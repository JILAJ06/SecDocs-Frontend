// Servicio de bitácora de auditoría para la vista 11 (/audit),
// conectado al backend real (/api/v1/audit/logs) con respaldo al mock en memoria.
import * as api from '@/lib/api';
import { auditEvents } from '@/lib/mock/audit';
import { vaults } from '@/lib/mock/vaults';

const BACKEND_EVENT_MAP = {
  USER_REGISTERED: ['Cuenta creada', 'info', false, 'Accesos'],
  LOGIN_SUCCESS: ['Inicio de sesión', 'success', false, 'Accesos'],
  LOGIN_FAILED: ['Inicio de sesión fallido', 'danger', true, 'Seguridad'],
  SESSION_REVOKED: ['Sesión revocada (kill-switch)', 'warning', true, 'Seguridad'],
  VAULT_CREATED: ['Bóveda creada', 'success', false, 'Ciclo de vida'],
  VAULT_LOCKED: ['Bóveda bloqueada', 'danger', true, 'Seguridad'],
  VAULT_UNLOCKED: ['Bóveda reactivada', 'success', false, 'Ciclo de vida'],
  VAULT_PURGED: ['Bóveda destruida (crypto-shredding)', 'neutral', true, 'Ciclo de vida'],
  VAULT_EXPIRED: ['Bóveda expirada (crypto-shredding)', 'neutral', true, 'Ciclo de vida'],
  FILE_UPLOADED: ['Archivo cifrado y subido', 'success', false, 'Archivos'],
  FILE_PURGED: ['Archivo destruido (crypto-shredding)', 'neutral', true, 'Archivos'],
  MEMBER_INVITED: ['Invitación creada', 'success', false, 'Invitaciones'],
  MEMBER_REVOKED: ['Acceso revocado', 'warning', false, 'Invitaciones'],
  IDENTITY_VERIFIED: ['Identidad verificada', 'success', false, 'Invitaciones'],
  PASSWORD_SENT: ['Contraseña enviada por correo', 'success', false, 'Invitaciones'],
  UNLOCK_FAILED: ['Contraseña de bóveda incorrecta', 'danger', false, 'Seguridad'],
  VAULT_UNLOCKED_BY_MEMBER: ['Acceso a bóveda concedido', 'success', false, 'Accesos'],
  FILE_DOWNLOADED: ['Archivo descargado', 'info', false, 'Archivos'],
  DOWNLOAD_DENIED: ['Descarga denegada', 'danger', true, 'Seguridad'],
  DOWNLOAD_FAILED: ['Descarga fallida', 'danger', false, 'Archivos'],
  ACCESS_DENIED: ['Acceso denegado: correo no coincide', 'danger', true, 'Seguridad'],
};

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 300 + Math.floor(Math.random() * 201)));
}

function isBackendUnavailable(err) {
  return !err || err.status === 0 || err.status === 502 || err.status === 503 || err.status === 504;
}

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yy} ${hh}:${min}`;
}

function formatDetail(detail) {
  if (!detail) return '—';
  if (typeof detail === 'string') return detail;
  if (typeof detail === 'object') {
    const parts = Object.entries(detail).map(([k, v]) => `${k}: ${v}`);
    return parts.length > 0 ? parts.join(' · ') : '—';
  }
  return '—';
}

/** Devuelve las opciones de bóvedas para el filtro de la vista de auditoría. */
export async function listAuditVaultOptions() {
  try {
    const res = await api.listVaults();
    if (Array.isArray(res?.vaults)) {
      return res.vaults.map((v) => ({ id: v.id, name: v.name }));
    }
  } catch (err) {
    if (!isBackendUnavailable(err)) throw err;
  }
  await wait();
  return vaults.map((v) => ({ id: v.id, name: v.name }));
}

/**
 * Lista los eventos de la bitácora filtrados por bóveda (`ALL` o `vaultId`)
 * y por categoría (`ALL`, `Accesos`, `Seguridad`, `Archivos`, `Invitaciones`, `Ciclo de vida`).
 */
export async function listAuditEvents({ vaultId = 'ALL', type = 'ALL' } = {}) {
  try {
    const res = await api.getAuditLogs({ page: 1, limit: 100 });
    if (Array.isArray(res?.logs)) {
      const mapped = res.logs.map((log) => {
        const [label, tone, bold, category] = BACKEND_EVENT_MAP[log.event] || [
          log.event,
          'info',
          false,
          'Accesos',
        ];
        return {
          id: String(log.id),
          date: formatDateTime(log.created_at),
          event: label,
          tone,
          bold,
          category,
          vaultId: log.vault_id || null,
          target: log.vault_id ? log.vault_id.slice(0, 8) : '—',
          user: log.detail?.email || log.detail?.recipient_email || '—',
          ip: log.ip || '—',
          detail: formatDetail(log.detail),
        };
      });

      return mapped.filter((item) => {
        if (vaultId && vaultId !== 'ALL' && item.vaultId !== vaultId) return false;
        if (type && type !== 'ALL' && item.category !== type) return false;
        return true;
      });
    }
  } catch (err) {
    if (!isBackendUnavailable(err)) throw err;
  }

  await wait();
  return auditEvents
    .filter((item) => {
      if (vaultId && vaultId !== 'ALL' && item.vaultId !== vaultId) return false;
      if (type && type !== 'ALL' && item.category !== type) return false;
      return true;
    })
    .map((item) => ({ ...item }));
}
