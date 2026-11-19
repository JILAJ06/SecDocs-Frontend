'use client';

import { useId, useState } from 'react';

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

const TONES = {
  success: 'bg-success-bg border-success-border text-success-text',
  info: 'bg-info-bg border-info-border text-info-text',
  warning: 'bg-warning-bg border-warning-border text-warning-text',
  danger: 'bg-danger-bg border-danger-border text-danger-text',
  niebla: 'bg-niebla border-salvia text-bosque-neutral',
  purged: 'bg-niebla border-salvia text-bosque-soft',
};

// Claves v1 (enlaces y archivos) + v2 (bóvedas, miembros, invitaciones).
// Las terminadas en _F son la forma femenina (bóveda): Activa, Expirada, Bloqueada.
const STATUS = {
  ACTIVE: ['Activo', 'success'],
  ACTIVE_F: ['Activa', 'success'],
  ACCEPTED: ['Aceptada', 'success'],
  CONSUMED: ['Consumido', 'info'],
  PENDING: ['Pendiente', 'info'],
  EXPIRED: ['Expirado', 'niebla'],
  EXPIRED_F: ['Expirada', 'niebla'],
  PURGED: ['Destruido', 'purged'],
  REVOKED: ['Revocado', 'warning'],
  TEMP_LOCK: ['Bloqueo temporal', 'warning'],
  LOCKED: ['Bloqueado', 'danger'],
  LOCKED_F: ['Bloqueada', 'danger'],
};

/** Píldora de estado. `status` es una clave de STATUS; si no existe, se muestra tal cual en gris. */
export function StatusBadge({ status }) {
  const [label, tone] = STATUS[status] || [status, 'niebla'];
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold leading-4 ${TONES[tone]}`}>
      {label}
    </span>
  );
}

const FIELD_LABEL = 'text-xs font-medium uppercase leading-4 tracking-[0.6px] text-bosque-soft';
const FIELD_BOX =
  'w-full rounded-lg border border-salvia bg-white px-3 py-2 text-sm leading-5 text-bosque placeholder-bosque-muted focus:border-bosque focus:outline-none focus:ring-1 focus:ring-bosque';

/** Campo de texto con etiqueta. `mono` usa JetBrains Mono (claves, tokens, URLs). */
export function Field({ label, id, mono = false, type = 'text', className = '', ...rest }) {
  const autoId = useId();
  const fieldId = id || autoId;
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={fieldId} className={FIELD_LABEL}>{label}</label>}
      <input id={fieldId} type={type} className={`${FIELD_BOX} ${mono ? 'font-mono' : ''} ${className}`} {...rest} />
    </div>
  );
}

/** Selector con etiqueta y chevron propio. Las opciones van como children. */
export function Select({ label, id, mono = false, className = '', children, ...rest }) {
  const autoId = useId();
  const fieldId = id || autoId;
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={fieldId} className={FIELD_LABEL}>{label}</label>}
      <div className="relative">
        <select id={fieldId} className={`${FIELD_BOX} appearance-none pr-8 ${mono ? 'font-mono' : ''} ${className}`} {...rest}>
          {children}
        </select>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-bosque"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

/** Valor de solo lectura con botón para copiarlo al portapapeles. */
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
    <div className="flex flex-col gap-1">
      {label && <span className={FIELD_LABEL}>{label}</span>}
      <div className="flex gap-2">
        <input
          readOnly value={value} aria-label={label}
          className={`${FIELD_BOX} min-w-0 truncate ${mono ? 'font-mono' : ''}`}
          onFocus={(e) => e.target.select()}
        />
        <Button variant="secondary" onClick={copy} className="shrink-0">
          {copied ? 'Copiado' : 'Copiar'}
        </Button>
      </div>
    </div>
  );
}

const ALERT_KINDS = {
  error: 'border-danger-border bg-danger-bg text-danger-text',
  warn: 'border-warning-border bg-warning-bg text-warning-text',
  ok: 'border-success-border bg-success-bg text-success-text',
  info: 'border-salvia bg-white text-bosque-soft', // solo v1
};

/** Alerta: error | warn | ok (Figma) e info (v1). No se dibuja si no hay contenido. */
export function Alert({ kind = 'error', children }) {
  if (!children) return null;
  const cls = ALERT_KINDS[kind] || ALERT_KINDS.error;
  return <div className={`rounded-lg border px-3 py-2 text-sm leading-5 ${cls}`}>{children}</div>;
}
