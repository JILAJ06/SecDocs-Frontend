# SecDocs v2 · Guía Completa de Integración Frontend (Next.js)

> **Propósito:** Este documento es la fuente única de verdad para integrar el frontend de **SecDocs v2** (Next.js) con el backend RESTful. Todos los nombres de rutas, propiedades (`snake_case` vs `camelCase`), códigos de estado HTTP, cabeceras y tipos TypeScript han sido extraídos directamente del código fuente real del servidor (`src/`).

---

## A. Configuración de Conexión, CORS y Cookies

### 1. URL Base y Prefijo
- **Puerto por defecto del backend:** `PORT=3000` (en desarrollo con Next.js, se recomienda correr el backend en `PORT=4000` o correr Next.js en `5173`/`3001`, o usar `rewrites` de Next.js).
- **Prefijo base de todos los endpoints:** `/api/v1`
- **Ejemplo de URL local:** `http://localhost:3000/api/v1`
- **Healthcheck:** `GET /api/v1/health` → `200 OK` `{ "status": "ok" }`

### 2. Cookie de Sesión (`secdocs_session`)
El backend **NO acepta tokens JWT por header `Authorization: Bearer` ni por query string**. La autenticación se realiza **exclusivamente** mediante una cookie `HttpOnly` firmada con `HS256`.

- **Nombre de la cookie:** `secdocs_session` (configurable vía `COOKIE_NAME` en `.env`).
- **Atributos de la cookie:**
  - `HttpOnly: true` (inaccesible desde `document.cookie`).
  - `SameSite: Strict`
  - `Secure: true` solo cuando `NODE_ENV=production` (`false` en `development`).
  - `Path: /`
  - `Expires`: fecha de expiración (`JWT_EXPIRES_HOURS`, por defecto `8` horas).
- **Requisito obligatorio en `fetch` (cliente):**
  Todas las peticiones desde el navegador deben incluir `credentials: 'include'`:
  ```ts
  const res = await fetch(`${API_BASE_URL}/api/v1/vaults`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  ```
  *(Atención: en subidas de archivos con `FormData`, **NO** pongas el header `'Content-Type'`; el navegador debe generarlo automáticamente con el `boundary` de `multipart/form-data`).*

### 3. Configuración de CORS y Nota Crítica sobre `SameSite=Strict` en Next.js
- En el backend (`src/config/env.js` y `src/middlewares/security.middleware.js`):
  - La variable de entorno se llama **`CORS_ORIGINS`** (en plural, soporta múltiples orígenes separados por coma, ej. `CORS_ORIGINS=http://localhost:3000,http://localhost:5173`).
  - Si un navegador envía un header `Origin` que no está en `CORS_ORIGINS`, el backend responde `403 Forbidden` `{ "error": "Origen no permitido" }`.
  - Métodos permitidos: `GET, POST, PATCH, DELETE, OPTIONS`.
  - Headers permitidos en peticiones CORS: **`Content-Type`** y **`X-Download-Ticket`**.
  - `Access-Control-Allow-Credentials: true`.

- **Cómo evitar problemas con `SameSite=Strict` en Next.js:**
  1. **En desarrollo local:** Usa siempre el mismo hostname (`localhost`) tanto para el frontend como para el backend (ej. `http://localhost:3001` y `http://localhost:3000`). **No mezcles `localhost` con `127.0.0.1`**, ya que para el navegador son *sites* distintos y `SameSite=Strict` bloqueará el envío de la cookie `secdocs_session`.
  2. **Opción recomendada (Next.js Rewrites / Proxy Same-Origin):**
     Configura un rewrite en `next.config.mjs` para que el frontend llame siempre a `/api/v1/:path*` sobre su propio origen:
     ```js
     // next.config.mjs
     /** @type {import('next').NextConfig} */
     const nextConfig = {
       async rewrites() {
         return [
           {
             source: '/api/v1/:path*',
             destination: `${process.env.BACKEND_INTERNAL_URL || 'http://localhost:4000'}/api/v1/:path*`,
           },
         ];
       },
     };
     export default nextConfig;
     ```
     Con esto, las peticiones son 100% *same-origin*, `SameSite=Strict` funciona tanto en desarrollo como en producción en dominios distintos, y no hay preflight CORS.
  3. **Variables que debes alinear en `.env` del backend:**
     - `CORS_ORIGINS=http://localhost:3000,http://localhost:5173` (agrega el puerto donde corra tu Next.js).
     - `FRONTEND_URL=http://localhost:3000` (el backend usa `FRONTEND_URL` para construir el campo `invitationUrl`: `${FRONTEND_URL}/invitacion/${token}`).

### 4. Cómo levantar el Backend en Local y ver Claves del Canal 2
- **Opción 1: Todo con Docker (PostgreSQL 16 + API):**
  ```bash
  docker compose up --build -d
  docker compose logs -f api
  ```
- **Opción 2: Base de datos en Docker + API en modo desarrollo (recomendado si quieres usar almacenamiento local sin credenciales de Cloudflare R2):**
  1. En `.env` del backend asegúrate de tener:
     ```env
     PORT=4000
     CORS_ORIGINS=http://localhost:3000,http://localhost:5173
     FRONTEND_URL=http://localhost:3000
     STORAGE_DRIVER=local
     SMTP_HOST=
     ```
  2. Levanta PostgreSQL y arranca la API:
     ```bash
     docker compose up -d db
     npm run dev
     ```
- **Cómo ver la contraseña del Canal 2 en desarrollo (sin SMTP):**
  Cuando `SMTP_HOST` está vacío y `NODE_ENV !== 'production'`, al llamar a `POST /api/v1/invitations/:token/verify-identity`, el backend **no envía correo real** sino que imprime un recuadro en la terminal donde corre la API (`npm run dev` o `docker compose logs -f api`):
  ```text
  ┌── [mail:dev] SMTP no configurado, correo NO enviado (solo consola de desarrollo) ──
  │ Para:    invitado@dominio.com
  │ Asunto:  SecDocs: contraseña de acceso a la bóveda compartida
  │
  │ dueno@dominio.com te compartió la bóveda "Contratos 2026".
  │
  │ Tu contraseña de acceso (Canal 2) es:
  │
  │     K9mP4xR7wQ2nJ8
  └──────────────────────────────────────────────────────────────────────
  ```

---

## B. Formato Global de Errores y Estados Comunes

### 1. Estructura JSON de Error
Todos los errores controlados (`src/middlewares/error.middleware.js`) devuelven un objeto JSON con la propiedad principal **`error`** (`string`), más propiedades adicionales opcionales en casos específicos (como bloqueos `401`/`429` en invitaciones):

```json
{
  "error": "Mensaje descriptivo legible para el usuario"
}
```

Con campos extra (ej. `POST /api/v1/invitations/:token/unlock` o `verify-identity`):
```json
{
  "error": "Contraseña incorrecta",
  "attemptsUsed": 2,
  "maxAttempts": 5,
  "retryAfterSeconds": 4
}
```

### 2. Guía de Manejo por Código HTTP en el Frontend

| Código | Significado en SecDocs v2 | Acción recomendada en el Frontend |
|---|---|---|
| **`400`** | Datos de entrada inválidos (validación de correo, contraseña `< 8` chars o `> 72` bytes, fecha `expires_at` pasada o que supera el tope, falta archivo en multipart, auto-invitación). | Mostrar `res.error` directamente en el formulario. |
| **`401`** | **En rutas protegidas:** sin sesión, JWT expirado o sesión revocada (`{ "error": "No autenticado" }`). El backend además limpia la cookie `secdocs_session`.<br>**En `/auth/login`:** `{ "error": "Credenciales inválidas" }`.<br>**En `/invitations/:token/unlock`:** `{ "error": "Contraseña incorrecta", attemptsUsed, maxAttempts, retryAfterSeconds }` (intentos 1 al 4).<br>**En `/shared/.../download`:** `{ "error": "Ticket inválido, expirado o ya utilizado" }`. | - Si ocurre en rutas generales: limpiar estado de usuario en cliente y redirigir a `/login` (guardando `returnTo` si estaba en `/invitacion/[token]`).<br>- Si ocurre en `unlock`: mostrar intentos restantes (`maxAttempts - attemptsUsed`) e iniciar cuenta regresiva con `retryAfterSeconds`.<br>- Si ocurre en `download`: solicitar al invitado que vuelva a desbloquear la bóveda para obtener un nuevo ticket de 60s. |
| **`403`** | - **En `/invitations/:token/verify-identity`, `/unlock` o `/shared/.../download`:** `{ "error": "Acceso denegado" }` (el correo de la sesión actual **no coincide** con `recipient_email`), o `{ "error": "Se alcanzó el límite de descargas de esta invitación" }`.<br>- **En CORS:** `{ "error": "Origen no permitido" }`. | En `/invitacion/[token]`, mostrar pantalla de **"Cuenta incorrecta"** indicando qué correo tiene sesión iniciada y ofrecer un botón **"Cerrar sesión y cambiar de cuenta"** (`POST /api/v1/auth/logout`). |
| **`404`** | Recurso inexistente o **de otro usuario (anti-IDOR)**: bóveda, archivo, miembro, sesión o token de invitación inválido/inexistente (`{ "error": "Bóveda no encontrada" }`, `{ "error": "Invitación no encontrada" }`, etc.). | Mostrar estado 404 / recurso no encontrado. |
| **`409`** | Conflicto de estado:<br>- Registro: `{ "error": "El correo ya está registrado" }`.<br>- Bóveda: `{ "error": "La bóveda está bloqueada" }`, `"La bóveda expiró"`, `"La bóveda fue purgada"` al intentar subir archivos, invitar miembros o cambiar estado.<br>- Miembros: `{ "error": "Ya existe una invitación vigente para ese correo" }`. | Mostrar alerta de conflicto (`res.error`) y refrescar el estado de la bóveda. |
| **`410`** | Recurso ya no disponible (`Gone`):<br>- En `/invitations/:token/*`: `{ "error": "Invitación no disponible" }` (la invitación fue revocada, expiró, o la bóveda del dueño está `LOCKED`, `EXPIRED` o `PURGED`).<br>- En `/shared/.../download`: `{ "error": "La bóveda no está disponible" }`. | Mostrar pantalla de **"Enlace expirado o revocado"** (sin formulario de contraseña). |
| **`413`** | Archivo supera el límite (`MAX_FILE_SIZE_MB`, por defecto **15 MB**): `{ "error": "El archivo excede el tamaño máximo permitido" }`, o JSON body `> 100 KB`. | Validar tamaño en cliente antes de subir (`file.size <= 15 * 1024 * 1024`) y mostrar error si recibe `413`. |
| **`415`** | Tipo MIME real (detectado por *magic bytes*) no está en la allowlist o contiene código activo (ejecutables, scripts, HTML, SVG, PHP): `{ "error": "Tipo de archivo no permitido" }`. | Informar al usuario que el formato real del archivo no está permitido por seguridad. |
| **`429`** | 1. **Cooldown de reenvío Canal 2 (`verify-identity`):** `{ "error": "La clave ya fue enviada recientemente", "retryAfterSeconds": 48 }`.<br>2. **Bloqueo exponencial en `unlock`:** cuando `locked_until > now()` o al alcanzar el 5.º intento fallido (15 min = 900s, estado `TEMP_LOCKED`). Incluye `retryAfterSeconds`, `attemptsUsed`, `maxAttempts: 5` (y `failedAttempts` cuando ya estaba bloqueado).<br>3. **Rate limit por IP:** `{ "error": "Demasiados intentos de autenticación, intenta más tarde" }` o `"Demasiadas solicitudes..."`. | Deshabilitar el botón de envío/desbloqueo y mostrar un temporizador regresivo usando `retryAfterSeconds` (también disponible en el header HTTP `Retry-After`). |
| **`500` / `502`** | `500`: `{ "error": "Error interno del servidor" }`.<br>`502`: `{ "error": "No se pudo enviar el correo con la clave. Intenta de nuevo más tarde" }` (fallo SMTP en `verify-identity`). | Mostrar notificación de error del servidor y permitir reintentar. |

---

## C. Catálogo Completo de Endpoints (`/api/v1`)

> **Convención de nombres:** Presta especial atención al casing de cada respuesta. Los modelos de base de datos suelen exponer campos en `snake_case` (`created_at`, `expires_at`, `size_bytes`, `mime_type`, `files_count`), mientras que algunos envoltorios de invitación/estadísticas usan `camelCase` (`vaultName`, `maskedEmail`, `ticketExpiresAt`, `downloadsRemaining`, `failedAttempts`). **Usa los nombres exactos documentados aquí.**

---

### Módulo 0: Salud (`Health`)

#### `GET /api/v1/health`
- **Requiere sesión:** No.
- **Respuesta `200 OK`:**
  ```json
  { "status": "ok" }
  ```

---

### Módulo 1: Autenticación (`Auth`)
> **Rate Limit:** `/register` y `/login` comparten un limitador de **20 peticiones cada 15 minutos por IP** (`AUTH_RATE_LIMIT_MAX`).

#### 1.1 `POST /api/v1/auth/register`
- **Requiere sesión:** No.
- **Body (`application/json`):**
  - `email` (`string`, requerido): se normaliza con `trim().toLowerCase()`, formato de email válido, máx. `255` chars.
  - `password` (`string`, requerido): mínimo **`8` caracteres**, máximo **`72` bytes en UTF-8**.
- **Acción:** Crea el usuario, inicializa `user_metrics` en 0, crea sesión en `user_sessions` y emite cookie `secdocs_session`.
- **Respuesta `201 Created`:**
  ```json
  {
    "user": {
      "id": "8f14e45f-ceea-467f-a833-1551c082f7b1",
      "email": "usuario@dominio.com",
      "role": "user",
      "created_at": "2026-11-20T18:00:00.000Z"
    }
  }
  ```
- **Errores:**
  - `400`: `"Correo inválido"`, `"Contraseña inválida"`, `"La contraseña debe tener al menos 8 caracteres"`, `"La contraseña no puede exceder 72 bytes"`
  - `409`: `"El correo ya está registrado"`
  - `429`: `"Demasiados intentos de autenticación, intenta más tarde"`

#### 1.2 `POST /api/v1/auth/login`
- **Requiere sesión:** No.
- **Body (`application/json`):**
  - `email` (`string`, requerido)
  - `password` (`string`, requerido)
- **Acción:** Valida credenciales en tiempo constante, registra sesión en `user_sessions` y emite cookie `secdocs_session`.
- **Respuesta `200 OK`:**
  ```json
  {
    "user": {
      "id": "8f14e45f-ceea-467f-a833-1551c082f7b1",
      "email": "usuario@dominio.com",
      "role": "user",
      "created_at": "2026-11-20T18:00:00.000Z"
    }
  }
  ```
- **Errores:**
  - `401`: `{ "error": "Credenciales inválidas" }` (mismo mensaje si el correo no existe, la contraseña falla o el formato es inválido).
  - `429`: `"Demasiados intentos de autenticación, intenta más tarde"`

#### 1.3 `POST /api/v1/auth/logout`
- **Requiere sesión:** Sí (`requireAuth`).
- **Body:** vacío (`{}` o sin body).
- **Acción:** Inserta el `jti` actual en `revoked_tokens`, lo elimina de `user_sessions` y limpia la cookie `secdocs_session`.
- **Respuesta `200 OK`:**
  ```json
  { "ok": true }
  ```
- **Errores:** `401` (`"No autenticado"`).

#### 1.4 `GET /api/v1/auth/me`
- **Requiere sesión:** Sí (`requireAuth`).
- **Respuesta `200 OK`:**
  ```json
  {
    "user": {
      "id": "8f14e45f-ceea-467f-a833-1551c082f7b1",
      "email": "usuario@dominio.com",
      "role": "user",
      "created_at": "2026-11-20T18:00:00.000Z"
    }
  }
  ```
- **Errores:** `401` (`"No autenticado"`).

---

### Módulo 2: Seguridad y Sesiones (`Security`)

#### 2.1 `GET /api/v1/security/sessions`
- **Requiere sesión:** Sí (`requireAuth`).
- **Descripción:** Lista las sesiones activas no expiradas del usuario autenticado, ordenadas por `created_at DESC`. Marca con `current: true` la sesión correspondiente a la cookie actual.
- **Respuesta `200 OK`:**
  ```json
  {
    "sessions": [
      {
        "jti": "c9a646d3-9c61-4d4a-8c8a-627d7a98d2f4",
        "ip": "127.0.0.1",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
        "created_at": "2026-11-20T18:10:00.000Z",
        "expires_at": "2026-11-21T02:10:00.000Z",
        "current": true
      }
    ]
  }
  ```

#### 2.2 `DELETE /api/v1/security/sessions/:jti`
- **Requiere sesión:** Sí (`requireAuth`).
- **Parámetros URL:** `jti` (`string`, máx. 128 chars, identificador de la sesión).
- **Acción:** Revoca esa sesión específica. Si `current === true` (revocó su propia sesión actual), el servidor limpia además la cookie `secdocs_session`.
- **Respuesta `200 OK`:**
  ```json
  {
    "ok": true,
    "current": false
  }
  ```
- **Errores:** `404` (`{ "error": "Sesión no encontrada" }` si no existe o pertenece a otro usuario).

#### 2.3 `POST /api/v1/security/kill-switch`
- **Requiere sesión:** Sí (`requireAuth`).
- **Body:** vacío (`{}` o sin body).
- **Acción:** Revoca **todas** las sesiones activas del usuario (incluyendo la actual) en una sola transacción, vacía `user_sessions` y limpia la cookie `secdocs_session`. Tras llamar a este endpoint, el frontend debe redirigir inmediatamente a `/login`.
- **Respuesta `200 OK`:**
  ```json
  {
    "ok": true,
    "revoked": 3
  }
  ```

---

### Módulo 3: Bóvedas del Dueño (`Vaults`)

#### 3.1 `GET /api/v1/vaults`
- **Requiere sesión:** Sí (`requireAuth`).
- **Query Params opcionales:**
  - `include_purged` (`"true"` | `"false"`, default `"false"`): por defecto excluye las bóvedas con `status === 'PURGED'`. Si se pasa `?include_purged=true`, las incluye.
- **Respuesta `200 OK`:**
  ```json
  {
    "metrics": {
      "total_storage_bytes": 524288,
      "total_files_active": 2,
      "total_vaults_active": 1
    },
    "vaults": [
      {
        "id": "a72a761c-6a58-4a30-8f02-93823d28095a",
        "name": "Contratos 2026",
        "status": "ACTIVE",
        "expires_at": "2026-12-20T18:00:00.000Z",
        "expired": false,
        "purged_at": null,
        "created_at": "2026-11-20T18:00:00.000Z",
        "files_count": 2,
        "members_count": 1
      }
    ]
  }
  ```
  *(Nota: `total_storage_bytes` viene parseado como `number` entero).*

#### 3.2 `POST /api/v1/vaults`
- **Requiere sesión:** Sí (`requireAuth`).
- **Body (`application/json`):**
  - `name` (`string`, requerido): `1` a `150` caracteres (tras `trim()`), sin caracteres de control.
  - `expires_at` (`string` ISO 8601, requerido): fecha futura válida, máximo **`365` días** desde la fecha actual (`VAULT_MAX_DAYS`).
- **Respuesta `201 Created`:**
  ```json
  {
    "vault": {
      "id": "a72a761c-6a58-4a30-8f02-93823d28095a",
      "name": "Contratos 2026",
      "status": "ACTIVE",
      "expires_at": "2026-12-20T18:00:00.000Z",
      "expired": false,
      "purged_at": null,
      "created_at": "2026-11-20T18:00:00.000Z",
      "files_count": 0,
      "members_count": 0
    }
  }
  ```
- **Errores:** `400` (`"El nombre es obligatorio"`, `"El nombre debe tener entre 1 y 150 caracteres"`, `"expires_at es obligatorio (fecha ISO 8601)"`, `"expires_at debe ser una fecha futura"`, `"expires_at no puede exceder 365 días desde hoy"`).

#### 3.3 `GET /api/v1/vaults/:vaultId`
- **Requiere sesión:** Sí (`requireAuth`, dueño de la bóveda).
- **Parámetros URL:** `vaultId` (UUID).
- **Descripción:** Devuelve metadatos de la bóveda, estado seguro de su llave (`keys`), lista de archivos `ACTIVE` y lista completa de miembros invitados (`workspace_members`).
- **Respuesta `200 OK`:**
  ```json
  {
    "vault": {
      "id": "a72a761c-6a58-4a30-8f02-93823d28095a",
      "name": "Contratos 2026",
      "status": "ACTIVE",
      "expires_at": "2026-12-20T18:00:00.000Z",
      "expired": false,
      "purged_at": null,
      "created_at": "2026-11-20T18:00:00.000Z",
      "keys": {
        "algorithm": "AES-256-GCM",
        "kekStatus": "ACTIVE"
      }
    },
    "files": [
      {
        "id": "4e89b10d-3c14-489a-8a39-146f0e61c3d2",
        "original_filename": "Informe.pdf",
        "mime_type": "application/pdf",
        "size_bytes": 104857,
        "status": "ACTIVE",
        "created_at": "2026-11-20T18:05:00.000Z"
      }
    ],
    "members": [
      {
        "id": "f9031f3a-5b3f-4e1a-9f8c-3391e88b01a1",
        "recipient_email": "invitado@dominio.com",
        "recipient_label": "Cliente B",
        "status": "ACCEPTED",
        "failed_attempts": 0,
        "locked_until": null,
        "download_count": 1,
        "max_downloads": 3,
        "expires_at": "2026-12-20T18:00:00.000Z",
        "last_access_at": "2026-11-20T18:15:00.000Z"
      }
    ]
  }
  ```
  *(Nota: `keys.kekStatus` es `'ACTIVE'` o `'PURGED'`).*
- **Errores:** `404` (`"Bóveda no encontrada"`).

#### 3.4 `PATCH /api/v1/vaults/:vaultId/status`
- **Requiere sesión:** Sí (`requireAuth`, dueño).
- **Body (`application/json`):**
  - `status` (`"ACTIVE"` | `"LOCKED"`, requerido).
- **Respuesta `200 OK`:**
  ```json
  {
    "vault": {
      "id": "a72a761c-6a58-4a30-8f02-93823d28095a",
      "name": "Contratos 2026",
      "status": "LOCKED",
      "expires_at": "2026-12-20T18:00:00.000Z",
      "expired": false,
      "purged_at": null,
      "created_at": "2026-11-20T18:00:00.000Z"
    }
  }
  ```
- **Errores:**
  - `400`: `"status debe ser 'ACTIVE' o 'LOCKED'"`
  - `404`: `"Bóveda no encontrada"`
  - `409`: `"La bóveda está PURGED y no puede cambiar de estado"`, `"La bóveda está EXPIRED y no puede cambiar de estado"`, `"La bóveda expiró y no puede reactivarse"`

#### 3.5 `DELETE /api/v1/vaults/:vaultId`
- **Requiere sesión:** Sí (`requireAuth`, dueño).
- **Acción:** Ejecuta **Crypto-Shredding total**: destruye la KEK de la bóveda (`wrapped_kek = NULL`, `status = 'PURGED'`), destruye las DEK de todos sus archivos (`wrapped_dek = NULL`, `status = 'PURGED'`), revoca todos los miembros activos, actualiza métricas y elimina los binarios `.enc` del almacenamiento.
- **Respuesta `200 OK`:**
  ```json
  {
    "ok": true,
    "purged_files": 2
  }
  ```
- **Errores:** `404` (`"Bóveda no encontrada"`, incluso si ya había sido purgada).

---

### Módulo 4: Archivos de una Bóveda (`Files` — Dueño)

#### 4.1 `POST /api/v1/vaults/:vaultId/files`
- **Requiere sesión:** Sí (`requireAuth`, dueño).
- **Content-Type:** `multipart/form-data`
- **Campo de archivo en `FormData`:** **`file`** (máximo 1 archivo por petición, límite **15 MB**).
- **Respuesta `201 Created`:**
  ```json
  {
    "file": {
      "id": "4e89b10d-3c14-489a-8a39-146f0e61c3d2",
      "original_filename": "Informe.pdf",
      "mime_type": "application/pdf",
      "size_bytes": 104857,
      "status": "ACTIVE",
      "created_at": "2026-11-20T18:05:00.000Z"
    }
  }
  ```
- **Errores:**
  - `400`: `"Falta el archivo (campo multipart 'file')"`, `"El archivo está vacío"`, `"Solicitud de subida inválida"`
  - `404`: `"Bóveda no encontrada"`
  - `409`: `"La bóveda está bloqueada"`, `"La bóveda expiró"`, `"La bóveda fue purgada"`
  - `413`: `"El archivo excede el tamaño máximo permitido"` (> 15 MB)
  - `415`: `"Tipo de archivo no permitido"` (validación por *magic bytes*)

#### 4.2 `DELETE /api/v1/vaults/:vaultId/files/:fileId`
- **Requiere sesión:** Sí (`requireAuth`, dueño).
- **Acción:** Crypto-shredding individual del archivo (`wrapped_dek = NULL`, `status = 'PURGED'`), actualiza métricas y borra el objeto `.enc` del storage.
- **Respuesta `200 OK`:**
  ```json
  { "ok": true }
  ```
- **Errores:** `404` (`"Archivo no encontrado"`).

---

### Módulo 5: Miembros / Invitaciones de una Bóveda (`Members` — Dueño)

#### 5.1 `POST /api/v1/vaults/:vaultId/members`
- **Requiere sesión:** Sí (`requireAuth`, dueño de bóveda `ACTIVE` y vigente).
- **Body (`application/json`):**
  - `recipient_email` (`string`, requerido): correo del invitado. **No puede ser el correo del propio dueño** (`400`).
  - `recipient_label` (`string | null`, opcional): etiqueta o nombre del destinatario, máx. `120` caracteres.
  - `max_downloads` (`number` entero, opcional, default `3`): entre **`1` y `10`**.
  - `expires_at` (`string` ISO 8601, opcional, default = `expires_at` de la bóveda): fecha futura que **no puede superar** la fecha `expires_at` de la bóveda.
- **Importante:** Los campos `invitationPath` e `invitationUrl` se devuelven **UNA SOLA VEZ** en esta respuesta `201`. El backend solo almacena el hash `SHA-256` del token, por lo que el enlace no puede recuperarse después (el frontend debe mostrarlo en un modal para que el dueño lo copie en ese momento).
- **Respuesta `201 Created`:**
  ```json
  {
    "member": {
      "id": "f9031f3a-5b3f-4e1a-9f8c-3391e88b01a1",
      "recipient_email": "invitado@dominio.com",
      "recipient_label": "Cliente B",
      "status": "PENDING",
      "max_downloads": 3,
      "expires_at": "2026-12-20T18:00:00.000Z",
      "created_at": "2026-11-20T18:06:00.000Z"
    },
    "invitationPath": "/invitacion/7xK9mP4xR7wQ2nJ8vL5tY3bN6cM1zX4w",
    "invitationUrl": "http://localhost:5173/invitacion/7xK9mP4xR7wQ2nJ8vL5tY3bN6cM1zX4w"
  }
  ```
- **Errores:**
  - `400`: `"recipient_email inválido"`, `"No puedes invitarte a ti mismo"`, `"recipient_label inválido (máx. 120 caracteres)"`, `"max_downloads debe ser un entero entre 1 y 10"`, `"expires_at debe ser una fecha futura"`, `"expires_at no puede exceder la expiración de la bóveda"`
  - `404`: `"Bóveda no encontrada"`
  - `409`: `"Ya existe una invitación vigente para ese correo"`, `"La bóveda está bloqueada"`, `"La bóveda expiró"`, `"La bóveda fue purgada"`

#### 5.2 `DELETE /api/v1/vaults/:vaultId/members/:memberId`
- **Requiere sesión:** Sí (`requireAuth`, dueño).
- **Acción:** Cambia `status = 'REVOKED'` y anula cualquier ticket activo del miembro.
- **Respuesta `200 OK`:**
  ```json
  { "ok": true }
  ```
- **Errores:** `404` (`"Miembro no encontrado"` o ya estaba revocado).

---

### Módulo 6: Flujo de Invitación y Canal 2 (`Invitations` — Invitado)
> **Rate Limit y Cabeceras:** Todas las rutas bajo `/api/v1/invitations/*` y `/api/v1/shared/*` comparten un límite de **60 peticiones cada 15 min por IP** (`INVITATION_RATE_LIMIT_MAX`) e inyectan siempre `X-Robots-Tag: noindex, nofollow, noarchive`, `Referrer-Policy: no-referrer` y `Cache-Control: no-store`.

#### 6.1 `GET /api/v1/invitations/:token`
- **Requiere sesión:** **No** (público para renderizar la pantalla de bienvenida `/invitacion/[token]`).
- **Parámetros URL:** `token` (`string` base64url de 32 chars).
- **Respuesta `200 OK`:**
  ```json
  {
    "invitation": {
      "vaultName": "Contratos 2026",
      "ownerEmail": "d***@dominio.com",
      "maskedEmail": "i***@dominio.com",
      "status": "PENDING",
      "expires_at": "2026-12-20T18:00:00.000Z"
    }
  }
  ```
- **Errores:**
  - `404`: `{ "error": "Invitación no encontrada" }` (token mal formado o no existe).
  - `410`: `{ "error": "Invitación no disponible" }` (invitación `REVOKED` o `EXPIRED`, o la bóveda está `LOCKED`, `EXPIRED` o `PURGED`).

#### 6.2 `POST /api/v1/invitations/:token/verify-identity`
- **Requiere sesión:** **Sí** (`requireAuth`).
- **Body:** vacío (`{}`).
- **Acción:**
  1. Compara `req.user.email.toLowerCase()` con `member.recipient_email.toLowerCase()`. Si no coinciden → registra `ACCESS_DENIED` y lanza `403`.
  2. Si coinciden → verifica el cooldown de reenvío (`60` segundos por defecto). Si se envió hace menos de 60s → devuelve `429` con `retryAfterSeconds`.
  3. Genera una clave aleatoria de **14 caracteres alfanuméricos** (sin caracteres ambiguos), guarda su hash `bcrypt` (costo 12) y la envía por correo al invitado (Canal 2).
- **Respuesta `200 OK`:**
  ```json
  {
    "ok": true,
    "message": "Clave enviada a tu correo",
    "maskedEmail": "i***@dominio.com",
    "cooldownSeconds": 60
  }
  ```
- **Errores:**
  - `401`: `{ "error": "No autenticado" }`
  - `403`: `{ "error": "Acceso denegado" }` (el usuario autenticado no es el destinatario de la invitación).
  - `404`: `{ "error": "Invitación no encontrada" }`
  - `410`: `{ "error": "Invitación no disponible" }`
  - `429` (cooldown activo):
    ```json
    {
      "error": "La clave ya fue enviada recientemente",
      "retryAfterSeconds": 45
    }
    ```
  - `502`: `{ "error": "No se pudo enviar el correo con la clave. Intenta de nuevo más tarde" }`

#### 6.3 `POST /api/v1/invitations/:token/unlock`
- **Requiere sesión:** **Sí** (`requireAuth`, y el correo debe coincidir con `recipient_email`).
- **Body (`application/json`):**
  - `password` (`string`, requerido, 1 a 128 chars): clave de 14 caracteres recibida por correo (Canal 2).
- **Acción:**
  - Verifica límite de descargas (`download_count < max_downloads`) y si hay bloqueo temporal activo (`locked_until > now()`).
  - Si la clave acierta: reinicia `failed_attempts = 0`, `locked_until = NULL`, cambia `status = 'ACCEPTED'`, emite un **ticket de un solo uso válido por 60 segundos** y devuelve la lista de archivos activos de la bóveda.
  - Si la clave falla: incrementa `failed_attempts`, aplica bloqueo exponencial (`2^n` segundos: `2s`, `4s`, `8s`, `16s`; en el **5.º fallo** bloquea por **900 segundos / 15 minutos** y cambia `status = 'TEMP_LOCKED'`) e invalida cualquier ticket previo.
- **Respuesta `200 OK`:**
  ```json
  {
    "ticket": "yL8vM2nQ9xR4kP7wT1zX6cB3vN5mK8jH2gF4dS6aP0q",
    "ticketExpiresAt": "2026-11-20T18:16:00.000Z",
    "vault": {
      "id": "a72a761c-6a58-4a30-8f02-93823d28095a",
      "name": "Contratos 2026",
      "expires_at": "2026-12-20T18:00:00.000Z"
    },
    "files": [
      {
        "id": "4e89b10d-3c14-489a-8a39-146f0e61c3d2",
        "original_filename": "Informe.pdf",
        "mime_type": "application/pdf",
        "size_bytes": 104857,
        "status": "ACTIVE",
        "created_at": "2026-11-20T18:05:00.000Z"
      }
    ],
    "downloadsRemaining": 3
  }
  ```
- **Errores:**
  - `400`: `{ "error": "La contraseña es obligatoria" }`
  - `403` (correo distinto): `{ "error": "Acceso denegado" }`
  - `403` (descargas agotadas): `{ "error": "Se alcanzó el límite de descargas de esta invitación" }`
  - `401` (contraseña incorrecta en intentos 1 a 4, incluye header `Retry-After`):
    ```json
    {
      "error": "Contraseña incorrecta",
      "attemptsUsed": 1,
      "maxAttempts": 5,
      "retryAfterSeconds": 2
    }
    ```
  - `429` (en el 5.º intento fallido, bloqueo de 15 min):
    ```json
    {
      "error": "Demasiados intentos: acceso bloqueado temporalmente",
      "attemptsUsed": 5,
      "maxAttempts": 5,
      "retryAfterSeconds": 900
    }
    ```
  - `429` (intento realizado mientras `locked_until > now()`, sin evaluar `bcrypt`):
    ```json
    {
      "error": "Acceso temporalmente bloqueado por intentos fallidos",
      "retryAfterSeconds": 14,
      "failedAttempts": 4,
      "attemptsUsed": 4,
      "maxAttempts": 5
    }
    ```
  - `404` / `410`: invitación no encontrada o no disponible.

---

### Módulo 7: Bóvedas Compartidas y Descarga (`Shared` — Invitado)

#### 7.1 `GET /api/v1/shared`
- **Requiere sesión:** Sí (`requireAuth`).
- **Descripción:** Lista las bóvedas vigentes (no `PURGED` ni expiradas) donde el correo del usuario autenticado tiene una membresía vigente en estado `ACCEPTED` o `TEMP_LOCKED`. *(Las invitaciones aún en `PENDING` no aparecen aquí hasta que el invitado las desbloquea al menos una vez).*
- **Respuesta `200 OK`:**
  ```json
  {
    "shared": [
      {
        "vault_id": "a72a761c-6a58-4a30-8f02-93823d28095a",
        "name": "Contratos 2026",
        "vault_status": "ACTIVE",
        "vault_expires_at": "2026-12-20T18:00:00.000Z",
        "owner_email": "dueno@dominio.com",
        "member_status": "ACCEPTED",
        "member_expires_at": "2026-12-20T18:00:00.000Z",
        "max_downloads": 3,
        "download_count": 1,
        "downloads_remaining": 2,
        "files_count": 2
      }
    ]
  }
  ```

#### 7.2 `GET /api/v1/shared/:vaultId/files/:fileId/download`
- **Requiere sesión:** Sí (`requireAuth`).
- **Ticket de descarga (obligatorio, de un solo uso y válido por 60s):**
  - Header recomendado: **`X-Download-Ticket: <ticket>`**
  - Alternativa por query string: `?ticket=<ticket>`
- **Acción:** Consume atómicamente el ticket en PostgreSQL (`ticket_hash = NULL`, `download_count = download_count + 1`), descarga el `.enc` de R2/storage, descifra el archivo en RAM (MEK → KEK → DEK → AES-256-GCM) y envía el binario.
- **Respuesta `200 OK`:**
  - **Cuerpo:** Binario del archivo descifrado (`Blob` / `ArrayBuffer`).
  - **Headers de respuesta:**
    - `Content-Type`: MIME real del archivo (ej. `application/pdf`, `image/png`).
    - `Content-Length`: tamaño en bytes.
    - `Content-Disposition`: `attachment; filename="Informe.pdf"; filename*=UTF-8''Informe.pdf`
    - `Cache-Control: no-store`
    - `X-Content-Type-Options: nosniff`
    - `X-Robots-Tag: noindex, nofollow, noarchive`
    - `Referrer-Policy: no-referrer`
- **Errores (devuelven JSON):**
  - `401`: `{ "error": "Ticket inválido, expirado o ya utilizado" }` (o sin sesión: `"No autenticado"`).
  - `403`: `{ "error": "Acceso denegado" }` (el usuario no es miembro vigente de esa bóveda).
  - `404`: `{ "error": "Archivo no encontrado" }` (bóveda o archivo no existe o fue purgado).
  - `410`: `{ "error": "La bóveda no está disponible" }` (bóveda `LOCKED`, `EXPIRED` o `PURGED`).

---

### Módulo 8: Auditoría y Estadísticas (`Audit` — Dueño)

#### 8.1 `GET /api/v1/audit/logs`
- **Requiere sesión:** Sí (`requireAuth`). Filtra estrictamente por `owner_id = req.user.id`.
- **Query Params opcionales:**
  - `page` (`number` entero >= 1, default `1`)
  - `limit` (`number` entero >= 1, default `20`, máximo **`100`**; si se envía > 100 se recorta a 100)
  - `event` (`string`, máx. 50 chars): filtra por nombre exacto de evento (ver sección E.3).
  - `from` (`string` ISO 8601 o `YYYY-MM-DD`): inicio inclusivo.
  - `to` (`string` ISO 8601 o `YYYY-MM-DD`): fin inclusivo (si se pasa `YYYY-MM-DD`, cubre todo ese día completo).
- **Respuesta `200 OK`:**
  ```json
  {
    "retentionPolicy": "6 months (LFPDPPP)",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 4,
      "totalPages": 1
    },
    "logs": [
      {
        "id": 42,
        "event": "FILE_DOWNLOADED",
        "vault_id": "a72a761c-6a58-4a30-8f02-93823d28095a",
        "file_id": "4e89b10d-3c14-489a-8a39-146f0e61c3d2",
        "member_id": "f9031f3a-5b3f-4e1a-9f8c-3391e88b01a1",
        "ip": "127.0.0.1",
        "user_agent": "Mozilla/5.0...",
        "detail": {
          "size_bytes": 104857,
          "mime_type": "application/pdf"
        },
        "created_at": "2026-11-20T18:16:10.000Z"
      }
    ]
  }
  ```
- **Errores:** `400` (`"page debe ser un entero positivo"`, `"limit debe ser un entero positivo"`, `"from no es una fecha ISO válida"`, `"from debe ser anterior a to"`, `"event inválido"`).

#### 8.2 `GET /api/v1/audit/stats`
- **Requiere sesión:** Sí (`requireAuth`).
- **Query Params opcionales:**
  - `days`: **`"7"`** o **`"30"`** (default `"30"`). Cualquier otro valor devuelve `400`.
- **Descripción:** Devuelve una serie cronológica ascendente continua de los últimos 7 o 30 días (los días sin actividad vienen con `0`) y la suma total del periodo.
- **Respuesta `200 OK`:**
  ```json
  {
    "days": 7,
    "totals": {
      "downloads": 5,
      "failedAttempts": 1,
      "uniqueVisitors": 2
    },
    "series": [
      { "date": "2026-11-14", "downloads": 0, "failedAttempts": 0, "uniqueVisitors": 0 },
      { "date": "2026-11-15", "downloads": 0, "failedAttempts": 0, "uniqueVisitors": 0 },
      { "date": "2026-11-16", "downloads": 0, "failedAttempts": 0, "uniqueVisitors": 0 },
      { "date": "2026-11-17", "downloads": 2, "failedAttempts": 0, "uniqueVisitors": 1 },
      { "date": "2026-11-18", "downloads": 0, "failedAttempts": 0, "uniqueVisitors": 0 },
      { "date": "2026-11-19", "downloads": 0, "failedAttempts": 0, "uniqueVisitors": 0 },
      { "date": "2026-11-20", "downloads": 3, "failedAttempts": 1, "uniqueVisitors": 1 }
    ]
  }
  ```
- **Errores:** `400` (`"days debe ser 7 o 30"`).

---

## D. Flujos Críticos Paso a Paso (para el Frontend)

### 1. Subida de Archivos (`POST /api/v1/vaults/:vaultId/files`)
- **Límite estricto:** `15 MB` (`15 * 1024 * 1024` bytes). Valídalo antes de enviar.
- **Allowlist exacta de formatos permitidos (validados en el servidor por *magic bytes*, no por extensión):**
  - Documentos:
    - PDF (`application/pdf`)
    - Word DOCX (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
    - Excel XLSX (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`)
    - PowerPoint PPTX (`application/vnd.openxmlformats-officedocument.presentationml.presentation`)
    - Texto plano UTF-8 (`text/plain`) y CSV UTF-8 (`text/csv`) — *sin bytes nulos ni tags HTML/SVG/XML/PHP/scripts (`#!`)*.
  - Imágenes:
    - PNG (`image/png`)
    - JPEG (`image/jpeg`)
    - WEBP (`image/webp`)
  - Comprimidos:
    - ZIP (`application/zip`)
  *(Nota: como DOCX, XLSX y PPTX son contenedores ZIP por dentro, `file-type` puede detectarlos por su estructura OpenXML o como `application/zip`; ambos están en la allowlist. Archivos `.svg`, `.html`, `.exe`, `.sh`, `.php` o `.bat` son rechazados siempre con `415`).*
- **Ejemplo de subida en TypeScript:**
  ```ts
  export async function uploadVaultFile(vaultId: string, file: File) {
    if (file.size === 0) throw new Error('El archivo está vacío');
    if (file.size > 15 * 1024 * 1024) throw new Error('El archivo supera el límite de 15 MB');

    const formData = new FormData();
    formData.append('file', file); // El campo DEBE llamarse 'file'

    const res = await fetch(`${API_BASE}/api/v1/vaults/${vaultId}/files`, {
      method: 'POST',
      credentials: 'include',
      body: formData, // NO agregues Content-Type manualmente
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al subir el archivo');
    return data.file;
  }
  ```

### 2. Flujo de Invitación y Canal 2 (`/invitacion/[token]`)
Cuando un invitado abre `/invitacion/[token]` en Next.js:

1. **Paso 1 — Consultar invitación pública:**
   Llama a `GET /api/v1/invitations/${token}`.
   - Si responde `404` o `410`: muestra pantalla de invitación no encontrada / expirada / revocada.
   - Si responde `200`: muestra el nombre de la bóveda (`invitation.vaultName`), el correo del dueño enmascarado (`invitation.ownerEmail`) y el correo destinatario esperado enmascarado (`invitation.maskedEmail`, ej. `i***@dominio.com`).

2. **Paso 2 — Verificar si hay sesión activa (`GET /api/v1/auth/me`):**
   - Si responde `401`: muestra botones para **Iniciar sesión** o **Registrarse** con el correo `i***@dominio.com`, guardando la ruta `/invitacion/${token}` para regresar automáticamente tras autenticarse.

3. **Paso 3 — Verificar identidad y disparar envío de clave Canal 2:**
   Con sesión iniciada, cuando el usuario pulsa **"Verificar identidad y enviar clave a mi correo"**, llama a:
   `POST /api/v1/invitations/${token}/verify-identity`
   - Si responde `403` (`"Acceso denegado"`): el usuario inició sesión con un correo diferente al invitado. Muestra aviso claro: *"Estás autenticado como `otro@correo.com`, pero esta invitación pertenece a `i***@dominio.com`"* y un botón para cerrar sesión (`POST /api/v1/auth/logout`).
   - Si responde `429` (`"La clave ya fue enviada recientemente"`): pasa igualmente al formulario de ingreso de clave (la clave ya fue enviada hace segundos) y usa `retryAfterSeconds` para el contador del botón *"Reenviar clave"*.
   - Si responde `200`: muestra el formulario para introducir la contraseña del Canal 2 e inicia el cooldown de reenvío con `cooldownSeconds` (`60` s).

4. **Paso 4 — Desbloquear bóveda (`POST /api/v1/invitations/${token}/unlock`):**
   Envía `{ "password": inputPassword.trim() }`.
   - Si responde `401` o `429`: lee `retryAfterSeconds`, `attemptsUsed` y `maxAttempts` (`5`). Bloquea el input/botón durante `retryAfterSeconds` segundos con una cuenta regresiva visible.
   - Si responde `200`: guarda en estado `{ ticket, ticketExpiresAt, vault, files, downloadsRemaining }`. Muestra la lista de archivos y un indicador visual de que el ticket de descarga vence en **60 segundos** (`ticketExpiresAt`).

### 3. Descarga Binaria Segura (`GET /api/v1/shared/:vaultId/files/:fileId/download`)
> **ADVERTENCIA CRÍTICA SOBRE EL TICKET:**
> El `ticket` devuelto por `unlock` es **de un solo uso (single-use)** y **expira a los 60 segundos**.
> - En cuanto el invitado descarga **1 archivo**, el backend hace `ticket_hash = NULL` e incrementa `download_count`.
> - Si la bóveda tiene varios archivos y el invitado quiere descargar un **segundo archivo** (o si pasaron más de 60 segundos), el ticket anterior ya no servirá (`401`). El frontend debe detectar que el ticket ya fue consumido o expiró y pedirle al invitado que vuelva a desbloquear con su misma contraseña del Canal 2 (`POST /api/v1/invitations/:token/unlock`) para emitir un nuevo ticket de 60s (siempre que `downloadsRemaining > 0`).
> - Asimismo, desde la vista `GET /api/v1/shared`, el usuario ve el listado de bóvedas compartidas, pero para descargar un archivo necesita un `ticket` emitido por `POST /api/v1/invitations/:token/unlock`. Por ello, se recomienda guardar el `token` de invitación en `localStorage` indexado por `vault.id` cuando el usuario desbloquea una invitación, o llevarlo a su enlace de invitación para desbloquear antes de descargar.

**Ejemplo completo de descarga con `fetch` + `Blob` en el navegador:**
```ts
export async function downloadSharedFile(
  vaultId: string,
  fileId: string,
  fallbackFilename: string,
  ticket: string,
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/api/v1/shared/${vaultId}/files/${fileId}/download`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'X-Download-Ticket': ticket,
      },
    },
  );

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Error ${res.status} al descargar`);
  }

  const blob = await res.blob();

  // Extraer nombre de Content-Disposition si está disponible
  const disposition = res.headers.get('content-disposition') || '';
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  const asciiMatch = disposition.match(/filename="([^"]+)"/i);
  const filename = utf8Match
    ? decodeURIComponent(utf8Match[1])
    : asciiMatch
      ? asciiMatch[1]
      : fallbackFilename;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
```

---

## E. Enums, Estados y Tipos TypeScript listos para copiar (`types/api.ts`)

### 1. Estados de Bóveda, Archivo y Miembro
- **Bóveda (`VaultStatus`):**
  - `'ACTIVE'` — Operativa; permite subir archivos, invitar y descargar.
  - `'LOCKED'` — Bloqueada temporalmente por el dueño; nadie puede subir, invitar ni descargar hasta que vuelva a `'ACTIVE'`.
  - `'EXPIRED'` — Venció su `expires_at` y el cron job aplicó crypto-shredding (`wrapped_kek = NULL`). Estado terminal.
  - `'PURGED'` — Eliminada por el dueño con crypto-shredding (`wrapped_kek = NULL`). Estado terminal.
- **Archivo (`VaultFileStatus`):**
  - `'ACTIVE'` — Cifrado y disponible.
  - `'PURGED'` — DEK destruida (`wrapped_dek = NULL`) y binario eliminado.
- **Miembro (`WorkspaceMemberStatus`):**
  - `'PENDING'` — Invitado; aún no ha desbloqueado la bóveda con la clave del Canal 2.
  - `'ACCEPTED'` — Identidad verificada y bóveda desbloqueada al menos una vez.
  - `'TEMP_LOCKED'` — Bloqueado por 15 minutos tras 5 intentos fallidos de contraseña en `unlock`.
  - `'REVOKED'` — Acceso revocado por el dueño (o por purga de la bóveda).
  - `'EXPIRED'` — Venció la fecha `expires_at` del miembro o de la bóveda.

### 2. Eventos de Auditoría (`AuditEvent`)
Nombres exactos registrados en `access_logs.event` (útiles para el selector de filtro `?event=` y para pintar badges en la tabla de auditoría):

| Evento (`access_logs.event`) | Cuándo se registra | Campos en `detail` |
|---|---|---|
| `'USER_REGISTERED'` | Registro de cuenta (`POST /auth/register`) | `{}` |
| `'LOGIN_SUCCESS'` | Inicio de sesión exitoso (`POST /auth/login`) | `{}` |
| `'LOGIN_FAILED'` | Contraseña incorrecta para un usuario existente (`POST /auth/login`) | `{}` |
| `'SESSION_REVOKED'` | Logout, revocación individual o Kill-Switch | `{ scope: 'logout' \| 'single' \| 'all', count?: number }` |
| `'VAULT_CREATED'` | Creación de bóveda (`POST /vaults`) | `{}` |
| `'VAULT_LOCKED'` | Dueño bloquea bóveda (`PATCH /vaults/:id/status`) | `{}` |
| `'VAULT_UNLOCKED'` | Dueño reactiva bóveda (`PATCH /vaults/:id/status`) | `{}` |
| `'VAULT_PURGED'` | Dueño elimina bóveda con crypto-shredding (`DELETE /vaults/:id`) | `{ reason: 'owner_request', files_purged: number, members_revoked: number }` |
| `'VAULT_EXPIRED'` | Cron job expira bóveda vencida con crypto-shredding | `{ reason: 'expired', files_purged: number, members_revoked: number }` |
| `'FILE_UPLOADED'` | Subida de archivo cifrado (`POST /vaults/:id/files`) | `{ size_bytes: number, mime_type: string }` |
| `'FILE_PURGED'` | Borrado individual con crypto-shredding (`DELETE /vaults/:id/files/:fileId`) | `{}` |
| `'MEMBER_INVITED'` | Creación de invitación (`POST /vaults/:id/members`) | `{ max_downloads: number }` |
| `'MEMBER_REVOKED'` | Revocación de miembro (`DELETE /vaults/:id/members/:memberId`) | `{}` |
| `'IDENTITY_VERIFIED'` | Correo del invitado coincide en `verify-identity` | `{}` |
| `'PASSWORD_SENT'` | Envío de contraseña por Canal 2 en `verify-identity` | `{}` |
| `'UNLOCK_FAILED'` | Contraseña de Canal 2 incorrecta en `unlock` | `{ attempts_used: number, lock_seconds: number, temp_locked: boolean }` |
| `'VAULT_UNLOCKED_BY_MEMBER'` | Desbloqueo exitoso por invitado y emisión de ticket | `{}` |
| `'FILE_DOWNLOADED'` | Descarga exitosa y consumo atómico de ticket | `{ size_bytes: number, mime_type: string }` |
| `'DOWNLOAD_DENIED'` | Intento de descarga con ticket inválido, expirado, reutilizado o sin cupo | `{ reason: 'ticket_invalid_expired_used_or_limit' }` |
| `'DOWNLOAD_FAILED'` | Error interno de storage/descifrado tras consumir ticket (revierte contador) | `{ reason: 'server_error' }` |
| `'ACCESS_DENIED'` | Usuario autenticado con un correo distinto al del invitado intenta `verify-identity`, `unlock` o `download` | `{ action: 'verify_identity' \| 'unlock' \| 'download' }` |

### 3. Archivo `types/api.ts` listo para copiar

```ts
// types/api.ts — Contratos exactos del backend SecDocs v2

export type UserRole = 'user' | 'admin';

export type VaultStatus = 'ACTIVE' | 'LOCKED' | 'EXPIRED' | 'PURGED';
export type KekStatus = 'ACTIVE' | 'PURGED';
export type VaultFileStatus = 'ACTIVE' | 'PURGED';
export type WorkspaceMemberStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'TEMP_LOCKED'
  | 'REVOKED'
  | 'EXPIRED';

export type AuditEvent =
  | 'USER_REGISTERED'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'SESSION_REVOKED'
  | 'VAULT_CREATED'
  | 'VAULT_LOCKED'
  | 'VAULT_UNLOCKED'
  | 'VAULT_PURGED'
  | 'VAULT_EXPIRED'
  | 'FILE_UPLOADED'
  | 'FILE_PURGED'
  | 'MEMBER_INVITED'
  | 'MEMBER_REVOKED'
  | 'IDENTITY_VERIFIED'
  | 'PASSWORD_SENT'
  | 'UNLOCK_FAILED'
  | 'VAULT_UNLOCKED_BY_MEMBER'
  | 'FILE_DOWNLOADED'
  | 'DOWNLOAD_DENIED'
  | 'DOWNLOAD_FAILED'
  | 'ACCESS_DENIED';

// --- Errores ---
export interface ApiErrorResponse {
  error: string;
  // Presentes en 401/429 de /invitations/:token/unlock y verify-identity
  retryAfterSeconds?: number;
  attemptsUsed?: number;
  failedAttempts?: number;
  maxAttempts?: number;
}

// --- Auth & Security ---
export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface AuthResponse {
  user: User;
}

export interface UserSession {
  jti: string;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
  expires_at: string;
  current: boolean;
}

export interface SessionsListResponse {
  sessions: UserSession[];
}

export interface RevokeSessionResponse {
  ok: true;
  current: boolean;
}

export interface KillSwitchResponse {
  ok: true;
  revoked: number;
}

// --- Vaults, Files & Members (Dueño) ---
export interface UserMetrics {
  total_storage_bytes: number;
  total_files_active: number;
  total_vaults_active: number;
}

export interface VaultSummary {
  id: string;
  name: string;
  status: VaultStatus;
  expires_at: string;
  expired: boolean;
  purged_at: string | null;
  created_at: string;
  files_count: number;
  members_count: number;
}

export interface VaultsListResponse {
  metrics: UserMetrics;
  vaults: VaultSummary[];
}

export interface CreateVaultRequest {
  name: string;
  expires_at: string; // ISO 8601 futura (<= 365 días)
}

export interface CreateVaultResponse {
  vault: VaultSummary;
}

export interface VaultFileItem {
  id: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  status: VaultFileStatus;
  created_at: string;
}

export interface WorkspaceMemberItem {
  id: string;
  recipient_email: string;
  recipient_label: string | null;
  status: WorkspaceMemberStatus;
  failed_attempts: number;
  locked_until: string | null;
  download_count: number;
  max_downloads: number;
  expires_at: string;
  last_access_at: string | null;
}

export interface VaultDetail {
  id: string;
  name: string;
  status: VaultStatus;
  expires_at: string;
  expired: boolean;
  purged_at: string | null;
  created_at: string;
  keys: {
    algorithm: 'AES-256-GCM';
    kekStatus: KekStatus;
  };
}

export interface VaultDetailResponse {
  vault: VaultDetail;
  files: VaultFileItem[];
  members: WorkspaceMemberItem[];
}

export interface UpdateVaultStatusResponse {
  vault: Omit<VaultSummary, 'files_count' | 'members_count'>;
}

export interface DeleteVaultResponse {
  ok: true;
  purged_files: number;
}

export interface UploadFileResponse {
  file: VaultFileItem;
}

export interface CreateMemberRequest {
  recipient_email: string;
  recipient_label?: string | null;
  max_downloads?: number; // 1..10 (default 3)
  expires_at?: string; // ISO 8601 futura (<= vault.expires_at)
}

export interface CreatedMember {
  id: string;
  recipient_email: string;
  recipient_label: string | null;
  status: WorkspaceMemberStatus;
  max_downloads: number;
  expires_at: string;
  created_at: string;
}

export interface CreateMemberResponse {
  member: CreatedMember;
  invitationPath: string; // "/invitacion/<token>" (se muestra UNA sola vez)
  invitationUrl: string;  // "${FRONTEND_URL}/invitacion/<token>"
}

// --- Invitations & Shared (Invitado) ---
export interface PublicInvitationInfo {
  vaultName: string;
  ownerEmail: string;  // enmascarado: "d***@dominio.com"
  maskedEmail: string; // enmascarado: "i***@dominio.com"
  status: WorkspaceMemberStatus;
  expires_at: string;
}

export interface GetInvitationResponse {
  invitation: PublicInvitationInfo;
}

export interface VerifyIdentityResponse {
  ok: true;
  message: string;
  maskedEmail: string;
  cooldownSeconds: number;
}

export interface UnlockInvitationResponse {
  ticket: string;
  ticketExpiresAt: string;
  vault: {
    id: string;
    name: string;
    expires_at: string;
  };
  files: VaultFileItem[];
  downloadsRemaining: number;
}

export interface SharedVaultItem {
  vault_id: string;
  name: string;
  vault_status: VaultStatus;
  vault_expires_at: string;
  owner_email: string;
  member_status: WorkspaceMemberStatus;
  member_expires_at: string;
  max_downloads: number;
  download_count: number;
  downloads_remaining: number;
  files_count: number;
}

export interface SharedVaultsListResponse {
  shared: SharedVaultItem[];
}

// --- Audit & Stats ---
export interface AuditLogItem {
  id: number;
  event: AuditEvent | string;
  vault_id: string | null;
  file_id: string | null;
  member_id: string | null;
  ip: string | null;
  user_agent: string | null;
  detail: Record<string, unknown>;
  created_at: string;
}

export interface AuditLogsResponse {
  retentionPolicy: '6 months (LFPDPPP)';
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  logs: AuditLogItem[];
}

export interface DailyStatPoint {
  date: string; // "YYYY-MM-DD"
  downloads: number;
  failedAttempts: number;
  uniqueVisitors: number;
}

export interface AuditStatsResponse {
  days: 7 | 30;
  totals: {
    downloads: number;
    failedAttempts: number;
    uniqueVisitors: number;
  };
  series: DailyStatPoint[];
}
```
