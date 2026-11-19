# Reporte de Claude Code

> Claude Code: reescribe **todo** este archivo al terminar cada tarea (no lo acumules).
> Claude Chat lo lee para revisar. No edites `ai/siguiente.md`.

**Tarea:** T-02 · Tokens de diseño y componentes compartidos
**Rama:** `00-componentes-base`
**Pull Request:** https://github.com/JILAJ06/SecDocs-Frontend/pull/3 (hacia `develop`)
**Estado:** Completada
**Fecha:** 2026-11-19

## Qué hice
- `git pull --rebase` en `00-componentes-base`: la rama ya estaba al día con los commits de Claude Chat (`2c69790`, `6007aa1`). Leí `ai/conocimiento/` completo (incluido `08`) y `ai/grafo.md`.
- **Tokens (`tailwind.config.js`):**
  - Agregué `./lib/**/*.{js,jsx}` a `content` y `bosque.neutral: 'rgba(0, 65, 46, 0.85)'`.
  - El acento "Docs" ya era `salvia`.
  - Comparé `success`, `danger`, `warning` e `info` contra `05-figma.md`: coinciden en los 12 valores, sin diferencias.
- **`Brand`:**
  - El SVG usa `currentColor` con `text-bosque`, sin hex.
  - Grande: ícono de 30 px y texto `text-2xl leading-8` (24/32). Chico: ícono de 22 px y texto `text-lg leading-7` (18/28).
  - `font-bold`, `tracking-[-0.5px]` y `gap-2`.
- **`Button` (nuevo):**
  - Props `variant` (`primary` | `secondary` | `danger`, por defecto `primary`), `type` (por defecto `button`), `disabled`, `className` y el resto de props al `<button>`.
  - Foco visible con `focus-visible:outline-2 outline-offset-2 outline-salvia`.
  - No toqué las clases `.btn-*` de `globals.css`.
- **`StatusBadge`:**
  - Misma API (`status`), con `border` real en lugar de `ring`.
  - Clases: `rounded-full border px-2 py-0.5 text-xs leading-4 font-semibold`.
  - Lista de claves:
    - `ACTIVE` Activo (success)
    - `ACTIVE_F` Activa (success)
    - `ACCEPTED` Aceptada (success)
    - `CONSUMED` Consumido (info)
    - `PENDING` Pendiente (info)
    - `EXPIRED` Expirado (niebla)
    - `EXPIRED_F` Expirada (niebla)
    - `PURGED` Destruido (niebla con `text-bosque-soft`)
    - `REVOKED` Revocado (warning)
    - `TEMP_LOCK` Bloqueo temporal (warning)
    - `LOCKED` Bloqueado (danger)
    - `LOCKED_F` Bloqueada (danger)
  - Una clave desconocida se muestra tal cual con el estilo niebla.
- **`Field` y `Select` (nuevos):**
  - Columna con `gap-1`, etiqueta `text-xs leading-4 font-medium uppercase tracking-[0.6px] text-bosque-soft` y caja con el estilo pedido. `mono` usa `font-mono`.
  - Si no se pasa `id`, se genera con `useId()` para que la etiqueta siga asociada al campo.
  - `Select` lleva `appearance-none pr-8` y un chevron SVG de 16 px (`M4 6l4 4 4-4`, trazo 1.5, `currentColor`, `pointer-events-none`).
  - Los dos ocupan el ancho de su contenedor (`w-full`).
- **`CopyField`:**
  - Misma API (`label`, `value`, `mono`). Etiqueta como en `Field`, fila con `gap-2` y caja de solo lectura `font-mono text-sm truncate` con `min-w-0`, para que se trunque dentro del flex.
  - El botón es `Button variant="secondary"` y cambia a "Copiado" durante 1,5 s.
  - Agregué `aria-label={label}` al input, porque la etiqueta es un `<span>`.
- **`Alert`:** `rounded-lg border px-3 py-2 text-sm leading-5`, con los tipos `error`, `warn` y `ok`. Conservé `info` (v1). Un `kind` desconocido cae en `error`.
- **`components/AppHeader.jsx` (nuevo):**
  - Props `active`, `email` y `onLogout`. No tiene estado ni `'use client'` (ver D2).
  - `nav aria-label="Principal"` con `next/link`. La pestaña activa usa `aria-current="page"` y el foco es visible con teclado.
  - El correo usa `hidden sm:inline`. "Salir" es `Button variant="secondary"`.
- `app/layout.jsx` no se tocó: Inter y JetBrains Mono ya se cargan con `next/font` y las variables `--font-inter` y `--font-mono`.
- **Decisiones de T-01 en `07-decisiones.md`:** Claude Chat ya las había agregado en `2c69790` (filas "`postcss` interno de Next" y "`docker build`"), así que no las dupliqué.

## Diferencias contra la tarea
- **Alto del encabezado:** la tarea pide alto de 60 px y `py-3`. Con `py-3` (24) + botón de 38 (36 + 2 de borde) + 1 px de `border-b` daría 63. Usé `h-[60px]` en el `<header>` (incluye el borde) y centré el contenido con `items-center`, sin `py-3`. Medido en el navegador: **60 px**.
- **Alto de los botones:** el primario mide 36 px. `secondary` y `danger` miden 38 por el borde de 1 px que pide la tarea (ver D1).
- **Pestañas en pantallas angostas:** el `nav` tiene `overflow-x-auto` y las pestañas `whitespace-nowrap`, para que la página no se desborde en móvil (ver D3).

## Archivos tocados
- `tailwind.config.js`, `components/ui.jsx`, `components/AppHeader.jsx` (nuevo), `ai/grafo.md`, `ai/reporte.md`

## Commits subidos
- `32889f1` Agrega el color bosque-neutral y la carpeta lib a Tailwind
- `dc04d4c` Ajusta el logo al Figma y agrega el componente Button
- `d79fede` Amplía StatusBadge con los estados de la v2
- `468379c` Agrega los campos Field y Select y ajusta CopyField al Figma
- `be369db` Ajusta el componente Alert al Figma
- `5d088f4` Agrega el encabezado de la app con las pestañas de la v2
- `91fd1a9` Actualiza el grafo con los componentes base
- Agrega el reporte de la tarea T-02 (este archivo)

## Verificación
- **`npm run build`:** OK, sin errores ni advertencias, antes y después de borrar la demo. Las rutas v1 (`/login`, `/register`, `/dashboard`, `/audit`, `/s/[token]`) siguen compilando. `npm run lint` no existe en `package.json` y no lo agregué.
- **Demo temporal:** usé `app/demo-componentes/page.jsx`, porque las carpetas con `_` no generan ruta en el App Router. La revisé con `npm run start` y la **borré sin commitearla**. Lo que vi:
  - **A 1440 px:** el encabezado mide 60 px y el contenido 1152 px centrado (margen de unos 144 px). `Brand small` sale en 18/28, tracking −0.5 px, Inter, ícono y "Sec" en `rgb(0,65,46)` y "Docs" en salvia. La pestaña activa tiene fondo niebla. Probé `active="vaults"` y `active="audit"`.
  - **Botones:** primario verde, secundario blanco con borde salvia, peligro con borde y texto rojo, deshabilitado al 50 %.
  - **Estados:** las 12 píldoras con su color y borde de 1 px (22 px de alto).
  - **Campos:** `Field`, `Field mono`, `Select` con chevron y `CopyField` con la URL truncada, todos de 38 px de alto.
  - **Alertas:** las cuatro con su color.
  - **A 375 px:** no hay scroll horizontal en la página (`scrollWidth = 375`). El correo se oculta y las pestañas se desplazan dentro del `nav`.
  - **Consola:** solo tres 404 del *prefetch* de `next/link` hacia `/vaults`, `/shared` y `/security`, que todavía no existen. Es lo esperado.
- **v1 en el navegador:** `/login` se ve igual que antes. `/s/prueba` muestra "Enlace no disponible" porque la API no está levantada.

## Grafo actualizado
- **Cambiados:**
  - `C-ui`: de `en curso` a `hecho`, con la lista de exports nuevos y quién lo usa.
  - `C-tw`: de `en curso` a `hecho`, con los tokens y el `content` con `lib`.
  - `C-header`: de `planeado` a `hecho`, con ruta real `components/AppHeader.jsx`, relaciones → usa C-ui y → navega a S-03, S-13, S-11, S-12.
- **Sin cambios:** `C-css` (no toqué `globals.css`) y `C-layout` (las fuentes ya estaban).
- **Creados:** ninguno. `AppHeader.jsx` ya tenía su nodo `C-header`.
- **Obsoletos:** ninguno.
- Actualicé "Última actualización" y agregué una fila al registro de cambios. No toqué documentos, tareas, pantallas, conceptos, externos ni el diagrama Mermaid.
- Al terminar la T-02, la fila `T-02` (de Claude Chat) sigue en `en curso`. La dejo para que Chat la cambie al aprobar.

## Dudas
- **D1 (no bloquea):** el botón primario mide 36 px y los de borde 38 px. ¿El Figma usa borde interior (*inside stroke*, 36 px los tres) o exterior? Si los tres deben medir 36, agrego `border border-transparent` al primario y bajo el `py` de los otros, o los igualo como digas.
- **D2 (no bloquea):** `AppHeader` quedó sin `'use client'`, como pide la tarea. Pero recibe `onLogout` (una función), y una función no se puede pasar desde un componente de servidor. En la práctica lo usarán pantallas cliente (con el contexto de la sesión simulada), donde funciona. Si una página de servidor lo renderiza, debe omitir `onLogout` o envolverlo en un componente cliente. ¿Se queda así?
- **D3 (no bloquea):** el Figma no tiene versión móvil del encabezado. Por ahora las pestañas se desplazan horizontalmente y se ve la barra de desplazamiento del navegador. ¿Quieren un menú compacto en móvil más adelante, o basta así?
- **D4 (no bloquea):** las vistas v1 usan `StatusBadge`. Con el cambio de `ring` a `border`, `EXPIRED` ahora sale con `text-bosque-neutral` en lugar de `text-bosque-soft`, como pide la tabla. Es un cambio visual mínimo en la v1, que aceptamos como referencia. Lo menciono por si importa.

## Cosas que noté fuera del alcance
- En la carpeta del proyecto hay archivos sin seguimiento que no son míos: `.github/`, `auditoria/`, `db-secdocs/` y `resultados.sarif`. No los toqué ni los commiteé.
- Las clases `.label` y `.input` de `globals.css` (v1) son casi iguales a `Field`. Cuando se retire la v1 se pueden borrar o hacer que `Field` las use.
