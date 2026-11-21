'use client';

import { useState } from 'react';
import { FILE_STATUS, KEK_STATUS, MEMBER_STATUS, VAULT_STATUS, effectiveVaultStatus } from '@/lib/constants';

export function Brand({ small = false }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={small ? 22 : 30} height={small ? 22 : 30} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="10" width="16" height="11" rx="2.5" stroke="#00412E" strokeWidth="2" />
        <path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="#00412E" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="15.5" r="1.6" fill="#00412E" />
      </svg>
      <span className={`${small ? 'text-lg' : 'text-2xl'} font-bold tracking-tight`}>
        Sec<span className="text-salvia">Docs</span>
      </span>
    </div>
  );
}

function Badge({ map, status }) {
  const { label, cls } = map[status] || { label: status, cls: 'bg-niebla text-bosque-soft' };
  return <span className={`badge ${cls}`}>{label}</span>;
}

export const VaultBadge = ({ vault, status }) => <Badge map={VAULT_STATUS} status={status || effectiveVaultStatus(vault)} />;
export const MemberBadge = ({ status }) => <Badge map={MEMBER_STATUS} status={status} />;
export const FileBadge = ({ status }) => <Badge map={FILE_STATUS} status={status} />;
export const KekBadge = ({ status }) => <Badge map={KEK_STATUS} status={status} />;

export function CopyField({ label, value, mono = true }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* el usuario puede copiar manualmente */
    }
  };
  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex gap-2">
        <input readOnly value={value} className={`input ${mono ? 'font-mono' : ''}`} onFocus={(e) => e.target.select()} />
        <button type="button" onClick={copy} className="btn-ghost shrink-0">
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  );
}

export function Alert({ kind = 'error', children }) {
  if (!children) return null;
  const cls = {
    error: 'border-danger-border bg-danger-bg text-danger-text',
    warn: 'border-warning-border bg-warning-bg text-warning-text',
    ok: 'border-success-border bg-success-bg text-success-text',
    info: 'border-salvia bg-white text-bosque-soft',
  }[kind];
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-3 py-2 text-sm ${cls}`}>
      {children}
    </div>
  );
}

/** Modal accesible mínimo. */
export function Modal({ title, children, onClose, closeLabel = 'Cerrar' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="card max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          {onClose && (
            <button type="button" onClick={onClose} className="text-sm text-bosque-soft hover:text-bosque" aria-label={closeLabel}>
              ✕
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export function Spinner({ text = 'Cargando…' }) {
  return <div className="card text-sm text-bosque-muted">{text}</div>;
}

export function Stat({ label, value }) {
  return (
    <div className="card">
      <p className="text-xs font-medium uppercase tracking-wide text-bosque-soft">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
