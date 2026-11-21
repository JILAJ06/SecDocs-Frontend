// Enums y etiquetas exactos de INTEGRACION_FRONTEND.md (sección E).
// Los colores usan las clases de tailwind.config.js (success / danger / warning / info / niebla).

export const MAX_FILE_BYTES = 15 * 1024 * 1024; // MAX_FILE_SIZE_MB = 15
export const MAX_FILE_MB = 15;
export const MAX_UNLOCK_ATTEMPTS = 5;
export const TICKET_TTL_SECONDS = 60;
export const VAULT_MAX_DAYS = 365;
export const AUDIT_PAGE_SIZE = 20;

const OK = 'bg-success-bg text-success-text ring-1 ring-success-border';
const BAD = 'bg-danger-bg text-danger-text ring-1 ring-danger-border';
const WARN = 'bg-warning-bg text-warning-text ring-1 ring-warning-border';
const INFO = 'bg-info-bg text-info-text ring-1 ring-info-border';
const NEUTRAL = 'bg-niebla text-bosque-soft ring-1 ring-salvia';

/** VaultStatus */
export const VAULT_STATUS = {
  ACTIVE: { label: 'Activa', cls: OK },
  LOCKED: { label: 'Bloqueada', cls: WARN },
  EXPIRED: { label: 'Expirada', cls: NEUTRAL },
  PURGED: { label: 'Destruida', cls: BAD },
};

/** KekStatus */
export const KEK_STATUS = {
  ACTIVE: { label: 'Activa', cls: OK },
  PURGED: { label: 'Destruida', cls: BAD },
};

/** VaultFileStatus */
export const FILE_STATUS = {
  ACTIVE: { label: 'Activo', cls: OK },
  PURGED: { label: 'Destruido', cls: NEUTRAL },
};

/** WorkspaceMemberStatus */
export const MEMBER_STATUS = {
  PENDING: { label: 'Pendiente', cls: INFO },
  ACCEPTED: { label: 'Aceptada', cls: OK },
  TEMP_LOCKED: { label: 'Bloqueo temporal', cls: WARN },
  REVOKED: { label: 'Revocada', cls: BAD },
  EXPIRED: { label: 'Expirada', cls: NEUTRAL },
};

/** El backend puede devolver status ACTIVE con expired=true: se muestra como Expirada. */
export function effectiveVaultStatus(vault) {
  if (!vault) return 'ACTIVE';
  if (vault.status === 'ACTIVE' && vault.expired) return 'EXPIRED';
  return vault.status;
}

/** AuditEvent: nombre exacto de access_logs.event → etiqueta y color. */
export const AUDIT_EVENTS = {
  USER_REGISTERED: { label: 'Cuenta registrada', cls: INFO },
  LOGIN_SUCCESS: { label: 'Inicio de sesión', cls: OK },
  LOGIN_FAILED: { label: 'Inicio de sesión fallido', cls: BAD },
  SESSION_REVOKED: { label: 'Sesión revocada', cls: WARN },
  VAULT_CREATED: { label: 'Bóveda creada', cls: INFO },
  VAULT_LOCKED: { label: 'Bóveda bloqueada', cls: WARN },
  VAULT_UNLOCKED: { label: 'Bóveda reactivada', cls: OK },
  VAULT_PURGED: { label: 'Bóveda destruida', cls: BAD },
  VAULT_EXPIRED: { label: 'Bóveda expirada', cls: NEUTRAL },
  FILE_UPLOADED: { label: 'Archivo subido', cls: INFO },
  FILE_PURGED: { label: 'Archivo destruido', cls: WARN },
  MEMBER_INVITED: { label: 'Miembro invitado', cls: INFO },
  MEMBER_REVOKED: { label: 'Miembro revocado', cls: WARN },
  IDENTITY_VERIFIED: { label: 'Identidad verificada', cls: OK },
  PASSWORD_SENT: { label: 'Clave enviada (Canal 2)', cls: INFO },
  UNLOCK_FAILED: { label: 'Desbloqueo fallido', cls: BAD },
  VAULT_UNLOCKED_BY_MEMBER: { label: 'Bóveda desbloqueada por invitado', cls: OK },
  FILE_DOWNLOADED: { label: 'Archivo descargado', cls: OK },
  DOWNLOAD_DENIED: { label: 'Descarga denegada', cls: BAD },
  DOWNLOAD_FAILED: { label: 'Descarga fallida', cls: BAD },
  ACCESS_DENIED: { label: 'Acceso denegado', cls: BAD },
};

/** Extensiones de la allowlist de subida (la validación real es por magic bytes en el servidor). */
export const UPLOAD_ACCEPT = '.pdf,.docx,.xlsx,.pptx,.txt,.csv,.png,.jpg,.jpeg,.webp,.zip';
