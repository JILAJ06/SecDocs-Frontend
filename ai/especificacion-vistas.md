# Especificación detallada de las vistas v2 (Figma "SecDocs-Maquetado")

Documento de referencia para Claude Code. Describe **cada vista, componente por componente**, con textos exactos, medidas, colores y datos de ejemplo tomados del Figma (fileKey `OxGANOgoxvenSJMpa97ZB6`). Se usa junto con `ai/plan-vistas.md` (orden de tareas, ramas, servicios y reglas). Si hay conflicto entre ambos, manda este archivo para lo **visual** y el plan para lo **técnico**.

Lienzo de diseño: **1440 px de ancho**. Idioma de la interfaz: español (México). Tipografías: **Inter** (todo el texto) y **JetBrains Mono** (valores técnicos: contraseñas, URLs, IP, jti, llaves).

---

## 0. Fundamentos

### 0.1 Colores (tokens ya existentes en `tailwind.config.js`)
| Uso | Token | Valor |
|---|---|---|
| Fondo de página | `niebla` | #E8EAE5 |
| Superficie (tarjetas, header, inputs) | `white` | #FFFFFF |
| Texto principal / botón primario / marca | `bosque` | #00412E |
| Hover del primario | `bosque-hover` | #00573E |
| Texto de botón secundario | `bosque-neutral` | rgba(0,65,46,.85) |
| Texto secundario | `bosque-soft` | rgba(0,65,46,.72) |
| Texto de ayuda / deshabilitado | `bosque-muted` | rgba(0,65,46,.55) |
| Acento (palabra "Docs", bordes fuertes) | `salvia` | #96BF8A |
| Éxito | `success` | bg rgba(150,191,138,.22) · borde #96BF8A · texto #00412E |
| Peligro | `danger` | bg #FCEDED · borde #E3A1A1 · texto #9B1C1C |
| Aviso | `warning` | bg #FFF5DD · borde #E5C26F · texto #6B4500 |
| Info | `info` | bg #E3EEF0 · borde #9CC0C9 · texto #1E4E5C |

Bordes: tarjetas y filas usan `border-niebla` (borde "default"); botones secundarios, inputs, tarjetas de bóveda y zonas punteadas usan `border-salvia` (borde "strong").

### 0.2 Radios y espaciado
`rounded-lg` 8 px (botones, campos, alertas) · `rounded-xl` 12 px (filas, zonas de carga, avisos, íconos de 40 px) · `rounded-2xl` 16 px (tarjetas, modal, tarjetas de bóveda, tablas) · `rounded-full` (píldoras, círculos). Padding de tarjeta: 20 px (`p-5`) o 24 px (`p-6`) según la vista.

### 0.3 Tipografía (tamaño/interlineado)
| Estilo | Spec |
|---|---|
| Título de página | 24/32 Inter semibold |
| Marca grande | 24/32 bold, `tracking-[-0.5px]` |
| Título de tarjeta | 18/28 semibold (16/24 semibold para tarjetas pequeñas) |
| Cuerpo | 14/20 regular; énfasis 14/20 medium o semibold |
| Pie / ayuda | 12/16 regular; énfasis 12/16 semibold |
| Etiqueta de campo/tabla | 12/16 medium, MAYÚSCULAS, `tracking-[0.6px]` |
| Métrica (valor) | 24/32 bold, `tracking-[-0.5px]` |
| Mono | JetBrains Mono 14/20 (campos) o 12/16 (valores/IP) |

### 0.4 Componentes compartidos (ya existen en `components/ui.jsx` y `AppHeader.jsx`; reutilizar)
- **Botón primario:** fondo bosque, texto blanco 14/20 semibold, `px-4 py-2 rounded-lg`. **Secundario:** borde 1 px salvia, texto bosque-neutral. **Peligro:** borde 1 px danger-border, texto danger-text, fondo transparente.
- **Campo:** etiqueta (mayúsculas 12/16 medium bosque-soft) + caja `rounded-lg border-salvia bg-white px-3 py-2`, texto 14/20 bosque, `gap-1` (4 px) entre etiqueta y caja. Variante **monoespaciada** (JetBrains Mono 14/20) y variante **selector** (la caja lleva un chevron hacia abajo de 16 px a la derecha, `gap-2`).
- **Alerta:** `rounded-lg border px-3 py-2`, texto 14/20, tonos success/danger/warning/info.
- **Campo para copiar:** etiqueta + fila `gap-2`: caja mono (texto con elipsis) + botón secundario "Copiar".
- **Estado (píldora):** `rounded-full border px-2 py-0.5 text-xs font-semibold leading-4`. Estados usados: Activa/Activo (success), Aceptada (success), Pendiente (info), Bloqueo temporal (warning), Bloqueada (danger), Expirada (bg niebla, borde salvia, texto bosque-neutral), Revocado (warning).
- **Logo:** candado (22 px) + "Sec" (bosque) + "Docs" (salvia), 18/28 bold, `tracking-[-0.5px]`, `gap-2`. Versión grande: candado 30 px, 24/32.
- **Íconos:** SVG en línea (`currentColor`, trazo 1.5). Tamaños: 16 (chevron), 20 (dentro de contenedores de 40 px), 26 (dentro de círculos de 44/56 px), 22/30 (candado del logo).

### 0.5 Encabezado de la app (`AppHeader`, vistas 03–04 y 06–12)
- Barra `h-[60px]`, fondo blanco, borde inferior 1 px niebla, ancho completo. Contenido centrado en **1152 px** (en 1440 queda margen de 144 px a cada lado), `py-3`.
- **Izquierda** (`gap-6`): Logo chico + pestañas (`gap-1`): **Bóvedas**, **Compartidas conmigo**, **Auditoría**, **Seguridad**. Cada pestaña `px-3 py-1.5 rounded-lg`, 14/20. Activa: fondo niebla, medium, texto bosque. Inactiva: regular, texto bosque-soft.
- **Derecha** (`gap-3`): correo de la sesión (14/20 bosque-soft) + botón secundario "Salir".
- Pestaña activa por vista: 03/04 → Bóvedas · 06/07/09/10 → Compartidas conmigo · 11 → Auditoría · 12 → Seguridad. La vista 05 **no** lleva encabezado.

### 0.6 Contenedores
- Páginas de panel (03, 04, 11, 12): contenido de **1152 px**, `pt-8` (32 px), `pb-12` (48 px), fondo niebla.
- Página compartida (10): contenido de **960 px**.
- Pantallas centradas (05, 06, 07, 09): cuerpo `flex-1`, contenido centrado vertical y horizontalmente, `py-8`; columna de 420 (05), 480 (06, 07) o 448 px (09).

---

## Vista 03 · Mis bóvedas (`/vaults`) — nodo `29:474`
Encabezado app con pestaña **Bóvedas** activa, correo `alex@upchiapas.edu.mx`.
Contenido de 1152 px, columna con `gap-6` (24 px):

**1. Título** (fila, alineada abajo, espacio entre):
- Izquierda (`gap-1`): "Mis bóvedas" (24/32 semibold, bosque) y "Cada bóveda tiene su propia llave maestra (KEK). Si una bóveda expira, sus archivos se destruyen criptográficamente." (14/20 bosque-soft, una sola línea).
- Derecha: botón primario "+ Nueva bóveda".

**2. Métricas** (fila, `gap-4`, 4 tarjetas de igual ancho): tarjeta blanca, borde niebla, `rounded-2xl`, `p-5`, `gap-1.5` (6 px). Orden: etiqueta (12/16 medium mayúsculas bosque-soft) → valor (24/32 bold) → detalle (12/16 regular bosque-muted).
| Etiqueta | Valor | Detalle | Extra |
|---|---|---|---|
| ALMACENAMIENTO | 38.2 MB | de 100 MB del plan | barra |
| BÓVEDAS ACTIVAS | 3 | de 5 bóvedas | — |
| ARCHIVOS CIFRADOS | 17 | AES-256-GCM, una llave por archivo | — |
| INVITACIONES PENDIENTES | 2 | esperando verificación de identidad | — |
Barra (solo almacenamiento): pista `h-1.5 rounded-full bg-niebla`, progreso `h-1.5 rounded-[3px] bg-bosque` (≈38 % de la pista).

**3. Bóvedas** (flex-wrap, `gap-6`, tarjetas de **368 px**; en 1152 caben 3 por fila):
Tarjeta de bóveda: blanca, borde **salvia** 1 px, `rounded-2xl`, `p-5`, columna `gap-4`.
- *Encabezado* (`gap-3`): ícono en cuadro de 40×40 `rounded-xl bg-niebla` con ícono de 20 px · bloque de texto (`gap-0.5`, crece): nombre 16/24 semibold bosque + línea 12/16 bosque-soft · píldora de estado a la derecha.
- *Datos* (`gap-2`): tres píldoras `rounded-full bg-niebla px-2.5 py-1`, 12/16 semibold bosque: archivos, miembros, tamaño.
- *Acción:* botón secundario a ancho completo.
| # | Nombre | Línea 12/16 | Estado | Píldoras | Botón |
|---|---|---|---|---|---|
| 1 | Auditoría Financiera | Creada 01/11/26 · expira 30/11/26 | Activa | 4 archivos · 3 miembros · 12.4 MB | Abrir bóveda |
| 2 | Contratos 2026 | Creada 28/10/26 · expira 28/12/26 | Activa | 9 archivos · 2 miembros · 18.9 MB | Abrir bóveda |
| 3 | Recursos Humanos | Creada 05/11/26 · expira 05/12/26 | Activa | 3 archivos · 1 miembro · 6.9 MB* | Abrir bóveda |
| 4 | Due diligence Proveedor X | Bloqueada el 10/11/26 por intentos fallidos | Bloqueada (danger) | 3 archivos · 2 miembros · 4.1 MB | Revisar |
| 5 | Licitación Q3 | Expiró el 31/10/26 · llaves destruidas | Expirada | 0 archivos · 0 miembros · 0 MB | Ver bitácora |
\*En el Figma la tarjeta 3 solo cambia el tamaño a 6.9 MB y deja "4 archivos" del componente base; aquí se unifica a **3 archivos · 6.9 MB** para que sea coherente.
La tarjeta 5 completa va con **opacidad 65 %**.
- *Sexta tarjeta (nueva bóveda):* `w-[368px] h-[214px]`, borde **2 px punteado salvia**, `rounded-2xl`, centrada en columna con `gap-1.5`: "+" (32/32 bold bosque, `tracking-[-0.5px]`), "Nueva bóveda" (14/20 semibold bosque), "Se genera una KEK exclusiva" (12/16 bosque-muted).

## Vista 03b · Modal "Nueva bóveda" — nodo `29:644`
Es la vista 03 con un modal encima.
- **Velo:** cubre toda la pantalla, color bosque al **35 %** (rgba(0,65,46,.35)).
- **Modal:** ancho **480 px**, blanco, `rounded-2xl`, `p-6` (24 px), columna `gap-4`, sombra `0 16px 48px rgba(0,38,26,.25)`. En el Figma queda a 480 px del borde izquierdo y 200 px del superior (centrado horizontal).
- Contenido en orden:
  1. "Nueva bóveda" (18/28 semibold).
  2. "Un espacio cerrado para compartir documentos con personas específicas." (14/20 bosque-soft).
  3. Campo "NOMBRE DE LA BÓVEDA" (valor de ejemplo: "Auditoría Financiera").
  4. Selector "LA BÓVEDA EXPIRA EN" (valor de ejemplo: "30 días", con chevron).
  5. Alerta success: "Se generará una llave maestra (KEK) exclusiva para esta bóveda. Al expirar, se destruye junto con todas las llaves de sus archivos."
  6. Botones alineados a la derecha, `gap-2`: secundario "Cancelar", primario "Crear bóveda".

---

## Vista 04 · Detalle de bóveda — dueño (`/vaults/[id]`) — nodo `29:835`
Encabezado con **Bóvedas** activa. Contenido 1152 px, columna `gap-5` (20 px).

**Migas** (14/20, `gap-1.5`): "Mis bóvedas" (medium bosque-soft) · "/" (regular bosque-muted) · "Auditoría Financiera" (medium bosque).

**Título** (fila, centrada vertical, espacio entre):
- Izquierda (`gap-1`): fila `gap-2.5` con "Auditoría Financiera" (24/32 semibold) + píldora "Activa"; debajo "Expira 30/11/26 · KEK v1 · 4 archivos · 12.4 MB · 3 miembros" (14/20 bosque-soft).
- Derecha (`gap-2`): secundario "Bloquear bóveda" + peligro "Destruir bóveda".

**Columnas** (`gap-6`): **Principal** (crece, ≈744 px, `gap-6`) y **Lateral** (400 px, `gap-6`).

### Principal · Tarjeta "Archivos"
Tarjeta blanca borde niebla `rounded-2xl p-5`, columna `gap-3`.
- *Encabezado* (espacio entre): "Archivos" (18/28 semibold) + "Se cifran en memoria y se guardan en Cloudflare R2 con nombre UUID." (12/16 bosque-soft, `gap-0.5`) · botón primario "Subir y cifrar".
- *Zona de carga:* borde **2 px punteado salvia**, `rounded-xl`, `py-4`, texto centrado 14/20 bosque-soft: "Arrastra un archivo aquí o selecciónalo · PDF, Office, imágenes, .env · máx. 25 MB".
- *Filas de archivo* (4): alto **64 px**, blanca, borde niebla, `rounded-xl`, `px-4 py-3`, `gap-3`. Ícono en cuadro 40×40 `rounded-xl bg-niebla` (ícono 20 px) · texto (crece, `gap-0.5`): nombre 14/20 semibold + meta 12/16 bosque-soft · botón **peligro** "Destruir".
| Nombre | Meta |
|---|---|
| balance_general_2026.pdf | 2.4 MB · PDF · subido 01/11/26 |
| estado_resultados_q3.xlsx | 860 KB · Excel · subido 01/11/26 |
| contrato_auditoria_firmado.pdf | 1.1 MB · PDF · subido 02/11/26 |
| credenciales_erp.env | 2 KB · texto · subido 03/11/26 |

### Principal · Tarjeta "Miembros e invitaciones"
Tarjeta `p-5`, columna `gap-1`.
- *Encabezado* (`pb-3`): "Miembros e invitaciones" (18/28 semibold) + "Sólo el correo invitado puede aceptar. 5 contraseñas incorrectas bloquean al miembro." (12/16 bosque-soft).
- *Encabezados de columna* (`pt-1 pb-2`, 12/16 medium mayúsculas `tracking-[0.6px]` bosque-muted): CORREO (210 px) · ESTADO (140 px) · INTENTOS (70 px) · ACTIVIDAD (140 px).
- *Filas* (3): alto **44 px**, borde superior 1 px niebla, `py-2.5`. Columnas: correo (210; texto 200 px con elipsis, 14/20 medium bosque) · estado (140, píldora) · intentos (70, 14/20 bosque) · actividad (140, 14/20 bosque-soft) · acción (resto, alineada a la derecha, 12/16 semibold danger-text).
| Correo | Estado | Intentos | Actividad | Acción |
|---|---|---|---|---|
| auditor@empresa.com | Aceptada | 0/5 | hace 2 h | Revocar acceso |
| contador@despacho.mx | Pendiente | — | expira en 46 h | Cancelar invitación |
| legal@empresa.com | Bloqueo temporal | 3/5 | bloqueado 16 s | Revocar acceso |

### Lateral · Tarjeta "Invitar por correo"
Tarjeta `p-5`, columna `gap-3.5` (14 px).
1. "Invitar por correo" (18/28 semibold).
2. "La invitación queda amarrada a un correo. Aunque el enlace se reenvíe, nadie más podrá entrar." (14/20 bosque-soft).
3. Campo "CORREO DEL DESTINATARIO" (ejemplo: contador@despacho.mx).
4. Selector "LA INVITACIÓN EXPIRA EN" (ejemplo: "48 horas").
5. Primario ancho completo "Crear invitación".
6. **Bloque "Invitación creada"** (aparece tras crear): fondo success, borde salvia, `rounded-xl`, `p-4`, columna `gap-3`:
   - "Invitación para contador@despacho.mx" (14/20 semibold, texto success).
   - "Canal 1: comparte este enlace por WhatsApp, Teams o correo. Canal 2: SecDocs enviará la contraseña de la bóveda al correo del invitado sólo después de verificar su identidad." (12/16 bosque-soft).
   - Campo para copiar "ENLACE DE INVITACIÓN" con valor mono `https://secdocs.app/invitacion/Vb3xQ9mK2rT7wLp0aZ8cN4yE1uH6sJ5dF0gR2iO8nWk` (con elipsis) y botón "Copiar".

### Lateral · Tarjeta "Llaves de esta bóveda"
Tarjeta `p-5`, columna `gap-2.5`. Título "Llaves de esta bóveda" (16/24 semibold). Tres filas (espacio entre; etiqueta 14/20 bosque-soft, valor **mono** 12/16 bosque):
| Etiqueta | Valor |
|---|---|
| KEK | v1 · creada 01/11/26 |
| DEKs activas | 4 (una por archivo) |
| Almacenamiento | Cloudflare R2 · nombres UUID |

---

## Vista 05 · Invitación: iniciar sesión (`/invitacion/[token]`) — nodo `30:877`
**Sin encabezado de app.** Fondo niebla; cuerpo centrado vertical y horizontalmente, `py-8`; columna de **420 px**, `gap-5`.
1. **Marca:** Logo grande (candado 30 px, wordmark 24/32) centrado.
2. **Aviso de invitación:** fondo success, borde salvia, `rounded-xl`, `p-4`, `gap-3.5` (14 px). Círculo 44×44 con fondo success y un ícono de 26 px. Texto (`gap-0.5`): "Alexander J. te invitó a la bóveda «Auditoría Financiera»" (14/20 semibold bosque) y "Esta invitación es para a•••••r@empresa.com. Inicia sesión con ese correo para continuar." (12/16 bosque-soft).
3. **Tarjeta de login:** blanca, borde niebla, `rounded-2xl`, `p-6`, columna `gap-4`:
   - "Iniciar sesión para aceptar" (18/28 semibold).
   - Campo "CORREO" (ejemplo: auditor@empresa.com).
   - Campo "CONTRASEÑA" (ejemplo: ••••••••••••••).
   - Primario ancho completo "Entrar y verificar identidad".
   - Pie centrado (`gap-1`, 14/20): "¿No tienes cuenta?" (bosque-soft) + "Regístrate con ese correo" (medium, bosque, subrayado).

## Vista 06 · Invitación: identidad verificada — nodo `30:911`
Encabezado app con **Compartidas conmigo** activa y correo `auditor@empresa.com`. Cuerpo centrado, columna de **480 px**.
Tarjeta blanca, borde niebla, `rounded-2xl`, `p-6`, columna `gap-4`, todo **centrado**:
- Círculo 56×56 fondo success con ícono de palomita de 26 px.
- "Identidad verificada" (18/28 semibold bosque, centrado).
- "Enviamos la contraseña de «Auditoría Financiera» a auditor@empresa.com. Llega por un canal distinto al enlace que recibiste." (14/20 bosque-soft, centrado).
- **Pasos:** caja fondo niebla, `rounded-xl`, `p-4`, columna `gap-2.5`; cada paso `gap-2.5`: marca 20×20 circular + texto 14/20.
  1. ✓ (fondo bosque, ✓ blanco 12/16 semibold) · "Enlace de invitación recibido (canal 1)"
  2. ✓ · "Sesión iniciada como auditor@empresa.com"
  3. ✓ · "El correo coincide con la invitación"
  4. → (fondo **salvia**, → en bosque) · "Contraseña enviada por correo (canal 2)" en **semibold**
- Primario ancho completo "Ingresar contraseña de la bóveda".
- "¿No llegó? Revisa spam o reenvía en 60 s." (12/16 bosque-muted, centrado).

## Vista 07 · Invitación: acceso denegado — nodo `30:964`
Encabezado app con **Compartidas conmigo** activa y correo `otro.usuario@gmail.com`. Columna de **480 px**; tarjeta igual a la 06 (`p-6`, `gap-4`, centrada):
- Círculo 56×56 fondo **danger-bg** con ícono de 26 px.
- "Acceso denegado" (18/28 semibold, **texto danger**).
- "Esta invitación es para otra cuenta. Iniciaste sesión como otro.usuario@gmail.com." (14/20 bosque-soft, centrado).
- Alerta danger (ancho completo): "No se envió ninguna contraseña. El intento quedó registrado en la bitácora del dueño de la bóveda."
- Botones en fila `gap-2`, cada uno `flex-1`: secundario "Ir a mis bóvedas" · primario "Cambiar de cuenta".

## Vista 08 · Correo (no es página)
Es el correo del canal 2 (diseño de ejemplo); **no se construye como ruta**. Su texto vive en el mock del servicio de invitaciones como referencia: asunto y cuerpo con la contraseña de la bóveda enviada al correo invitado, sin enlace.

---

## Vista 09 · Bóveda compartida: ingresar contraseña (`/shared/[id]`) — nodo `30:1036`
Encabezado app con **Compartidas conmigo** activa, correo `auditor@empresa.com`. Columna de **448 px** centrada.
Tarjeta blanca, borde niebla, `rounded-2xl`, `p-6`, columna `gap-4`:
- **Cabecera** (`gap-3.5`, centrada vertical): círculo 56×56 fondo success con ícono de 26 px · texto (`gap-0.5`): "Auditoría Financiera" (18/28 semibold) + "Compartida por Alexander J. · 4 archivos" (12/16 bosque-soft).
- "Escribe la contraseña que te llegó por correo." (14/20 bosque-soft).
- Campo **mono** "CONTRASEÑA DE LA BÓVEDA" (ejemplo: ••••••••••••••••••• ).
- Alerta **warning**: "Contraseña incorrecta (3 de 5). Por seguridad, espera 8 s antes de intentar de nuevo."
- Primario ancho completo con **opacidad 50 %** (deshabilitado): "Espera 8 s…"
- "El tiempo de espera se duplica con cada error. Al quinto, tu acceso se bloquea y se avisa al dueño." (12/16 bosque-muted, centrado).
Estado inicial (sin error): sin alerta, botón "Ingresar" habilitado. Espera: 1, 2, 4, 8 s tras los errores 1 a 4; bloqueo al quinto.

## Vista 10 · Bóveda compartida: archivos — nodo `30:1081`
Encabezado app con **Compartidas conmigo** activa, correo `auditor@empresa.com`. Contenido de **960 px**, `pt-8`, `pb-12`, columna `gap-5`.
- **Migas:** "Compartidas conmigo" (medium bosque-soft) · "/" (bosque-muted) · "Auditoría Financiera" (medium bosque).
- **Título** (espacio entre): "Auditoría Financiera" (24/32 semibold) + píldora "Activa" (`gap-2.5`) con debajo "Compartida por Alexander J. · tu acceso vence el 30/11/26" (14/20 bosque-soft) · secundario "Salir de la bóveda".
- Alerta success (ancho completo): "Acceso concedido. Cada archivo se descifra al vuelo al descargarlo y no queda copia en caché. Cada descarga queda registrada."
- **Archivos** (`gap-2.5`, 4 filas de 64 px; mismo diseño que la vista 04 pero con botón secundario **"Descargar"** en lugar de "Destruir"). Meta añade el autor:
  - balance_general_2026.pdf — 2.4 MB · PDF · subido 01/11/26 por Alexander J.
  - estado_resultados_q3.xlsx — 860 KB · Excel · subido 01/11/26 por Alexander J.
  - contrato_auditoria_firmado.pdf — 1.1 MB · PDF · subido 02/11/26 por Alexander J.
  - credenciales_erp.env — 2 KB · texto · subido 03/11/26 por Alexander J.

---

## Vista 11 · Auditoría de accesos (`/audit`) — nodo `31:1055`
Encabezado con **Auditoría** activa, correo `alex@upchiapas.edu.mx`. Contenido 1152 px, columna `gap-5`.
- **Título** (fila, alineada abajo, espacio entre): izquierda "Auditoría de accesos" (24/32 semibold) + "Quién hizo qué, cuándo y desde dónde. Nunca se guardan tokens ni contraseñas." (14/20 bosque-soft) · derecha controles (`gap-2`, alineados abajo): selector "BÓVEDA" (220 px, valor "Todas las bóvedas"), selector "TIPO" (200 px, valor "Todos los eventos"), secundario "Actualizar".
- **Aviso info** (ancho completo, `rounded-lg`, `px-3.5 py-2.5`, texto 14/20 color info): "Retención LFPDPPP: los registros con IP se eliminan automáticamente a los 6 meses (principio de cancelación). Las métricas anónimas se conservan."
- **Tabla:** blanca, borde niebla, `rounded-2xl`, `overflow-hidden`.
  - Encabezados (`px-4 py-3`, `gap-3`, 12/16 medium mayúsculas `tracking-[0.6px]` bosque-muted): FECHA (138) · EVENTO (288) · BÓVEDA / ARCHIVO (208) · USUARIO (158) · IP (128) · DETALLE (resto).
  - Filas: alto **40 px**, borde superior niebla, `px-4 py-2.5`, `gap-3`; celdas con elipsis. Fecha 14/20 bosque-soft · evento 14/20 con el color del tipo · bóveda/archivo y usuario 14/20 bosque · IP JetBrains Mono 12/16 bosque-soft · detalle 14/20 bosque-soft.
  - El color del evento: éxito = texto success; info = texto info; **peligro = texto danger**; aviso = texto warning; neutro = bosque-neutral. Las alertas de seguridad van en **semibold**.
| Fecha | Evento (tono) | Bóveda / archivo | Usuario | IP | Detalle |
|---|---|---|---|---|---|
| 14/11/26 10:42 | Archivo descargado (info) | AF / balance_general_2026.pdf | auditor@empresa.com | 187.190.42.10 | descifrado al vuelo |
| 14/11/26 10:41 | Acceso a bóveda concedido (success) | Auditoría Financiera | auditor@empresa.com | 187.190.42.10 | contraseña correcta |
| 14/11/26 10:40 | Contraseña de bóveda incorrecta (danger) | Auditoría Financiera | legal@empresa.com | 201.141.7.33 | intento 3/5 · espera 8 s |
| 14/11/26 10:35 | Contraseña enviada por correo (success) | Auditoría Financiera | auditor@empresa.com | — | canal 2 |
| 14/11/26 10:35 | Identidad verificada (success) | Auditoría Financiera | auditor@empresa.com | 187.190.42.10 | el correo coincide |
| 14/11/26 10:33 | Acceso denegado: correo no coincide (danger, semibold) | Auditoría Financiera | otro.usuario@gmail.com | 189.203.11.4 | invitación de otra cuenta |
| 14/11/26 10:20 | Invitación creada (success) | Auditoría Financiera | contador@despacho.mx | 172.18.0.1 | expira en 48 h |
| 14/11/26 10:05 | Sesión revocada (kill-switch) (warning, semibold) | — | alex@upchiapas.edu.mx | 172.18.0.1 | jti 9b0f…c2 en lista negra |
| 14/11/26 09:58 | Archivo cifrado y subido (success) | AF / balance_general_2026.pdf | alex@upchiapas.edu.mx | 172.18.0.1 | DEK nueva · 2.4 MB |
| 13/11/26 18:12 | Bóveda bloqueada (danger, semibold) | Due diligence Proveedor X | — | — | 5 intentos fallidos |
| 31/10/26 23:59 | Bóveda expirada (crypto-shredding) (neutro, semibold) | Licitación Q3 | — | — | KEK y DEKs destruidas |
("AF" es la abreviatura de Auditoría Financiera en la columna de archivo.)

## Vista 12 · Seguridad de la cuenta (`/security`) — nodo `31:1187`
Encabezado con **Seguridad** activa, correo `alex@upchiapas.edu.mx`. Contenido 1152 px, columna `gap-5`.
- **Título:** "Seguridad de la cuenta" (24/32 semibold) + "Controla dónde está abierta tu sesión. Revocar una sesión la invalida al instante." (14/20 bosque-soft). (A la derecha hay un contenedor vacío de 100×100: **no se construye**.)
- **Alerta success** (ancho completo): "Sesión revocada: Chrome · Android. Su token quedó en la lista negra y ya no puede usarse."
- **Columnas** (`gap-6`): izquierda (crece) y lateral (**380 px**, `gap-6`).

### Izquierda · Tarjeta "Sesiones activas"
Tarjeta blanca, borde niebla, `rounded-2xl`, **`p-6`**, columna `gap-1`.
- *Encabezado* (`pb-3`, espacio entre): "Sesiones activas" (18/28 semibold) + "Cada sesión es un JWT con identificador único (jti)." (12/16 bosque-soft) · botón peligro "Cerrar todas las sesiones".
- *Filas de sesión* (alto **60 px**, borde superior niebla, `py-3.5`, `gap-3`): ícono en cuadro 40×40 `rounded-xl bg-niebla` (ícono 20 px) · texto (crece, `gap-0.5`): línea 1 = dispositivo (14/20 semibold) + píldora de estado (`gap-2`); línea 2 = detalle (12/16 bosque-soft) · acción "Revocar" (12/16 semibold danger-text) a la derecha.
| Dispositivo | Estado | Detalle | Acción |
|---|---|---|---|
| Chrome · Windows (este dispositivo) | Activo | 187.190.42.10 · Tuxtla Gutiérrez · activa ahora · jti 7c1e…a4 | (ninguna) |
| Safari · iPhone | Activo | 187.190.40.2 · Tuxtla Gutiérrez · activa hace 3 h · jti 2d9a…77 | Revocar |
| Firefox · Linux | Activo | 201.141.7.33 · Ciudad de México · activa hace 1 día · jti e41b…0f | Revocar |
| Chrome · Android | **Revocado** (warning) | 189.203.11.4 · Monterrey · revocada hace 1 min · jti 9b0f…c2 | (ninguna) — fila con **opacidad 60 %** |

### Lateral · Tarjeta "¿Cómo funciona el kill-switch?"
`p-6`, columna `gap-2.5`. Título 16/24 semibold. Dos párrafos 14/20 bosque-soft:
1. "Los JWT no se pueden “apagar” por sí solos. Al revocar una sesión, su jti se guarda en revoked_tokens y el servidor rechaza cualquier petición que lo use, aunque el token no haya expirado."
2. "Úsalo si perdiste un dispositivo o ves una IP que no reconoces en la bitácora."

### Lateral · Tarjeta "Tu cuenta"
`p-6`, columna `gap-3`. Título "Tu cuenta" (16/24 semibold). Tres filas (espacio entre, 14/20; etiqueta bosque-soft, valor medium bosque):
| Etiqueta | Valor |
|---|---|
| Correo | alex@upchiapas.edu.mx |
| Contraseña | cambiada hace 12 días |
| Bitácora | se conserva 6 meses (LFPDPPP) |
Debajo, secundario ancho completo "Cambiar contraseña".

---

## Vistas ya construidas (no rehacer, solo verificar)
- **01 Iniciar sesión (`/login`, nodo `6:23`)** y **02 Crear cuenta (`/register`, nodo `6:52`)** están en la rama `01-autenticacion` (PR #4). Único pendiente: separación de **16 px** entre el campo Contraseña y el texto "Mínimo 12 caracteres…" en el registro.

## Vista sin diseño
- **`/shared` (lista "Compartidas conmigo")**: no existe en el Figma. Se construye con el encabezado (pestaña Compartidas conmigo activa), título "Compartidas conmigo" y las bóvedas aceptadas del correo; sin ninguna, el texto "Próximamente: aquí verás todas las bóvedas que compartieron contigo."

## Notas para quien implemente
- Los íconos del Figma no se pueden descargar desde el entorno de Chat: dibuja SVG simples (cofre/candado, documento, sobre, escudo, palomita, dispositivo, chevron) con `currentColor`.
- Anchos del Figma son de lienzo (1440). En pantallas menores, las columnas se apilan y las tablas hacen scroll horizontal; el encabezado en móvil solo hace scroll (decisión previa).
- Los textos de ejemplo con valores variables (correo de sesión, nombre de bóveda, conteos) salen del mock/servicios, no se escriben fijos en los componentes.
