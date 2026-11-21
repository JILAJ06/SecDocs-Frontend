# 07 · Decisiones tomadas

Respuestas de Claude Chat a las dudas del reporte T-00 y otras decisiones del proyecto. Si algo aquí choca con otro documento, **este archivo manda**.

| Tema | Decisión |
|---|---|
| Revisión antes del merge | Claude Chat revisa el Pull Request **antes** de que el usuario haga el merge. Claude Code nunca hace merge. |
| `package-lock.json` | Se versiona y el `Dockerfile` usa `npm ci`. Se hace en la rama `00-dependencias`. |
| Login v2 y la v1 | Cuando `/login` y `/register` pasen a la v2 (sesión simulada), la v1 (`/dashboard`, `/s/[token]`, `Shell`) deja de poder iniciar sesión real. **Se acepta**: la v1 es solo referencia y se retirará más adelante. |
| Sesión simulada | Vive solo en memoria (contexto de React); recargar la página la pierde y es aceptable. Más adelante se podrá agregar un atajo solo para desarrollo (por ejemplo `?demo=dueno` o `?demo=invitado`) en la capa de datos de ejemplo; Claude Chat lo pedirá en una tarea. |
| Ruta `/` | Sigue redirigiendo a `/dashboard` (v1) hasta que exista la pantalla 03; entonces pasa a `/vaults` en esa misma tarea. |
| Contraseña de la bóveda (v2) | La genera el **servidor** y solo viaja por correo. El frontend nunca la genera ni la muestra (salvo el texto de ejemplo del correo, pantalla 08, si se maqueta). `generatePassword` de `lib/api.js` se queda para la v1. |
| Color `color/neutral/text` | Se agrega a `tailwind.config.js` como `bosque-neutral` (bosque al 85 %) en la rama de componentes base. |
| Ruta `/shared` | La pestaña "Compartidas conmigo" se muestra en la barra, pero la página es un marcador ("Próximamente") hasta que exista el diseño en Figma. |
| Estados de `StatusBadge` | Se amplían a los de la v2 en la rama de componentes base. |
| `push` | Se usa `git push -u origin <rama>` (la regla de `03` queda corregida). |
| Next.js | Se sube a Next 15.5.21 o superior (con React 19) por avisos de seguridad en las *rewrites* (ver `siguiente.md` de la rama `00-dependencias`). |
| `postcss` interno de Next | No se agrega `overrides` para el `postcss` 8.4.31 que trae Next. Riesgo aceptado (solo en tiempo de compilación); se revisa cuando salga una 15.5.x con postcss actualizado. |
| `docker build` | Se verifica en una tarea final, junto con `docker-compose`. |
| Altura de botones | Se respeta el Figma: primario 36 px, secundario y peligro 38 px (borde exterior). No se igualan. |
| `AppHeader` y `onLogout` | Se queda sin `'use client'`. Lo usan pantallas cliente; una página de servidor debe omitir `onLogout` o envolverlo en un componente cliente. |
| Encabezado en móvil | Basta con las pestañas desplazables; no se hace menú compacto (el Figma no lo tiene). |
| `StatusBadge` en la v1 | El cambio visual mínimo de `EXPIRED` en la v1 se acepta. |
| Tarea 01 | Las pantallas 01 (Iniciar sesión) y 02 (Crear cuenta) van juntas en la rama `01-autenticacion` porque comparten componente. |
| Redirección tras entrar | Login y registro llevan a `/vaults` aunque la pantalla 03 aún no exista (404 temporal hasta la siguiente tarea). `/` sigue yendo a `/dashboard`. |
| Frase de la marca | En 384 px la frase "Bóveda con cifrado…" no cabe en una línea (el Figma la corta): se permite partirla en dos líneas. |
| Contraseña de la maqueta | Los usuarios de ejemplo comparten una `DEMO_PASSWORD` falsa documentada en `lib/mock/users.js`; no es un secreto. |
