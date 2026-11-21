# Reporte de Claude Code

> Claude Code: reescribe **todo** este archivo al terminar cada tarea (no lo acumules).
> Claude Chat lo lee para revisar. No edites `ai/siguiente.md`.

**Tarea:** T-04 · Datos mock y servicios
**Rama:** `02-vistas-v2`
**Estado:** Completada
**Fecha:** 2026-11-20

## Qué hice
- **`lib/mock/users.js`:** agregué el usuario `u-3` (`otro.usuario@gmail.com`) para probar el caso de acceso denegado en invitaciones.
- **`lib/mock/vaults.js` (nuevo):** definí las fechas fijas de la maqueta (`14/11/26` y `14/11/26 10:45`), `BOVEDA_DEMO_PASSWORD = 'boveda-maqueta-2026'`, las métricas fijas (`vaultSummary`), las 5 bóvedas del dueño (`v-1` a `v-5`), los archivos y miembros de ejemplo, y el mapa de invitaciones por token.
- **`lib/services/vaults.js` (nuevo):** implementé `getVaultSummary`, `listVaults`, `getVault`, `createVault`, `lockVault`, `destroyVault`, `listFiles`, `addFile`, `destroyFile`, `listMembers`, `createInvitation`, `cancelInvitation` y `revokeMember` con espera simulada de 300–500 ms y validaciones en memoria.
- **`components/SessionProvider.jsx`:** agregué el hook `useRequireSession()` que redirige a `/login` cuando no hay sesión activa en memoria.

## Verificación
- `npm run build` compila sin errores.

## Grafo actualizado
- **Cambiados:** `C-mock` (añade `lib/mock/vaults.js` y usuario `u-3`), `C-services` (añade `lib/services/vaults.js`), `C-session` (añade `useRequireSession`).

## Dudas
- Ninguna en esta tarea.
