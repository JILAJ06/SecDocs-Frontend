# 04 · Vistas: lo que ya existe (v1) y cómo se construye la v2

## Estrategia de la v2: maquetado con datos de ejemplo
- Las pantallas nuevas **no llaman a la API real**. Leen de una capa de servicios con datos simulados:
  - `lib/mock/`: datos de ejemplo (bóvedas, archivos, miembros, bitácora, sesiones…). Usa los textos del Figma (por ejemplo "Auditoría Financiera", `auditor@empresa.com`).
  - `lib/services/`: funciones asíncronas (`listVaults()`, `getVault(id)`, `inviteMember(...)`…) que hoy devuelven datos de `lib/mock/`. Más adelante se reemplazan por llamadas a `/api/*` sin tocar las pantallas.
- El estado de sesión simulado vive en memoria (contexto de React). **No** uses `localStorage`/`sessionStorage` ni cookies inventadas.
- Todo dato falso debe verse como falso en el código (carpeta `mock`); nunca pongas contraseñas o llaves reales de ejemplo.
- El mapa de pantallas, rutas y IDs de Figma está en `05-figma.md`.

## Código v1 que ya existe (se conserva hasta nuevo aviso)
| Ruta | Archivo | Qué hace |
|---|---|---|
| `/` | `app/page.jsx` | Redirige a `/dashboard` |
| `/login`, `/register` | `app/login`, `app/register` + `components/AuthForm.jsx` | Sesión (v1, contra la API real) |
| `/dashboard` | `app/dashboard/page.jsx` | Bóveda v1: archivos y enlaces por receptor |
| `/audit` | `app/audit/page.jsx` | Bitácora v1 |
| `/s/[token]` | `app/s/[token]/page.jsx` | Receptor v1 con enlace y clave |

Componentes compartidos: `Shell.jsx` (marco con sesión v1), `AuthForm.jsx`, `ui.jsx` (`Brand`, `StatusBadge`, `CopyField`, `Alert`) y `lib/api.js` (cliente axios y utilidades).

**Conflictos de ruta v1 ↔ v2:** `/login`, `/register` y `/audit` existen en ambas. Cuando una tarea diga que una pantalla v2 reemplaza a la v1, se sustituye en el mismo archivo; no se duplican rutas. `/dashboard` y `/s/[token]` son solo v1 y se retirarán cuando Claude Chat lo indique.

## Estados que cada pantalla debe cubrir
Cargando, vacío, error, y los estados de bóveda (Activa, Bloqueada, Expirada), de miembro/invitación (Pendiente, Aceptada, Bloqueo temporal, Bloqueado) y de archivo (Activo, Destruido). `siguiente.md` dirá cuáles aplican a cada vista.
