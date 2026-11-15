# Tarea T-00 · Reconocimiento (no se programa nada)

**Objetivo:** que leas el proyecto, confirmes que entendiste cómo trabajamos y me hagas todas las preguntas antes de tocar la interfaz.

## Qué hacer
1. `git pull --rebase origin main`.
2. Lee en orden los archivos de `ai/conocimiento/` (01 a 05). Presta atención a la sección "Versión 1 y versión 2" de `01-proyecto.md`: el Figma es la v2 y el código actual es la v1.
3. Revisa el código actual: `app/`, `components/`, `lib/`, `tailwind.config.js`, `next.config.mjs`.
4. Corre `npm install` y `npm run build` y anota si falla algo.
5. **No cambies ningún archivo** salvo `ai/reporte.md`.
6. Rellena `ai/reporte.md` con:
   - Un resumen en tus palabras de cómo es el flujo Chat ↔ Code y de las reglas de seguridad que no se pueden romper (3 a 6 líneas).
   - Un resumen de la diferencia v1/v2 y de la estrategia de maquetado con datos de ejemplo (3 a 5 líneas).
   - El resultado de `npm install` / `npm run build`.
   - Dudas (D1, D2…) sobre el proyecto, el flujo o el código. Si no tienes, escribe "Sin dudas".
   - Cualquier inconsistencia que encuentres entre `ai/conocimiento/` y el código real.
7. Haz commit de `ai/reporte.md` con el mensaje `Agrega el reporte de reconocimiento` y `git push origin main`.

## Criterios de aceptación
- `ai/reporte.md` completo y con el ID `T-00`.
- Los commits no mencionan a Claude (revisa con `git log -1 --format=%B`).
- Ningún otro archivo modificado.

## Lo que sigue (para que tengas contexto, aún no lo hagas)
Cuando termines, Claude Chat revisa tu reporte y escribe `T-01`: la base del v2, es decir, tokens de diseño en `tailwind.config.js` y los componentes compartidos del Figma (Logo, Botón, Estado, Campo, Alerta, Encabezado app…) con sus medidas ya traducidas. Después se construyen las pantallas por grupos (autenticación, bóvedas, invitación, bóveda compartida, auditoría y seguridad).
