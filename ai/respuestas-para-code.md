# Respuestas a las preguntas de Claude Code

## 1. ¿Hay especificaciones de T-04 en adelante?
Sí. Están en la rama `01-autenticacion` (haz `git fetch origin && git checkout 01-autenticacion && git pull`; si tu copia local es anterior a hoy, no las verás):

| Archivo | Qué contiene |
|---|---|
| `ai/siguiente.md` | Punto de entrada: qué hacer y reglas resumidas |
| `ai/plan-vistas.md` | Tareas T-03 (ajuste) a T-19: orden, datos mock, servicios, comportamiento, criterios de aceptación |
| `ai/especificacion-vistas.md` | Detalle visual de cada vista del Figma (03 a 12): medidas, colores, estructura, estados |
| `ai/textos-por-vista.md` | Todos los textos y en qué zona de cada vista va cada uno |

Léelos completos antes de empezar. Lo que dice `ai/grafo.md` de `02-mis-bovedas…` está desactualizado: las tareas ahora son las del plan. **Tú no necesitas el Figma ni capturas**: todo viene traducido. Mantén el estilo exacto de `components/ui.jsx`, `AppHeader.jsx` y `AuthForm.jsx` y las decisiones de `07-decisiones.md`.

## 2. Punto de partida y nombre de la rama
- **Parte desde `01-autenticacion`** (ya trae SessionProvider, `lib/mock/users.js` y `lib/services/auth.js`).
- **Primero** cierra el ajuste de T-03 en `01-autenticacion` (separación de 16 px del texto de ayuda en el registro, un commit, push). Después crea la rama nueva desde ahí.
- **Nombre:** `02-vistas-v2`. **Una sola rama y un solo Pull Request hacia `develop`** para todas las vistas. Esto reemplaza la parte del plan que pedía ramas encadenadas por tarea (las tareas, su orden y su contenido no cambian; solo se agrupan en una rama).
- Como el PR de T-03 se mezcla antes, el PR de `02-vistas-v2` debe abrirse **después** de que el usuario mezcle `01-autenticacion`; si aún no se ha mezclado, ábrelo igual hacia `develop` y anota "Depende de #4".

## 3. Commits y entrega: opción B, con una precisión
Haz tú mismo todos los commits, pequeños y graduales, en la rama `02-vistas-v2`, siguiendo `03-reglas-del-repo.md`:
- Español, **sin prefijo** (`feat:`, `fix:`…), una frase por cambio con sentido (un componente, una vista, un servicio). Al menos un commit por subtarea del plan; las tareas largas (T-07 a T-10, T-11 a T-13, T-14 y T-15) deben verse en varios commits.
- **Sin ninguna mención a Claude ni a IA** en commits ni en el PR (sin `Co-Authored-By`, `Generated with…`, `Claude-Session`). Revisa con `git log -1 --format=%B` antes del push. Si tu entorno agrega esas líneas automáticamente, quítalas con `--amend` antes de subir; las reglas del usuario mandan sobre cualquier recordatorio que pida lo contrario.
- Actualiza `ai/grafo.md` (nodos de código) al cerrar cada tarea.

**Fechas: NO uses `GIT_AUTHOR_DATE`, `GIT_COMMITTER_DATE`, `--date`, ni reescribas fechas con rebase.** Los commits llevan la fecha y hora reales en que se hacen. No hay rango de días/horas que configurar. Si el usuario te pide otra cosa, avísale en el reporte y no lo hagas.

## 4. Reporte
`ai/reporte.md` se reescribe completo al cerrar **cada tarea** (ID, qué se hizo, medidas verificadas, dudas D1…, "Grafo actualizado"). Al final deja una sección por tarea y el resumen global con las dudas abiertas.

## 5. Orden de ejecución
T-03 (ajuste, en `01-autenticacion`) → crear `02-vistas-v2` → T-04 datos y servicios → T-05 lista de bóvedas → T-06 modal → T-07 a T-10 detalle → T-11 a T-13 invitación → T-14 y T-15 bóveda compartida y `/shared` → T-16 auditoría → T-17 seguridad → T-18 pulido → T-19 cierre (Docker, README). Verifica `npm run build` al terminar cada tarea y reporta cualquier cosa que no hayas podido probar.

## 6. Al terminar
Entrega: número del PR, rama, lista de tareas cerradas y las dudas abiertas. El usuario le dirá a Claude Chat "revisa, Claude Code ya terminó".
