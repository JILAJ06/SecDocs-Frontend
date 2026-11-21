// Servicios de bóvedas compartidas con el usuario invitado (pantallas 09, 10 y /shared).
import { recordMockAuditEvent } from '@/lib/mock/audit';
import {
  BOVEDA_DEMO_PASSWORD,
  invitationsByToken,
  vaultFiles,
  vaultMembers,
  vaults,
} from '@/lib/mock/vaults';

// Espera exponencial en segundos para los intentos fallidos 1 a 4. Al 5.º intento se bloquea.
const BACKOFF_SECONDS = [1, 2, 4, 8];

// Estado en memoria por clave `${vaultId}:${emailLower}`:
// { unlocked: boolean, failedAttempts: number, blockedUntil: number, locked: boolean }
const sharedAccessState = new Map();

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 300 + Math.floor(Math.random() * 201)));
}

function getKey(vaultId, email) {
  return `${vaultId}:${String(email || '').trim().toLowerCase()}`;
}

function ensureState(vaultId, email) {
  const key = getKey(vaultId, email);
  if (!sharedAccessState.has(key)) {
    sharedAccessState.set(key, {
      unlocked: false,
      failedAttempts: 0,
      blockedUntil: 0,
      locked: false,
    });
  }
  return sharedAccessState.get(key);
}

function findAcceptedMember(vaultId, email) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const list = vaultMembers[vaultId] || [];
  return list.find(
    (m) =>
      m.email.toLowerCase() === cleanEmail &&
      (m.status === 'ACCEPTED' || m.status === 'TEMP_LOCK' || m.status === 'LOCKED')
  );
}

/** Lista las bóvedas donde el correo tiene membresía ACCEPTED. */
export async function listSharedVaults(email) {
  await wait();
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail) return [];

  const result = [];
  for (const v of vaults) {
    const members = vaultMembers[v.id] || [];
    const member = members.find(
      (m) => m.email.toLowerCase() === cleanEmail && m.status === 'ACCEPTED'
    );
    if (member) {
      const files = vaultFiles[v.id] || [];
      result.push({
        id: v.id,
        name: v.name,
        ownerName: v.ownerName || 'Alexander J.',
        status: v.status,
        expiresAt: v.expiresAt,
        filesCount: files.length,
      });
    }
  }
  return result;
}

/**
 * Obtiene la bóveda compartida para el correo en sesión.
 * Solo permite acceso si el correo tiene membresía ACCEPTED (o quedó bloqueado durante la sesión).
 */
export async function getSharedVault(id, email) {
  await wait();
  const v = vaults.find((item) => item.id === id);
  if (!v) throw new Error('No tienes acceso a esta bóveda');

  const member = findAcceptedMember(id, email);
  if (!member || member.status === 'PENDING') {
    throw new Error('No tienes acceso a esta bóveda');
  }

  const state = ensureState(id, email);
  if (member.status === 'LOCKED') {
    state.locked = true;
    state.failedAttempts = 5;
  }

  const files = (vaultFiles[id] || []).map((f) => ({ ...f }));
  const remainingWaitSeconds = Math.max(0, Math.ceil((state.blockedUntil - Date.now()) / 1000));

  return {
    vault: {
      id: v.id,
      name: v.name,
      ownerName: v.ownerName || 'Alexander J.',
      status: v.status,
      expiresAt: v.expiresAt,
      filesCount: files.length,
    },
    files,
    unlocked: state.unlocked && !state.locked,
    failedAttempts: state.failedAttempts,
    locked: state.locked,
    waitSeconds: remainingWaitSeconds,
  };
}

/**
 * Verifica la contraseña de la bóveda (canal 2).
 * Backoff exponencial: 1, 2, 4, 8 s; al 5.º intento fallido bloquea al miembro.
 */
export async function unlockVault(id, email, password) {
  await wait();
  const v = vaults.find((item) => item.id === id);
  if (!v) throw new Error('No tienes acceso a esta bóveda');

  const member = findAcceptedMember(id, email);
  if (!member || member.status === 'PENDING') {
    throw new Error('No tienes acceso a esta bóveda');
  }

  const state = ensureState(id, email);
  if (state.locked || member.status === 'LOCKED') {
    state.locked = true;
    return {
      unlocked: false,
      locked: true,
      failedAttempts: 5,
      waitSeconds: 0,
      message: 'Acceso bloqueado. Se avisó al dueño de la bóveda.',
    };
  }

  const now = Date.now();
  if (state.blockedUntil > now) {
    const waitSeconds = Math.max(1, Math.ceil((state.blockedUntil - now) / 1000));
    return {
      unlocked: false,
      locked: false,
      failedAttempts: state.failedAttempts,
      waitSeconds,
      message: `Contraseña incorrecta (${state.failedAttempts} de 5). Por seguridad, espera ${waitSeconds} s antes de intentar de nuevo.`,
    };
  }

  if (password === BOVEDA_DEMO_PASSWORD) {
    state.unlocked = true;
    state.failedAttempts = 0;
    state.blockedUntil = 0;
    member.status = 'ACCEPTED';
    member.attempts = '0/5';
    member.activity = 'activa ahora';

    recordMockAuditEvent({
      event: 'Acceso a bóveda concedido',
      tone: 'success',
      bold: false,
      category: 'Accesos',
      vaultId: v.id,
      target: v.name,
      user: email,
      ip: '187.190.42.10',
      detail: 'contraseña correcta',
    });

    return {
      unlocked: true,
      locked: false,
      failedAttempts: 0,
      waitSeconds: 0,
    };
  }

  state.failedAttempts += 1;
  const n = state.failedAttempts;

  if (n >= 5) {
    state.locked = true;
    state.unlocked = false;
    state.blockedUntil = 0;
    member.status = 'LOCKED';
    member.attempts = '5/5';
    member.activity = 'bloqueado';

    recordMockAuditEvent({
      event: 'Contraseña de bóveda incorrecta',
      tone: 'danger',
      bold: true,
      category: 'Seguridad',
      vaultId: v.id,
      target: v.name,
      user: email,
      ip: '187.190.42.10',
      detail: 'intento 5/5 · miembro bloqueado',
    });

    return {
      unlocked: false,
      locked: true,
      failedAttempts: 5,
      waitSeconds: 0,
      message: 'Acceso bloqueado. Se avisó al dueño de la bóveda.',
    };
  }

  const waitSeconds = BACKOFF_SECONDS[n - 1] || 8;
  state.blockedUntil = Date.now() + waitSeconds * 1000;
  member.status = 'TEMP_LOCK';
  member.attempts = `${n}/5`;
  member.activity = `bloqueado ${waitSeconds} s`;

  recordMockAuditEvent({
    event: 'Contraseña de bóveda incorrecta',
    tone: 'danger',
    bold: false,
    category: 'Seguridad',
    vaultId: v.id,
    target: v.name,
    user: email,
    ip: '187.190.42.10',
    detail: `intento ${n}/5 · espera ${waitSeconds} s`,
  });

  return {
    unlocked: false,
    locked: false,
    failedAttempts: n,
    waitSeconds,
    message: `Contraseña incorrecta (${n} de 5). Por seguridad, espera ${waitSeconds} s antes de intentar de nuevo.`,
  };
}

/** Simula la descarga con descifrado al vuelo y la registra en la bitácora. */
export async function downloadSharedFile(id, email, file) {
  await wait();
  const v = vaults.find((item) => item.id === id);
  if (!v) throw new Error('Bóveda no encontrada');
  const prefix = v.name === 'Auditoría Financiera' ? 'AF' : v.name;
  recordMockAuditEvent({
    event: 'Archivo descargado',
    tone: 'info',
    bold: false,
    category: 'Archivos',
    vaultId: v.id,
    target: `${prefix} / ${file.name}`,
    user: email,
    ip: '187.190.42.10',
    detail: 'descifrado al vuelo',
  });
}

/** Sale de la bóveda compartida (elimina la membresía en memoria y limpia el estado de desbloqueo). */
export async function leaveVault(id, email) {
  await wait();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const list = vaultMembers[id] || [];
  const idx = list.findIndex((m) => m.email.toLowerCase() === cleanEmail);
  if (idx !== -1) {
    const [removed] = list.splice(idx, 1);
    if (removed?.token) delete invitationsByToken[removed.token];
  }
  const v = vaults.find((item) => item.id === id);
  if (v) v.membersCount = (vaultMembers[id] || []).length;
  sharedAccessState.delete(getKey(id, email));
}
