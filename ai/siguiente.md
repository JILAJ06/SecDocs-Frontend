# Tarea T-00 · Reconocimiento (no se programa nada)

**Rama:** `00-reconocimiento` (creada desde `develop`)
**Pull Request:** hacia `develop`

**Objetivo:** que leas el proyecto, confirmes que entendiste cómo trabajamos y me hagas todas las preguntas antes de tocar la interfaz.

## Qué hacer
1. `git fetch origin`, `git checkout 00-reconocimiento` y `git pull`. Confirma que estás en esa rama (`git branch --show-current`).
2. Lee en orden los archivos de `ai/conocimiento/` (01 a 06). Presta atención a la sección "Versión 1 y versión 2" de `01-proyecto.md` (el Figma es la v2 y el código actual es la v1) y a `06-ramas-y-pull-requests.md` (ramas y PR).
3. Revisa el código actual: `app/`, `components/`, `lib/`, `tailwind.config.js`, `next.config.mjs`.
4. Corre `npm install` y `npm run build` y anota si falla algo.
5. **No cambies ningún archivo** salvo `ai/reporte.md`.
6. Rellena `ai/reporte.md` (con la rama y el ID `T-00`) con:
   - Un resumen en tus palabras de cómo es el flujo Chat ↔ Code y de las reglas de seguridad que no se pueden romper (3 a 6 líneas).
   - Un resumen de la diferencia v1/v2 y de la estrategia de maquetado con datos de ejemplo (3 a 5 líneas).
   - Un resumen del flujo de ramas y Pull Requests, incluyendo qué NO debes hacer (3 a 5 líneas).
   - El resultado de `npm install` / `npm run build`.
   - Si `gh` está instalado y con sesión (`gh auth status`).
   - Dudas (D1, D2…) sobre el proyecto, el flujo o el código. Si no tienes, escribe "Sin dudas".
   - Cualquier inconsistencia entre `ai/conocimiento/` y el código real.
7. Commit de `ai/reporte.md` con el mensaje `Agrega el reporte de reconocimiento`.
8. `git push -u origin 00-reconocimiento` y abre el Pull Request hacia `develop` con `gh pr create --base develop` (título: `Reconocimiento del proyecto`; descripción: una línea que diga que solo se agrega el reporte). Si `gh` no funciona, deja el título y la descripción en el reporte y avísame. **No hagas merge.**

## Criterios de aceptación
- `ai/reporte.md` completo, con el ID `T-00` y la rama.
- Ningún otro archivo modificado.
- Los commits y el Pull Request no mencionan a Claude (revisa con `git log -1 --format=%B`).

## Lo que sigue (para que tengas contexto, aún no lo hagas)
Cuando termines, Claude Chat revisa tu reporte y el Pull Request. Después crea la rama `00-componentes-base` con la tarea `T-01`: tokens de diseño en `tailwind.config.js` y los componentes compartidos del Figma (Logo, Botón, Estado, Campo, Alerta, Encabezado app…), con sus medidas ya traducidas. Luego siguen las pantallas por grupos, cada una en su rama (`01-iniciar-sesion`, etc.).
