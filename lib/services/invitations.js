// Servicios de invitación (pantallas 05, 06 y 07, más referencia del correo canal 2 vista 08).
import { recordMockAuditEvent } from '@/lib/mock/audit';
import { BOVEDA_DEMO_PASSWORD, invitationsByToken, vaultMembers } from '@/lib/mock/vaults';

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 300 + Math.floor(Math.random() * 201)));
}

/**
 * Enmascara un correo electrónico: primera letra + "•••••" + última letra del usuario + "@" + dominio.
 * Ejemplo: auditor@empresa.com -> a•••••r@empresa.com
 */
export function maskEmail(email = '') {
  const [userPart, domainPart] = String(email).split('@');
  if (!userPart || !domainPart) return email;
  if (userPart.length <= 2) return `${userPart[0] || ''}•••••@${domainPart}`;
  return `${userPart[0]}•••••${userPart[userPart.length - 1]}@${domainPart}`;
}

/** Texto de referencia del correo de canal 2 (vista 08 del Figma, no es ruta web). */
export function buildChannel2EmailPreview(vaultName) {
  return {
    subject: `Contraseña de la bóveda «${vaultName}»`,
    body: `Verificamos tu identidad. Esta es la contraseña de la bóveda «${vaultName}»: ${BOVEDA_DEMO_PASSWORD}. Por seguridad no la compartas ni la reenvíes.`,
  };
}

/** Obtiene los datos públicos de una invitación por token (con el correo enmascarado). */
export async function getInvitation(token) {
  await wait();
  const inv = invitationsByToken[token];
  if (!inv) throw new Error('Invitación no válida o expirada');
  return {
    token: inv.token,
    vaultId: inv.vaultId,
    vaultName: inv.vaultName,
    ownerName: inv.ownerName || 'Alexander J.',
    inviteEmail: inv.inviteEmail,
    maskedEmail: maskEmail(inv.inviteEmail),
    status: inv.status,
  };
}

/**
 * Verifica que el correo de la sesión coincida con la invitación.
 * Si coincide, marca la membresía ACCEPTED y registra en la bitácora "Identidad verificada"
 * y "Contraseña enviada por correo".
 */
export async function acceptInvitation(token, sessionEmail) {
  await wait();
  const inv = invitationsByToken[token];
  if (!inv) throw new Error('Invitación no válida o expirada');

  const cleanSession = String(sessionEmail || '').trim().toLowerCase();
  const cleanInvite = inv.inviteEmail.trim().toLowerCase();

  if (cleanSession !== cleanInvite) {
    recordMockAuditEvent({
      event: 'Acceso denegado: correo no coincide',
      tone: 'danger',
      bold: true,
      category: 'Seguridad',
      vaultId: inv.vaultId,
      target: inv.vaultName,
      user: sessionEmail || '—',
      ip: '189.203.11.4',
      detail: 'invitación de otra cuenta',
    });
    return { accepted: false };
  }

  inv.status = 'ACCEPTED';
  const list = vaultMembers[inv.vaultId] || [];
  const member = list.find((m) => m.email.toLowerCase() === cleanInvite);
  if (member) {
    member.status = 'ACCEPTED';
    member.attempts = '0/5';
    member.activity = 'hace un momento';
  }

  recordMockAuditEvent({
    event: 'Identidad verificada',
    tone: 'success',
    bold: false,
    category: 'Invitaciones',
    vaultId: inv.vaultId,
    target: inv.vaultName,
    user: inv.inviteEmail,
    ip: '187.190.42.10',
    detail: 'el correo coincide',
  });

  recordMockAuditEvent({
    event: 'Contraseña enviada por correo',
    tone: 'success',
    bold: false,
    category: 'Invitaciones',
    vaultId: inv.vaultId,
    target: inv.vaultName,
    user: inv.inviteEmail,
    ip: '—',
    detail: 'canal 2',
  });

  return {
    accepted: true,
    emailPreview: buildChannel2EmailPreview(inv.vaultName),
  };
}

/** Reenvía la contraseña de la bóveda por el canal 2 (simulado) y lo anota en la bitácora. */
export async function sendVaultPassword(token) {
  await wait();
  const inv = invitationsByToken[token];
  if (!inv) throw new Error('Invitación no válida o expirada');
  recordMockAuditEvent({
    event: 'Contraseña enviada por correo',
    tone: 'success',
    bold: false,
    category: 'Invitaciones',
    vaultId: inv.vaultId,
    target: inv.vaultName,
    user: inv.inviteEmail,
    ip: '—',
    detail: 'canal 2',
  });
  return buildChannel2EmailPreview(inv.vaultName);
}
