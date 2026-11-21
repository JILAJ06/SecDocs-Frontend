// Servicios de sesiones y seguridad de la cuenta para la vista 12 (/security).
import { recordMockAuditEvent } from '@/lib/mock/audit';
import { sessions } from '@/lib/mock/sessions';
import { DEMO_PASSWORD, registeredPasswords, users } from '@/lib/mock/users';

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 300 + Math.floor(Math.random() * 201)));
}

/** Lista todas las sesiones de la cuenta en memoria. */
export async function listSessions() {
  await wait();
  return sessions.map((s) => ({ ...s }));
}

/** Revoca una sesión individual por id, actualiza su detalle y lo registra en auditoría. */
export async function revokeSession(id, userEmail = 'alex@upchiapas.edu.mx') {
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

/** Revoca todas las sesiones activas excepto la del dispositivo actual. */
export async function revokeAllSessions(userEmail = 'alex@upchiapas.edu.mx') {
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

/** Valida y cambia la contraseña de la cuenta en memoria. */
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
