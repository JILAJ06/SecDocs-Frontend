# Textos de cada vista y dónde van

Lista de **todos los textos** de la interfaz v2, por vista y por zona de la pantalla (de arriba hacia abajo, y de izquierda a derecha). Los textos están tal cual deben escribirse (mayúsculas, puntuación y acentos incluidos). Los valores entre `{llaves}` salen de los datos (sesión, mock o servicios); no se escriben fijos.

Convención: **[etiqueta]** = campo de formulario (se muestra en MAYÚSCULAS por estilo; en el código escríbela normal, ej. "Correo", y deja que el estilo la ponga en mayúsculas). *(ejemplo)* = valor de muestra del Figma, no es el texto real del campo.

---

## A. Encabezado de la app (vistas 03, 04, 06, 07, 09, 10, 11, 12)
| Zona | Texto |
|---|---|
| Izquierda · logo | Sec + Docs |
| Izquierda · pestaña 1 | Bóvedas |
| Izquierda · pestaña 2 | Compartidas conmigo |
| Izquierda · pestaña 3 | Auditoría |
| Izquierda · pestaña 4 | Seguridad |
| Derecha · correo | {correo de la sesión} |
| Derecha · botón | Salir |

## B. Vistas 01 y 02 (ya construidas en `01-autenticacion`; solo referencia)
| Vista | Zona | Texto |
|---|---|---|
| Ambas | Subtítulo bajo el logo | Bóveda con cifrado en reposo y enlaces que se autodestruyen |
| 02 Crear cuenta | Ayuda bajo el campo Contraseña | Mínimo 12 caracteres… *(texto completo ya en `AuthForm.jsx`; no cambiarlo, solo la separación de 16 px)* |
| Ambas | Errores | Correo o contraseña incorrectos · La contraseña debe tener entre 12 y 72 caracteres · Ya existe una cuenta con ese correo |

---

## 03 · Mis bóvedas (`/vaults`)
| Zona | Texto |
|---|---|
| Título (izquierda, línea 1) | Mis bóvedas |
| Título (izquierda, línea 2) | Cada bóveda tiene su propia llave maestra (KEK). Si una bóveda expira, sus archivos se destruyen criptográficamente. |
| Título (derecha) · botón | + Nueva bóveda |
| Métrica 1 | ALMACENAMIENTO · 38.2 MB · de 100 MB del plan |
| Métrica 2 | BÓVEDAS ACTIVAS · 3 · de 5 bóvedas |
| Métrica 3 | ARCHIVOS CIFRADOS · 17 · AES-256-GCM, una llave por archivo |
| Métrica 4 | INVITACIONES PENDIENTES · 2 · esperando verificación de identidad |
| Tarjeta de bóveda · botón (activa) | Abrir bóveda |
| Tarjeta de bóveda · botón (bloqueada) | Revisar |
| Tarjeta de bóveda · botón (expirada) | Ver bitácora |
| Tarjeta de bóveda · píldoras de datos | {n} archivos · {n} miembros (singular: "1 miembro") · {tamaño} MB |
| Tarjeta de bóveda · línea secundaria (activa) | Creada {dd/mm/aa} · expira {dd/mm/aa} |
| Tarjeta de bóveda · línea secundaria (bloqueada) | Bloqueada el {dd/mm/aa} por intentos fallidos |
| Tarjeta de bóveda · línea secundaria (expirada) | Expiró el {dd/mm/aa} · llaves destruidas |
| Tarjeta de bóveda · estado | Activa · Bloqueada · Expirada |
| Tarjeta punteada (arriba) | + |
| Tarjeta punteada (centro) | Nueva bóveda |
| Tarjeta punteada (abajo) | Se genera una KEK exclusiva |
| Nombres de las 5 bóvedas del ejemplo | Auditoría Financiera · Contratos 2026 · Recursos Humanos · Due diligence Proveedor X · Licitación Q3 |
| Estado de carga | Cargando… |
| Error de carga | No se pudieron cargar las bóvedas. |

## 03b · Modal "Nueva bóveda"
| Zona | Texto |
|---|---|
| Título | Nueva bóveda |
| Subtítulo | Un espacio cerrado para compartir documentos con personas específicas. |
| [Campo 1] | Nombre de la bóveda *(ejemplo: Auditoría Financiera)* · placeholder: Ej. Auditoría Financiera |
| [Selector] | La bóveda expira en · opciones: 7 días · 15 días · 30 días (por defecto) · 60 días · 90 días |
| Aviso (verde) | Se generará una llave maestra (KEK) exclusiva para esta bóveda. Al expirar, se destruye junto con todas las llaves de sus archivos. |
| Botón izquierdo | Cancelar |
| Botón derecho | Crear bóveda · (enviando) Creando… |
| Error (rojo, sobre los botones) | El nombre es obligatorio |

---

## 04 · Detalle de bóveda — dueño (`/vaults/[id]`)
| Zona | Texto |
|---|---|
| Migas | Mis bóvedas / {nombre de la bóveda} |
| Título + estado | {nombre} · Activa |
| Línea bajo el título | Expira {dd/mm/aa} · KEK v1 · {n} archivos · {tamaño} MB · {n} miembros |
| Acción 1 (secundario) | Bloquear bóveda · (ya bloqueada) Bloqueada |
| Acción 2 (peligro) | Destruir bóveda |
| Confirmar destruir · título | ¿Destruir «{nombre}»? |
| Confirmar destruir · texto | Se borran la KEK y todas las llaves de sus archivos. No se puede deshacer. |
| Confirmar destruir · botones | Cancelar · Destruir bóveda |
| Bóveda inexistente | Bóveda no encontrada · enlace: Volver a mis bóvedas |

### 04 · Tarjeta "Archivos" (columna principal, arriba)
| Zona | Texto |
|---|---|
| Título | Archivos |
| Subtítulo | Se cifran en memoria y se guardan en Cloudflare R2 con nombre UUID. |
| Botón (derecha) | Subir y cifrar |
| Zona de carga | Arrastra un archivo aquí o selecciónalo · PDF, Office, imágenes, .env · máx. 25 MB |
| Fila de archivo · botón | Destruir |
| Fila de archivo · meta | {tamaño} · {tipo} · subido {dd/mm/aa} |
| Fila mientras sube | Cifrando… |
| Error de tamaño | El archivo supera 25 MB |
| Confirmar destruir archivo · título | ¿Destruir «{archivo}»? |
| Confirmar destruir archivo · texto | Se elimina su llave (DEK) y no se podrá recuperar. |
| Sin archivos | Esta bóveda aún no tiene archivos |
| Archivos del ejemplo (nombre → meta) | balance_general_2026.pdf → 2.4 MB · PDF · subido 01/11/26 · estado_resultados_q3.xlsx → 860 KB · Excel · subido 01/11/26 · contrato_auditoria_firmado.pdf → 1.1 MB · PDF · subido 02/11/26 · credenciales_erp.env → 2 KB · texto · subido 03/11/26 |

### 04 · Tarjeta "Miembros e invitaciones" (columna principal, abajo)
| Zona | Texto |
|---|---|
| Título | Miembros e invitaciones |
| Subtítulo | Sólo el correo invitado puede aceptar. 5 contraseñas incorrectas bloquean al miembro. |
| Encabezados de tabla | CORREO · ESTADO · INTENTOS · ACTIVIDAD |
| Estados | Aceptada · Pendiente · Bloqueo temporal |
| Acción (aceptada / bloqueo temporal) | Revocar acceso |
| Acción (pendiente) | Cancelar invitación |
| Confirmación en la fila | ¿Seguro? · Sí · No |
| Intentos | {n}/5 · — (si no aplica) |
| Actividad (ejemplos) | hace 2 h · expira en 46 h · bloqueado 16 s |
| Filas del ejemplo | auditor@empresa.com · contador@despacho.mx · legal@empresa.com |
| Sin miembros | Aún no has invitado a nadie |

### 04 · Tarjeta "Invitar por correo" (columna lateral, arriba)
| Zona | Texto |
|---|---|
| Título | Invitar por correo |
| Descripción | La invitación queda amarrada a un correo. Aunque el enlace se reenvíe, nadie más podrá entrar. |
| [Campo] | Correo del destinatario *(ejemplo: contador@despacho.mx)* · placeholder: correo@empresa.com |
| [Selector] | La invitación expira en · opciones: 24 horas · 48 horas (por defecto) · 72 horas · 168 horas |
| Botón | Crear invitación · (enviando) Creando… |
| Errores | Correo inválido · Ya existe una invitación para ese correo |
| Bloque "Invitación creada" · título | Invitación para {correo} |
| Bloque "Invitación creada" · texto | Canal 1: comparte este enlace por WhatsApp, Teams o correo. Canal 2: SecDocs enviará la contraseña de la bóveda al correo del invitado sólo después de verificar su identidad. |
| Bloque "Invitación creada" · [campo para copiar] | Enlace de invitación · valor: https://secdocs.app/invitacion/{token} · botón: Copiar · (tras copiar) Copiado |

### 04 · Tarjeta "Llaves de esta bóveda" (columna lateral, abajo)
| Zona | Texto |
|---|---|
| Título | Llaves de esta bóveda |
| Fila 1 | KEK → v1 · creada {dd/mm/aa} |
| Fila 2 | DEKs activas → {n} (una por archivo) |
| Fila 3 | Almacenamiento → Cloudflare R2 · nombres UUID |

---

## 05 · Invitación: iniciar sesión (`/invitacion/[token]`, sin encabezado)
| Zona | Texto |
|---|---|
| Arriba, centrado | Logo grande: Sec + Docs |
| Aviso verde · línea 1 | {Nombre del dueño} te invitó a la bóveda «{nombre}» *(ejemplo: Alexander J. te invitó a la bóveda «Auditoría Financiera»)* |
| Aviso verde · línea 2 | Esta invitación es para {correo enmascarado}. Inicia sesión con ese correo para continuar. *(ejemplo: a•••••r@empresa.com)* |
| Tarjeta · título | Iniciar sesión para aceptar |
| [Campo 1] | Correo |
| [Campo 2] | Contraseña |
| Botón | Entrar y verificar identidad · (enviando) Entrando… |
| Pie · texto gris | ¿No tienes cuenta? |
| Pie · enlace | Regístrate con ese correo |
| Error de credenciales | Correo o contraseña incorrectos |
| Invitación no válida | Invitación no válida o expirada · enlace: Ir a iniciar sesión |

## 06 · Invitación: identidad verificada
| Zona | Texto |
|---|---|
| Círculo | (palomita, sin texto) |
| Título | Identidad verificada |
| Descripción | Enviamos la contraseña de «{nombre}» a {correo}. Llega por un canal distinto al enlace que recibiste. |
| Paso 1 (✓) | Enlace de invitación recibido (canal 1) |
| Paso 2 (✓) | Sesión iniciada como {correo} |
| Paso 3 (✓) | El correo coincide con la invitación |
| Paso 4 (→, en negritas) | Contraseña enviada por correo (canal 2) |
| Botón | Ingresar contraseña de la bóveda |
| Pie | ¿No llegó? Revisa spam o reenvía en 60 s. · (en cuenta regresiva) reenvía en {n} s |

## 07 · Invitación: acceso denegado
| Zona | Texto |
|---|---|
| Círculo | (ícono de alerta, sin texto) |
| Título (rojo) | Acceso denegado |
| Descripción | Esta invitación es para otra cuenta. Iniciaste sesión como {correo de la sesión}. |
| Aviso rojo | No se envió ninguna contraseña. El intento quedó registrado en la bitácora del dueño de la bóveda. |
| Botón izquierdo (secundario) | Ir a mis bóvedas |
| Botón derecho (primario) | Cambiar de cuenta |

## 08 · Correo (no es página; texto de ejemplo para el mock del canal 2)
| Zona | Texto sugerido |
|---|---|
| Asunto | Contraseña de la bóveda «{nombre}» |
| Cuerpo | Verificamos tu identidad. Esta es la contraseña de la bóveda «{nombre}»: {contraseña}. Por seguridad no la compartas ni la reenvíes. |

---

## 09 · Bóveda compartida: ingresar contraseña (`/shared/[id]`)
| Zona | Texto |
|---|---|
| Cabecera · línea 1 | {nombre de la bóveda} |
| Cabecera · línea 2 | Compartida por {dueño} · {n} archivos *(ejemplo: Compartida por Alexander J. · 4 archivos)* |
| Instrucción | Escribe la contraseña que te llegó por correo. |
| [Campo] | Contraseña de la bóveda |
| Aviso amarillo (tras un error) | Contraseña incorrecta ({n} de 5). Por seguridad, espera {s} s antes de intentar de nuevo. |
| Botón | Ingresar · (en espera) Espera {s} s… |
| Pie | El tiempo de espera se duplica con cada error. Al quinto, tu acceso se bloquea y se avisa al dueño. |
| Aviso rojo (quinto error) | Acceso bloqueado. Se avisó al dueño de la bóveda. |
| Sin acceso | No tienes acceso a esta bóveda |

## 10 · Bóveda compartida: archivos
| Zona | Texto |
|---|---|
| Migas | Compartidas conmigo / {nombre} |
| Título + estado | {nombre} · Activa |
| Línea bajo el título | Compartida por {dueño} · tu acceso vence el {dd/mm/aa} |
| Botón (derecha) | Salir de la bóveda |
| Aviso verde | Acceso concedido. Cada archivo se descifra al vuelo al descargarlo y no queda copia en caché. Cada descarga queda registrada. |
| Fila de archivo · botón | Descargar |
| Fila de archivo · meta | {tamaño} · {tipo} · subido {dd/mm/aa} por {dueño} |
| Tras descargar (aviso breve) | Descarga registrada |

## `/shared` (lista; sin diseño en Figma)
| Zona | Texto |
|---|---|
| Título | Compartidas conmigo |
| Tarjeta de cada bóveda | {nombre} · Compartida por {dueño} · botón: Abrir |
| Sin bóvedas | Próximamente: aquí verás todas las bóvedas que compartieron contigo. |

---

## 11 · Auditoría de accesos (`/audit`)
| Zona | Texto |
|---|---|
| Título | Auditoría de accesos |
| Subtítulo | Quién hizo qué, cuándo y desde dónde. Nunca se guardan tokens ni contraseñas. |
| [Selector 1] | Bóveda · opciones: Todas las bóvedas + una por bóveda |
| [Selector 2] | Tipo · opciones: Todos los eventos · Accesos · Seguridad · Archivos · Invitaciones · Ciclo de vida |
| Botón | Actualizar |
| Aviso azul | Retención LFPDPPP: los registros con IP se eliminan automáticamente a los 6 meses (principio de cancelación). Las métricas anónimas se conservan. |
| Encabezados de tabla | FECHA · EVENTO · BÓVEDA / ARCHIVO · USUARIO · IP · DETALLE |
| Sin resultados | No hay eventos con esos filtros |

Filas (Fecha · Evento · Bóveda/archivo · Usuario · IP · Detalle):
1. 14/11/26 10:42 · Archivo descargado · AF / balance_general_2026.pdf · auditor@empresa.com · 187.190.42.10 · descifrado al vuelo
2. 14/11/26 10:41 · Acceso a bóveda concedido · Auditoría Financiera · auditor@empresa.com · 187.190.42.10 · contraseña correcta
3. 14/11/26 10:40 · Contraseña de bóveda incorrecta · Auditoría Financiera · legal@empresa.com · 201.141.7.33 · intento 3/5 · espera 8 s
4. 14/11/26 10:35 · Contraseña enviada por correo · Auditoría Financiera · auditor@empresa.com · — · canal 2
5. 14/11/26 10:35 · Identidad verificada · Auditoría Financiera · auditor@empresa.com · 187.190.42.10 · el correo coincide
6. 14/11/26 10:33 · Acceso denegado: correo no coincide · Auditoría Financiera · otro.usuario@gmail.com · 189.203.11.4 · invitación de otra cuenta
7. 14/11/26 10:20 · Invitación creada · Auditoría Financiera · contador@despacho.mx · 172.18.0.1 · expira en 48 h
8. 14/11/26 10:05 · Sesión revocada (kill-switch) · — · alex@upchiapas.edu.mx · 172.18.0.1 · jti 9b0f…c2 en lista negra
9. 14/11/26 09:58 · Archivo cifrado y subido · AF / balance_general_2026.pdf · alex@upchiapas.edu.mx · 172.18.0.1 · DEK nueva · 2.4 MB
10. 13/11/26 18:12 · Bóveda bloqueada · Due diligence Proveedor X · — · — · 5 intentos fallidos
11. 31/10/26 23:59 · Bóveda expirada (crypto-shredding) · Licitación Q3 · — · — · KEK y DEKs destruidas

## 12 · Seguridad de la cuenta (`/security`)
| Zona | Texto |
|---|---|
| Título | Seguridad de la cuenta |
| Subtítulo | Controla dónde está abierta tu sesión. Revocar una sesión la invalida al instante. |
| Aviso verde (tras revocar) | Sesión revocada: {dispositivo}. Su token quedó en la lista negra y ya no puede usarse. |
| Tarjeta sesiones · título | Sesiones activas |
| Tarjeta sesiones · subtítulo | Cada sesión es un JWT con identificador único (jti). |
| Tarjeta sesiones · botón rojo | Cerrar todas las sesiones |
| Confirmación (en el botón) | ¿Seguro? · Sí · No |
| Fila de sesión · estados | Activo · Revocado |
| Fila de sesión · acción | Revocar |
| Fila 1 | Chrome · Windows (este dispositivo) · 187.190.42.10 · Tuxtla Gutiérrez · activa ahora · jti 7c1e…a4 |
| Fila 2 | Safari · iPhone · 187.190.40.2 · Tuxtla Gutiérrez · activa hace 3 h · jti 2d9a…77 |
| Fila 3 | Firefox · Linux · 201.141.7.33 · Ciudad de México · activa hace 1 día · jti e41b…0f |
| Fila 4 (revocada, atenuada) | Chrome · Android · 189.203.11.4 · Monterrey · revocada hace 1 min · jti 9b0f…c2 |
| Tarjeta kill-switch · título | ¿Cómo funciona el kill-switch? |
| Tarjeta kill-switch · párrafo 1 | Los JWT no se pueden “apagar” por sí solos. Al revocar una sesión, su jti se guarda en revoked_tokens y el servidor rechaza cualquier petición que lo use, aunque el token no haya expirado. |
| Tarjeta kill-switch · párrafo 2 | Úsalo si perdiste un dispositivo o ves una IP que no reconoces en la bitácora. |
| Tarjeta cuenta · título | Tu cuenta |
| Tarjeta cuenta · fila 1 | Correo → {correo de la sesión} |
| Tarjeta cuenta · fila 2 | Contraseña → cambiada hace 12 días |
| Tarjeta cuenta · fila 3 | Bitácora → se conserva 6 meses (LFPDPPP) |
| Tarjeta cuenta · botón | Cambiar contraseña |
| Modal cambiar contraseña · título | Cambiar contraseña |
| Modal · [campos] | Contraseña actual · Nueva contraseña · Confirmar nueva contraseña |
| Modal · botones | Cancelar · Guardar contraseña |
| Modal · errores | La contraseña debe tener entre 12 y 72 caracteres · Las contraseñas no coinciden · La contraseña actual es incorrecta |
| Modal · éxito | Contraseña actualizada |

---

## Textos comunes a varias vistas
| Situación | Texto |
|---|---|
| Cargando datos | Cargando… |
| Error genérico de red/servicio | Algo salió mal. Intenta de nuevo. |
| Botón cerrar/cancelar en modales | Cancelar |
| Confirmaciones en línea | ¿Seguro? · Sí · No |
| Acceso a ruta protegida sin sesión | (redirige a `/login`, sin texto) |
| Botón copiar | Copiar · (tras copiar, 2 s) Copiado |

## Reglas de escritura
- Idioma: español de México. Fechas `dd/mm/aa` y horas `hh:mm` de 24 h.
- Nombres de producto y términos técnicos tal cual: KEK, DEK, JWT, jti, kill-switch, crypto-shredding, AES-256-GCM, Cloudflare R2, UUID, LFPDPPP.
- Comillas angulares «así» para nombres de bóveda/archivo dentro de frases; comillas curvas “así” solo para “apagar”.
- Las etiquetas de campo se escriben normal en el código (ej. "Correo del destinatario"); el estilo las pone en MAYÚSCULAS.
- No uses signos de exclamación ni emojis.
