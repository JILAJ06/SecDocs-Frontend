// Cliente HTTP centralizado (fetch). Mismo origen: /api/v1 se reenvía al backend con `rewrites`
// (next.config.mjs), así la cookie HttpOnly `secdocs_session` (SameSite=Strict) viaja sola.
// NUNCA se guarda JWT ni contraseña en localStorage/sessionStorage.

export const API_BASE = '/api/v1';

export class ApiError extends Error {
  constructor(status, message, data = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

let onUnauthorized = null;
/** El AuthProvider registra aquí cómo limpiar la sesión cuando una ruta protegida responde 401. */
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

async function parseError(res) {
  const data = await res.json().catch(() => ({}));
  const retryHeader = Number(res.headers.get('retry-after'));
  if (data.retryAfterSeconds == null && Number.isFinite(retryHeader) && retryHeader > 0) {
    data.retryAfterSeconds = retryHeader;
  }
  return new ApiError(res.status, data.error || `Error ${res.status}`, data);
}

/**
 * Petición base. `credentials: 'include'` siempre.
 * - body objeto → JSON; FormData → sin Content-Type manual.
 * - skipAuthRedirect: el 401 es parte del flujo (login, unlock, download…), no sesión caducada.
 * - raw: devuelve la Response (descargas binarias).
 */
export async function request(path, { method = 'GET', body, headers = {}, skipAuthRedirect = false, raw = false } = {}) {
  const init = { method, credentials: 'include', headers: { ...headers } };
  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    init.body = JSON.stringify(body);
    init.headers['Content-Type'] = 'application/json';
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, init);
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.');
  }

  if (!res.ok) {
    const err = await parseError(res);
    if (err.status === 401 && !skipAuthRedirect && onUnauthorized) onUnauthorized();
    throw err;
  }
  if (raw) return res;
  return res.json().catch(() => ({}));
}

const post = (path, body = {}, opts) => request(path, { method: 'POST', body, ...opts });
const enc = encodeURIComponent;

function qs(params) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

// --- Auth ---
export const getMe = () => request('/auth/me', { skipAuthRedirect: true });
export const login = (email, password) => post('/auth/login', { email, password }, { skipAuthRedirect: true });
export const register = (email, password) => post('/auth/register', { email, password }, { skipAuthRedirect: true });
export const logout = () => post('/auth/logout', {}, { skipAuthRedirect: true });

// --- Seguridad ---
export const listSessions = () => request('/security/sessions');
export const revokeSession = (jti) => request(`/security/sessions/${enc(jti)}`, { method: 'DELETE' });
export const killSwitch = () => post('/security/kill-switch', {}, { skipAuthRedirect: true });

// --- Bóvedas (dueño) ---
export const listVaults = () => request('/vaults');
export const createVault = (name, expires_at) => post('/vaults', { name, expires_at });
export const getVault = (vaultId) => request(`/vaults/${enc(vaultId)}`);
export const setVaultStatus = (vaultId, status) => request(`/vaults/${enc(vaultId)}/status`, { method: 'PATCH', body: { status } });
export const deleteVault = (vaultId) => request(`/vaults/${enc(vaultId)}`, { method: 'DELETE' });

// --- Archivos (dueño) ---
export function uploadVaultFile(vaultId, file) {
  const form = new FormData();
  form.append('file', file); // el campo DEBE llamarse "file"; sin Content-Type manual
  return request(`/vaults/${enc(vaultId)}/files`, { method: 'POST', body: form });
}
export const deleteVaultFile = (vaultId, fileId) => request(`/vaults/${enc(vaultId)}/files/${enc(fileId)}`, { method: 'DELETE' });

// --- Miembros (dueño) ---
export const inviteMember = (vaultId, payload) => post(`/vaults/${enc(vaultId)}/members`, payload);
export const revokeMember = (vaultId, memberId) => request(`/vaults/${enc(vaultId)}/members/${enc(memberId)}`, { method: 'DELETE' });

// --- Invitaciones (invitado). 401 = parte del flujo, no sesión caducada ---
export const getInvitation = (token) => request(`/invitations/${enc(token)}`, { skipAuthRedirect: true });
export const verifyIdentity = (token) => post(`/invitations/${enc(token)}/verify-identity`, {}, { skipAuthRedirect: true });
export const unlockInvitation = (token, password) => post(`/invitations/${enc(token)}/unlock`, { password }, { skipAuthRedirect: true });

// --- Compartidas ---
export const listShared = () => request('/shared');

/** Descarga binaria con ticket de un solo uso (header X-Download-Ticket). */
export async function downloadSharedFile(vaultId, fileId, fallbackFilename, ticket) {
  const res = await request(`/shared/${enc(vaultId)}/files/${enc(fileId)}/download`, {
    headers: { 'X-Download-Ticket': ticket },
    skipAuthRedirect: true,
    raw: true,
  });
  const blob = await res.blob();
  const disposition = res.headers.get('content-disposition') || '';
  const utf8 = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  const ascii = disposition.match(/filename="([^"]+)"/i);
  let filename = fallbackFilename;
  try {
    if (utf8) filename = decodeURIComponent(utf8[1]);
    else if (ascii) filename = ascii[1];
  } catch {
    /* se usa el nombre de respaldo */
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return filename;
}

// --- Auditoría ---
export const getAuditLogs = ({ page, limit, event, from, to }) => request(`/audit/logs${qs({ page, limit, event, from, to })}`);
export const getAuditStats = (days) => request(`/audit/stats${qs({ days })}`);
