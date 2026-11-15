# 02 · Flujo de trabajo entre Claude Chat y Claude Code

Trabajan dos instancias de Claude y el usuario (Alexander) de intermediario:

- **Claude Chat** (claude.ai): planea, lee el Figma, escribe las tareas y revisa tu trabajo. **No programa la interfaz.**
- **Claude Code** (tú, si lees esto en el repo): programa en el clon local de `SecDocs-Frontend`, prueba y reporta.

## Los dos archivos de comunicación
| Archivo | Lo escribe | Lo lee | Para qué |
|---|---|---|---|
| `ai/siguiente.md` | Claude Chat | Claude Code | La tarea actual, con todo el detalle |
| `ai/reporte.md` | Claude Code | Claude Chat | Estado de la tarea y dudas |

**Regla de oro:** cada archivo tiene un solo autor. Claude Code **nunca edita `siguiente.md`** y Claude Chat **nunca edita `reporte.md`**. Así no hay conflictos de git.

## Ciclo de una tarea
1. Claude Chat escribe `ai/siguiente.md` (con un ID, por ejemplo `T-01`) y lo sube a `main`.
2. El usuario le dice a Claude Code: **"sigue con siguiente.md"**.
3. Claude Code hace `git pull --rebase origin main`, lee `ai/siguiente.md` y las notas de `ai/conocimiento/`, trabaja la tarea.
4. Al terminar, Claude Code **reescribe por completo `ai/reporte.md`** con el estado, lo que hizo y sus dudas (usa la plantilla que ya tiene el archivo). El reporte debe repetir el ID de la tarea; si el ID no coincide con el de `siguiente.md`, el reporte no corresponde.
5. Claude Code sube todo a `main` (código y `ai/reporte.md`).
6. El usuario le dice a Claude Chat: **"revisa, Claude Code ya terminó"**. Claude Chat hace `git pull`, lee el reporte, revisa el código contra el Figma, responde las dudas y escribe la siguiente tarea.

## Dudas
- Si una duda **bloquea** la tarea, Claude Code se detiene en lo que sí pudo hacer, lo reporta y no adivina.
- Si la duda **no bloquea**, toma la opción más conservadora, la deja anotada en el reporte y sigue.
- Las dudas se numeran (D1, D2…) para que Claude Chat pueda responder por número en la siguiente tarea.
