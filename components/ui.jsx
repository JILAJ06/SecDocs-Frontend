'use client';

import { useState } from 'react';

/** Logo: candado + "SecDocs". Grande (ícono 30 px, texto 24/32) o chico (ícono 22 px, texto 18/28). */
export function Brand({ small = false }) {
  const size = small ? 22 : 30;
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-bosque">
        <rect x="4" y="10" width="16" height="11" rx="2.5" stroke="currentColor" strokeWidth="2" />
        <path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="15.5" r="1.6" fill="currentColor" />
      </svg>
      <span className={`${small ? 'text-lg leading-7' : 'text-2xl leading-8'} font-bold tracking-[-0.5px] text-bosque`}>
        Sec<span className="text-salvia">Docs</span>
      </span>
    </div>
  );
}

const BUTTON_VARIANTS = {
  primary: 'bg-bosque text-white hover:bg-bosque-hover',
  secondary: 'bg-white border border-salvia text-bosque-neutral hover:bg-niebla',
  danger: 'bg-white border border-danger-border text-danger-text hover:bg-danger-bg',
};

/** Botón del Figma: variantes primary | secondary | danger. */
export function Button({ variant = 'primary', type = 'button', disabled = false, className = '', children, ...rest }) {
  const look = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary;
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold leading-5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-salvia disabled:cursor-not-allowed disabled:opacity-50 ${look} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

const STATUS = {
  ACTIVE: ['Activo', 'bg-success-bg text-success-text ring-1 ring-success-border'],
  CONSUMED: ['Consumido', 'bg-info-bg text-info-text ring-1 ring-info-border'],
  EXPIRED: ['Expirado', 'bg-niebla text-bosque-soft ring-1 ring-salvia'],
  REVOKED: ['Revocado', 'bg-warning-bg text-warning-text ring-1 ring-warning-border'],
  LOCKED: ['Bloqueado', 'bg-danger-bg text-danger-text ring-1 ring-danger-border'],
  PURGED: ['Destruido', 'bg-niebla text-bosque-soft ring-1 ring-salvia'],
};

export function StatusBadge({ status }) {
  const [label, cls] = STATUS[status] || [status, 'bg-niebla text-bosque-soft'];
  return <span className={`badge ${cls}`}>{label}</span>;
}

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
  return <div className={`rounded-lg border px-3 py-2 text-sm ${cls}`}>{children}</div>;
}
