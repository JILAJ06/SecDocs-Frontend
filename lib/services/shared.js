// Servicios de bóvedas compartidas con el usuario invitado (pantallas 09, 10 y /shared),
// conectados al backend real (/api/v1/shared y /api/v1/invitations/:token/unlock) con respaldo al mock en memoria.
import * as api from '@/lib/api';
import { recordMockAuditEvent } from '@/lib/mock/audit';
import {
  BOVEDA_DEMO_PASSWORD,
  invitationsByToken,
  vaultFiles,
  vaultMembers,
  vaults,
} from '@/lib/mock/vaults';
import { verifiedTokensByKey } from './invitations';

const BACKOFF_SECONDS = [1, 2, 4, 8];

// Estado en memoria por clave `${vaultId}:${emailLower}`:
// { unlocked, failedAttempts, blockedUntil, locked, ticket, backendVault, backendFiles }
const sharedAccessState = new Map();

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 300 + Math.floor(Math.random() * 201)));
}

function isBackendUnavailable(err) {
  return !err || err.status === 0 || err.status === 502 || err.status === 503 || err.status === 504;
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

function formatSize(bytes) {
  if (bytes == null) return '0 KB';
  const n = Number(bytes);
  if (Number.isNaN(n) || n <= 0) return '2 KB';
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
      ticket: null,
      realVaultId: null,
      backendVault: null,
      backendFiles: null,
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
  try {
    const res = await api.listShared();
    if (Array.isArray(res?.shared)) {
      return res.shared.map((s) => ({
        id: s.vault_id,
        name: s.name,
        ownerName: s.owner_email || 'Alexander J.',
        status: s.vault_status || 'ACTIVE',
        expiresAt: formatShortDate(s.vault_expires_at),
        filesCount: Number(s.files_count ?? 0),
      }));
    }
  } catch (err) {
    if (!isBackendUnavailable(err)) throw err;
  }

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

/** Obtiene la bóveda compartida para el correo en sesión. */
export async function getSharedVault(id, email) {
  const localVault = vaults.find((item) => item.id === id);
  const state = ensureState(id, email);

  if (!localVault) {
    try {
      const tokenCandidate = verifiedTokensByKey.get(id) || verifiedTokensByKey.get('lastToken') || id;
      const invRes = await api.getInvitation(tokenCandidate).catch(() => null);
      if (invRes?.invitation) {
        const inv = invRes.invitation;
        const remainingWait = Math.max(0, Math.ceil((state.blockedUntil - Date.now()) / 1000));
        return {
          vault: state.backendVault || {
            id,
            name: inv.vaultName,
            ownerName: inv.ownerEmail || 'Alexander J.',
            status: 'ACTIVE',
            expiresAt: formatShortDate(inv.expires_at),
            filesCount: state.backendFiles ? state.backendFiles.length : 0,
          },
          files: state.backendFiles || [],
          unlocked: state.unlocked && !state.locked,
          failedAttempts: state.failedAttempts,
          locked: state.locked,
          waitSeconds: remainingWait,
        };
      }
      const sharedRes = await api.listShared();
      const found = (sharedRes?.shared || []).find((s) => s.vault_id === id);
      if (found) {
        const remainingWait = Math.max(0, Math.ceil((state.blockedUntil - Date.now()) / 1000));
        return {
          vault: state.backendVault || {
            id: found.vault_id,
            name: found.name,
            ownerName: found.owner_email || 'Alexander J.',
            status: found.vault_status || 'ACTIVE',
            expiresAt: formatShortDate(found.vault_expires_at),
            filesCount: Number(found.files_count ?? 0),
          },
          files: state.backendFiles || [],
          unlocked: state.unlocked && !state.locked,
          failedAttempts: state.failedAttempts,
          locked: state.locked,
          waitSeconds: remainingWait,
        };
      }
    } catch (err) {
      if (!isBackendUnavailable(err)) {
        throw new Error('No tienes acceso a esta bóveda');
      }
    }
  }

  await wait();
  if (!localVault) throw new Error('No tienes acceso a esta bóveda');

  const member = findAcceptedMember(id, email);
  if (!member || member.status === 'PENDING') {
    throw new Error('No tienes acceso a esta bóveda');
  }

  if (member.status === 'LOCKED') {
    state.locked = true;
    state.failedAttempts = 5;
  }

  const files = (vaultFiles[id] || []).map((f) => ({ ...f }));
  const remainingWaitSeconds = Math.max(0, Math.ceil((state.blockedUntil - Date.now()) / 1000));

  return {
    vault: {
      id: localVault.id,
      name: localVault.name,
      ownerName: localVault.ownerName || 'Alexander J.',
      status: localVault.status,
      expiresAt: localVault.expiresAt,
      filesCount: files.length,
    },
    files,
    unlocked: state.unlocked && !state.locked,
    failedAttempts: state.failedAttempts,
    locked: state.locked,
    waitSeconds: remainingWaitSeconds,
  };
}

/** Verifica la contraseña de la bóveda (canal 2) con espera exponencial y bloqueo al 5.º intento. */
export async function unlockVault(id, email, password) {
  const localVault = vaults.find((item) => item.id === id);
  const state = ensureState(id, email);

  if (!localVault) {
    const tokenCandidate = verifiedTokensByKey.get(id) || verifiedTokensByKey.get('lastToken') || id;
    try {
      const res = await api.unlockInvitation(tokenCandidate, password);
      if (res?.ticket) {
        state.unlocked = true;
        state.failedAttempts = 0;
        state.blockedUntil = 0;
        state.ticket = res.ticket;
        state.realVaultId = res.vault?.id || id;
        state.backendFiles = (res.files || []).map((f) => ({
          id: f.id,
          name: f.original_filename,
          sizeLabel: formatSize(f.size_bytes),
          typeLabel: inferTypeLabel(f.original_filename, f.mime_type),
          uploadedAt: formatShortDate(f.created_at),
          author: 'Alexander J.',
        }));
        state.backendVault = {
          id: res.vault?.id || id,
          name: res.vault?.name || 'Bóveda compartida',
          ownerName: 'Alexander J.',
          status: 'ACTIVE',
          expiresAt: formatShortDate(res.vault?.expires_at),
          filesCount: state.backendFiles.length,
        };
        return {
          unlocked: true,
          locked: false,
          failedAttempts: 0,
          waitSeconds: 0,
        };
      }
    } catch (err) {
      if (!isBackendUnavailable(err)) {
        const used = err.data?.attemptsUsed ?? state.failedAttempts + 1;
        state.failedAttempts = used;
        if (used >= 5) {
          state.locked = true;
          return {
            unlocked: false,
            locked: true,
            failedAttempts: 5,
            waitSeconds: 0,
            message: 'Acceso bloqueado. Se avisó al dueño de la bóveda.',
          };
        }
        const waitSeconds = err.data?.retryAfterSeconds || BACKOFF_SECONDS[used - 1] || 8;
        state.blockedUntil = Date.now() + waitSeconds * 1000;
        return {
          unlocked: false,
          locked: false,
          failedAttempts: used,
          waitSeconds,
          message: `Contraseña incorrecta (${used} de 5). Por seguridad, espera ${waitSeconds} s antes de intentar de nuevo.`,
        };
      }
    }
  }

  await wait();
  if (!localVault) throw new Error('No tienes acceso a esta bóveda');

  const member = findAcceptedMember(id, email);
  if (!member || member.status === 'PENDING') {
    throw new Error('No tienes acceso a esta bóveda');
  }

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
      vaultId: localVault.id,
      target: localVault.name,
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
      vaultId: localVault.id,
      target: localVault.name,
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
    vaultId: localVault.id,
    target: localVault.name,
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

/** Descarga un archivo con descifrado al vuelo (contra el backend si hay ticket, o simulado en memoria). */
export async function downloadSharedFile(id, email, file) {
  const state = ensureState(id, email);
  if (state.ticket && state.realVaultId) {
    const ticket = state.ticket;
    state.ticket = null;
    await api.downloadSharedFile(state.realVaultId, file.id, file.name, ticket);
    return;
  }

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

/** Sale de la bóveda compartida. */
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
