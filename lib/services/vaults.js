// Servicios de bóvedas, archivos, miembros e invitaciones sobre los datos en memoria de lib/mock/vaults.js.
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

function findVaultOrThrow(id) {
  const v = vaults.find((item) => item.id === id);
  if (!v) throw new Error('Bóveda no encontrada');
  return v;
}

function addDaysToMockToday(days) {
  // Calcula una fecha dd/mm/aa a partir del 14/11/26 (2026-11-14).
  const base = new Date(2026, 10, 14);
  base.setDate(base.getDate() + Number(days || 30));
  const dd = String(base.getDate()).padStart(2, '0');
  const mm = String(base.getMonth() + 1).padStart(2, '0');
  const yy = String(base.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

function formatSize(bytes) {
  if (!bytes || bytes <= 0) return '2 KB';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.max(1, Math.round(kb))} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

function inferTypeLabel(filename = '') {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return 'PDF';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'Excel';
  if (['doc', 'docx'].includes(ext)) return 'Word';
  if (['ppt', 'pptx'].includes(ext)) return 'PowerPoint';
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return 'imagen';
  return 'texto';
}

function generateMockToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < 43; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function syncVaultCounters(vaultId) {
  const v = vaults.find((item) => item.id === vaultId);
  if (!v) return;
  const files = vaultFiles[vaultId] || [];
  const members = vaultMembers[vaultId] || [];
  v.filesCount = files.length;
  v.membersCount = members.length;
}

/** Devuelve las métricas fijas del panel Mis bóvedas. */
export async function getVaultSummary() {
  await wait();
  return { ...vaultSummary };
}

/** Devuelve la lista de bóvedas del dueño. */
export async function listVaults() {
  await wait();
  return vaults.map((v) => ({ ...v }));
}

/** Devuelve una bóveda por id o lanza Error('Bóveda no encontrada'). */
export async function getVault(id) {
  await wait();
  const v = findVaultOrThrow(id);
  return { ...v };
}

/** Crea una bóveda nueva en memoria y la coloca al principio de la lista. */
export async function createVault({ name, expiresInDays = 30 }) {
  await wait();
  const cleanName = String(name || '').trim();
  if (!cleanName) throw new Error('El nombre es obligatorio');
  const days = [7, 15, 30, 60, 90].includes(Number(expiresInDays)) ? Number(expiresInDays) : 30;
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

/** Bloquea una bóveda en memoria. */
export async function lockVault(id) {
  await wait();
  const v = findVaultOrThrow(id);
  v.status = 'LOCKED';
  v.subtitle = `Bloqueada el ${MOCK_TODAY_DATE} por el dueño`;
  return { ...v };
}

/** Destruye una bóveda en memoria (elimina la bóveda, sus archivos y miembros). */
export async function destroyVault(id) {
  await wait();
  const idx = vaults.findIndex((item) => item.id === id);
  if (idx === -1) throw new Error('Bóveda no encontrada');
  vaults.splice(idx, 1);
  delete vaultFiles[id];
  delete vaultMembers[id];
}

/** Lista los archivos de una bóveda. */
export async function listFiles(id) {
  await wait();
  findVaultOrThrow(id);
  return (vaultFiles[id] || []).map((f) => ({ ...f }));
}

/** Simula el cifrado y subida de un archivo guardando solo sus metadatos en memoria. */
export async function addFile(id, file) {
  await wait();
  findVaultOrThrow(id);
  if (!file || !file.name) throw new Error('Selecciona un archivo válido');
  if (typeof file.size === 'number' && file.size > MAX_FILE_BYTES) {
    throw new Error('El archivo supera 25 MB');
  }
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

/** Destruye un archivo de la bóveda (borra su fila en memoria). */
export async function destroyFile(id, fileId) {
  await wait();
  findVaultOrThrow(id);
  const list = vaultFiles[id] || [];
  const idx = list.findIndex((f) => f.id === fileId);
  if (idx !== -1) list.splice(idx, 1);
  syncVaultCounters(id);
}

/** Lista los miembros e invitaciones de una bóveda. */
export async function listMembers(id) {
  await wait();
  findVaultOrThrow(id);
  return (vaultMembers[id] || []).map((m) => ({ ...m }));
}

/** Crea una invitación por correo para la bóveda y devuelve miembro + enlace. */
export async function createInvitation(id, { email, expiresInHours = 48 }) {
  await wait();
  const v = findVaultOrThrow(id);
  const cleanEmail = String(email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    throw new Error('Correo inválido');
  }
  const list = vaultMembers[id] || [];
  if (list.some((m) => m.email.toLowerCase() === cleanEmail)) {
    throw new Error('Ya existe una invitación para ese correo');
  }
  const hours = [24, 48, 72, 168].includes(Number(expiresInHours)) ? Number(expiresInHours) : 48;
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
