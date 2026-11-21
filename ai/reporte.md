# Reporte de Claude Code

> Claude Code: reescribe **todo** este archivo al terminar cada tarea (no lo acumules).
> Claude Chat lo lee para revisar. No edites `ai/siguiente.md`.

**Tarea:** T-06 · Modal "Nueva bóveda"
**Rama:** `02-vistas-v2`
**Estado:** Completada
**Fecha:** 2026-11-20

## Qué hice
- **`components/Modal.jsx` (nuevo):** modal genérico accesible con velo `bg-bosque/35`, panel `w-[480px] rounded-2xl bg-white p-6 gap-4 shadow-[0_16px_48px_0_rgba(0,38,26,0.25)]`, `role="dialog" aria-modal="true" aria-labelledby`, bloqueo de scroll del body, cierre con Escape y clic en el velo, trampa de foco y restauración del foco al cerrar.
- **`components/NewVaultModal.jsx` (nuevo):** formulario de creación de bóveda con textos exactos del Figma (`29:644`), `Field` "Nombre de la bóveda", `Select` "La bóveda expira en" (7, 15, 30, 60, 90 días), `Alert kind="ok"` de KEK exclusiva, validación de nombre vacío ("El nombre es obligatorio") y llamada a `createVault`.
- **`app/vaults/page.jsx`:** conecté el botón "+ Nueva bóveda" y la tarjeta punteada con `NewVaultModal`; al crear una bóveda se inserta al inicio de la lista.

## Verificación
- Medidas verificadas contra `ai/especificacion-vistas.md` (vista 03b, nodo `29:644`): modal de 480 px, padding 24 px (`p-6`), `gap-4`, velo 35 % bosque.

## Grafo actualizado
- **Creados:** `C-modal` (`components/Modal.jsx`), `C-newvaultmodal` (`components/NewVaultModal.jsx`).
- **Cambiados:** `C-vaults` pasa a `hecho`.

## Dudas
- Ninguna.
