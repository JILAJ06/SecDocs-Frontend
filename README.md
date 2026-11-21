# SecDocs · Frontend (Versión 2 · Maqueta con datos simulados)

Interfaz web de **SecDocs**, bóveda digital para guardar y compartir documentos confidenciales con cifrado en reposo (KEK por bóveda y DEK por archivo), verificación de identidad del correo invitado, contraseña de bóveda enviada fuera de banda (canal 2) y control de sesiones con *kill-switch* (`jti`).

Proyecto de Seguridad Informática, Universidad Politécnica de Chiapas (Alexander Jiménez y Sayd Quevedo).

## Stack
- **Next.js 15** (App Router, JavaScript `.jsx`)
- **React 19**
- **Tailwind CSS 3**
- Tipografías **Inter** y **JetBrains Mono** (`next/font/google`, cumplimiento de CSP `'self'`)

## Repositorios del proyecto
- **SecDocs-Frontend** (este repositorio)
- [SecDocs-Backend](https://github.com/JILAJ06/SecDocs-Backend): API en Node.js/Express
- [SecDocs-DB](https://github.com/JILAJ06/SecDocs-DB): esquema y migraciones de PostgreSQL

## Cómo ejecutar en local
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # compilación de producción
```

## Credenciales y datos de prueba (maqueta en memoria)
La versión 2 funciona contra una capa de servicios asíncronos (`lib/services/*`) respaldada por datos de ejemplo en memoria (`lib/mock/*`). **No usa `localStorage`, `sessionStorage` ni cookies**; al recargar la página el estado y la sesión vuelven a su estado inicial.

- **Contraseña de acceso de todas las cuentas demo (`DEMO_PASSWORD`):**
  `demo-maqueta-2026`
- **Usuarios de ejemplo:**
  - `alex@upchiapas.edu.mx` — dueño de las 5 bóvedas de ejemplo.
  - `auditor@empresa.com` — invitado con acceso a «Auditoría Financiera».
  - `otro.usuario@gmail.com` — cuenta adicional para probar la pantalla de **Acceso denegado** en invitaciones.
- **Contraseña de bóveda del canal 2 (`BOVEDA_DEMO_PASSWORD`):**
  `boveda-maqueta-2026`
- **Tokens de invitación de prueba (`/invitacion/<token>`):**
  - Invitación para `auditor@empresa.com` (bóveda `v-1` «Auditoría Financiera»):
    `/invitacion/Tq7aN2xLm9Wc4ZpR8vK1sB6yH3dJ0eGf5uIo2nXaMrE`
  - Invitación pendiente para `contador@despacho.mx` (bóveda `v-1` «Auditoría Financiera»):
    `/invitacion/Vb3xQ9mK2rT7wLp0aZ8cN4yE1uH6sJ5dF0gR2iO8nWk`

## Mapa de rutas (v2)
| Ruta | Vista Figma | Descripción |
|---|---|---|
| `/` | — | Redirige a `/vaults` (con sesión) o a `/login` (sin sesión) |
| `/login` | 01 (`6:23`) | Iniciar sesión |
| `/register` | 02 (`6:52`) | Crear cuenta (mínimo 12 caracteres) |
| `/vaults` | 03 (`29:474`) y 03b (`29:644`) | Mis bóvedas (métricas, rejilla de bóvedas y modal «Nueva bóveda») |
| `/vaults/[id]` | 04 (`29:835`) | Detalle de bóveda del dueño (archivos, miembros, invitar por correo y llaves) |
| `/invitacion/[token]` | 05 (`30:877`), 06 (`30:911`), 07 (`30:964`) | Flujo de invitación: iniciar sesión, identidad verificada (canal 2) o acceso denegado |
| `/shared` | — | Compartidas conmigo (lista de bóvedas aceptadas por el usuario en sesión) |
| `/shared/[id]` | 09 (`30:1036`), 10 (`30:1081`) | Bóveda compartida: ingreso de contraseña con espera exponencial (1, 2, 4, 8 s y bloqueo al 5.º intento) y descarga simulada al vuelo |
| `/audit` | 11 (`31:1055`) | Auditoría de accesos con filtros por bóveda y tipo de evento |
| `/security` | 12 (`31:1187`) | Seguridad de la cuenta: sesiones activas (*kill-switch* `jti`) y cambio de contraseña |

## Estructura de carpetas
```text
app/                  rutas del App Router (login, register, vaults, invitacion, shared, audit, security)
components/           componentes reutilizables (ui.jsx, AppHeader, SessionProvider, AuthForm, Modal, Card, etc.)
lib/
  mock/               datos simulados en memoria (users.js, vaults.js, audit.js, sessions.js)
  services/           servicios asíncronos consumidos por las vistas (auth.js, vaults.js, invitations.js, shared.js, audit.js, sessions.js)
public/               archivos estáticos
```

## Paleta
Verde bosque `#00412E` · Salvia `#96BF8A` · Niebla `#E8EAE5` · Blanco `#FFFFFF`.
