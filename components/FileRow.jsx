'use client';

import { Button } from './ui';

/**
 * Fila de archivo en el detalle de bóveda del dueño (`variant="owner"`, botón "Destruir")
 * o en la bóveda compartida (`variant="shared"`, botón "Descargar").
 */
export default function FileRow({ file, variant = 'owner', onAction, disabled = false }) {
  const isShared = variant === 'shared';
  const metaText = file.uploading
    ? 'Cifrando…'
    : isShared
      ? `${file.sizeLabel} · ${file.typeLabel} · subido ${file.uploadedAt} por ${file.author || 'Alexander J.'}`
      : `${file.sizeLabel} · ${file.typeLabel} · subido ${file.uploadedAt}`;

  return (
    <div className="flex h-16 items-center gap-3 rounded-xl border border-niebla bg-white px-4 py-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-niebla text-bosque">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-semibold leading-5 text-bosque">{file.name}</span>
        <span className="truncate text-xs leading-4 text-bosque-soft">{metaText}</span>
      </div>
      {!file.uploading && (
        <Button
          variant={isShared ? 'secondary' : 'danger'}
          disabled={disabled}
          onClick={() => onAction?.(file)}
          className="shrink-0"
        >
          {isShared ? 'Descargar' : 'Destruir'}
        </Button>
      )}
    </div>
  );
}
