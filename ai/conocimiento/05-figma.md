# 05 · Figma: SecDocs-Maquetado

- Archivo: https://www.figma.com/design/OxGANOgoxvenSJMpa97ZB6 (fileKey `OxGANOgoxvenSJMpa97ZB6`)
- Páginas: `SecDocs` (pantallas y fundamentos), `Flujo de Navegacion` (mapa y rutas), `Componentes` (biblioteca).
- Lo lee Claude Chat. Cada tarea de `siguiente.md` trae las medidas y textos de la vista; estos IDs son solo para ubicarte.

## Tokens (ya coinciden con `tailwind.config.js`)
| Variable Figma | Valor | Tailwind |
|---|---|---|
| `color/brand/primary`, `color/text/primary` | `#00412E` | `bosque` |
| `color/brand/accent`, `color/border/strong` | `#96BF8A` | `salvia` |
| `color/bg/base`, `color/border/default`, `color/bg/raised` | `#E8EAE5` | `niebla` |
| `color/bg/surface`, `color/bg/input`, `color/brand/on-primary` | `#FFFFFF` | `white` |
| `color/text/secondary` | `#00412E` al 72 % | `bosque-soft` |
| `color/text/muted` | `#00412E` al 55 % | `bosque-muted` |
| `color/neutral/text` | `#00412E` al 85 % | (agregar si hace falta) |
| `color/success/*` | bg `#96BF8A` al 22 %, borde `#96BF8A`, texto `#00412E` | `success` |
| `color/danger/*` | bg `#FCEDED`, borde `#E3A1A1`, texto `#9B1C1C` | `danger` |
| `color/warning/*` | bg `#FFF5DD`, borde `#E5C26F`, texto `#6B4500` | `warning` |
| `color/info/*` | bg `#E3EEF0`, borde `#9CC0C9`, texto `#1E4E5C` | `info` |
| Radios | md 8 · lg 12 · xl 16 · full 999 | `rounded-lg` · `rounded-xl` · `rounded-2xl` · `rounded-full` |
| Espaciado | escala de 4 px (8, 12, 16, 20, 24, 32) | utilidades de Tailwind |

## Estilos de texto
| Estilo | Fuente | Tamaño / interlínea | Notas |
|---|---|---|---|
| Display/Brand | Inter Bold | 24 / 32 | tracking −0.5 |
| Heading/H1 | Inter Semi Bold | 20 / 28 | |
| Heading/H2 | Inter Semi Bold | 18 / 28 | |
| Heading/H3 | Inter Semi Bold | 16 / 24 | |
| Body/Base · Medium · Strong | Inter 400 · 500 · 600 | 14 / 20 | |
| Caption/Base · Strong | Inter 400 · 600 | 12 / 16 | |
| Label/Upper | Inter Medium | 12 / 16 | mayúsculas, tracking 0.6 |
| Mono/Base | JetBrains Mono | 14 / 20 | claves, tokens, URLs |
| Mono/Small | JetBrains Mono | 12 / 16 | IPs |

## Pantallas v2 (página `SecDocs`, sección "04 · Pantallas")
| N.º | Pantalla | Ruta | Node ID |
|---|---|---|---|
| 01 | Iniciar sesión | `/login` | `6:23` |
| 02 | Crear cuenta | `/register` | `6:52` |
| 03 | Mis bóvedas | `/vaults` | `29:474` |
| 03b | Mis bóvedas · Nueva bóveda (modal) | `/vaults` | `29:644` |
| 04 | Detalle de bóveda (dueño) | `/vaults/[id]` | `29:835` |
| 05 | Invitación · Iniciar sesión | `/invitacion/[token]` | `30:877` |
| 06 | Invitación · Identidad verificada | `/invitacion/[token]` | `30:911` |
| 07 | Invitación · Acceso denegado | `/invitacion/[token]` | `30:964` |
| 08 | Correo con la contraseña (canal 2) | no es página web | `30:1004` |
| 09 | Bóveda compartida · Ingresar contraseña | `/shared/[id]` | `30:1036` |
| 10 | Bóveda compartida · Archivos | `/shared/[id]` | `30:1081` |
| 11 | Auditoría de accesos | `/audit` | `31:1055` |
| 12 | Seguridad de la cuenta | `/security` | `31:1187` |

- La 08 es la vista del correo que recibe el invitado: **no se maqueta como ruta** salvo que se indique.
- **Sin diseño en Figma:** la lista `/shared` ("Compartidas conmigo"). La barra de navegación sí tiene esa pestaña. Pendiente de definir.
- La sección "05 · Versión anterior (v1)" (`13:461`) es solo referencia de lo que ya estaba programado.

## Componentes (página `Componentes`)
Marca/Logo (Grande `33:1256`, Chico `33:1264`) · Encabezado app (variantes Bóvedas, Auditoría, Compartidas conmigo, Seguridad) · Botón (Primario, Secundario, Peligro) · Estado (Activo, Consumido, Expirado, Revocado, Bloqueado, Destruido, Pendiente, Aceptada, Bloqueo temporal, Activa, Bloqueada, Expirada) · Campo (Texto, Monoespaciado, Selector) · Campo para copiar · Alerta (Error, Aviso, Éxito) · Encabezado de archivo · Fila de enlace · Fila de auditoría · Tarjeta de bóveda · Métrica · Fila de miembro · Fila de archivo (botón Descargar o Destruir) · Fila de sesión.

## Reglas de navegación (del Figma)
- Sin sesión, cualquier ruta privada redirige a `/login`; la invitación conserva su token para volver después.
- La invitación solo se acepta si el correo de la sesión es exactamente el invitado; si no, "Acceso denegado" (no se envía nada y queda en la bitácora).
- La contraseña de la bóveda solo viaja por correo: nunca aparece en pantalla ni en el enlace.
- Cada contraseña errónea duplica la espera (1, 2, 4, 8 s); al quinto error el miembro queda bloqueado.
- Bóveda expirada o destruida: sus llaves se borran y los archivos ya no se pueden descifrar.
- Salir o "Cerrar todas las sesiones" manda el `jti` a la lista negra (kill-switch).
