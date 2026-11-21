'use client';

import { useState } from 'react';
import { StatusBadge } from './ui';

/**
 * Fila de miembro o invitación en la tarjeta "Miembros e invitaciones" (Figma 29:933).
 * Incluye confirmación inline ("¿Seguro? · Sí · No") para Revocar acceso / Cancelar invitación.
 */
export default function MemberRow({ member, onRemove }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const isPending = member.status === 'PENDING';
  const actionLabel = isPending ? 'Cancelar invitación' : 'Revocar acceso';

  async function handleConfirm() {
    setBusy(true);
    try {
      await onRemove?.(member);
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  }

  return (
    <div className="flex h-11 items-center border-t border-niebla py-2.5 text-sm leading-5">
      <div className="w-[210px] shrink-0 pr-2.5">
        <span className="block w-[200px] truncate font-medium text-bosque">{member.email}</span>
      </div>
      <div className="w-[140px] shrink-0">
        <StatusBadge status={member.status} />
      </div>
      <div className="w-[70px] shrink-0 text-bosque">{member.attempts || '—'}</div>
      <div className="w-[140px] shrink-0 text-bosque-soft">{member.activity}</div>
      <div className="flex flex-1 items-center justify-end gap-1.5 text-xs font-semibold leading-4">
        {confirming ? (
          <>
            <span className="text-bosque-soft">¿Seguro?</span>
            <button
              type="button"
              disabled={busy}
              onClick={handleConfirm}
              className="text-danger-text hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-salvia disabled:opacity-50"
            >
              Sí
            </button>
            <span className="text-bosque-muted">·</span>
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirming(false)}
              className="text-bosque hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-salvia disabled:opacity-50"
            >
              No
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="text-danger-text hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-salvia"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
