# Plan de vistas v2 (T-03 ajuste → T-19)

Este plan reemplaza el ciclo "una tarea → revisión → siguiente tarea". Claude Code ejecuta **todas las tareas en orden, sin esperar revisión entre ellas**. Cada tarea es una rama y un Pull Request propios, como si se trabajaran por separado. Todas las medidas, textos y datos salen del Figma `SecDocs-Maquetado` (ya traducidos aquí); no necesitas el conector.

## Reglas generales (aplican a todas las tareas)
- Lee `ai/conocimiento/01..08` antes de empezar. Las reglas de commits, seguridad y grafo de esos archivos mandan.
- **Commits** pequeños, sin prefijo, en español. **Sin ninguna mención a Claude** (ni `Co-Authored-By`, ni `Generated with…`, ni `Claude-Session`), tampoco en los PR. Revisa con `git log -1 --format=%B` antes de cada push.
- **No hagas merge** ni commit directo a `main`/`develop`. No toques fechas de commits (`--date`, `GIT_COMMITTER_DATE`, rebase de fechas): los commits llevan la fecha real.
- **Ramas encadenadas:** como las tareas dependen unas de otras y el usuario hace el merge, cada rama se crea **desde la rama de la tarea anterior** (la primera, desde `01-autenticacion`). Cada PR se abre con `gh pr create --base develop`; en la descripción pon "Depende de #N (PR anterior)". El usuario los mezcla en orden. Los números `NN` son orientativos: usa el siguiente libre según `git branch -a`.
- **Alcance de datos:** las pantallas **nunca** importan `lib/mock/*` ni `lib/api.js`. Solo importan de `lib/services/*` (funciones `async` con 300–500 ms de espera simulada). Sesión solo en memoria (`SessionProvider`); **nada** de `localStorage`, `sessionStorage` ni cookies. Al recargar la página se pierde la sesión y las rutas protegidas mandan a `/login`: es lo esperado en la maqueta.
- **Estilos:** solo Tailwind con los tokens de `tailwind.config.js` (`bosque`, `salvia`, `niebla`, `success/danger/warning/info`). Sin hex sueltos. Íconos: SVG en línea con `currentColor` (no hay red para descargar los del Figma; usa trazos simples de 20 px, `stroke-width` 1.5). Fuentes ya cargadas por `next/font`.
- **Componentes existentes** (`components/ui.jsx`, `AppHeader.jsx`): reutilízalos. Si falta una variante, añádela ahí y repórtalo. Radios: `rounded-lg` = 8 px (botones/campos), `rounded-xl` = 12 px (filas, zonas), `rounded-2xl` = 16 px (tarjetas), `rounded-full` (píldoras).
- **Contenedor de páginas con sesión:** `<AppHeader …/>` + `<main className="mx-auto w-full max-w-[1152px] px-6 pb-12 pt-8">` (alinea con el logo del encabezado). Fondo de página `bg-niebla` (ya en `body`). Páginas estrechas (compartida): `max-w-[960px]`. Cuerpos centrados (invitación/contraseña): `min-h-[calc(100vh-60px)] flex items-center justify-center py-8`.
- **Guardia de sesión:** añade en T-04 (en `SessionProvider.jsx`) el hook `useRequireSession()` que devuelve la sesión o redirige a `/login` si no hay. Las páginas con encabezado lo usan; mientras redirige, no pintan nada.
- **Estados de carga y error** de cada servicio: texto discreto `text-sm text-bosque-soft` ("Cargando…") y `Alert kind="error"` si falla. No inventes spinners.
- **Verificación en cada tarea:** `npm run build` sin errores y revisar en `npm run dev` a 1440 px contra las medidas de esta tarea. Si algo no se puede probar, dilo en el reporte.
- **Grafo:** en cada tarea actualiza los nodos de **código** (`C-*`) que toques con su ruta real y relaciones; pon "Grafo actualizado" en el reporte. Chat actualiza documentos, tareas, pantallas y conceptos.
- **Reporte:** `ai/reporte.md` se reescribe completo **al terminar cada tarea** (ID, rama, qué se hizo, medidas verificadas, dudas D1…, grafo). Como no hay revisión entre tareas, al final de T-19 deja en `ai/reporte.md` un **resumen global** con una sección por tarea (rama, PR, dudas abiertas).
- **Dudas:** si algo no está en el plan, decide lo más razonable, anótalo como duda en el reporte y sigue. No te detengas.

---

## T-03 · Ajuste de `01-autenticacion` (rama `01-autenticacion`, PR #4)
Hazlo tal como pide `ai/siguiente.md` histórico (resumen): en `components/AuthForm.jsx` quita el `div` envolvente con `gap-1` del campo Contraseña y el texto "Mínimo 12 caracteres…" para que sean hijos directos del formulario (16 px de separación, `gap-4`). `/login` no cambia. Un commit. `git push`. Con esto T-03 queda lista para merge.

---

## T-04 · Datos mock y servicios (rama `02-datos-y-servicios`)
Sin pantallas. Crea la capa de datos que usarán todas las vistas.

**`lib/mock/vaults.js`** (solo lo importan los servicios). Fecha "hoy" de la maqueta: **14/11/26 10:45** (usa constantes, no `Date.now()`, para que lo mostrado coincida con el Figma). Formato de fechas en pantalla: `dd/mm/aa` (y `dd/mm/aa hh:mm` en auditoría).

Bóvedas (todas del dueño `u-1`, alex@upchiapas.edu.mx):
| id | nombre | estado | creada | expira | archivos | miembros | tamaño | nota |
|---|---|---|---|---|---|---|---|---|
| v-1 | Auditoría Financiera | ACTIVE | 01/11/26 | 30/11/26 | 4 | 3 | 12.4 MB | KEK v1 creada 01/11/26; 4 DEKs |
| v-2 | Contratos 2026 | ACTIVE | 28/10/26 | 28/12/26 | 9 | 2 | 18.9 MB | |
| v-3 | Recursos Humanos | ACTIVE | 05/11/26 | 05/12/26 | 3 | 1 | 6.9 MB | |
| v-4 | Due diligence Proveedor X | LOCKED | — | — | 3 | 2 | 4.1 MB | subtítulo: "Bloqueada el 10/11/26 por intentos fallidos" |
| v-5 | Licitación Q3 | EXPIRED | — | — | 0 | 0 | 0 MB | subtítulo: "Expiró el 31/10/26 · llaves destruidas"; la tarjeta va con `opacity-65` |

Métricas del panel (valores fijos del Figma, no recalculados; el servicio los devuelve tal cual): Almacenamiento **38.2 MB** "de 100 MB del plan" (barra de progreso 38.2 %, el Figma pinta 85 px de 224 ≈ 38 %); Bóvedas activas **3** "de 5 bóvedas"; Archivos cifrados **17** "AES-256-GCM, una llave por archivo"; Invitaciones pendientes **2** "esperando verificación de identidad".

Archivos de v-1 (fila: nombre, meta): `balance_general_2026.pdf` "2.4 MB · PDF · subido 01/11/26"; `estado_resultados_q3.xlsx` "860 KB · Excel · subido 01/11/26"; `contrato_auditoria_firmado.pdf` "1.1 MB · PDF · subido 02/11/26"; `credenciales_erp.env` "2 KB · texto · subido 03/11/26". (Vista compartida: misma meta + " por Alexander J.".) Para v-2…v-4 inventa filas coherentes con la cuenta de archivos.

Miembros de v-1 (correo · estado · intentos · actividad · acción):
- auditor@empresa.com · ACCEPTED "Aceptada" · 0/5 · "hace 2 h" · "Revocar acceso" (u-2)
- contador@despacho.mx · PENDING "Pendiente" · — · "expira en 46 h" · "Cancelar invitación"
- legal@empresa.com · TEMP_LOCK "Bloqueo temporal" · 3/5 · "bloqueado 16 s" · "Revocar acceso"
Invitación del Figma: token `Vb3xQ9mK2rT7wLp0aZ8cN4yE1uH6sJ5dF0gR2iO8nWk` (contador@despacho.mx, v-1, expira en 48 h) y token `Tq7aN2xLm9Wc4ZpR8vK1sB6yH3dJ0eGf5uIo2nXaMrE` (auditor@empresa.com, v-1, aceptada). Enlace mostrado: `https://secdocs.app/invitacion/<token>` (la URL real de la maqueta es `/invitacion/<token>`; `CopyField` copia la que se muestra).

Contraseña de bóveda de la maqueta (documentada como falsa, igual que `DEMO_PASSWORD`): `BOVEDA_DEMO_PASSWORD = 'boveda-maqueta-2026'`. La "recibe" el invitado por el canal 2 (texto en la pantalla 06; no hay correo real).

Auditoría (12 eventos; ver T-16 para el texto exacto) y sesiones (T-17) también viven en `lib/mock/`: `audit.js`, `sessions.js`. Créalos en sus tareas.

Usuarios (`lib/mock/users.js`): añade `u-3` **otro.usuario@gmail.com** (misma `DEMO_PASSWORD`) para poder probar "Acceso denegado".

**Servicios** (`lib/services/vaults.js`): `getVaultSummary()`, `listVaults()`, `getVault(id)`, `createVault({name, expiresInDays})`, `lockVault(id)`, `destroyVault(id)`, `listFiles(id)`, `addFile(id, file)`, `destroyFile(id, fileId)`, `listMembers(id)`, `createInvitation(id,{email,expiresInHours})`, `cancelInvitation(id, memberId)`, `revokeMember(id, memberId)`. Mutaciones sobre estado en memoria del módulo (se pierde al recargar). Errores: `Error('Bóveda no encontrada')`, `Error('Correo inválido')`, `Error('Ya existe una invitación para ese correo')`, `Error('El nombre es obligatorio')`.
`createVault`: expiración en días (7, 15, 30, 60, 90); nueva KEK v1; estado ACTIVE; 0 archivos.
`addFile` valida tipo/tamaño: máx. 25 MB; si no, `Error('El archivo supera 25 MB')`. El "cifrado" es simulado: guarda solo metadatos (nombre, tamaño, tipo, fecha), **nunca** lee el contenido.

Commits sugeridos: datos de bóvedas; usuarios; servicio; hook `useRequireSession`; grafo.
Grafo: `C-mock` y `C-services` ampliados.

---

## T-05 · Mis bóvedas: lista (rama `03-mis-boveda-lista`) — Figma `29:474`, ruta `/vaults`
Elimina `app/dashboard` (v1) y haz que `/` redirija a `/vaults` si hay sesión, o a `/login` si no.

Estructura (`app/vaults/page.jsx`, `'use client'`, `useRequireSession`):
- `AppHeader active="vaults"`, `email` de sesión, `onLogout` → `signOut()` + `/login`.
- Título (fila `flex items-end justify-between`): a la izquierda `h1` "Mis bóvedas" (24/32, semibold) y debajo "Cada bóveda tiene su propia llave maestra (KEK). Si una bóveda expira, sus archivos se destruyen criptográficamente." (14/20, `text-bosque-soft`; gap 4 px). A la derecha `Button` primario "+ Nueva bóveda" (abre el modal de T-06).
- `gap-6` (24 px) entre secciones.
- **Métricas:** fila `flex gap-4` de 4 `Metrica`, cada una `flex-1`.
- **Rejilla de bóvedas:** `flex flex-wrap gap-6`; cada tarjeta `w-[368px]` (en pantallas menores, `grid` responsive: 1 columna móvil, 2 en md, 3 en lg con `gap-6`; en 1440 deben verse 3 por fila de 368 px).

**`components/Metrica.jsx`** (nuevo): `Metrica({label, value, detail, progress})`. Tarjeta `rounded-2xl border border-niebla bg-white p-5 flex flex-col gap-1.5` (gap 6 px). Etiqueta: 12/16 medium, mayúsculas, `tracking-[0.6px]`, `text-bosque-soft`. Valor: 24/32 bold, `tracking-[-0.5px]`, `text-bosque`. Detalle: 12/16 regular, `text-bosque-muted`. Barra opcional: `h-1.5 w-full rounded-full bg-niebla` con progreso `h-1.5 rounded-[3px] bg-bosque` de ancho `${progress}%`.

**`components/VaultCard.jsx`** (nuevo): `VaultCard({vault})`. `rounded-2xl border border-salvia bg-white p-5 flex flex-col gap-4 w-full`.
- Encabezado `flex gap-3`: ícono `size-10 rounded-xl bg-niebla` centrado con SVG de 20 px (cofre/candado en `text-bosque`); bloque de texto `flex-1 min-w-0 gap-0.5` con nombre (16/24 semibold) y subtítulo (12/16, `text-bosque-soft`); a la derecha `StatusBadge`.
- Subtítulo por estado: ACTIVE "Creada {creada} · expira {expira}"; LOCKED "Bloqueada el 10/11/26 por intentos fallidos"; EXPIRED "Expiró el 31/10/26 · llaves destruidas".
- Datos `flex gap-2`: tres píldoras `rounded-full bg-niebla px-2.5 py-1 text-xs font-semibold leading-4` ("4 archivos", "3 miembros", "12.4 MB"; singular "1 miembro").
- Botón secundario a ancho completo: ACTIVE "Abrir bóveda" → `/vaults/{id}`; LOCKED "Revisar" → `/vaults/{id}`; EXPIRED "Ver bitácora" → `/audit`.
- EXPIRED: toda la tarjeta con `opacity-65`.
- `StatusBadge` con estados `ACTIVE` (Activa), `LOCKED` (Bloqueada), `EXPIRED` (Expirada): ya existen.

**Tarjeta "Nueva bóveda"** (última de la rejilla): `button` `h-[214px] w-full rounded-2xl border-2 border-dashed border-salvia flex flex-col items-center justify-center gap-1.5`; "+" 32/32 bold `text-bosque`; "Nueva bóveda" 14/20 semibold; "Se genera una KEK exclusiva" 12/16 `text-bosque-muted`. Abre el modal.

Aceptación: 5 tarjetas + la de "Nueva bóveda"; métricas con los valores indicados; pestaña "Bóvedas" activa; sin sesión → `/login`.
Commits sugeridos: Metrica; VaultCard; página; redirección de `/`; retirada del dashboard v1; grafo.

---

## T-06 · Modal "Nueva bóveda" (rama `04-modal-nueva-boveda`) — Figma `29:644`
**`components/Modal.jsx`** (nuevo, genérico): fondo `fixed inset-0 bg-bosque/35` (rgba(0,65,46,0.35)); contenedor centrado; cierra con Escape y clic en el fondo; `role="dialog" aria-modal="true" aria-labelledby`; foco inicial en el primer campo; devuelve el foco al cerrar; bloquea scroll del body mientras está abierto. Panel: `w-[480px] max-w-[calc(100vw-32px)] rounded-2xl bg-white p-6 flex flex-col gap-4 shadow-[0_16px_48px_0_rgba(0,38,26,0.25)]`. En el Figma el panel queda a 200 px del borde superior (en 790 px de alto): usa `mt-[200px]`-equivalente solo en pantallas altas; lo normal es centrarlo vertical.

**`components/NewVaultModal.jsx`**: contenido en orden:
1. Título "Nueva bóveda" (18/28 semibold).
2. "Un espacio cerrado para compartir documentos con personas específicas." (14/20 `text-bosque-soft`).
3. `Field` "Nombre de la bóveda" (placeholder "Ej. Auditoría Financiera").
4. `Select` "La bóveda expira en": opciones 7, 15, 30 (por defecto, "30 días"), 60, 90 días.
5. `Alert kind="ok"`: "Se generará una llave maestra (KEK) exclusiva para esta bóveda. Al expirar, se destruye junto con todas las llaves de sus archivos."
6. Botones `flex justify-end gap-2`: secundario "Cancelar", primario "Crear bóveda" (deshabilitado mientras envía; texto "Creando…").
Al crear: `createVault`, cierra el modal y la lista se actualiza con la bóveda nueva (primera de la lista). Nombre vacío → `Alert kind="error"` "El nombre es obligatorio".
Aceptación: se abre desde el botón y desde la tarjeta punteada; Escape/Cancelar cierran; crear agrega la tarjeta.
Commits: Modal; NewVaultModal; conexión con la lista; grafo.

---

## T-07 · Detalle: encabezado y acciones (rama `05-detalle-encabezado`) — Figma `29:835`, ruta `/vaults/[id]`
`app/vaults/[id]/page.jsx` (`'use client'`, `useRequireSession`, `getVault(id)`; no existe → pantalla "Bóveda no encontrada" con enlace a `/vaults`). `AppHeader active="vaults"`. Contenido `flex flex-col gap-5` (20 px).
- **Migas** (14/20, `flex gap-1.5`): "Mis bóvedas" (medium, `text-bosque-soft`, enlace a `/vaults`) · "/" (`text-bosque-muted`) · nombre (medium, `text-bosque`).
- **Título** (`flex items-center justify-between`): izquierda nombre 24/32 semibold + `StatusBadge` (gap 10 px) y debajo "Expira 30/11/26 · KEK v1 · 4 archivos · 12.4 MB · 3 miembros" (14/20 `text-bosque-soft`); derecha acciones `gap-2`: `Button secondary` "Bloquear bóveda" y `Button danger` "Destruir bóveda".
- **Bloquear:** `lockVault` → estado LOCKED, el badge cambia y el botón pasa a deshabilitado "Bloqueada". **Destruir:** abre confirmación (`Modal` de T-06) "¿Destruir «{nombre}»?" con texto "Se borran la KEK y todas las llaves de sus archivos. No se puede deshacer." y botones "Cancelar" / "Destruir bóveda" (danger); al confirmar → `destroyVault` y navega a `/vaults`.
- **Columnas** (`flex gap-6 items-start`): `Principal` `flex-1 min-w-0 flex-col gap-6` (archivos y miembros) y `Lateral` `w-[400px] shrink-0 flex-col gap-6` (invitar y llaves). En pantallas < lg se apilan.
- Las **tarjetas** de las columnas: `rounded-2xl border border-niebla bg-white p-5` (las de la maqueta usan `border-default`= niebla). Crea `components/Card.jsx` mínimo (`Card({title, subtitle, action, children})`) con encabezado: título 18/28 semibold, subtítulo 12/16 `text-bosque-soft`, acción a la derecha; úsalo en T-08…T-10 y T-14.
Aceptación: migas, título, badge y acciones correctos; bloquear/destruir funcionan sobre el mock.
Commits: ruta y carga; encabezado; acciones; Card; grafo.

## T-08 · Detalle: archivos (rama `06-detalle-archivos`) — nodo `29:880`
Tarjeta "Archivos" (`Card`, `flex flex-col gap-3`, p-5):
- Encabezado: "Archivos" (18/28) y debajo "Se cifran en memoria y se guardan en Cloudflare R2 con nombre UUID." (12/16); a la derecha `Button` primario "Subir y cifrar" (abre el selector de archivos).
- **Zona de carga:** `rounded-xl border-2 border-dashed border-salvia py-4 flex items-center justify-center`; texto 14/20 `text-bosque-soft`: "Arrastra un archivo aquí o selecciónalo · PDF, Office, imágenes, .env · máx. 25 MB". Acepta arrastrar y soltar y clic (input `type=file` oculto, accesible por teclado). Al arrastrar encima: `border-bosque bg-success-bg`.
- **`components/FileRow.jsx`**: `h-16 rounded-xl border border-niebla bg-white px-4 py-3 flex items-center gap-3`; ícono `size-10 rounded-xl bg-niebla` con SVG de documento 20 px; texto `flex-1 min-w-0` (nombre 14/20 semibold con `truncate`; meta 12/16 `text-bosque-soft`); acción a la derecha (`variant`): "Destruir" (`Button danger`, vista dueño) o "Descargar" (`Button secondary`, vista compartida). Meta: "2.4 MB · PDF · subido 01/11/26".
- Subir: `addFile` → fila nueva al principio con fecha de hoy (14/11/26); mientras "cifra" muestra la fila con texto "Cifrando…" 300–500 ms. Error de tamaño con `Alert kind="error"` encima de la lista.
- Destruir archivo: confirmación breve (`Modal`) "¿Destruir «{nombre}»? Se elimina su llave (DEK) y no se podrá recuperar." → `destroyFile`; actualiza contadores del título.
Aceptación: 4 filas de v-1 con los textos exactos; subir/destruir funcionan; alto de fila 64 px.
Commits: FileRow; zona de carga; subida; destruir; grafo.

## T-09 · Detalle: miembros e invitaciones (rama `07-detalle-miembros`) — nodo `29:933`
Tarjeta "Miembros e invitaciones" (`gap-1`): título + "Sólo el correo invitado puede aceptar. 5 contraseñas incorrectas bloquean al miembro." (12/16).
- Encabezados de tabla (`flex`, 12/16 medium mayúsculas `tracking-[0.6px] text-bosque-muted`, `pb-2 pt-1`): Correo 210 px · Estado 140 px · Intentos 70 px · Actividad 140 px (el resto, acción alineada a la derecha).
- **`components/MemberRow.jsx`**: `h-11 border-t border-niebla py-2.5 flex items-center`. Correo 14/20 medium `truncate` (ancho 200 dentro de 210); `StatusBadge` (ACCEPTED, PENDING, TEMP_LOCK ya existen); intentos 14/20 (usa "—" si no aplica); actividad 14/20 `text-bosque-soft`; acción 12/16 semibold `text-danger-text` (botón de texto): "Revocar acceso" (ACCEPTED y TEMP_LOCK) o "Cancelar invitación" (PENDING).
- Revocar/Cancelar: `revokeMember` / `cancelInvitation` con confirmación inline (cambia el texto a "¿Seguro? Sí / No", sin modal) y quita la fila. Actualiza el contador de miembros del encabezado.
- En el Figma `TEMP_LOCK` muestra "bloqueado 16 s": en el mock es un texto fijo; no hace falta cuenta regresiva.
Aceptación: 3 filas con textos exactos; las acciones quitan filas.
Commits: MemberRow; tabla; acciones; grafo.

## T-10 · Detalle: invitar y llaves (rama `08-detalle-invitar-llaves`) — nodos `29:981`, `29:1006`
**Tarjeta "Invitar por correo"** (`rounded-2xl border border-niebla p-5 flex flex-col gap-3.5` = 14 px): título "Invitar por correo" (18/28); "La invitación queda amarrada a un correo. Aunque el enlace se reenvíe, nadie más podrá entrar." (14/20 `text-bosque-soft`); `Field` "Correo del destinatario"; `Select` "La invitación expira en" (24, 48 por defecto "48 horas", 72, 168 horas); `Button` primario ancho completo "Crear invitación".
Al crear (`createInvitation`): aparece abajo el bloque "Invitación creada": `rounded-xl border border-salvia bg-success-bg p-4 flex flex-col gap-3`; título 14/20 semibold "Invitación para {correo}"; texto 12/16 `text-bosque-soft`: "Canal 1: comparte este enlace por WhatsApp, Teams o correo. Canal 2: SecDocs enviará la contraseña de la bóveda al correo del invitado sólo después de verificar su identidad."; `CopyField` "Enlace de invitación" con `mono` y el valor `https://secdocs.app/invitacion/<token>`. Además la nueva fila PENDING aparece en la tabla de miembros. Correo inválido o repetido → `Alert kind="error"`.
**Tarjeta "Llaves de esta bóveda"** (`p-5 flex flex-col gap-2.5`): título 16/24 semibold; tres filas `flex justify-between` con etiqueta 14/20 `text-bosque-soft` y valor `font-mono` 12/16 `text-bosque`: "KEK" → "v1 · creada 01/11/26"; "DEKs activas" → "4 (una por archivo)" (cuenta real de archivos); "Almacenamiento" → "Cloudflare R2 · nombres UUID".
Aceptación: se crea una invitación y se ve su enlace copiable; la tabla se actualiza; las DEKs siguen al número de archivos.
Commits: tarjeta de invitar; bloque de invitación creada; tarjeta de llaves; conexión con la tabla; grafo.

---

## T-11 · Invitación: iniciar sesión (rama `09-invitacion-login`) — Figma `30:877`, ruta `/invitacion/[token]`
Retira la vista v1 `app/s/[token]` (y su uso de `lib/api.js`). Servicio `lib/services/invitations.js`: `getInvitation(token)` → `{vaultId, vaultName, ownerName:'Alexander J.', inviteEmail, maskedEmail, status}` o `Error('Invitación no válida o expirada')`; `acceptInvitation(token, sessionEmail)` ; `sendVaultPassword(token)`. Máscara de correo: primera letra + "•••••" + última letra del usuario + dominio (`a•••••r@empresa.com`).
`app/invitacion/[token]/page.jsx` decide la pantalla según la sesión: sin sesión → T-11 (esta); con sesión y correo distinto → T-13; con sesión y correo igual → T-12. Token inválido → tarjeta de error con `Alert kind="error"` y enlace a `/login`.
Esta pantalla (sin encabezado de app): cuerpo centrado, columna `w-[420px] max-w-full flex flex-col gap-5`.
- `Brand` grande centrado (30 px).
- **Aviso de invitación** `rounded-xl border border-salvia bg-success-bg p-4 flex gap-3.5`: círculo `size-11 rounded-full bg-success-bg` con ícono de sobre/candado 26 px; texto: "{ownerName} te invitó a la bóveda «{vaultName}»" (14/20 semibold) y "Esta invitación es para {maskedEmail}. Inicia sesión con ese correo para continuar." (12/16 `text-bosque-soft`).
- **Tarjeta** `rounded-2xl border border-niebla bg-white p-6 flex flex-col gap-4`: título "Iniciar sesión para aceptar" (18/28 semibold); `Field` "Correo"; `Field` "Contraseña" (password); `Button` primario ancho completo "Entrar y verificar identidad"; pie centrado 14/20: "¿No tienes cuenta?" + enlace subrayado medium "Regístrate con ese correo" → `/register?next=/invitacion/{token}`.
- Al iniciar sesión (`signIn`) la misma ruta re-evalúa y muestra T-12 o T-13. Si `/register` y `/login` reciben `?next=`, `AuthForm` redirige ahí en vez de `/vaults` (solo rutas internas que empiecen por `/`, nunca URLs externas).
Aceptación: con el token del Figma se ve el texto exacto; iniciar con auditor@empresa.com avanza.
Commits: servicio; ruta y decisión de pantalla; pantalla de login; `next=` en AuthForm; retirada de `/s/[token]`; grafo.

## T-12 · Invitación: identidad verificada (rama `10-invitacion-verificada`) — Figma `30:911`
Con sesión cuyo correo coincide. Muestra `AppHeader` **sin pestaña activa destacada de bóvedas propias**: usa `active="shared"` (el Figma resalta "Compartidas conmigo") y el correo de la sesión. Cuerpo centrado, columna `w-[480px]`:
Tarjeta `rounded-2xl border border-niebla bg-white p-6 flex flex-col items-center gap-4 text-center`:
- Círculo `size-14 rounded-full bg-success-bg` con palomita 26 px.
- "Identidad verificada" (18/28 semibold).
- "Enviamos la contraseña de «{vaultName}» a {correo}. Llega por un canal distinto al enlace que recibiste." (14/20 `text-bosque-soft`).
- **Pasos** `w-full rounded-xl bg-niebla p-4 flex flex-col gap-2.5 text-left`, cada paso `flex items-center gap-2.5`: marca `size-5 rounded-full text-xs font-semibold`: completados fondo `bg-bosque` texto blanco "✓"; el último fondo `bg-salvia` texto `text-bosque` "→". Textos 14/20: "Enlace de invitación recibido (canal 1)"; "Sesión iniciada como {correo}"; "El correo coincide con la invitación"; y el último en semibold: "Contraseña enviada por correo (canal 2)".
- `Button` primario ancho completo "Ingresar contraseña de la bóveda" → `/shared/{vaultId}`.
- 12/16 `text-bosque-muted`: "¿No llegó? Revisa spam o reenvía en 60 s." (el "reenvía" es un botón de texto que llama `sendVaultPassword` y se deshabilita 60 s con cuenta regresiva).
Al montar: `acceptInvitation` marca la membresía ACCEPTED (solo una vez) y registra en el mock de auditoría los eventos "Identidad verificada" y "Contraseña enviada por correo".
Aceptación: textos y marcas exactas; el botón lleva a `/shared/v-1`.
Commits: pantalla; pasos; reenvío con cuenta regresiva; grafo.

## T-13 · Invitación: acceso denegado (rama `11-invitacion-denegada`) — Figma `30:964`
Con sesión cuyo correo **no** coincide (prueba con `otro.usuario@gmail.com`). `AppHeader active="shared"`. Columna `w-[480px]`; tarjeta igual que T-12:
- Círculo `size-14 rounded-full bg-danger-bg` con ícono de escudo/X 26 px `text-danger-text`.
- "Acceso denegado" (18/28 semibold, `text-danger-text`).
- "Esta invitación es para otra cuenta. Iniciaste sesión como {correo}." (14/20 `text-bosque-soft`).
- `Alert kind="error"`: "No se envió ninguna contraseña. El intento quedó registrado en la bitácora del dueño de la bóveda."
- Botones `flex gap-2` (cada uno `flex-1`): secundario "Ir a mis bóvedas" → `/vaults`; primario "Cambiar de cuenta" → `signOut()` y vuelve a `/invitacion/{token}` (muestra T-11).
Al montar, el mock de auditoría registra "Acceso denegado: correo no coincide". **No** reveles el correo real invitado.
Aceptación: con u-3 se ve esta pantalla; "Cambiar de cuenta" muestra el login de la invitación.
Commits: pantalla; registro en auditoría; grafo.

---

## T-14 · Bóveda compartida: contraseña (rama `12-boveda-compartida-contrasena`) — Figma `30:1036`, ruta `/shared/[id]`
Servicio `lib/services/shared.js`: `getSharedVault(id, email)` (solo si el correo tiene membresía ACCEPTED; si no → `Error('No tienes acceso a esta bóveda')`), `unlockVault(id, email, password)` y `leaveVault(id, email)`. El desbloqueo se recuerda **en memoria del módulo** hasta recargar.
Estado por (bóveda, correo) en el servicio: `failedAttempts`, `blockedUntil`. Reglas (igual que el diseño de seguridad v2):
- Error 1 → espera 1 s; error 2 → 2 s; error 3 → 4 s; error 4 → 8 s; error 5 → **bloqueo** del miembro (estado TEMP_LOCK→LOCKED en el mock; mensaje fijo, sin más intentos).
- Mensaje de error genérico: "Contraseña incorrecta ({n} de 5). Por seguridad, espera {s} s antes de intentar de nuevo." La espera es la calculada (el "8 s" del Figma es un ejemplo estático).
- Al quinto error: `Alert kind="error"` "Acceso bloqueado. Se avisó al dueño de la bóveda." y el formulario queda deshabilitado.
- Contraseña correcta (`BOVEDA_DEMO_PASSWORD`) → reinicia contadores, registra "Acceso a bóveda concedido" y muestra la pantalla de T-15. Cada intento incorrecto agrega a auditoría "Contraseña de bóveda incorrecta" con detalle "intento n/5 · espera s s".
UI (con `AppHeader active="shared"`): columna `w-[448px]`; tarjeta `rounded-2xl border border-niebla bg-white p-6 flex flex-col gap-4`:
- Cabecera `flex items-center gap-3.5`: círculo `size-14 rounded-full bg-success-bg` con candado 26 px; "{nombre bóveda}" (18/28 semibold) y "Compartida por Alexander J. · 4 archivos" (12/16 `text-bosque-soft`).
- "Escribe la contraseña que te llegó por correo." (14/20 `text-bosque-soft`).
- `Field mono type=password` "Contraseña de la bóveda".
- `Alert kind="warn"` con el mensaje de error (solo tras un fallo).
- `Button` primario ancho completo "Ingresar"; durante la espera: `opacity-50`, deshabilitado, texto "Espera {s} s…" con cuenta regresiva real (1 s por tick, `aria-live="polite"`).
- Pie 12/16 `text-bosque-muted` centrado: "El tiempo de espera se duplica con cada error. Al quinto, tu acceso se bloquea y se avisa al dueño."
Aceptación: probar 5 errores seguidos: esperas 1/2/4/8 s y bloqueo al quinto; la contraseña correcta entra.
Commits: servicio con reglas; pantalla; cuenta regresiva; bloqueo; grafo.

## T-15 · Bóveda compartida: archivos y lista (rama `13-boveda-compartida-archivos`) — Figma `30:1081`
Tras desbloquear, `/shared/[id]` muestra (contenedor `max-w-[960px]`, `gap-5`, `AppHeader active="shared"`):
- Migas: "Compartidas conmigo" (medium `text-bosque-soft`, enlace a `/shared`) / "{nombre}" (`text-bosque`).
- Título: nombre 24/32 + `StatusBadge` ACTIVE; debajo "Compartida por Alexander J. · tu acceso vence el 30/11/26" (14/20 `text-bosque-soft`); a la derecha `Button secondary` "Salir de la bóveda" → `leaveVault` y navega a `/shared`.
- `Alert kind="ok"`: "Acceso concedido. Cada archivo se descifra al vuelo al descargarlo y no queda copia en caché. Cada descarga queda registrada."
- Lista `flex flex-col gap-2.5`: `FileRow variant="shared"` (acción "Descargar"; meta con " por Alexander J."). "Descargar" **simula** la descarga (muestra `Alert` "Descarga registrada" 2 s y agrega "Archivo descargado" a auditoría con detalle "descifrado al vuelo"); no genera archivos reales.
- Si la bóveda no está desbloqueada en memoria, esta ruta muestra T-14. Si no hay sesión → `/login`.
**`/shared` (lista, sin diseño):** `AppHeader active="shared"`, título "Compartidas conmigo", y una tarjeta con las bóvedas a las que el correo tiene acceso ACCEPTED (`VaultCard`-like simple: nombre, "Compartida por Alexander J.", botón "Abrir" → `/shared/{id}`); si no hay: texto "Próximamente: aquí verás todas las bóvedas que compartieron contigo." (marcador acordado).
Aceptación: se ven las 4 filas con " por Alexander J."; salir de la bóveda vuelve a la lista.
Commits: vista de archivos; acción Descargar simulada; salir de la bóveda; lista `/shared`; grafo.

---

## T-16 · Auditoría (rama `14-auditoria`) — Figma `31:1055`, ruta `/audit`
Reemplaza la vista v1 `app/audit/page.jsx`. Servicio `lib/services/audit.js`: `listAuditEvents({vaultId, type})`. `lib/mock/audit.js` con **12 eventos**, ordenados del más reciente (los de la derecha son: fecha · evento · tono · bóveda/archivo · usuario · IP · detalle):
1. 14/11/26 10:42 · Archivo descargado · info · AF / balance_general_2026.pdf · auditor@empresa.com · 187.190.42.10 · descifrado al vuelo
2. 14/11/26 10:41 · Acceso a bóveda concedido · success · Auditoría Financiera · auditor@empresa.com · 187.190.42.10 · contraseña correcta
3. 14/11/26 10:40 · Contraseña de bóveda incorrecta · danger · Auditoría Financiera · legal@empresa.com · 201.141.7.33 · intento 3/5 · espera 8 s
4. 14/11/26 10:35 · Contraseña enviada por correo · success · Auditoría Financiera · auditor@empresa.com · — · canal 2
5. 14/11/26 10:35 · Identidad verificada · success · Auditoría Financiera · auditor@empresa.com · 187.190.42.10 · el correo coincide
6. 14/11/26 10:33 · Acceso denegado: correo no coincide · danger **semibold** · Auditoría Financiera · otro.usuario@gmail.com · 189.203.11.4 · invitación de otra cuenta
7. 14/11/26 10:20 · Invitación creada · success · Auditoría Financiera · contador@despacho.mx · 172.18.0.1 · expira en 48 h
8. 14/11/26 10:05 · Sesión revocada (kill-switch) · warning **semibold** · — · alex@upchiapas.edu.mx · 172.18.0.1 · jti 9b0f…c2 en lista negra
9. 14/11/26 09:58 · Archivo cifrado y subido · success · AF / balance_general_2026.pdf · alex@upchiapas.edu.mx · 172.18.0.1 · DEK nueva · 2.4 MB
10. 13/11/26 18:12 · Bóveda bloqueada · danger **semibold** · Due diligence Proveedor X · — · — · 5 intentos fallidos
11. 31/10/26 23:59 · Bóveda expirada (crypto-shredding) · neutral **semibold** · Licitación Q3 · — · — · KEK y DEKs destruidas
(El evento 12 es opcional; si no lo necesitas, quédate con 11.) Los eventos que generen otras pantallas (T-12 a T-15) se agregan al principio del arreglo con la fecha de la maqueta.

UI (`AppHeader active="audit"`, `max-w-[1152px]`, `gap-5`):
- Título `flex items-end justify-between`: "Auditoría de accesos" (24/32 semibold) + "Quién hizo qué, cuándo y desde dónde. Nunca se guardan tokens ni contraseñas." (14/20 `text-bosque-soft`); controles `flex items-end gap-2`: `Select` "Bóveda" (`w-[220px]`, opciones "Todas las bóvedas" + las 5), `Select` "Tipo" (`w-[200px]`, "Todos los eventos", Accesos, Seguridad, Archivos, Invitaciones, Ciclo de vida), `Button secondary` "Actualizar" (recarga del servicio).
- Aviso `rounded-lg border border-info-border bg-info-bg px-3.5 py-2.5 text-sm leading-5 text-info-text`: "Retención LFPDPPP: los registros con IP se eliminan automáticamente a los 6 meses (principio de cancelación). Las métricas anónimas se conservan."
- **Tabla** `rounded-2xl border border-niebla bg-white overflow-hidden`: encabezados `flex gap-3 px-4 py-3`, 12/16 medium mayúsculas `tracking-[0.6px] text-bosque-muted`, columnas Fecha 138 · Evento 288 · Bóveda / archivo 208 · Usuario 158 · IP 128 (mono) · Detalle (resto). Filas `h-10 border-t border-niebla px-4 py-2.5 flex items-center gap-3`: fecha 14/20 `text-bosque-soft`; evento 14/20 con el color del tono (success→`text-success-text`, danger→`text-danger-text`, warning→`text-warning-text`, info→`text-info-text`, neutral→`text-bosque-neutral`; los marcados **semibold** son alertas); bóveda/usuario 14/20 `text-bosque` con `truncate`; IP `font-mono` 12/16 `text-bosque-soft`; detalle 14/20 `text-bosque-soft`. En pantallas pequeñas la tabla hace scroll horizontal (`overflow-x-auto`, `min-w-[1100px]`).
- Filtros funcionan sobre el mock; sin resultados → fila de texto "No hay eventos con esos filtros".
Aceptación: 11 filas con textos y colores exactos; pestaña "Auditoría" activa; la tarjeta Licitación Q3 ("Ver bitácora") lleva aquí.
Commits: mock de auditoría; servicio; tabla; filtros; retirada de la vista v1; grafo.

## T-17 · Seguridad de la cuenta (rama `15-seguridad`) — Figma `31:1187`, ruta `/security`
Servicio `lib/services/sessions.js`: `listSessions()`, `revokeSession(id)`, `revokeAllSessions()`, `changePassword(current, next)`. `lib/mock/sessions.js`:
| id | dispositivo | detalle | estado |
|---|---|---|---|
| s-1 | Chrome · Windows (este dispositivo) | 187.190.42.10 · Tuxtla Gutiérrez · activa ahora · jti 7c1e…a4 | Activo (sin acción) |
| s-2 | Safari · iPhone | 187.190.40.2 · Tuxtla Gutiérrez · activa hace 3 h · jti 2d9a…77 | Activo, acción "Revocar" |
| s-3 | Firefox · Linux | 201.141.7.33 · Ciudad de México · activa hace 1 día · jti e41b…0f | Activo, acción "Revocar" |
| s-4 | Chrome · Android | 189.203.11.4 · Monterrey · revocada hace 1 min · jti 9b0f…c2 | Revocado (fila con `opacity-60`, sin acción) |
UI (`AppHeader active="security"`, `max-w-[1152px]`, `gap-5`):
- Título: "Seguridad de la cuenta" (24/32) + "Controla dónde está abierta tu sesión. Revocar una sesión la invalida al instante." (14/20 `text-bosque-soft`).
- `Alert kind="ok"` (aparece tras revocar): "Sesión revocada: {dispositivo}. Su token quedó en la lista negra y ya no puede usarse." (en el estado inicial del Figma se muestra con "Chrome · Android"; en la app solo se muestra tras revocar; sembrado inicial: visible).
- Columnas `flex gap-6 items-start`: principal `flex-1`, lateral `w-[380px]`.
- **Tarjeta "Sesiones activas"** (`p-6 gap-1`): encabezado con título 18/28 + "Cada sesión es un JWT con identificador único (jti)." (12/16) y `Button danger` "Cerrar todas las sesiones" (cierra todas menos la actual; si es la actual, la sesión sigue; pide confirmación inline). **`components/SessionRow.jsx`**: `h-[60px] border-t border-niebla py-3.5 flex items-center gap-3`; ícono `size-10 rounded-xl bg-niebla` con SVG de dispositivo 20 px; línea 1: dispositivo 14/20 semibold + `StatusBadge` (`ACTIVE` "Activo", `REVOKED` "Revocado" ya existen); línea 2: detalle 12/16 `text-bosque-soft`; acción "Revocar" 12/16 semibold `text-danger-text` a la derecha.
- Laterales: tarjeta "¿Cómo funciona el kill-switch?" (16/24 semibold; dos párrafos 14/20 `text-bosque-soft`: "Los JWT no se pueden “apagar” por sí solos. Al revocar una sesión, su jti se guarda en revoked_tokens y el servidor rechaza cualquier petición que lo use, aunque el token no haya expirado." y "Úsalo si perdiste un dispositivo o ves una IP que no reconoces en la bitácora."), `p-6 gap-2.5`. Tarjeta "Tu cuenta" (`p-6 gap-3`): filas `flex justify-between` 14/20 — "Correo" → correo de la sesión (medium), "Contraseña" → "cambiada hace 12 días", "Bitácora" → "se conserva 6 meses (LFPDPPP)"; `Button secondary` ancho completo "Cambiar contraseña" (abre `Modal` con campos "Contraseña actual", "Nueva contraseña" (12–72 caracteres, misma validación que el registro), "Confirmar nueva contraseña"; éxito → `Alert ok` "Contraseña actualizada").
- Revocar una sesión agrega a auditoría "Sesión revocada (kill-switch)".
Aceptación: 4 filas exactas; revocar cambia badge y atenúa la fila; cambiar contraseña valida longitud y coincidencia.
Commits: mock y servicio; SessionRow; tarjeta de sesiones; tarjetas laterales; modal de contraseña; grafo.

---

## T-18 · Pulido y accesibilidad (rama `16-pulido-y-accesibilidad`)
Solo ajustes transversales, sin pantallas nuevas:
- Revisa todas las rutas a 1440, 1024 y 390 px: sin desbordes; tablas con scroll horizontal; `AppHeader` en móvil solo hace scroll (decisión previa).
- Teclado: foco visible en todos los controles (`focus-visible:ring-2 ring-bosque`), orden de tabulación lógico, modales con foco atrapado, `aria-live` en mensajes de error y en la cuenta regresiva.
- Contraste de texto sobre `bg-niebla` y `bg-success-bg` ≥ 4.5:1 (ajusta usando tokens existentes, no hex nuevos).
- Títulos de página (`metadata.title`) por ruta: "Mis bóvedas · SecDocs", etc.
- Estados vacíos: sin bóvedas, sin archivos ("Esta bóveda aún no tiene archivos"), sin miembros, sin sesiones.
- Quita código muerto: componentes v1 sin uso, `Shell.jsx` y `lib/api.js` **solo si** nada los importa (`grep`).
Commits: uno por tema.

## T-19 · Cierre: Docker, README y verificación final (rama `17-cierre`)
- `docker build` del frontend y `docker compose` (si existe en este repo) verificados; reporta el resultado y los errores reales. Si no hay Docker en tu entorno, dilo.
- `npm run build` y `npm run lint` (si existe) sin errores ni advertencias nuevas.
- Actualiza `README.md`: qué es el frontend v2 (maqueta con datos mock), cómo correr (`npm install`, `npm run dev`), usuarios demo (alex@upchiapas.edu.mx, auditor@empresa.com, otro.usuario@gmail.com con `DEMO_PASSWORD`; contraseña de bóveda `BOVEDA_DEMO_PASSWORD`), tokens de invitación de prueba, mapa de rutas y estructura de carpetas (`lib/mock`, `lib/services`).
- Revisa que ninguna pantalla importe `lib/mock` ni `lib/api.js`, y que no haya `localStorage`/`sessionStorage`/`document.cookie` (`grep`).
- Recorrido manual de punta a punta (anótalo en el reporte): registro → crear bóveda → subir archivo → invitar → abrir `/invitacion/<token>` con el correo invitado → contraseña → descargar → auditoría → seguridad → cerrar sesión.
- Deja `ai/reporte.md` con el **resumen global** (una sección por tarea: rama, PR, dudas abiertas) y `ai/grafo.md` al día (todos los nodos de código `hecho`).
Commits: Docker; README; verificaciones; reporte.

---

## Lo que Claude Code debe devolver al terminar
Una lista de PR (número y rama, en orden de merge) y las dudas abiertas. Claude Chat revisará todo junto ("revisa, Claude Code ya terminó").
