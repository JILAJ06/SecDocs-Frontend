// Servicios de sesiones y seguridad de la cuenta para la vista 12 (/security),
// conectados al backend real (/api/v1/security/*) con respaldo al mock en memoria.
import * as api from '@/lib/api';
import { recordMockAuditEvent } from '@/lib/mock/audit';
import { sessions } from '@/lib/mock/sessions';
import { DEMO_PASSWORD, registeredPasswords, users } from '@/lib/mock/users';

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 300 + Math.floor(Math.random() * 201)));
}

function isBackendUnavailable(err) {
  return !err || err.status === 0 || err.status === 502 || err.status === 503 || err.status === 504;
}

function formatShortDate(iso) {
  if (!iso) return 'reciente';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'reciente';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

function mapBackendSession(s) {
  const shortJti = s.jti && s.jti.length > 8 ? `${s.jti.slice(0, 4)}…${s.jti.slice(-2)}` : s.jti;
  const baseDevice = s.user_agent ? s.user_agent.slice(0, 40) : 'Navegador web';
  const device = s.current ? `${baseDevice} (este dispositivo)` : baseDevice;
  const activity = s.current ? 'activa ahora' : `activa (${formatShortDate(s.created_at)})`;
  return {
    id: s.jti,
    device,
    detail: `${s.ip || '127.0.0.1'} · ${activity} · jti ${shortJti}`,
    jti: shortJti,
    ip: s.ip || '127.0.0.1',
    status: 'ACTIVE',
    current: Boolean(s.current),
  };
}

/** Lista todas las sesiones de la cuenta. */
export async function listSessions() {
  try {
    const res = await api.listSessions();
    if (Array.isArray(res?.sessions)) {
      return res.sessions.map(mapBackendSession);
    }
  } catch (err) {
    if (!isBackendUnavailable(err)) throw err;
  }
  await wait();
  return sessions.map((s) => ({ ...s }));
}

/** Revoca una sesión individual por id/jti. */
export async function revokeSession(id, userEmail = 'alex@upchiapas.edu.mx') {
  try {
    await api.revokeSession(id);
    const shortJti = id.length > 8 ? `${id.slice(0, 4)}…${id.slice(-2)}` : id;
    return {
      id,
      device: 'Sesión remota',
      detail: `revocada hace un momento · jti ${shortJti}`,
      jti: shortJti,
      status: 'REVOKED',
      current: false,
    };
  } catch (err) {
    if (!isBackendUnavailable(err)) {
      throw new Error(err.message || 'Sesión no encontrada');
    }
  }

  await wait();
  const s = sessions.find((item) => item.id === id);
  if (!s) throw new Error('Sesión no encontrada');
  if (!s.current && s.status !== 'REVOKED') {
    s.status = 'REVOKED';
    s.detail = s.detail.replace(/activa [^·]+/, 'revocada hace un momento ');
    recordMockAuditEvent({
      event: 'Sesión revocada (kill-switch)',
      tone: 'warning',
      bold: true,
      category: 'Seguridad',
      vaultId: null,
      target: '—',
      user: userEmail,
      ip: '172.18.0.1',
      detail: `jti ${s.jti} en lista negra`,
    });
  }
  return { ...s };
}

/** Revoca todas las sesiones activas. */
export async function revokeAllSessions(userEmail = 'alex@upchiapas.edu.mx') {
  try {
    await api.killSwitch();
    return {
      sessions: [],
      revokedDevices: ['todas las sesiones activas'],
    };
  } catch (err) {
    if (!isBackendUnavailable(err)) {
      throw new Error(err.message || 'No se pudieron cerrar las sesiones');
    }
  }

  await wait();
  const revokedDevices = [];
  for (const s of sessions) {
    if (!s.current && s.status === 'ACTIVE') {
      s.status = 'REVOKED';
      s.detail = s.detail.replace(/activa [^·]+/, 'revocada hace un momento ');
      revokedDevices.push(s.device);
      recordMockAuditEvent({
        event: 'Sesión revocada (kill-switch)',
        tone: 'warning',
        bold: true,
        category: 'Seguridad',
        vaultId: null,
        target: '—',
        user: userEmail,
        ip: '172.18.0.1',
        detail: `jti ${s.jti} en lista negra`,
      });
    }
  }
  return {
    sessions: sessions.map((s) => ({ ...s })),
    revokedDevices,
  };
}

/** Valida y cambia la contraseña de la cuenta. */
export async function changePassword(current, next, userEmail = '') {
  await wait();
  const cleanEmail = String(userEmail || '').trim().toLowerCase();
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
  const customPass = user ? registeredPasswords.get(user.id) : undefined;
  const currentOk = current === DEMO_PASSWORD || (customPass && current === customPass);
  if (!currentOk) {
    throw new Error('La contraseña actual es incorrecta');
  }
  const nextStr = String(next || '');
  if (nextStr.length < 12 || nextStr.length > 72) {
    throw new Error('La contraseña debe tener entre 12 y 72 caracteres');
  }
  if (user) {
    registeredPasswords.set(user.id, nextStr);
  }
}
