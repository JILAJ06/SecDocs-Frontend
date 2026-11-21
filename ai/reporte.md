# Reporte de Claude Code

> Claude Code: reescribe **todo** este archivo al terminar cada tarea (no lo acumules).
> Claude Chat lo lee para revisar. No edites `ai/siguiente.md`.

**Tarea:** T-17 · Seguridad de la cuenta
**Rama:** `02-vistas-v2`
**Estado:** Completada
**Fecha:** 2026-11-20

## Qué hice
- **`lib/mock/sessions.js` (nuevo):** arreglo con las 4 sesiones del Figma (`s-1` a `s-4`: Chrome · Windows activa actual, Safari · iPhone activa, Firefox · Linux activa, Chrome · Android revocada).
- **`lib/services/sessions.js` (nuevo):** `listSessions()`, `revokeSession(id)`, `revokeAllSessions()` (revoca todas menos la actual y agrega "Sesión revocada (kill-switch)" a la bitácora) y `changePassword(current, next)`.
- **`components/SessionRow.jsx` (nuevo):** fila de sesión de 60 px (`h-[60px] border-t border-niebla py-3.5 flex items-center gap-3`) con ícono de dispositivo en cuadro `size-10 rounded-xl bg-niebla`, línea 1 con dispositivo 14/20 semibold y `StatusBadge`, línea 2 con detalle 12/16 `text-bosque-soft`, acción "Revocar" en las activas no actuales y `opacity-60` en las revocadas.
- **`app/security/page.jsx` (nuevo):**
  - `AppHeader active="security"`, contenedor de 1152 px (`gap-5`), título "Seguridad de la cuenta" y `Alert kind="ok"` "Sesión revocada: {dispositivo}. Su token quedó en la lista negra y ya no puede usarse." (sembrado inicial con "Chrome · Android").
  - Columnas `flex-1` (izquierda) y `w-[380px]` (lateral).
  - Tarjeta "Sesiones activas" (`p-6 gap-1`) con botón peligro "Cerrar todas las sesiones" (confirmación inline "¿Seguro? · Sí · No") y las 4 filas `SessionRow`.
  - Tarjetas laterales "¿Cómo funciona el kill-switch?" (`p-6 gap-2.5`) y "Tu cuenta" (`p-6 gap-3`) con botón secundario "Cambiar contraseña" que abre el `Modal` para actualizar la contraseña con validación de contraseña actual, longitud (12–72 caracteres) y coincidencia.

## Verificación
- Medidas verificadas contra `ai/especificacion-vistas.md` (vista 12, nodo `31:1187`): columna lateral de 380 px, tarjetas con `p-6`, filas de 60 px (`h-[60px]`), fila revocada con `opacity-60`.

## Grafo actualizado
- **Creados:** `C-sessionrow` (`components/SessionRow.jsx`), `C-security` (`app/security/page.jsx`).
- **Cambiados:** `C-mock` y `C-services` pasan a `hecho`.

## Dudas
- Ninguna.
