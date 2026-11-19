# Tarea T-03 · Iniciar sesión y Crear cuenta (con datos de ejemplo)

**Rama:** `01-autenticacion` (creada desde `develop`, que ya incluye T-02)
**Pull Request:** hacia `develop` con `gh pr create --base develop`. **No hagas merge**: primero lo reviso yo (Claude Chat).

Antes de empezar: `git fetch origin`, `git checkout 01-autenticacion`, `git pull`; lee `ai/conocimiento/` (sobre todo `04`, `05`, `07`, `08`) y `ai/grafo.md`.

## Objetivo
Dejar funcionando las pantallas **01 Iniciar sesión** (`/login`) y **02 Crear cuenta** (`/register`) de la v2, contra una capa de datos de ejemplo, e inaugurar la infraestructura que usarán todas las pantallas: `lib/mock`, `lib/services` y la sesión simulada en memoria. Las dos pantallas son casi idénticas, por eso van juntas y comparten componente.

## Alcance y archivos permitidos
- `components/AuthForm.jsx` (se reescribe **en el mismo archivo**; sustituye a la v1)
- `components/SessionProvider.jsx` (nuevo, cliente)
- `lib/mock/users.js` (nuevo)
- `lib/services/auth.js` (nuevo)
- `app/layout.jsx` (solo para envolver con `SessionProvider`)
- `app/login/page.jsx` y `app/register/page.jsx` solo si hace falta
- `ai/grafo.md` (solo nodos de código), `ai/reporte.md`
- Prohibido: backend, `lib/api.js` (se conserva para la v1), `globals.css`, dependencias nuevas, otras pantallas, `/` (sigue redirigiendo a `/dashboard`).

## 1. Datos de ejemplo y servicios
Regla: todo dato falso vive en `lib/mock/`; las pantallas **solo** hablan con `lib/services/`, nunca con `lib/mock/` ni con `lib/api.js`.

`lib/mock/users.js`
- Arreglo en memoria con usuarios de ejemplo: `{ id, email }`. Mínimo `alex@upchiapas.edu.mx` (dueño) y `auditor@empresa.com` (invitado, ya usado en el Figma).
- Una constante exportada `DEMO_PASSWORD` con una contraseña **claramente falsa** de al menos 12 caracteres (por ejemplo `demo-maqueta-2026`), con un comentario que diga que es solo para la maqueta. Todos los usuarios de ejemplo usan esa contraseña. Es un dato de ejemplo, no un secreto: no la compares con nada real ni la imprimas en consola.

`lib/services/auth.js` (funciones asíncronas; simulan 300–500 ms de espera con una promesa)
- `login(email, password)` → devuelve `{ id, email }` si el correo existe (sin distinguir mayúsculas) y la contraseña es `DEMO_PASSWORD`; si no, lanza `Error('Correo o contraseña incorrectos')` (mismo mensaje en ambos casos; no reveles cuál falló).
- `register(email, password)` → valida `password.length >= 12 && <= 72`; si el correo ya existe lanza `Error('Ya existe una cuenta con ese correo')`; si no, agrega el usuario al arreglo en memoria y lo devuelve. Para que el usuario nuevo pueda volver a entrar con la maqueta, guarda su contraseña en un mapa en memoria dentro de `lib/mock/users.js` y haz que `login` la acepte (o `DEMO_PASSWORD`). Documenta en un comentario cómo lo resolviste.
- `logout()` → promesa vacía.
- Cuando más adelante se conecte la API real, solo cambia el interior de estas funciones; **su firma no cambia**.

## 2. Sesión simulada (`components/SessionProvider.jsx`)
- `'use client'`. Contexto de React con `session` (`null` o `{ id, email }`), `signIn(email, password)`, `signUp(email, password)`, `signOut()` y un hook `useSession()`.
- La sesión vive **solo en memoria** (`useState`). Prohibido `localStorage`, `sessionStorage`, cookies y `window.name`. Recargar la página la pierde y es aceptable (ver `07-decisiones.md`).
- `signIn`/`signUp` llaman a los servicios y guardan el usuario; los errores se **propagan** a quien llamó (la pantalla los muestra).
- Envuelve `{children}` en `app/layout.jsx` con `<SessionProvider>` (el layout sigue siendo de servidor).

## 3. Pantallas 01 y 02 (`components/AuthForm.jsx`, prop `mode="login" | "register"`)
Usa los componentes de T-02 (`Brand`, `Field`, `Button`, `Alert`) en vez de las clases v1 (`.card`, `.input`, `.label`, `.btn-*`). Estructura y medidas (Figma 01 `6:23` y 02 `6:52`, ya traducidas):

- **Fondo:** `bg-niebla` a pantalla completa (`min-h-screen`), contenido centrado vertical y horizontalmente, `px-4`.
- **Columna:** `w-full max-w-sm` (384 px), `flex flex-col gap-6`.
- **Marca (arriba de la tarjeta):** centrada, `gap-2`: `Brand` grande y debajo el texto **"Bóveda con cifrado en reposo y enlaces que se autodestruyen"** (14/20, `text-bosque-soft`, `text-center`). En el Figma esa frase no cabe en 384 px y se corta; **permite que se parta en dos líneas** (no uses `whitespace-nowrap`).
- **Tarjeta:** `bg-white border border-niebla rounded-2xl` (radio 16) `p-5` (20), `flex flex-col gap-4`.
  - Título: `Iniciar sesión` / `Crear cuenta` en `<h1>`, `text-lg leading-7 font-semibold text-bosque` (18/28).
  - `Field` **Correo** (`type="email"`, `autoComplete="email"`, `required`) y `Field` **Contraseña** (`type="password"`, `required`, `maxLength={72}`; en login `autoComplete="current-password"`, en registro `autoComplete="new-password"`). Las etiquetas salen en mayúsculas por el propio `Field`.
  - Solo en **registro**, debajo de la contraseña: **"Mínimo 12 caracteres. Se guarda con bcrypt (costo 12)."** (12/16, `text-bosque-muted`) y `minLength={12}` en el campo.
  - Solo en **login**, si hay error: `Alert` de error con el mensaje (en el Figma: "Correo o contraseña incorrectos"). En **registro** el error se muestra con el mismo `Alert`, en el mismo lugar (justo antes del botón), aunque el Figma no lo dibuje.
  - Botón primario `w-full`: **"Entrar"** / **"Registrarme"**; mientras espera muestra **"Procesando…"** y queda deshabilitado.
  - Pie centrado, `gap-1`, 14/20: texto `text-bosque-soft` **"¿No tienes cuenta?"** / **"¿Ya tienes cuenta?"** seguido del enlace (`next/link`) **"Regístrate"** (`/register`) / **"Inicia sesión"** (`/login`) en `font-medium text-bosque underline` (con `underline-offset-2`).
- Al enviar: `preventDefault`, limpia el error, llama a `signIn` / `signUp` del contexto; si sale bien, `router.replace('/vaults')`; si falla, muestra `err.message` en el `Alert`. (`/vaults` todavía no existe y dará 404 hasta la siguiente tarea: es esperado.)
- Si ya hay sesión y alguien entra a `/login` o `/register`, redirige a `/vaults` (con `useEffect`).
- Accesibilidad: el mensaje de error debe anunciarse (`role="alert"` en el contenedor del `Alert` o equivalente); no cambies el componente `Alert` si no hace falta, envuélvelo.

## Reglas de seguridad que aplican
- Ningún dato de sesión, correo ni contraseña en `localStorage`/`sessionStorage`/cookies.
- No imprimas contraseñas ni correos en consola.
- El mismo mensaje de error para correo inexistente y contraseña incorrecta.
- No agregues atajos de desarrollo (`?demo=…`) todavía.

## Verificación mínima
- `npm run build` sin errores ni advertencias nuevas; `/dashboard`, `/audit` y `/s/[token]` (v1) siguen compilando.
- Con `npm run start`, en el navegador, a 1440 px y a 375 px, compara `/login` y `/register` con la descripción de esta tarea y anota qué viste. Casos: login correcto (`alex@upchiapas.edu.mx` + `DEMO_PASSWORD`) → navega a `/vaults`; contraseña incorrecta → el `Alert`; correo inexistente → el mismo mensaje; registro con menos de 12 caracteres → bloquea el navegador o el servicio; registro con correo existente → su mensaje; registro nuevo → entra, y luego `logout` + login con esa cuenta funciona (en la misma sesión de la página, sin recargar).
- Comprueba que no se escribió nada en `localStorage`/`sessionStorage` (consola del navegador).
- Dime en el reporte cuál es `DEMO_PASSWORD`, para que el usuario pueda probar.

## Grafo de conocimiento
Al terminar, en `ai/grafo.md` (solo nodos de código): pasa `C-authform` a `hecho` (ya no es v1), crea `C-session` (`components/SessionProvider.jsx`), pasa `C-mock` y `C-services` a `en curso` con sus rutas reales (`lib/mock/users.js`, `lib/services/auth.js`) y relaciones (`C-authform` → usa `C-session`, `C-services`, `C-ui`), actualiza `C-layout`, "Última actualización" y el registro de cambios. No toques documentos, tareas, pantallas, conceptos ni externos. En `ai/reporte.md` agrega **Grafo actualizado**.

## Entrega
- Commits pequeños (por ejemplo: datos de ejemplo, servicios, proveedor de sesión, pantalla de inicio de sesión, pantalla de registro, grafo, reporte), sin prefijo, en español, **sin ninguna mención a Claude**; revisa con `git log -1 --format=%B`. Autor: el usuario.
- `git push -u origin 01-autenticacion` (obligatorio), abre el PR hacia `develop`, descripción corta sin menciones a Claude, y pon su enlace en el reporte.
- Reescribe `ai/reporte.md` completo: ID T-03, rama, enlace del PR, qué hiciste, diferencias contra esta tarea, verificación, dudas D1, D2…, y **Grafo actualizado**.
