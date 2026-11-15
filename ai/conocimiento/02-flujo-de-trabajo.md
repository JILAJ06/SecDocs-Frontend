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

## Ciclo de una tarea (detalle de ramas y Pull Requests en `06-ramas-y-pull-requests.md`)
1. Claude Chat crea una rama de tarea desde `develop` (por ejemplo `01-iniciar-sesion`), escribe `ai/siguiente.md` **en esa rama** (con un ID como `T-01` y el nombre de la rama) y la sube.
2. El usuario le dice a Claude Code: **"sigue con siguiente.md en la rama `<rama>`"**. Si no menciona la rama, Claude Code hace `git fetch origin` y usa la rama de tarea con el commit más reciente (que no sea `main` ni `develop`) y confirma en `siguiente.md` que el nombre coincide.
3. Claude Code hace checkout de esa rama, `git pull`, lee `ai/siguiente.md` y las notas de `ai/conocimiento/` y trabaja la tarea con commits pequeños.
4. Al terminar, Claude Code **reescribe por completo `ai/reporte.md`** con el estado, lo que hizo y sus dudas (plantilla ya en el archivo). El reporte repite el ID y la rama; si no coinciden con `siguiente.md`, no corresponde.
5. Claude Code sube la rama y abre el Pull Request hacia `develop`.
6. El usuario le dice a Claude Chat: **"revisa, Claude Code ya terminó"**. Claude Chat lee el reporte y el Pull Request, revisa el código contra el Figma, responde las dudas y, si hace falta, escribe un nuevo `siguiente.md` en la misma rama. Si todo está bien, el usuario hace el merge a `develop`.

## Dudas
- Si una duda **bloquea** la tarea, Claude Code se detiene en lo que sí pudo hacer, lo reporta y no adivina.
- Si la duda **no bloquea**, toma la opción más conservadora, la deja anotada en el reporte y sigue.
- Las dudas se numeran (D1, D2…) para que Claude Chat pueda responder por número en la siguiente tarea.
