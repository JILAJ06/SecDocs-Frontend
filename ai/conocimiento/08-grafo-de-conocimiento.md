# 08 · Grafo de conocimiento

`ai/grafo.md` es el mapa del proyecto: qué existe, dónde está y con qué se relaciona. Sirve para encontrar rápido lo que se necesita sin recorrer todo el repo.

## Regla principal
Cada vez que se **cree, mueva, renombre, elimine o cambie de estado** algo, se actualiza el grafo **en la misma tarea y en el mismo Pull Request**. Un cambio sin su actualización del grafo está incompleto.

## Qué es un nodo
Documentos, tareas, pantallas/vistas, carpetas y módulos de código, componentes, repositorios, pruebas, CI, decisiones, conceptos del dominio y dependencias externas. Cada nodo tiene:
- **ID único** (prefijos: `R-` repo, `D-` documento, `T-` tarea, `S-` pantalla, `V1-` vista v1, `C-` código, `K-` concepto, `X-` externo).
- **Ruta real** en el repo (`—` si aún no existe).
- **Estado:** `planeado`, `en curso`, `hecho` u `obsoleto`.
- **Relaciones** con otros nodos: `→ usa`, `→ navega a`, `→ documenta`, `→ reemplaza`, etc.

## Quién actualiza qué
| Instancia | Mantiene |
|---|---|
| Claude Chat | Documentos, tareas, pantallas y navegación, conceptos y externos (al planear y al revisar). Marca la tarea `en curso` al escribir `siguiente.md`. |
| Claude Code | Nodos de código que crea o cambia, con rutas reales, estado y relaciones. |

Ninguno borra filas que no le tocan. Lo que ya no existe se marca `obsoleto`.

## Al terminar una tarea (Claude Code)
1. Actualiza los nodos de código afectados en `ai/grafo.md`.
2. Actualiza la línea "Última actualización" y agrega una fila al "Registro de cambios del grafo".
3. En `ai/reporte.md` agrega la sección **Grafo actualizado**: nodos creados, cambiados u obsoletos, o "sin cambios" con la razón.

## Al revisar (Claude Chat)
Verifica que las rutas existan, las relaciones sean correctas, no haya nodos huérfanos y los estados coincidan con la realidad. Si el grafo falta o está mal, **no aprueba el PR**.

## Nota de numeración
En el skill de flujo este documento se llama `06-grafo-de-conocimiento.md`; aquí el 06 ya lo ocupa `06-ramas-y-pull-requests.md`, por eso este es el `08`.
