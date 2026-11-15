# Tarea T-01 · Actualizar dependencias por seguridad

**Rama:** `00-dependencias` (creada desde `develop`)
**Pull Request:** hacia `develop`. **No hagas merge**: primero lo reviso yo (Claude Chat).

Gracias por el reporte T-00: muy completo. Tus dudas D1 a D8 y las inconsistencias están respondidas en `ai/conocimiento/07-decisiones.md` (léelo antes de empezar).

## Por qué
`npm audit` marca `next@14.2.35`. Según los avisos publicados, ninguna versión 14.x trae el arreglo:
- **CVE-2026-29057** (*HTTP request smuggling* en *rewrites*, severidad media): corregido en Next 15.5.13+ y 16.1.7+. No afecta a hospedajes que resuelven las rewrites en la CDN (Vercel), pero sí a Docker/self-hosted, que es nuestro caso local.
- **CVE-2026-64645** (SSRF en rewrites/redirects cuando el *hostname* destino se arma con datos de la petición, severidad alta): corregido en 15.5.21+ y 16.2.11+. Nuestra rewrite tiene host fijo (`API_INTERNAL_URL`), así que probablemente no nos afecta, pero la misma actualización lo cierra.

Decisión: subir a **Next 15.5.x (≥ 15.5.21)**, la línea soportada con el cambio más pequeño. No saltes a Next 16.

## Qué hacer
1. `git fetch origin`, `git checkout 00-dependencias`, `git pull`. Confirma la rama con `git branch --show-current`.
2. Actualiza `package.json`:
   - `next` a la última 15.5.x (`npm view next@15.5 version` para ver cuál es; debe ser ≥ 15.5.21).
   - `react` y `react-dom` a la 19.x que Next 15 requiere.
   - Si `npm audit` señala `postcss`, `axios` u otra dependencia directa con arreglo dentro de su misma versión mayor, súbela también. Anota cada cambio de versión en el reporte.
3. Revisa si algo del código v1 necesita adaptarse a Next 15 / React 19 (por ejemplo, rutas dinámicas que reciben `params`, que en Next 15 es asíncrono; `app/s/[token]/page.jsx` es el principal sospechoso). Haz solo los cambios mínimos necesarios, sin tocar la interfaz ni la lógica. Si no hace falta cambiar nada, dilo.
4. Versiona `package-lock.json` (verifica que no esté en `.gitignore`).
5. En el `Dockerfile`: copia también `package-lock.json` en la etapa `deps` y cambia `npm install` por `npm ci`. No toques nada más del archivo.
6. Verifica:
   - `npm ci` desde cero (borra `node_modules` antes) y `npm run build` sin errores.
   - `npm audit`: reporta qué queda (idealmente sin críticas ni altas; si queda algo, explica si aplica al proyecto).
   - `npm run start` (o `dev`) y comprueba con `curl -I http://localhost:3000/login` que siguen saliendo las cabeceras de seguridad de `next.config.mjs` (Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) y que `/login` y `/register` renderizan. La API no estará levantada: es normal que fallen las llamadas a `/api`.
   - `/s/prueba` carga sin error de compilación o de `params`.
7. **No cambies** interfaz, estilos, textos ni lógica de las vistas.

## Archivos permitidos
`package.json`, `package-lock.json`, `Dockerfile`, `next.config.mjs` (solo si Next 15 lo exige) y los mínimos de `app/` necesarios por la migración. Más `ai/reporte.md`.

## Commits (sugeridos, sin prefijo, sin mencionar a Claude)
- `Actualiza Next.js y React a versiones sin vulnerabilidades conocidas en las rewrites`
- `Adapta las rutas a Next.js 15` (solo si hubo cambios de código)
- `Versiona package-lock.json y usa npm ci en el Dockerfile`
- `Agrega el reporte de la tarea T-01`

## Criterios de aceptación
- `next` ≥ 15.5.21 y `package-lock.json` en el repo.
- Build limpio y cabeceras de seguridad intactas (adjunta la salida resumida de `curl -I` en el reporte).
- `npm audit` reportado con honestidad.
- Ningún cambio visual ni de lógica.
- Reporte `ai/reporte.md` con el ID `T-01`, la rama, el enlace del PR y las dudas (D1, D2…). Los commits y el PR no mencionan a Claude (revisa con `git log -1 --format=%B`).

## Lo que sigue (para que tengas contexto, aún no lo hagas)
Después de aprobar esta rama, creo `00-componentes-base` con la tarea `T-02`: tokens de diseño en `tailwind.config.js` y componentes compartidos del Figma (Logo, Botón, Estado, Campo, Alerta, Encabezado app…), incluyendo las correcciones que anotaste (`bosque-neutral`, `./lib/**` en `content`, `currentColor` en `Brand`, estados v2 en `StatusBadge`).
