// Servicio de bitácora de auditoría para la vista 11 (/audit).
import { auditEvents } from '@/lib/mock/audit';
import { vaults } from '@/lib/mock/vaults';

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 300 + Math.floor(Math.random() * 201)));
}

/** Devuelve las opciones de bóvedas para el filtro de la vista de auditoría. */
export async function listAuditVaultOptions() {
  await wait();
  return vaults.map((v) => ({ id: v.id, name: v.name }));
}

/**
 * Lista los eventos de la bitácora filtrados por bóveda (`ALL` o `vaultId`)
 * y por categoría (`ALL`, `Accesos`, `Seguridad`, `Archivos`, `Invitaciones`, `Ciclo de vida`).
 */
export async function listAuditEvents({ vaultId = 'ALL', type = 'ALL' } = {}) {
  await wait();
  return auditEvents
    .filter((item) => {
      if (vaultId && vaultId !== 'ALL' && item.vaultId !== vaultId) return false;
      if (type && type !== 'ALL' && item.category !== type) return false;
      return true;
    })
    .map((item) => ({ ...item }));
}
