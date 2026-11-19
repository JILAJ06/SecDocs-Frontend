# Reporte de Claude Code

> Claude Code: reescribe **todo** este archivo al terminar cada tarea (no lo acumules).
> Claude Chat lo lee para revisar. No edites `ai/siguiente.md`.

**Tarea:** T-03 · Iniciar sesión y Crear cuenta (con datos de ejemplo)
**Rama:** `01-autenticacion`
**Pull Request:** (pendiente)
**Estado:** Completada
**Fecha:** 2026-11-19

## Para probar
- **`DEMO_PASSWORD`:** `demo-maqueta-2026`. Es una contraseña falsa, solo para la maqueta, y la usan todos los usuarios de ejemplo.
- **Usuarios de ejemplo:** `alex@upchiapas.edu.mx` (dueño) y `auditor@empresa.com` (invitado).
- Al entrar, la app lleva a `/vaults`, que todavía da 404. Es lo esperado.

## Qué hice
- **`lib/mock/users.js` (nuevo):**
  - `DEMO_PASSWORD`, con un comentario que dice que es falsa y solo para la maqueta.
  - El arreglo `users` con los dos usuarios.
  - El mapa `registeredPasswords` (id → contraseña) para las cuentas creadas desde "Crear cuenta".
- **`lib/services/auth.js` (nuevo):**
  - `login`, `register` y `logout` son asíncronas y esperan entre 300 y 500 ms al azar.
  - `login` compara el correo sin distinguir mayúsculas e ignora espacios al inicio y al final. Acepta `DEMO_PASSWORD` o la contraseña guardada en `registeredPasswords`. Si algo falla lanza siempre `Correo o contraseña incorrectos`, sin decir qué falló.
  - `register` valida la contraseña (de 12 a 72 caracteres) y revisa si el correo ya existe. Después agrega el usuario a `users`, guarda su contraseña en `registeredPasswords` y devuelve `{ id, email }`.
  - Las pantallas no importan `lib/mock` ni `lib/api.js`.
- **`components/SessionProvider.jsx` (nuevo, `'use client'`):**
  - Contexto con `session`, `signIn`, `signUp`, `signOut` y el hook `useSession()`.
  - La sesión vive solo en `useState`. Los errores de los servicios llegan a la pantalla.
  - Si `useSession()` se usa fuera del proveedor, lanza un error claro.
- **`app/layout.jsx`:** envuelve `{children}` con `<SessionProvider>`. El layout sigue siendo de servidor.
- **`components/AuthForm.jsx` (reescrito en el mismo archivo):**
  - Una sola pantalla con `mode="login" | "register"` y los textos en un objeto `TEXTS`.
  - Usa `Brand`, `Field`, `Button` y `Alert`, sin clases v1.
  - Las medidas son las de la tarea: fondo niebla, columna de 384 px con `gap-6`, frase de marca que puede partirse, tarjeta `rounded-2xl p-5 gap-4`, título 18/28, botón `w-full` con "Procesando…" y pie con `gap-1`.
  - El `Alert` va envuelto en `<div role="alert">`, sin cambiar el componente, y solo se dibuja si hay error, justo antes del botón.
  - Si ya hay sesión, un `useEffect` lleva a `/vaults`.
- `app/login/page.jsx` y `app/register/page.jsx` no cambiaron.

## Diferencias contra la tarea
- **Mensaje de contraseña inválida en `register`:** la tarea no dice qué texto usar. Puse `La contraseña debe tener entre 12 y 72 caracteres` (ver D1).
- **Texto de ayuda del registro:** el campo y el texto "Mínimo 12 caracteres…" van juntos en una columna con `gap-1` (4 px). Así el texto queda pegado al campo y no a 16 px como el resto de la tarjeta (ver D2).
- **Correo de cuentas nuevas:** se guarda sin espacios al inicio y al final, y con las mayúsculas tal como se escribió. Solo la comparación ignora mayúsculas.

## Archivos tocados
- `lib/mock/users.js` (nuevo), `lib/services/auth.js` (nuevo), `components/SessionProvider.jsx` (nuevo), `components/AuthForm.jsx`, `app/layout.jsx`, `ai/grafo.md`, `ai/reporte.md`

## Commits
- `87f1cb4` Agrega los usuarios de ejemplo de la maqueta
- `98b9465` Agrega los servicios de inicio de sesión y registro con datos de ejemplo
- `cb2c844` Agrega la sesión simulada en memoria y envuelve la app con ella
- `e967ad0` Rehace la pantalla de inicio de sesión con la sesión simulada y los componentes base
- `e5f00f7` Agrega la pantalla de crear cuenta al formulario de acceso
- `44f71ef` Actualiza el grafo con la sesión simulada y el formulario de acceso
- Agrega el reporte de la tarea T-03 (este archivo)

## Verificación
- **`npm run build`:** sin errores ni advertencias. Compilan `/login`, `/register`, `/dashboard`, `/audit` y `/s/[token]`.
- **Página temporal:** para probar "Salir" sin recargar hice `app/vaults/page.jsx`. Mostraba el correo de la sesión y tenía un botón que llamaba a `signOut` y un enlace a `/login`. La **borré sin commitearla** y volví a compilar.
- **Casos probados con `npm run start`**, todos en la misma carga de la página:

| Caso | Resultado |
|---|---|
| Login correcto (`ALEX@upchiapas.edu.mx`, con mayúsculas) | Navega a `/vaults` con sesión de `alex@upchiapas.edu.mx` |
| Contraseña incorrecta | `Alert` "Correo o contraseña incorrectos" |
| Correo inexistente | El mismo mensaje |
| Mientras espera | Botón "Procesando…" y deshabilitado |
| Entrar a `/login` con sesión | Redirige a `/vaults` |
| Registro con 5 caracteres, escritos a mano | El navegador bloquea el envío (`tooShort`) |
| Registro corto saltando la validación del navegador | El servicio lo rechaza con su mensaje |
| Registro con `Auditor@Empresa.com` | "Ya existe una cuenta con ese correo" |
| Registro nuevo (`nueva@ejemplo.com`) | Entra a `/vaults` |
| `signOut` y login con la cuenta nueva | Entra |
| `localStorage`, `sessionStorage` y `document.cookie` | Vacíos al final de todo |

- **A 1440 px:**
  - La columna mide 384 px y está centrada; el fondo es niebla.
  - La tarjeta tiene radio 16, relleno 20, separación 16 y borde niebla.
  - El título sale en 18/28 semibold y el botón mide 342 × 36.
  - El texto de ayuda sale en 12/16 con `bosque-muted`.
  - La frase de la marca ocupa dos líneas (40 px).
- **A 375 px:** la columna mide 343 px con 16 px de margen y no hay scroll horizontal (`scrollWidth = 375`).
- **Consola:** sin errores en `/login` y `/register`. En `/dashboard` (v1) sale un 500 de `/api/auth/me` porque la API no está levantada, y la v1 manda a `/login`. Es lo esperado según `07-decisiones.md`.
- No hay `console.log` de correos ni contraseñas en el código nuevo.

## Grafo actualizado
- **Cambiados:**
  - `C-authform`: sigue en `hecho`, pero ahora es la v2 (S-01 y S-02). Usa C-session, C-services (a través de C-session) y C-ui, y ya no usa C-api.
  - `C-mock`: de `planeado` a `en curso`, con la ruta `lib/mock/users.js`.
  - `C-services`: de `planeado` a `en curso`, con la ruta `lib/services/auth.js`.
  - `C-layout`: ahora envuelve la app con C-session.
- **Creados:** `C-session` (`components/SessionProvider.jsx`), en `hecho`.
- **Sin cambios:** `C-api` (se queda para la v1), `C-ui` y `C-tw`.
- Actualicé "Última actualización" y agregué una fila al registro de cambios. No toqué documentos, tareas, pantallas, conceptos ni externos. Las pantallas S-01 y S-02 y la tarea T-03 quedan para Chat.

## Dudas
- **D1 (no bloquea):** ¿te sirve el texto `La contraseña debe tener entre 12 y 72 caracteres`? Normalmente no se ve, porque el navegador bloquea antes con `minLength` y `maxLength`.
- **D2 (no bloquea):** ¿el Figma 02 separa el texto de ayuda del campo con 4 px o con 16 px? Puse 4 px.
- **D3 (no bloquea):** la tarjeta tiene borde niebla sobre fondo niebla, así que el borde no se nota. Lo dejé así porque lo pide la tarea. ¿El Figma usa otro color de borde o así está bien?

## Cosas que noté fuera del alcance
- Siguen en la carpeta los archivos sin seguimiento que no son míos: `.github/`, `auditoria/`, `db-secdocs/` y `resultados.sarif`. No los toqué.
- `V1-login` y `V1-register` siguen en el grafo como vistas v1, aunque ya fueron reemplazadas. Son nodos de Chat.
