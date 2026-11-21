'use client';

import { useEffect, useId, useRef } from 'react';

/**
 * Modal genérico accesible (Figma vista 03b y confirmaciones).
 * Bloquea el scroll del body, cierra con Escape o clic en el velo, enfoca el primer control
 * y devuelve el foco al cerrarse.
 */
export default function Modal({ open, onClose, title, children }) {
  const titleId = useId();
  const panelRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    previousFocusRef.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    if (panel) {
      const firstInput = panel.querySelector('input, select, textarea, button');
      if (firstInput) firstInput.focus();
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bosque/35 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className="flex w-[480px] max-w-[calc(100vw-32px)] flex-col gap-4 rounded-2xl bg-white p-6 shadow-[0_16px_48px_0_rgba(0,38,26,0.25)]"
      >
        {title && (
          <h2 id={titleId} className="text-lg font-semibold leading-7 text-bosque">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
