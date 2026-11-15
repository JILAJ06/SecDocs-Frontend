# Reporte de Claude Code

> Claude Code: reescribe **todo** este archivo al terminar cada tarea (no lo acumules).
> Claude Chat lo lee para revisar. No edites `ai/siguiente.md`.

**Tarea:** T-01 · Actualizar dependencias por seguridad
**Rama:** `00-dependencias`
**Pull Request:** _(se agrega en el siguiente commit, después de abrirlo)_
**Estado:** Completada
**Fecha:** 2026-11-15

## Qué hice
- `git fetch origin`, `git checkout 00-dependencias`, `git pull`. `git branch --show-current` → `00-dependencias`. Leí `07-decisiones.md`.
- Borré `node_modules`, `.next` y el `package-lock.json` local sin versionar (venía de la T-00 con Next 14). Después instalé las versiones nuevas.
- Cambios de versión en `package.json` (sigo usando `^`):

| Paquete | Antes | Ahora | Motivo |
|---|---|---|---|
| `next` | `^14.2.30` (instalada 14.2.35) | `^15.5.29` (última 15.5.x, ≥ 15.5.21) | CVE-2026-29057 y CVE-2026-64645 en rewrites |
| `react` | `^18.3.1` | `^19.3.1` | Next 15 con React 19 |
| `react-dom` | `^18.3.1` | `^19.3.1` | igual |
| `axios` | `^1.12.0` | `^1.21.1` | última dentro de la 1.x |
| `postcss` (dev) | `^8.4.49` | `^8.5.33` | avisos de postcss ≤ 8.5.22 (arreglo dentro de la 8.x) |
| `tailwindcss` (dev) | `^3.4.17` | `^3.4.19` | última 3.x (no se sube a la 4) |
| `autoprefixer` (dev) | `^10.4.20` | `^10.6.2` | última 10.x |

- **Código de `app/`: no hizo falta cambiar nada.** La única ruta dinámica es `app/s/[token]/page.jsx`. Es un componente de cliente que lee el token con el hook `useParams()`, no con la prop `params`, que es la que pasó a ser asíncrona en Next 15. No hay `cookies()`, `headers()`, `searchParams` ni `forwardRef`/`defaultProps` que React 19 o Next 15 obliguen a cambiar. Por eso no existe el commit "Adapta las rutas a Next.js 15".
- `next.config.mjs` sin cambios: Next 15 lo acepta tal cual (`output: 'standalone'`, `rewrites`, `headers`).
- Versioné `package-lock.json`. Verifiqué que no esté en `.gitignore` (`git check-ignore` no devuelve nada).
- `Dockerfile`, solo la etapa `deps`: `COPY package.json package-lock.json ./` y `RUN npm ci --no-audit --no-fund`. Nada más.

## Archivos tocados
- `package.json`, `package-lock.json`, `Dockerfile`, `ai/reporte.md`

## Commits subidos
- `5c44555` Actualiza Next.js y React a versiones sin vulnerabilidades conocidas en las rewrites
- `2618c14` Versiona package-lock.json y usa npm ci en el Dockerfile
- Agrega el reporte de la tarea T-01 (este archivo)

## Verificación
- **`npm ci` desde cero** (sin `node_modules` ni `.next`): OK.
- **`npm run build`:** OK, compilado con Next 15.5.29 sin advertencias. Rutas: `/`, `/audit`, `/dashboard`, `/login`, `/register` estáticas y `/s/[token]` dinámica, igual que antes.
- **`npm audit`:** de 2 (1 crítica en `next` y 1 alta en `postcss`) bajó a 2 (1 alta y 1 moderada). **Ya no hay ningún aviso propio de Next.** Lo que queda es una sola cosa:
  - `next@15.5.29` trae fijado internamente `postcss@8.4.31` (`node_modules/next/node_modules/postcss`), afectado por GHSA-qx2v-qp2m-jg93, GHSA-6g55-p6wh-862q, GHSA-fxqj-rqcc-2cmp y GHSA-r28c-9q8g-f849. npm cuenta esa copia como 1 alta (postcss) y marca `next` como moderada solo por depender de ella.
  - **No aplica en la práctica:** son fallas al procesar CSS controlado por un atacante (`</style>` sin escapar, `sourceMappingURL` que lee archivos `.map`). Ese postcss solo corre **al compilar**, sobre nuestro propio CSS (`globals.css` + Tailwind). No se ejecuta en el servidor ni procesa datos de usuarios.
  - `npm audit fix --force` lo "arregla" instalando `next@16`, que la tarea prohíbe. Ver D1 para una alternativa.
- **`npm run start`** (producción) + `curl -I http://localhost:3000/login`, resumido:
  ```
  HTTP/1.1 200 OK
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  X-Robots-Tag: noindex, nofollow, noarchive
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  ```
  - Ya no aparece `X-Powered-By` (`poweredByHeader: false` sigue funcionando).
  - `curl -I /s/prueba` mantiene `Cache-Control: no-store, max-age=0` y la CSP.
- **Renderizado:** `/login` → 200 con "Iniciar sesión", `/register` → 200 con "Crear cuenta", `/s/prueba` → 200 con "Verificando enlace…".
  - En el navegador integrado, `/s/prueba` pasa a "Enlace no disponible" porque `GET /api/public/links/prueba` responde 500: la API no está levantada, así que es lo esperado.
  - `/login` se ve igual que antes.
  - En consola solo sale ese 500 de `/api`: sin errores de hidratación, de `params` ni de CSP.
- **Cambios visuales o de lógica:** ninguno (no se tocó `app/`, `components/` ni `lib/`).

## Dudas
- **D1 (no bloquea):** para cerrar también el aviso del postcss interno de Next, se puede agregar en `package.json` un `"overrides": { "next": { "postcss": "^8.5.33" } }`, que fuerza a Next a usar la misma 8.5.x que ya usamos. Es un cambio dentro de la 8.x, pero Next no lo prueba oficialmente con esa versión. No lo hice porque la tarea no lo pedía y el aviso no aplica en ejecución. ¿Lo agrego en esta rama o se queda así?
- **D2 (no bloquea):** con `npm ci` el build de Docker queda reproducible, pero sigo sin poder probar `docker build` (no lo corrí). Tampoco lo pedía la tarea. ¿Quieren que lo verifique en alguna tarea, si hay Docker disponible?

## Cosas que noté fuera del alcance
- Mi rama `develop` local estaba desactualizada respecto a `origin/develop`. No afecta: la rama de tarea viene de `origin`.
- `npm` avisa que hay una versión mayor nueva (12.x). No es relevante para el proyecto.
