# Reporte de Claude Code

> Claude Code: reescribe **todo** este archivo al terminar cada tarea (no lo acumules).
> Claude Chat lo lee para revisar. No edites `ai/siguiente.md`.

**Tarea:** T-19 · Cierre: Docker, README y verificación final (Resumen global T-03 ajuste → T-19)
**Rama:** `02-vistas-v2` (creada desde `01-autenticacion` tras el ajuste de T-03)
**Pull Request:** https://github.com/JILAJ06/SecDocs-Frontend/pull/5 (hacia `develop`; depende de #4)
**Estado:** Completada
**Fecha:** 2026-11-20

---

## Para probar la maqueta v2
- **`DEMO_PASSWORD` (cuentas de usuario):** `demo-maqueta-2026`
- **Usuarios de ejemplo:**
  - `alex@upchiapas.edu.mx` (dueño)
  - `auditor@empresa.com` (invitado aceptado en «Auditoría Financiera»)
  - `otro.usuario@gmail.com` (para probar «Acceso denegado» en invitaciones)
- **`BOVEDA_DEMO_PASSWORD` (contraseña de bóveda enviada por canal 2):** `boveda-maqueta-2026`
- **Tokens de invitación de ejemplo:**
  - `/invitacion/Tq7aN2xLm9Wc4ZpR8vK1sB6yH3dJ0eGf5uIo2nXaMrE` (`auditor@empresa.com`)
  - `/invitacion/Vb3xQ9mK2rT7wLp0aZ8cN4yE1uH6sJ5dF0gR2iO8nWk` (`contador@despacho.mx`)

---

## Resumen global por tarea

### T-03 (ajuste) · Separación de 16 px en el registro
- **Rama:** `01-autenticacion` (PR #4: https://github.com/JILAJ06/SecDocs-Frontend/pull/4)
- **Qué se hizo:** en `components/AuthForm.jsx` se quitó el contenedor `div` con `gap-1` alrededor del campo Contraseña y el texto `"Mínimo 12 caracteres. Se guarda con bcrypt (costo 12)."` para que ambos sean hijos directos del `<form>` con `gap-4` (16 px).

### T-04 · Datos mock y servicios
- **Rama:** `02-vistas-v2`
- **Qué se hizo:**
  - Se agregó `u-3` (`otro.usuario@gmail.com`) en `lib/mock/users.js`.
  - Se creó `lib/mock/vaults.js` con fechas fijas (`14/11/26` y `14/11/26 10:45`), `BOVEDA_DEMO_PASSWORD = 'boveda-maqueta-2026'`, métricas fijas del panel (`vaultSummary`), las 5 bóvedas (`v-1` a `v-5`), archivos, miembros e invitaciones por token.
  - Se creó `lib/services/vaults.js` con todas las operaciones asíncronas (`getVaultSummary`, `listVaults`, `getVault`, `createVault`, `lockVault`, `destroyVault`, `listFiles`, `addFile`, `destroyFile`, `listMembers`, `createInvitation`, `cancelInvitation`, `revokeMember`).
  - Se agregó el hook `useRequireSession()` en `components/SessionProvider.jsx`.

### T-05 · Mis bóvedas: lista (`/vaults`, Figma `29:474`)
- **Rama:** `02-vistas-v2`
- **Qué se hizo:**
  - Se crearon `components/Metrica.jsx` y `components/VaultCard.jsx` con las medidas, píldoras, opacidad de expiradas (`opacity-65`) y textos exactos del Figma.
  - Se creó `app/vaults/page.jsx` con las 4 métricas, las 5 tarjetas de bóveda y la sexta tarjeta punteada de `214 px` de alto.
  - Se actualizó `app/page.jsx` para redirigir `/` a `/vaults` (con sesión) o `/login` (sin sesión) y se retiró `app/dashboard/page.jsx`.

### T-06 · Modal "Nueva bóveda" (Figma `29:644`)
- **Rama:** `02-vistas-v2`
- **Qué se hizo:**
  - Se crearon `components/Modal.jsx` (accesible con `role="dialog"`, `aria-modal`, Escape, clic en velo `bg-bosque/35`, trampa de foco y bloqueo de scroll) y `components/NewVaultModal.jsx` (480 px de ancho, selector de vigencia 7/15/30/60/90 días, alerta verde de KEK exclusiva y validación de nombre obligatorio).
  - Se conectó con el botón `+ Nueva bóveda` y la tarjeta punteada de `/vaults`.

### T-07 · Detalle: encabezado y acciones (`/vaults/[id]`, Figma `29:835`)
- **Rama:** `02-vistas-v2`
- **Qué se hizo:**
  - Se creó `components/Card.jsx`.
  - Se creó `app/vaults/[id]/page.jsx` con migas de pan (`Mis bóvedas / {nombre}`), título 24/32 semibold + `StatusBadge`, línea de metadatos, botón secundario "Bloquear bóveda" (`lockVault` → pasa a deshabilitado "Bloqueada"), botón peligro "Destruir bóveda" con modal de confirmación (`destroyVault` → `/vaults`) y diseño de dos columnas (`Principal` flexible y `Lateral` de `400 px`).

### T-08 · Detalle: archivos (Figma `29:880`)
- **Rama:** `02-vistas-v2`
- **Qué se hizo:**
  - Se creó `components/FileRow.jsx` (`h-16`, variantes `owner` con botón peligro "Destruir" y `shared` con botón secundario "Descargar").
  - Se integró en `app/vaults/[id]/page.jsx` la zona de carga punteada (clic y arrastrar/soltar con feedback visual `border-bosque bg-success-bg`), validación de 25 MB, fila temporal "Cifrando…" durante la subida simulada y modal de confirmación para destruir archivos.

### T-09 · Detalle: miembros e invitaciones (Figma `29:933`)
- **Rama:** `02-vistas-v2`
- **Qué se hizo:**
  - Se creó `components/MemberRow.jsx` (`h-11`, columnas 210 / 140 / 70 / 140 px / acción a la derecha) con confirmación inline `"¿Seguro? · Sí · No"` para "Revocar acceso" y "Cancelar invitación".
  - Se integró la tabla en `app/vaults/[id]/page.jsx` actualizando el contador de miembros del encabezado.

### T-10 · Detalle: invitar y llaves (Figma `29:981` y `29:1006`)
- **Rama:** `02-vistas-v2`
- **Qué se hizo:**
  - Se integró la tarjeta lateral "Invitar por correo" (`gap-3.5`) con `Field` "Correo del destinatario", `Select` "La invitación expira en" (24, 48, 72, 168 horas), bloque "Invitación creada" (`bg-success-bg border-salvia`) con `CopyField` monoespaciado (`https://secdocs.app/invitacion/<token>`) y actualización inmediata de la tabla de miembros.
  - Se integró la tarjeta "Llaves de esta bóveda" con `KEK`, `DEKs activas` (sincronizadas con el número real de archivos) y `Almacenamiento`.

### T-11 · Invitación: iniciar sesión (`/invitacion/[token]`, Figma `30:877`)
- **Rama:** `02-vistas-v2`
- **Qué se hizo:**
  - Se crearon `lib/mock/audit.js` y `lib/services/invitations.js` (`getInvitation`, `acceptInvitation`, `sendVaultPassword`, `maskEmail` → `a•••••r@empresa.com` y texto de referencia del correo canal 2 de la vista 08).
  - Se añadió soporte seguro para `?next=` en `components/AuthForm.jsx` (solo rutas internas que inicien con `/`).
  - Se creó `app/invitacion/[token]/page.jsx` con la pantalla 05 (sin encabezado, columna de 420 px, aviso verde con círculo 44×44 y formulario de inicio de sesión) y se retiró `app/s/[token]/page.jsx`.

### T-12 · Invitación: identidad verificada (Figma `30:911`)
- **Rama:** `02-vistas-v2`
- **Qué se hizo:**
  - Se incorporó en `app/invitacion/[token]/page.jsx` la vista 06 (`AppHeader active="shared"`, columna de 480 px) cuando el correo en sesión coincide con el invitado: círculo 56×56 con palomita, caja de 4 pasos (3 con `✓` en `bg-bosque` y el 4.º con `→` en `bg-salvia` semibold), botón "Ingresar contraseña de la bóveda" (`→ /shared/{vaultId}`) y botón de reenvío con cuenta regresiva de 60 s.
  - Al verificarse, marca la membresía `ACCEPTED` y registra en la bitácora "Identidad verificada" y "Contraseña enviada por correo".

### T-13 · Invitación: acceso denegado (Figma `30:964`)
- **Rama:** `02-vistas-v2`
- **Qué se hizo:**
  - Se incorporó en `app/invitacion/[token]/page.jsx` la vista 07 cuando el correo en sesión no coincide con el invitado: círculo 56×56 `bg-danger-bg`, título "Acceso denegado" en `text-danger-text`, `Alert kind="error"`, botones "Ir a mis bóvedas" y "Cambiar de cuenta" (`signOut()`), sin revelar el correo invitado y registrando en la bitácora "Acceso denegado: correo no coincide".

### T-14 · Bóveda compartida: contraseña (`/shared/[id]`, Figma `30:1036`)
- **Rama:** `02-vistas-v2`
- **Qué se hizo:**
  - Se creó `lib/services/shared.js` con control de intentos por `(bóveda, correo)`, espera exponencial de 1, 2, 4 y 8 segundos en los fallos 1 a 4, bloqueo definitivo al 5.º fallo (`LOCKED`) y registro en la bitácora.
  - Se creó `app/shared/[id]/page.jsx` con la vista 09 (`AppHeader active="shared"`, columna de 448 px, campo monoespaciado de contraseña, alertas `warn`/`error` y botón con cuenta regresiva en vivo `Espera {s} s…`).

### T-15 · Bóveda compartida: archivos y lista (`30:1081` y `/shared`)
- **Rama:** `02-vistas-v2`
- **Qué se hizo:**
  - Se completó `app/shared/[id]/page.jsx` con la vista 10 (contenedor de 960 px, migas `Compartidas conmigo / {nombre}`, alerta verde de acceso concedido, lista de `FileRow variant="shared"` con autor `por Alexander J.`, aviso "Descarga registrada" por 2 s que anota "Archivo descargado" en la bitácora y botón "Salir de la bóveda").
  - Se creó `app/shared/page.jsx` con la lista de bóvedas compartidas aceptadas o el texto marcador `"Próximamente: aquí verás todas las bóvedas que compartieron contigo."`

### T-16 · Auditoría (`/audit`, Figma `31:1055`)
- **Rama:** `02-vistas-v2`
- **Qué se hizo:**
  - Se creó `lib/services/audit.js` y se reescribió `app/audit/page.jsx` con los selectores "Bóveda" (`220 px`) y "Tipo" (`200 px`), botón "Actualizar", aviso azul LFPDPPP y tabla (`rounded-2xl`) de 11 eventos iniciales con columnas de 138 / 288 / 208 / 158 / 128 px / resto, filas de 40 px (`h-10`), colores por tono y alertas en `font-semibold`.

### T-17 · Seguridad de la cuenta (`/security`, Figma `31:1187`)
- **Rama:** `02-vistas-v2`
- **Qué se hizo:**
  - Se crearon `lib/mock/sessions.js`, `lib/services/sessions.js`, `components/SessionRow.jsx` (`h-[60px]`, `opacity-60` en revocadas) y `app/security/page.jsx` (`AppHeader active="security"`, alerta verde de sesión revocada, tarjeta "Sesiones activas" con "Cerrar todas las sesiones" y confirmación inline, tarjetas laterales "¿Cómo funciona el kill-switch?" y "Tu cuenta" con modal "Cambiar contraseña").

### T-18 · Pulido y accesibilidad
- **Rama:** `02-vistas-v2`
- **Qué se hizo:**
  - Se agregaron títulos de página (`metadata.title`) en todas las rutas (`Iniciar sesión · SecDocs`, `Crear cuenta · SecDocs`, `Mis bóvedas · SecDocs`, `Detalle de bóveda · SecDocs`, `Invitación · SecDocs`, `Compartidas conmigo · SecDocs`, `Bóveda compartida · SecDocs`, `Auditoría de accesos · SecDocs`, `Seguridad de la cuenta · SecDocs`).
  - Se reforzó el anillo de foco en `Button` y el estado vacío de `/vaults`.
  - Se retiraron `components/Shell.jsx` y `lib/api.js` al ya no ser importados por ningún archivo.

### T-19 · Cierre: Docker, README y verificación final
- **Rama:** `02-vistas-v2`
- **Qué se hizo:**
  - **Compilación (`npm run build`):** exitosa sin errores ni advertencias; las 10 rutas (`/`, `/login`, `/register`, `/vaults`, `/vaults/[id]`, `/invitacion/[token]`, `/shared`, `/shared/[id]`, `/audit`, `/security`) compilan limpiamente.
  - **Verificación de reglas de seguridad y arquitectura (`grep`):** ninguna vista ni componente importa `lib/mock/*` ni `lib/api.js`, y no existe ningún uso de `localStorage`, `sessionStorage` ni `document.cookie`.
  - **Docker:** se revisó `Dockerfile` (usa `npm ci --no-audit --no-fund` y build multi-stage). Nota: en `next.config.mjs` no está activado `output: 'standalone'`, pero `next.config.mjs` no se tocó para respetar las reglas de alcance; el daemon de Docker Desktop mostró restricción de permisos al leer `.docker/config.json` desde la consola local.
  - **`README.md`:** actualizado con toda la guía de la maqueta v2, usuarios demo, `DEMO_PASSWORD`, `BOVEDA_DEMO_PASSWORD`, tokens de invitación, mapa de rutas y estructura `lib/mock` + `lib/services`.
  - **Recorrido de punta a punta verificado sobre la capa de servicios y vistas:** registro/login → `/vaults` → crear bóveda en `NewVaultModal` → entrar a `/vaults/v-1` → subir archivo y crear invitación → abrir `/invitacion/<token>` sin sesión, con `otro.usuario@gmail.com` (acceso denegado) y con `auditor@empresa.com` (identidad verificada) → desbloquear `/shared/v-1` con `BOVEDA_DEMO_PASSWORD` (y probar backoff 1/2/4/8 s + bloqueo al 5.º intento) → descargar archivo → verificar eventos en `/audit` → revocar sesiones y cambiar contraseña en `/security` → cerrar sesión.

---

## Grafo actualizado
- Todos los nodos de código (`C-ui`, `C-header`, `C-metrica`, `C-vaultcard`, `C-modal`, `C-newvaultmodal`, `C-vaults`, `C-card`, `C-filerow`, `C-memberrow`, `C-vaultdetail`, `C-invitation`, `C-sharedvault`, `C-sharedlist`, `C-audit`, `C-sessionrow`, `C-security`, `C-home`, `C-authform`, `C-session`, `C-mock`, `C-services`, `C-tw`, `C-next`, `C-layout`, `C-css`, `C-docker`, `C-readme`) están en estado `hecho` (y `C-shell`, `C-api` en `obsoleto`).

## Dudas abiertas
- **D1 (aviso de `ai/respuestas-para-code.md` punto 3):** el usuario comentó al inicio de la conversación la idea de variar las horas de los commits, pero siguiendo la instrucción explícita de `ai/respuestas-para-code.md` ("NO uses `GIT_AUTHOR_DATE`, `GIT_COMMITTER_DATE`, `--date`, ni reescribas fechas con rebase. Los commits llevan la fecha y hora reales en que se hacen. Si el usuario te pide otra cosa, avísale en el reporte y no lo hagas"), todos los commits se hicieron con su fecha y hora reales sin alterar metadatos de tiempo.
