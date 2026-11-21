'use client';

import { StatusBadge } from './ui';

/**
 * Fila de sesión en la tarjeta "Sesiones activas" (Figma vista 12, nodo 31:1187).
 * Alto 60 px (`h-[60px]`), opacidad 60 % cuando está revocada, y botón de texto "Revocar" en las activas no actuales.
 */
export default function SessionRow({ item, onRevoke, disabled = false }) {
  const isRevoked = item.status === 'REVOKED';
  const canRevoke = item.status === 'ACTIVE' && !item.current;

  return (
    <div
      className={`flex h-[60px] items-center gap-3 border-t border-niebla py-3.5 ${
        isRevoked ? 'opacity-60' : ''
      }`}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-niebla text-bosque">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect
            x="3"
            y="4"
            width="18"
            height="12"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M8 20h8m-4-4v4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold leading-5 text-bosque">
            {item.device}
          </span>
          <StatusBadge status={item.status} />
        </div>
        <span className="truncate text-xs leading-4 text-bosque-soft">{item.detail}</span>
      </div>

      {canRevoke && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onRevoke?.(item)}
          className="shrink-0 text-xs font-semibold leading-4 text-danger-text hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-salvia disabled:opacity-50"
        >
          Revocar
        </button>
      )}
    </div>
  );
}
