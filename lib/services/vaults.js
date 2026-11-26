// Servicios de bóvedas, archivos, miembros e invitaciones conectados al backend real (/api/v1/vaults/*),
// con respaldo automático a los datos en memoria de lib/mock/vaults.js si el backend no está disponible.
import * as api from '@/lib/api';
import {
  invitationsByToken,
  MOCK_TODAY_DATE,
  vaultFiles,
  vaultMembers,
  vaultSummary,
  vaults,
} from '@/lib/mock/vaults';

const MAX_FILE_BYTES = 25 * 1024 * 1024;

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 300 + Math.floor(Math.random() * 201)));
}

function isBackendUnavailable(err) {
  return !err || err.status === 0 || err.status === 502 || err.status === 503 || err.status === 504;
}

function findVaultOrThrow(id) {
  const v = vaults.find((item) => item.id === id);
  if (!v) throw new Error('Bóveda no encontrada');
  return v;
}

function formatShortDate(iso) {
  if (!iso) return '—';
  if (/^\d{2}\/\d{2}\/\d{2}$/.test(String(iso))) return String(iso);
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

function addDaysToMockToday(days) {
  const base = new Date(2026, 10, 14);
  base.setDate(base.getDate() + Number(days || 30));
  const dd = String(base.getDate()).padStart(2, '0');
  const mm = String(base.getMonth() + 1).padStart(2, '0');
  const yy = String(base.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

function addDaysToRealNowISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + Number(days || 30));
  d.setHours(23, 59, 59, 0);
  return d.toISOString();
}

function formatSize(bytes) {
  if (bytes == null) return '0 MB';
  const n = Number(bytes);
  if (Number.isNaN(n) || n <= 0) return '0 MB';
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${Math.max(1, Math.round(kb))} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

function inferTypeLabel(filename = '', mime = '') {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf' || mime.includes('pdf')) return 'PDF';
  if (['xls', 'xlsx', 'csv'].includes(ext) || mime.includes('spreadsheet') || mime.includes('excel')) return 'Excel';
  if (['doc', 'docx'].includes(ext) || mime.includes('word')) return 'Word';
  if (['ppt', 'pptx'].includes(ext) || mime.includes('presentation')) return 'PowerPoint';
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext) || mime.startsWith('image/')) return 'imagen';
  return 'texto';
}

function generateMockToken(length = 43) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789';
  const out = [];
  const limit = 256 - (256 % chars.length);
  while (out.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length * 2));
    for (const b of bytes) {
      if (b < limit && out.length < length) {
        out.push(chars[b % chars.length]);
      }
    }
  }
  return out.join('');
}

function syncVaultCounters(vaultId) {
  const v = vaults.find((item) => item.id === vaultId);
  if (!v) return;
  const files = vaultFiles[vaultId] || [];
  const members = vaultMembers[vaultId] || [];
  v.filesCount = files.length;
  v.membersCount = members.length;
}

function mapBackendVault(raw, filesList = null, membersList = null) {
  const effectiveStatus = raw.status === 'ACTIVE' && raw.expired ? 'EXPIRED' : raw.status;
  const createdAt = formatShortDate(raw.created_at);
  const expiresAt = formatShortDate(raw.expires_at);
  const filesCount = filesList ? filesList.length : Number(raw.files_count ?? 0);
  const membersCount = membersList ? membersList.length : Number(raw.members_count ?? 0);
  const totalBytes = filesList
    ? filesList.reduce((acc, f) => acc + Number(f.size_bytes || 0), 0)
    : Number(raw.size_bytes ?? 0);

  let subtitle = `Creada ${createdAt} · expira ${expiresAt}`;
  if (effectiveStatus === 'LOCKED') {
    subtitle = `Bloqueada · expira ${expiresAt}`;
  } else if (effectiveStatus === 'EXPIRED' || effectiveStatus === 'PURGED') {
    subtitle = `Expiró el ${expiresAt} · llaves destruidas`;
  }

  return {
    id: raw.id,
    ownerId: raw.owner_id || 'u-1',
    ownerName: 'Alexander J.',
    name: raw.name,
    status: effectiveStatus === 'PURGED' ? 'EXPIRED' : effectiveStatus,
    createdAt,
    expiresAt,
    kekVersion: 'v1',
    kekCreatedAt: createdAt,
    filesCount,
    membersCount,
    sizeLabel: formatSize(totalBytes),
    subtitle,
  };
}

function mapBackendFile(f) {
  return {
    id: f.id,
    name: f.original_filename || f.name,
    sizeLabel: formatSize(f.size_bytes),
    typeLabel: inferTypeLabel(f.original_filename || f.name, f.mime_type),
    uploadedAt: formatShortDate(f.created_at),
    author: 'Alexander J.',
  };
}

function mapBackendMember(m) {
  const status = m.status === 'TEMP_LOCKED' ? 'TEMP_LOCK' : m.status;
  const attempts = m.status === 'PENDING' ? '—' : `${m.failed_attempts ?? 0}/5`;
  let activity = '—';
  if (status === 'TEMP_LOCK' && m.locked_until) {
    const secs = Math.max(1, Math.ceil((new Date(m.locked_until) - Date.now()) / 1000));
    activity = `bloqueado ${secs} s`;
  } else if (status === 'PENDING' && m.expires_at) {
    const hours = Math.max(1, Math.ceil((new Date(m.expires_at) - Date.now()) / 3600000));
    activity = `expira en ${hours} h`;
  } else if (m.last_access_at) {
    activity = formatShortDate(m.last_access_at);
  } else if (status === 'ACCEPTED') {
    activity = 'activa';
  }

  return {
    id: m.id,
    userId: null,
    email: m.recipient_email,
    status,
    attempts,
    activity,
  };
}

/** Devuelve las métricas del panel Mis bóvedas (del backend o del mock). */
export async function getVaultSummary() {
  try {
    const res = await api.listVaults();
    if (res?.metrics) {
      const m = res.metrics;
      const list = res.vaults || [];
      const bytes = Number(m.total_storage_bytes || 0);
      const mb = bytes / (1024 * 1024);
      const progress = Math.min(100, Number(((mb / 100) * 100).toFixed(1)));
      return {
        storageUsed: formatSize(bytes),
        storageDetail: 'de 100 MB del plan',
        storageProgress: progress,
        activeVaults: String(m.total_vaults_active ?? list.filter((v) => v.status === 'ACTIVE' && !v.expired).length),
        activeVaultsDetail: `de ${list.length} bóvedas`,
        encryptedFiles: String(m.total_files_active ?? 0),
        encryptedFilesDetail: 'AES-256-GCM, una llave por archivo',
        pendingInvitations: String(
          list.reduce((acc, v) => acc + Number(v.members_count || 0), 0)
        ),
        pendingInvitationsDetail: 'esperando verificación de identidad',
      };
    }
  } catch (err) {
    if (!isBackendUnavailable(err)) throw err;
  }
  await wait();
  return { ...vaultSummary };
}

/** Devuelve la lista de bóvedas del dueño. */
export async function listVaults() {
  try {
    const res = await api.listVaults();
    if (Array.isArray(res?.vaults)) {
      return res.vaults.map((v) => mapBackendVault(v));
    }
  } catch (err) {
    if (!isBackendUnavailable(err)) throw err;
  }
  await wait();
  return vaults.map((v) => ({ ...v }));
}

/** Devuelve una bóveda por id o lanza Error('Bóveda no encontrada'). */
export async function getVault(id) {
  try {
    const res = await api.getVault(id);
    if (res?.vault) {
      return mapBackendVault(res.vault, res.files || [], res.members || []);
    }
  } catch (err) {
    if (!isBackendUnavailable(err)) {
      throw new Error(err.message || 'Bóveda no encontrada');
    }
  }
  await wait();
  const v = findVaultOrThrow(id);
  return { ...v };
}

/** Crea una bóveda nueva en el backend (o en memoria si no hay backend). */
export async function createVault({ name, expiresInDays = 30 }) {
  const cleanName = String(name || '').trim();
  if (!cleanName) throw new Error('El nombre es obligatorio');
  const days = [7, 15, 30, 60, 90].includes(Number(expiresInDays)) ? Number(expiresInDays) : 30;

  try {
    const res = await api.createVault(cleanName, addDaysToRealNowISO(days));
    if (res?.vault) {
      return mapBackendVault(res.vault);
    }
  } catch (err) {
    if (!isBackendUnavailable(err)) {
      throw new Error(err.message || 'No se pudo crear la bóveda');
    }
  }

  await wait();
  const expiresAt = addDaysToMockToday(days);
  const newVault = {
    id: `v-${Date.now()}`,
    ownerId: 'u-1',
    ownerName: 'Alexander J.',
    name: cleanName,
    status: 'ACTIVE',
    createdAt: MOCK_TODAY_DATE,
    expiresAt,
    kekVersion: 'v1',
    kekCreatedAt: MOCK_TODAY_DATE,
    filesCount: 0,
    membersCount: 0,
    sizeLabel: '0 MB',
    subtitle: `Creada ${MOCK_TODAY_DATE} · expira ${expiresAt}`,
  };
  vaults.unshift(newVault);
  vaultFiles[newVault.id] = [];
  vaultMembers[newVault.id] = [];
  return { ...newVault };
}

/** Bloquea una bóveda. */
export async function lockVault(id) {
  try {
    const res = await api.setVaultStatus(id, 'LOCKED');
    if (res?.vault) {
      return mapBackendVault(res.vault);
    }
  } catch (err) {
    if (!isBackendUnavailable(err)) {
      throw new Error(err.message || 'No se pudo bloquear la bóveda');
    }
  }
  await wait();
  const v = findVaultOrThrow(id);
  v.status = 'LOCKED';
  v.subtitle = `Bloqueada el ${MOCK_TODAY_DATE} por el dueño`;
  return { ...v };
}

/** Destruye una bóveda (crypto-shredding). */
export async function destroyVault(id) {
  try {
    await api.deleteVault(id);
    return;
  } catch (err) {
    if (!isBackendUnavailable(err)) {
      throw new Error(err.message || 'No se pudo destruir la bóveda');
    }
  }
  await wait();
  const idx = vaults.findIndex((item) => item.id === id);
  if (idx === -1) throw new Error('Bóveda no encontrada');
  vaults.splice(idx, 1);
  delete vaultFiles[id];
  delete vaultMembers[id];
}

/** Lista los archivos de una bóveda. */
export async function listFiles(id) {
  try {
    const res = await api.getVault(id);
    if (Array.isArray(res?.files)) {
      return res.files.map(mapBackendFile);
    }
  } catch (err) {
    if (!isBackendUnavailable(err)) {
      throw new Error(err.message || 'No se pudieron cargar los archivos');
    }
  }
  await wait();
  findVaultOrThrow(id);
  return (vaultFiles[id] || []).map((f) => ({ ...f }));
}

/** Sube y cifra un archivo en la bóveda. */
export async function addFile(id, file) {
  if (!file || !file.name) throw new Error('Selecciona un archivo válido');
  if (typeof file.size === 'number' && file.size > MAX_FILE_BYTES) {
    throw new Error('El archivo supera 25 MB');
  }

  try {
    const res = await api.uploadVaultFile(id, file);
    if (res?.file) {
      return mapBackendFile(res.file);
    }
  } catch (err) {
    if (!isBackendUnavailable(err)) {
      if (err.status === 413) throw new Error('El archivo supera 25 MB');
      throw new Error(err.message || 'No se pudo subir el archivo');
    }
  }

  await wait();
  findVaultOrThrow(id);
  const newFile = {
    id: `f-${Date.now()}`,
    name: file.name,
    sizeLabel: formatSize(file.size),
    typeLabel: inferTypeLabel(file.name),
    uploadedAt: MOCK_TODAY_DATE,
    author: 'Alexander J.',
  };
  if (!vaultFiles[id]) vaultFiles[id] = [];
  vaultFiles[id].unshift(newFile);
  syncVaultCounters(id);
  return { ...newFile };
}

/** Destruye un archivo de la bóveda. */
export async function destroyFile(id, fileId) {
  try {
    await api.deleteVaultFile(id, fileId);
    return;
  } catch (err) {
    if (!isBackendUnavailable(err)) {
      throw new Error(err.message || 'No se pudo destruir el archivo');
    }
  }
  await wait();
  findVaultOrThrow(id);
  const list = vaultFiles[id] || [];
  const idx = list.findIndex((f) => f.id === fileId);
  if (idx !== -1) list.splice(idx, 1);
  syncVaultCounters(id);
}

/** Lista los miembros e invitaciones de una bóveda. */
export async function listMembers(id) {
  try {
    const res = await api.getVault(id);
    if (Array.isArray(res?.members)) {
      return res.members
        .filter((m) => m.status !== 'REVOKED')
        .map(mapBackendMember);
    }
  } catch (err) {
    if (!isBackendUnavailable(err)) {
      throw new Error(err.message || 'No se pudieron cargar los miembros');
    }
  }
  await wait();
  findVaultOrThrow(id);
  return (vaultMembers[id] || []).map((m) => ({ ...m }));
}

/** Crea una invitación por correo para la bóveda y devuelve miembro + enlace. */
export async function createInvitation(id, { email, expiresInHours = 48 }) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    throw new Error('Correo inválido');
  }
  const hours = [24, 48, 72, 168].includes(Number(expiresInHours)) ? Number(expiresInHours) : 48;

  try {
    const res = await api.inviteMember(id, {
      recipient_email: cleanEmail,
      max_downloads: 3,
    });
    if (res?.member) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://secdocs.app';
      const url = res.invitationPath ? `${origin}${res.invitationPath}` : res.invitationUrl;
      const token = (res.invitationPath || '').split('/').pop() || '';
      return {
        member: mapBackendMember(res.member),
        token,
        url,
      };
    }
  } catch (err) {
    if (!isBackendUnavailable(err)) {
      if (err.status === 409) throw new Error('Ya existe una invitación para ese correo');
      throw new Error(err.message || 'Correo inválido');
    }
  }

  await wait();
  const v = findVaultOrThrow(id);
  const list = vaultMembers[id] || [];
  if (list.some((m) => m.email.toLowerCase() === cleanEmail)) {
    throw new Error('Ya existe una invitación para ese correo');
  }
  const token = generateMockToken();
  const member = {
    id: `m-${Date.now()}`,
    userId: null,
    email: cleanEmail,
    status: 'PENDING',
    attempts: '—',
    activity: `expira en ${hours} h`,
    token,
  };
  if (!vaultMembers[id]) vaultMembers[id] = [];
  vaultMembers[id].push(member);
  invitationsByToken[token] = {
    token,
    vaultId: v.id,
    vaultName: v.name,
    ownerName: v.ownerName || 'Alexander J.',
    inviteEmail: cleanEmail,
    expiresInHours: hours,
    status: 'PENDING',
  };
  syncVaultCounters(id);
  return {
    member: { ...member },
    token,
    url: `https://secdocs.app/invitacion/${token}`,
  };
}

/** Cancela una invitación pendiente y la quita de la lista. */
export async function cancelInvitation(id, memberId) {
  try {
    await api.revokeMember(id, memberId);
    return;
  } catch (err) {
    if (!isBackendUnavailable(err)) {
      throw new Error(err.message || 'No se pudo cancelar la invitación');
    }
  }
  await wait();
  findVaultOrThrow(id);
  const list = vaultMembers[id] || [];
  const idx = list.findIndex((m) => m.id === memberId);
  if (idx !== -1) {
    const [removed] = list.splice(idx, 1);
    if (removed?.token) delete invitationsByToken[removed.token];
  }
  syncVaultCounters(id);
}

/** Revoca el acceso de un miembro y lo quita de la lista. */
export async function revokeMember(id, memberId) {
  try {
    await api.revokeMember(id, memberId);
    return;
  } catch (err) {
    if (!isBackendUnavailable(err)) {
      throw new Error(err.message || 'No se pudo revocar el miembro');
    }
  }
  await wait();
  findVaultOrThrow(id);
  const list = vaultMembers[id] || [];
  const idx = list.findIndex((m) => m.id === memberId);
  if (idx !== -1) {
    const [removed] = list.splice(idx, 1);
    if (removed?.token) delete invitationsByToken[removed.token];
  }
  syncVaultCounters(id);
}
