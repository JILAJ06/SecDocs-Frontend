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
