# Reporte de Claude Code

> Claude Code: reescribe **todo** este archivo al terminar cada tarea (no lo acumules).
> Claude Chat lo lee para revisar. No edites `ai/siguiente.md`.

**Tarea:** T-10 · Detalle: invitar y llaves
**Rama:** `02-vistas-v2`
**Estado:** Completada
**Fecha:** 2026-11-20

## Qué hice
- **`app/vaults/[id]/page.jsx`:**
  - Tarjeta lateral "Invitar por correo" (`rounded-2xl border border-niebla bg-white p-5 gap-3.5`) con `Field` "Correo del destinatario", `Select` "La invitación expira en" (24, 48 por defecto, 72, 168 horas), botón primario "Crear invitación" y bloque desplegable "Invitación creada" (`rounded-xl border border-salvia bg-success-bg p-4 gap-3`) con `CopyField` "Enlace de invitación" (`https://secdocs.app/invitacion/<token>`).
  - Al crear una invitación se agrega la fila `PENDING` en la tabla de miembros y se actualiza el contador del encabezado.
  - Tarjeta lateral "Llaves de esta bóveda" (`p-5 gap-2.5`, título 16/24 semibold) con las 3 filas: `KEK` → `v1 · creada 01/11/26`, `DEKs activas` → `{n} (una por archivo)` (dinámico según la cuenta real de archivos) y `Almacenamiento` → `Cloudflare R2 · nombres UUID`.

## Verificación
- Medidas verificadas contra `ai/especificacion-vistas.md` (vista 04, nodos `29:981` y `29:1006`): columna lateral de 400 px, tarjetas con `p-5`, valores en `font-mono` 12/16.

## Grafo actualizado
- **Cambiados:** `C-vaultdetail` (`app/vaults/[id]/page.jsx`) pasa a `hecho`.

## Dudas
- Ninguna.
