# 04 · Vistas que ya existen (se ajustan al Figma, no se rehacen)

Decisión tomada: **se conserva la lógica y la conexión con la API**; solo cambia la interfaz para que coincida con el Figma.

| Ruta | Archivo | Qué hace | Llamadas a la API |
|---|---|---|---|
| `/` | `app/page.jsx` | Redirige a `/dashboard` | — |
| `/login` | `app/login/page.jsx` + `components/AuthForm.jsx` (`mode="login"`) | Inicio de sesión | vía `AuthForm` |
| `/register` | `app/register/page.jsx` + `components/AuthForm.jsx` (`mode="register"`) | Registro | vía `AuthForm` |
| `/dashboard` | `app/dashboard/page.jsx` (envuelta en `Shell`) | Bóveda: subir archivos, listarlos, crear/revocar enlaces por receptor, borrar | `GET /files`, `POST /files`, `DELETE /files/:id`, `GET /files/:id/links`, `POST /files/:id/links`, `POST /links/:id/revoke` |
| `/audit` | `app/audit/page.jsx` (envuelta en `Shell`) | Bitácora de auditoría | `GET /audit` |
| `/s/[token]` | `app/s/[token]/page.jsx` | Vista pública del receptor: mete la clave y descarga | `GET /public/links/:token`, `POST /public/links/:token/verify` |

## Componentes compartidos
- `components/Shell.jsx`: marco de las pantallas con sesión (navegación, cierre de sesión). Llama `GET /auth/me` y `POST /auth/logout`.
- `components/AuthForm.jsx`: formulario de login/registro según `mode`.
- `components/ui.jsx`: `Brand`, `StatusBadge`, `CopyField`, `Alert`.
- `lib/api.js`: cliente axios y utilidades (`errorMessage`, `errorData`, `formatBytes`, `formatDate`, `timeLeft`, `generatePassword`).

## Estados que la interfaz debe seguir cubriendo
Cada vista del Figma debe verse bien (o Claude Chat te dirá qué falta) en: cargando, vacío, error, y los estados de enlace (`ACTIVE`, `CONSUMED`, `EXPIRED`, `REVOKED`, `LOCKED`). El receptor ve "te quedan N intentos", retardo progresivo y "Enlace no disponible".

> Si una pantalla del Figma no tiene equivalente en esta tabla (vista nueva), `siguiente.md` lo indicará explícitamente.
