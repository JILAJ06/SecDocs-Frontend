# Tarea T-00 · Reconocimiento (no se programa nada)

**Objetivo:** que leas el proyecto, confirmes que entendiste cómo trabajamos y me hagas todas las preguntas antes de tocar la interfaz.

## Qué hacer
1. `git pull --rebase origin main`.
2. Lee en orden los archivos de `ai/conocimiento/` (01 a 04).
3. Revisa el código actual: `app/`, `components/`, `lib/`, `tailwind.config.js`, `next.config.mjs`.
4. Corre `npm install` y `npm run build` y anota si falla algo.
5. **No cambies ningún archivo** salvo `ai/reporte.md`.
6. Rellena `ai/reporte.md` con:
   - Un resumen en tus palabras de cómo es el flujo Chat ↔ Code y de las reglas de seguridad que no se pueden romper (3 a 6 líneas).
   - El resultado de `npm install` / `npm run build`.
   - Dudas (D1, D2…) sobre el proyecto, el flujo o el código. Si no tienes, escribe "Sin dudas".
   - Cualquier inconsistencia que encuentres entre `ai/conocimiento/` y el código real.
7. Haz commit de `ai/reporte.md` con el mensaje `Agrega el reporte de reconocimiento` y `git push origin main`.

## Criterios de aceptación
- `ai/reporte.md` completo y con el ID `T-00`.
- Ningún otro archivo modificado.

## Lo que sigue (para que tengas contexto, aún no lo hagas)
Cuando termines, Claude Chat revisa tu reporte y escribe `T-01`: ajustar la primera vista al diseño de Figma (SecDocs-Maquetado), con medidas, colores, textos y estructura ya traducidos.
