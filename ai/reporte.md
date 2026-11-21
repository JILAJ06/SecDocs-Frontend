# Reporte de Claude Code

> Claude Code: reescribe **todo** este archivo al terminar cada tarea (no lo acumules).
> Claude Chat lo lee para revisar. No edites `ai/siguiente.md`.

**Tarea:** T-07 · Detalle: encabezado y acciones
**Rama:** `02-vistas-v2`
**Estado:** Completada
**Fecha:** 2026-11-20

## Qué hice
- **`components/Card.jsx` (nuevo):** contenedor de tarjeta blanca (`rounded-2xl border border-niebla bg-white p-5`) con encabezado (`title` 18/28 semibold, `subtitle` 12/16 `text-bosque-soft` y `action` a la derecha).
- **`app/vaults/[id]/page.jsx` (nuevo):**
  - Carga de bóveda con `getVault(id)` y pantalla de "Bóveda no encontrada" con enlace "Volver a mis bóvedas".
  - Migas de pan "Mis bóvedas / {nombre}", título 24/32 semibold con `StatusBadge`, línea de metadatos ("Expira 30/11/26 · KEK v1 · 4 archivos · 12.4 MB · 3 miembros").
  - Botón secundario "Bloquear bóveda" (llama a `lockVault` y pasa a deshabilitado "Bloqueada") y botón peligro "Destruir bóveda" con modal de confirmación "¿Destruir «{nombre}»?" que llama a `destroyVault` y redirige a `/vaults`.
  - Estructura de dos columnas (`Principal` flexible y `Lateral` de `400 px`).

## Verificación
- Medidas verificadas contra `ai/especificacion-vistas.md` (vista 04, nodo `29:835`).

## Grafo actualizado
- **Creados:** `C-card` (`components/Card.jsx`), `C-vaultdetail` (`app/vaults/[id]/page.jsx`, en curso).

## Dudas
- Ninguna.
