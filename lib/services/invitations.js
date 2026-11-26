// Servicios de invitación (pantallas 05, 06 y 07) conectados al backend real (/api/v1/invitations/*)
// con respaldo automático al mock en memoria cuando el backend no está disponible o se usan tokens de ejemplo.
import * as api from '@/lib/api';
import { recordMockAuditEvent } from '@/lib/mock/audit';
import { BOVEDA_DEMO_PASSWORD, invitationsByToken, vaultMembers } from '@/lib/mock/vaults';

// Guarda en memoria el último token de invitación verificado para que /shared/[id]
// pueda desbloquear la bóveda contra el endpoint del backend (/invitations/:token/unlock).
export const verifiedTokensByKey = new Map();

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 300 + Math.floor(Math.random() * 201)));
}

function isBackendUnavailable(err) {
  return !err || err.status === 0 || err.status === 502 || err.status === 503 || err.status === 504;
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

/** Obtiene los datos públicos de una invitación por token. */
export async function getInvitation(token) {
  // Si el token existe en el mock local, lo resuelve primero o si el backend no está levantado.
  const localInv = invitationsByToken[token];
  try {
    const res = await api.getInvitation(token);
    if (res?.invitation) {
      const inv = res.invitation;
      return {
        token,
        vaultId: inv.vaultId || token,
        vaultName: inv.vaultName,
        ownerName: inv.ownerEmail || 'Alexander J.',
        inviteEmail: inv.inviteEmail || '',
        maskedEmail: inv.maskedEmail,
        status: inv.status,
        fromBackend: true,
      };
    }
  } catch (err) {
    if (!isBackendUnavailable(err) && !localInv) {
      throw new Error('Invitación no válida o expirada');
    }
  }

  await wait();
  if (!localInv) throw new Error('Invitación no válida o expirada');
  return {
    token: localInv.token,
    vaultId: localInv.vaultId,
    vaultName: localInv.vaultName,
    ownerName: localInv.ownerName || 'Alexander J.',
    inviteEmail: localInv.inviteEmail,
    maskedEmail: maskEmail(localInv.inviteEmail),
    status: localInv.status,
    fromBackend: false,
  };
}

/**
 * Verifica que el correo de la sesión coincida con la invitación y solicita el envío de la clave por Canal 2.
 */
export async function acceptInvitation(token, sessionEmail) {
  const localInv = invitationsByToken[token];
  try {
    const res = await api.verifyIdentity(token);
    if (res?.ok) {
      verifiedTokensByKey.set('lastToken', token);
      verifiedTokensByKey.set(token, token);
      return {
        accepted: true,
        cooldownSeconds: res.cooldownSeconds || 60,
      };
    }
  } catch (err) {
    if (!isBackendUnavailable(err) && !localInv) {
      if (err.status === 403) {
        return { accepted: false };
      }
      if (err.status === 429) {
        verifiedTokensByKey.set('lastToken', token);
        verifiedTokensByKey.set(token, token);
        return {
          accepted: true,
          cooldownSeconds: err.data?.retryAfterSeconds || 60,
        };
      }
      throw new Error(err.message || 'Invitación no válida o expirada');
    }
  }

  await wait();
  if (!localInv) throw new Error('Invitación no válida o expirada');

  const cleanSession = String(sessionEmail || '').trim().toLowerCase();
  const cleanInvite = localInv.inviteEmail.trim().toLowerCase();

  if (cleanSession !== cleanInvite) {
    recordMockAuditEvent({
      event: 'Acceso denegado: correo no coincide',
      tone: 'danger',
      bold: true,
      category: 'Seguridad',
      vaultId: localInv.vaultId,
      target: localInv.vaultName,
      user: sessionEmail || '—',
      ip: '189.203.11.4',
      detail: 'invitación de otra cuenta',
    });
    return { accepted: false };
  }

  localInv.status = 'ACCEPTED';
  const list = vaultMembers[localInv.vaultId] || [];
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
    vaultId: localInv.vaultId,
    target: localInv.vaultName,
    user: localInv.inviteEmail,
    ip: '187.190.42.10',
    detail: 'el correo coincide',
  });

  recordMockAuditEvent({
    event: 'Contraseña enviada por correo',
    tone: 'success',
    bold: false,
    category: 'Invitaciones',
    vaultId: localInv.vaultId,
    target: localInv.vaultName,
    user: localInv.inviteEmail,
    ip: '—',
    detail: 'canal 2',
  });

  return {
    accepted: true,
    emailPreview: buildChannel2EmailPreview(localInv.vaultName),
  };
}

/** Reenvía la contraseña de la bóveda por el canal 2. */
export async function sendVaultPassword(token) {
  const localInv = invitationsByToken[token];
  try {
    await api.verifyIdentity(token);
    return { ok: true };
  } catch (err) {
    if (!isBackendUnavailable(err) && !localInv) {
      if (err.status === 429) return { ok: true };
      throw new Error(err.message || 'No se pudo reenviar la contraseña');
    }
  }

  await wait();
  if (!localInv) throw new Error('Invitación no válida o expirada');
  recordMockAuditEvent({
    event: 'Contraseña enviada por correo',
    tone: 'success',
    bold: false,
    category: 'Invitaciones',
    vaultId: localInv.vaultId,
    target: localInv.vaultName,
    user: localInv.inviteEmail,
    ip: '—',
    detail: 'canal 2',
  });
  return buildChannel2EmailPreview(localInv.vaultName);
}
