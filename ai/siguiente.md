# Tarea T-02 · Tokens de diseño y componentes compartidos

**Rama:** `00-componentes-base` (creada desde `develop`)
**Pull Request:** hacia `develop` con `gh pr create --base develop`. **No hagas merge**: primero lo reviso yo (Claude Chat).

Antes de empezar lee `ai/conocimiento/` completo (sobre todo `03`, `05` y `07`). Respuestas a tus dudas D1 y D2 de T-01: ver "Decisiones" al final.

## Objetivo
Dejar listos, sin pantallas todavía, los componentes que usarán todas las vistas v2. Medidas y colores ya vienen traducidos del Figma (página "Componentes"); no necesitas el conector.

## Alcance y archivos permitidos
- `tailwind.config.js`
- `components/ui.jsx` (se amplía; **los exports actuales siguen funcionando** porque la v1 los usa: `Brand`, `StatusBadge`, `CopyField`, `Alert`)
- `components/AppHeader.jsx` (nuevo)
- `app/layout.jsx` solo si hace falta para las fuentes (Inter y JetBrains Mono con `next/font`, variables `--font-inter` y `--font-mono`; si ya están, no lo toques)
- `ai/conocimiento/07-decisiones.md`, `ai/reporte.md`
- `ai/grafo.md` (solo los nodos de código; ver abajo)
- Prohibido: pantallas nuevas, rutas, `lib/mock`, backend, dependencias nuevas.

## 1. Tokens (`tailwind.config.js`)
- Agrega `./lib/**/*.{js,jsx}` a `content`.
- Agrega `bosque.neutral: 'rgba(0, 65, 46, 0.85)'` (clase `text-bosque-neutral`, `border-bosque-neutral`).
- Cambia el color de acento "Docs" a `salvia` (ya existe). Los demás colores (`success`, `danger`, `warning`, `info`) ya coinciden con el Figma; verifica los valores contra esta tarea y anota en el reporte cualquier diferencia.
- Radios: Tailwind `rounded-lg` (8) para botones, campos y alertas; `rounded-full` para píldoras.

## 2. Logo (`Brand`)
- Ícono de candado SVG inline (el actual) usando `stroke="currentColor"` / `fill="currentColor"` y `className="text-bosque"`, **sin hex dentro del SVG**.
- Variantes: `Brand` (grande: ícono 30 px, texto 24/32) y `Brand small` (chico: ícono 22 px, texto 18/28).
- Texto: `Sec` en `text-bosque` + `Docs` en `text-salvia`, Inter Bold, `tracking` -0.5 px (`tracking-[-0.5px]`), separación entre ícono y texto 8 px (`gap-2`).

## 3. Botón (`Button`, nuevo)
Props: `variant` = `primary` | `secondary` | `danger` (por defecto `primary`), `type` (por defecto `button`), `disabled`, `className`, `children`, resto al `<button>`.
Base: `px-4 py-2 rounded-lg text-sm leading-5 font-semibold` + foco visible (`focus-visible:outline` con salvia).
- primary: `bg-bosque text-white hover:bg-bosque-hover`
- secondary: `bg-white border border-salvia text-bosque-neutral hover:bg-niebla`
- danger: `bg-white border border-danger-border text-danger-text hover:bg-danger-bg`
- disabled: `opacity-50 cursor-not-allowed`
Las clases `.btn-*` que ya existan en `globals.css` no se tocan (las usa la v1).

## 4. Estado (`StatusBadge`)
Píldora: `rounded-full border px-2 py-0.5 text-xs leading-4 font-semibold`. Mantén la API actual (`status`) y agrega los de la v2. Mapa completo:

| Clave | Etiqueta | Estilo |
|---|---|---|
| ACTIVE | Activo | success |
| ACTIVE_F (o `ACTIVA`) | Activa | success |
| ACCEPTED | Aceptada | success |
| CONSUMED | Consumido | info |
| PENDING | Pendiente | info |
| EXPIRED | Expirado | niebla |
| EXPIRED_F | Expirada | niebla |
| PURGED | Destruido | niebla con texto `text-bosque-soft` |
| REVOKED | Revocado | warning |
| TEMP_LOCK | Bloqueo temporal | warning |
| LOCKED | Bloqueado | danger |
| LOCKED_F | Bloqueada | danger |

Estilos: success = `bg-success-bg border-success-border text-success-text`; info/warning/danger análogos con su trío; niebla = `bg-niebla border-salvia text-bosque-neutral`. Las claves femeninas puedes nombrarlas como prefieras, pero documenta la lista en el reporte.
Usa `border` real (no `ring`).

## 5. Campo (`Field` y `Select`, nuevos)
`Field` props: `label`, `id`, `mono` (bool), `type`, y el resto al `<input>`. Estructura: columna con `gap-1` (4 px).
- Etiqueta: `text-xs leading-4 font-medium uppercase tracking-[0.6px] text-bosque-soft`.
- Caja: `bg-white border border-salvia rounded-lg px-3 py-2 text-sm leading-5 text-bosque`; con `mono` usa `font-mono`. Foco: `focus:border-bosque focus:outline-none focus:ring-1 focus:ring-bosque`.
- `Select`: igual que Field pero con `<select>` (`appearance-none`, `pr-8`) y un chevron-down SVG de 16 px a la derecha (`pointer-events-none`, `currentColor`, trazo 1.5, path `M4 6l4 4 4-4`).
- Los campos deben ocupar el ancho de su contenedor (el Figma usa 320 px solo como ejemplo).

## 6. Campo para copiar (`CopyField`)
Mantén la API actual. Cambios visuales: etiqueta como en Campo; fila con `gap-2`; caja de solo lectura con `font-mono text-sm`, `truncate`, mismo estilo de caja; botón `Copiar` = `Button variant="secondary"`. Al copiar, el texto cambia a `Copiado` 1,5 s (ya existe).

## 7. Alerta (`Alert`)
`rounded-lg border px-3 py-2 text-sm leading-5`. Tipos: `error` (danger), `warn` (warning), `ok` (success). Conserva `info`, que usa la v1.

## 8. Encabezado de la app (`components/AppHeader.jsx`, nuevo)
Props: `active` = `vaults` | `shared` | `audit` | `security`, `email`, `onLogout`.
- Contenedor: `bg-white border-b border-niebla`, alto 60 px; contenido centrado en un `max-w-[1152px] mx-auto px-6` (el diseño usa 144 px de margen a 1440 de ancho; en pantallas menores se reduce), `py-3`, `flex items-center justify-between`.
- Izquierda: `Brand small` + `gap-6` + pestañas con `gap-1`: **Bóvedas** (`/vaults`), **Compartidas conmigo** (`/shared`), **Auditoría** (`/audit`), **Seguridad** (`/security`), usando `next/link`.
- Pestaña: `px-3 py-1.5 rounded-lg text-sm leading-5`. Activa: `bg-niebla font-medium text-bosque`. Inactiva: `text-bosque-soft hover:bg-niebla/60`. La activa lleva `aria-current="page"`.
- Derecha: correo (`text-sm text-bosque-soft`, oculto en pantallas muy pequeñas) + `Button variant="secondary"` "Salir", `gap-3`.
- Es componente cliente solo si necesita estado; si no, déjalo como servidor. No uses `localStorage` ni lo conectes a sesión todavía.
- Navegación con teclado y `nav` con `aria-label="Principal"`.

## Verificación mínima
- `npm run build` pasa sin errores ni advertencias nuevas; `npm run lint` si existe.
- Las páginas v1 (`/login`, `/dashboard`, `/s/[token]`) siguen compilando.
- Prueba visual rápida: crea una página temporal **sin commitearla** (por ejemplo `app/_demo/page.jsx`) que muestre todos los componentes y sus variantes, compárala contra esta tarea y bórrala antes del commit. Describe en el reporte qué viste.

## Grafo de conocimiento (regla nueva)
Lee `ai/grafo.md` y `ai/conocimiento/08-grafo-de-conocimiento.md`. Al terminar, en `ai/grafo.md`:
- Actualiza los nodos de código que toques: `C-ui` (pasa a `hecho` y lista lo nuevo: `Button`, `Field`, `Select`, etc.), `C-tw`, `C-css` si lo cambias, y `C-header` (pon la ruta real y estado).
- Agrega nodos para cualquier archivo nuevo que crees, con ruta real y relaciones.
- Actualiza "Última actualización" y agrega una fila al "Registro de cambios del grafo".
- No borres ni cambies filas de documentos, tareas, pantallas, conceptos ni externos (son de Claude Chat). Si algo de esas secciones está mal, anótalo como duda.
- En `ai/reporte.md` agrega la sección **Grafo actualizado** (nodos creados, cambiados u obsoletos, o "sin cambios" con la razón). Sin esto no apruebo el PR.

## Entrega
- Commits pequeños, sin prefijo, en español, **sin ninguna mención a Claude** (ni `Co-Authored-By` ni `Generated with`; revisa con `git log -1 --format=%B`). Autor: el usuario.
- `git push -u origin 00-componentes-base` (**obligatorio**: la rama debe quedar en GitHub), abre el PR hacia `develop` con descripción corta y sin menciones a Claude.
- Reescribe `ai/reporte.md` completo: ID T-02, rama, enlace del PR, qué se hizo, diferencias contra esta tarea, dudas D1, D2…

## Decisiones (respuestas a T-01)
Agrégalas al final de `ai/conocimiento/07-decisiones.md` en esta misma rama:
- **No** se agrega `overrides` para el `postcss` 8.4.31 interno de Next: riesgo aceptado (solo en tiempo de compilación); se revisa cuando salga una 15.5.x con postcss actualizado.
- `docker build` se verifica en una tarea final junto con `docker-compose`.
