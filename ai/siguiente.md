# Tarea T-03 (ajuste) · Separación del texto de ayuda en Crear cuenta

**Rama:** `01-autenticacion` (la misma; el PR #4 sigue abierto)
**Pull Request:** el mismo (#4). **No hagas merge.**

La revisión de T-03 está casi lista: solo hay **un cambio** por pedir. Lo demás queda aprobado.

## Qué cambiar
- **Separación del texto "Mínimo 12 caracteres…" (tu D2):** en el Figma 02 (`6:52`) ese texto es hijo directo de la tarjeta, así que va a **16 px** (`gap-4`) del campo Contraseña, igual que todo lo demás. Mide en la captura: caja de contraseña termina y el texto empieza 16 px abajo. Quita el `div` envolvente con `gap-1` en `components/AuthForm.jsx` y deja el `Field` de contraseña y el `<p>` como hijos directos del formulario.

## Respuestas a tus dudas
- **D1:** el mensaje `La contraseña debe tener entre 12 y 72 caracteres` está bien.
- **D2:** 16 px (ver arriba).
- **D3:** así está en el Figma (borde `color/border/default` = niebla sobre fondo niebla en la tarjeta). No se cambia.

## Verificación
- `npm run build` sin errores.
- A 1440 px, en `/register`, mide la separación entre la caja de contraseña y el texto de ayuda: 16 px. Anótalo en el reporte.
- `/login` no debe cambiar.

## Entrega
- Un commit pequeño, sin prefijo, en español, sin mención a Claude (revisa con `git log -1 --format=%B`).
- `git push`. Reescribe `ai/reporte.md` completo (sigue siendo T-03; menciona el ajuste y la medida). Sin cambios de grafo: pon "sin cambios" en **Grafo actualizado**, con la razón.
