# Reporte de Claude Code

> Claude Code: reescribe **todo** este archivo al terminar cada tarea (no lo acumules).
> Claude Chat lo lee para revisar. No edites `ai/siguiente.md`.

**Tarea:** T-14 · Bóveda compartida: contraseña
**Rama:** `02-vistas-v2`
**Estado:** Completada
**Fecha:** 2026-11-20

## Qué hice
- **`lib/services/shared.js` (nuevo):**
  - `getSharedVault(id, email)`: verifica membresía `ACCEPTED` (o estado de bloqueo durante la sesión), devuelve metadatos de la bóveda, archivos y estado de desbloqueo en memoria.
  - `unlockVault(id, email, password)`: valida contra `BOVEDA_DEMO_PASSWORD`. Si falla, aplica espera exponencial de 1, 2, 4 y 8 segundos (intentos 1 a 4, actualizando `TEMP_LOCK` en el miembro y registrando en la bitácora "Contraseña de bóveda incorrecta" con detalle `intento n/5 · espera s s`). Al 5.º intento fallido bloquea al miembro (`LOCKED`) con el mensaje "Acceso bloqueado. Se avisó al dueño de la bóveda." Si acierta, reinicia contadores y registra "Acceso a bóveda concedido".
  - `downloadSharedFile(id, email, file)` y `leaveVault(id, email)`.
- **`app/shared/[id]/page.jsx` (nuevo):**
  - Pantalla 09 (`30:1036`, columna de 448 px, `AppHeader active="shared"`) con cabecera de círculo 56×56 (`size-14 rounded-full bg-success-bg`) e ícono de candado de 26 px, `Field mono type="password"` "Contraseña de la bóveda", `Alert kind="warn"` (o `error` al quinto fallo), botón primario con cuenta regresiva en vivo ("Espera {s} s…", `aria-live="polite"`) y pie 12/16 `text-bosque-muted`.

## Verificación
- Medidas verificadas contra `ai/especificacion-vistas.md` (vista 09, nodo `30:1036`): columna de 448 px, círculo de 56 px, campo monoespaciado, esperas 1 / 2 / 4 / 8 s y bloqueo al 5.º intento.

## Grafo actualizado
- **Creados:** `C-sharedvault` (`app/shared/[id]/page.jsx`, en curso).
- **Cambiados:** `C-services` (añade `lib/services/shared.js`).

## Dudas
- Ninguna.
