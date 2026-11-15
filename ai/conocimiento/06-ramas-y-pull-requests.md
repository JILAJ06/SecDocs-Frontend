# 06 · Ramas y Pull Requests

## Ramas
| Rama | Para qué | Quién la toca |
|---|---|---|
| `main` | Versión estable. **No se hace merge a `main` hasta que la aplicación esté terminada** y no haya nada más que mejorar. | Nadie, por ahora |
| `develop` | Integración: aquí se hace merge de todas las ramas de tareas ya revisadas. | Solo por Pull Request |
| `NN-nombre-de-la-tarea` | Una rama por bloque de trabajo, creada **desde `develop`**. Ej.: `01-iniciar-sesion`. | Claude Code trabaja aquí |
| `fix/NN-nombre-de-la-tarea` | Arreglo de un error en una tarea ya terminada, creada **desde `develop`**. Ej.: `fix/01-iniciar-sesion`. | Claude Code trabaja aquí |

- Nombres en minúsculas, sin acentos, con guiones (git no admite espacios ni dos puntos). El número `NN` coincide con el de la pantalla del Figma (ver `05-figma.md`). El trabajo previo a las pantallas usa `00-`, por ejemplo `00-componentes-base`.
- Los commits dentro de las ramas siguen **sin prefijo** (el `fix/` es solo del nombre de la rama).
- Nunca se hace commit directo a `main` ni a `develop` (salvo que Claude Chat lo indique para documentación).

## Ciclo de una tarea
1. **Claude Chat** crea la rama desde `develop`, escribe `ai/siguiente.md` **en esa rama** (con el nombre de la rama en el encabezado) y la sube. Luego le dice al usuario qué decirle a Claude Code.
2. **Claude Code** hace `git fetch origin`, `git checkout <rama>` y `git pull`, y trabaja la tarea con commits pequeños en esa rama.
3. Al terminar, Claude Code reescribe `ai/reporte.md` (en la misma rama), sube la rama y **abre el Pull Request hacia `develop`** (ver abajo).
4. **Claude Chat** revisa el Pull Request: lee el código contra el Figma y el reporte. Si hay cambios, los pide en un nuevo `siguiente.md` sobre la **misma rama**.
5. Cuando todo está bien, **el usuario hace el merge** a `develop` con **merge commit** (no squash, no rebase), para conservar los commits.
6. Si después aparece un error en una tarea terminada, se crea `fix/NN-nombre` desde `develop` y se repite el ciclo.

## Pull Request
- Destino: **`develop`**. Nunca `main`.
- Título: una frase en español que diga qué trae (sin prefijo). Descripción corta: qué se hizo, qué se verificó y las dudas abiertas.
- **Sin ninguna mención a Claude** en el título ni en la descripción (nada de "Generated with Claude Code").
- Modo para este proyecto: Claude Code lo abre con `gh pr create --base develop`. Si `gh` no está disponible o falla, deja el título y la descripción en `ai/reporte.md` y avisa al usuario para que lo abra en GitHub. No hagas merge tú.
- Cada proyecto nuevo puede usar otro modo; Claude Chat lo pregunta al inicio del proyecto.
