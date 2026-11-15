# Reporte de Claude Code

> Claude Code: reescribe **todo** este archivo al terminar cada tarea (no lo acumules).
> Claude Chat lo lee para revisar. No edites `ai/siguiente.md`.

**Tarea:** T-00 · Reconocimiento
**Rama:** `00-reconocimiento`
**Pull Request:** https://github.com/JILAJ06/SecDocs-Frontend/pull/1 (hacia `develop`)
**Estado:** Completada
**Fecha:** 2026-11-14

## Qué hice
- `git fetch origin`, `git checkout 00-reconocimiento`, `git pull`. `git branch --show-current` → `00-reconocimiento`.
- Leí `ai/conocimiento/01` a `06`, `ai/siguiente.md` y todo el código: `app/`, `components/`, `lib/api.js`, `tailwind.config.js`, `next.config.mjs`, `app/globals.css`, `package.json`, `Dockerfile`, `README.md`.
- Corrí `npm install`, `npm run build`, `npm audit` y busqué `gh`.
- No modifiqué ningún archivo salvo este reporte.

### Cómo entiendo el flujo Chat ↔ Code y la seguridad
Claude Chat planea, lee el Figma, crea la rama de tarea desde `develop` y escribe `ai/siguiente.md` en ella. Yo hago checkout de esa rama, trabajo con commits pequeños sin prefijo y sin ninguna mención a Claude, reescribo `ai/reporte.md` con el ID y la rama, subo la rama y abro el PR. Cada archivo de comunicación tiene un solo autor. Si una duda bloquea, me detengo; si no bloquea, tomo la opción conservadora y la anoto. Seguridad que no se rompe:
- Todo va al mismo origen: `/api/*` con `lib/api.js` (`withCredentials` y cabecera `X-SecDocs-CSRF`).
- La sesión vive solo en la cookie HttpOnly; nada en `localStorage`/`sessionStorage`.
- La CSP es estricta y solo permite recursos propios: sin CDNs, fuentes con `next/font` e íconos SVG en línea.
- El token de `/s/[token]` no se imprime, no se manda a terceros y no se cachea.
- Las claves se generan con `crypto.getRandomValues`.

### v1 / v2 y maquetado con datos de ejemplo
- El código actual es la v1: archivos sueltos con un enlace anónimo por receptor y una clave fuera de banda.
- El Figma es la v2: bóvedas con KEK propia, miembros, invitaciones amarradas a un correo, contraseña de bóveda que viaja solo por correo, y sesiones con kill-switch (`jti` en lista negra).
- La v2 se maqueta sin tocar la API real. Las pantallas llaman a funciones asíncronas de `lib/services/`, que hoy devuelven datos de `lib/mock/` con los textos del Figma. Más adelante se cambian por `/api/*` sin tocar las pantallas.
- La sesión simulada vive en memoria (contexto de React). La v1 se conserva hasta nuevo aviso; donde chocan las rutas se reemplaza en el mismo archivo.

### Ramas y Pull Requests
- `main` es la versión estable y no se toca hasta el final. `develop` es la integración y solo recibe PR.
- Cada tarea vive en `NN-nombre` (o `fix/NN-nombre`), creada desde `develop`. Al terminar subo con `git push -u origin <rama>` y abro el PR hacia `develop` con `gh pr create --base develop`. El título es una frase en español y la descripción es corta, sin mencionar a Claude.
- **No debo:** hacer commit o push a `main`/`develop`, hacer merge (lo hace el usuario con merge commit), editar `siguiente.md`, abrir PR hacia `main` ni poner prefijos o atribución a Claude en commits y PR.

## Archivos tocados
- `ai/reporte.md`

## Commits subidos
- `Agrega el reporte de reconocimiento` (el hash queda en el historial de la rama)

## Verificación
- `npm install`: OK (Node 26.13.0, npm 11.20.0). Generó `package-lock.json`, que no está versionado (ver D1). `npm audit` reporta 2 vulnerabilidades (ver "Cosas que noté").
- `npm run build`: OK con Next.js 14.2.35. Compiló sin errores; rutas `/`, `/audit`, `/dashboard`, `/login`, `/register` (estáticas) y `/s/[token]` (dinámica).
- `gh auth status`: al principio `gh` no estaba instalado. El usuario lo instaló y ahora tiene sesión iniciada (cuenta `JILAJ06`, alcance `repo`). Con él abrí el PR #1.
- `npm run dev` / Figma: no aplica, la tarea no cambia interfaz.

## Dudas
- **D1 (no bloquea):** `package-lock.json` no está en el repo ni en `.gitignore`, y el `Dockerfile` solo copia `package.json`, así que cada instalación puede resolver versiones distintas. ¿Lo agrego al repo en una tarea futura? Mientras tanto no lo subí, porque esta tarea solo permite tocar el reporte.
- **D2 (no bloquea ahora, sí en la T de login):** si `/login` y `/register` pasan a la v2 con sesión simulada, la v1 (`/dashboard`, `/audit` y `Shell`, que llaman a `/auth/me`) ya no tendrá cómo iniciar sesión real. ¿Se acepta que la v1 quede inaccesible desde ese momento, o el login v2 debe seguir llamando a `/api/auth/login`?
- **D3 (no bloquea):** con la sesión simulada solo en memoria, recargar la página la pierde y cualquier ruta privada redirige a `/login`. ¿Es aceptable para el maquetado? La alternativa sin storage sería una sesión de ejemplo "ya iniciada" por defecto.
- **D4 (no bloquea):** `/` redirige a `/dashboard` (v1). ¿Debe pasar a `/vaults` cuando exista la pantalla 03?
- **D5 (no bloquea):** `generatePassword` sirve para la clave de enlace v1. En la v2 la contraseña de bóveda "solo viaja por correo". ¿La genera el servidor o el frontend debe mostrar o generar algo? Lo pregunto para no romper la regla de `crypto.getRandomValues` si cambia el uso.
- **D6 (no bloquea):** `05-figma.md` dice que `color/neutral/text` (bosque al 85 %) "se agrega si hace falta". ¿Lo agrego en la T-01 como `bosque-neutral`, o tienes otro nombre?
- **D7 (no bloquea):** la pestaña "Compartidas conmigo" (`/shared`) no tiene diseño. ¿En la barra de navegación de la T-01 la dejo visible pero sin página, o la oculto hasta que exista?
- **D8 (resuelta):** el usuario instaló `gh`; los siguientes PR los abro con `gh pr create --base develop`.

## Inconsistencias entre `ai/conocimiento/` y el código
- `03-reglas-del-repo.md` dice "Al terminar: `git push origin <rama>`", y `siguiente.md` y las instrucciones del usuario dicen `git push -u origin <rama>`. Es menor; uso `-u`.
- `03` dice que no se pongan hex sueltos, pero `components/ui.jsx` (`Brand`) usa `#00412E` dentro del SVG (`stroke`/`fill`) en lugar de `currentColor` + `text-bosque`. También `app/layout.jsx` lo usa en `themeColor`, aunque ahí es necesario porque no es una clase.
- `tailwind.config.js` solo escanea `./app/**` y `./components/**`. Si en la v2 se ponen clases de Tailwind en `lib/` (por ejemplo, un mapa de estados en `lib/mock`), se eliminarían en el build. Conviene agregar `./lib/**/*.{js,jsx}` cuando haga falta.
- Los estados de `StatusBadge` (`ui.jsx`) son los de v1 (`ACTIVE`, `CONSUMED`, `EXPIRED`, `REVOKED`, `LOCKED`, `PURGED`). Faltan los v2 que lista `05-figma.md`: Pendiente, Aceptada, Bloqueo temporal, Activa, Bloqueada, Expirada (femenino, para bóveda). Supongo que es trabajo de la T-01.
- Los radios coinciden: `rounded-lg` 8, `rounded-xl` 12, `rounded-2xl` 16 en Tailwind.
- El `README.md` describe solo la estructura v1. Habrá que actualizarlo cuando entre la v2.

## Cosas que noté fuera del alcance
- `npm audit` reporta 1 vulnerabilidad crítica en `next` 14.2.35 y 1 alta en el `postcss` que trae `next`. Varias no aplican a este proyecto (no usa `next/image`, Server Actions ni middleware), pero sí está la de *request smuggling / SSRF en rewrites* y usamos una rewrite para `/api`. La corrección propuesta es `next@16`, que rompe compatibilidad. No lo toqué; lo dejo para que decidan si vale una tarea `fix/`.
- `next/font/google` descarga las fuentes al compilar: el build necesita red (en Docker o en CI). En ejecución se sirven desde el propio dominio, así que cumple la CSP.
