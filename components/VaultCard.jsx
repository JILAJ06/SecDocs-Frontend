'use client';

import { useRouter } from 'next/navigation';
import { Button, StatusBadge } from './ui';

const VAULT_STATUS_BADGE = {
  ACTIVE: 'ACTIVE_F',
  LOCKED: 'LOCKED_F',
  EXPIRED: 'EXPIRED_F',
};

/**
 * Tarjeta de bóveda en la vista 03 Mis bóvedas (Figma 29:474).
 */
export default function VaultCard({ vault }) {
  const router = useRouter();
  const isExpired = vault.status === 'EXPIRED';
  const isLocked = vault.status === 'LOCKED';
  const badgeKey = VAULT_STATUS_BADGE[vault.status] || vault.status;

  const subtitle =
    vault.status === 'ACTIVE'
      ? `Creada ${vault.createdAt} · expira ${vault.expiresAt}`
      : vault.subtitle;

  const filesText = `${vault.filesCount} ${vault.filesCount === 1 ? 'archivo' : 'archivos'}`;
  const membersText = `${vault.membersCount} ${vault.membersCount === 1 ? 'miembro' : 'miembros'}`;

  const actionLabel = isExpired ? 'Ver bitácora' : isLocked ? 'Revisar' : 'Abrir bóveda';
  const targetHref = isExpired ? '/audit' : `/vaults/${vault.id}`;

  return (
    <article
      className={`flex w-full flex-col gap-4 rounded-2xl border border-salvia bg-white p-5 lg:w-[368px] ${
        isExpired ? 'opacity-65' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-niebla text-bosque">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="4" y="10" width="16" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="15.5" r="1.5" fill="currentColor" />
          </svg>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="truncate text-base font-semibold leading-6 text-bosque">{vault.name}</h2>
          <p className="text-xs leading-4 text-bosque-soft">{subtitle}</p>
        </div>
        <StatusBadge status={badgeKey} />
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-niebla px-2.5 py-1 text-xs font-semibold leading-4 text-bosque">
          {filesText}
        </span>
        <span className="rounded-full bg-niebla px-2.5 py-1 text-xs font-semibold leading-4 text-bosque">
          {membersText}
        </span>
        <span className="rounded-full bg-niebla px-2.5 py-1 text-xs font-semibold leading-4 text-bosque">
          {vault.sizeLabel}
        </span>
      </div>

      <Button variant="secondary" className="w-full" onClick={() => router.push(targetHref)}>
        {actionLabel}
      </Button>
    </article>
  );
}
