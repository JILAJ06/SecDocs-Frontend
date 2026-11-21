# Reporte de Claude Code

> Claude Code: reescribe **todo** este archivo al terminar cada tarea (no lo acumules).
> Claude Chat lo lee para revisar. No edites `ai/siguiente.md`.

**Tarea:** T-08 · Detalle: archivos
**Rama:** `02-vistas-v2`
**Estado:** Completada
**Fecha:** 2026-11-20

## Qué hice
- **`components/FileRow.jsx` (nuevo):** fila de archivo de 64 px (`h-16 rounded-xl border border-niebla bg-white px-4 py-3 flex items-center gap-3`) con ícono de documento en contenedor `size-10 rounded-xl bg-niebla`, nombre 14/20 semibold con `truncate`, línea meta 12/16 `text-bosque-soft` (o "Cifrando…" mientras sube) y botón `variant="danger"` "Destruir" (`owner`) o `variant="secondary"` "Descargar" (`shared`).
- **`app/vaults/[id]/page.jsx`:**
  - Tarjeta "Archivos" con botón primario "Subir y cifrar", zona de carga punteada (`rounded-xl border-2 border-dashed border-salvia py-4`, con estado de arrastre `border-bosque bg-success-bg` y accesible por teclado), validación de 25 MB con `Alert kind="error"` y lista de filas `FileRow`.
  - Estado vacío "Esta bóveda aún no tiene archivos".
  - Modal de confirmación "¿Destruir «{archivo}»?" con texto "Se elimina su llave (DEK) y no se podrá recuperar." que llama a `destroyFile` y actualiza el contador del título.

## Verificación
- Medidas verificadas contra `ai/especificacion-vistas.md` (vista 04, nodo `29:880`): filas de 64 px, 4 archivos de `v-1` con sus metadatos exactos.

## Grafo actualizado
- **Creados:** `C-filerow` (`components/FileRow.jsx`).
- **Cambiados:** `C-vaultdetail` (usa `C-filerow`).

## Dudas
- Ninguna.
