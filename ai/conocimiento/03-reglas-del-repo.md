# 03 · Reglas del repositorio

## Commits
- Mensaje **sin prefijo** (nada de `feat:`, `fix:`, `chore:`): solo una frase en español que diga qué se hizo.
  - Bien: `Ajusta el panel de archivos al diseño de Figma`
  - Mal: `feat: ajusta panel`
- Commits pequeños y graduales, uno por cambio con sentido (una vista, un componente). No un commit gigante.
- Rama: `main`. Antes de empezar: `git pull --rebase origin main`. Al terminar: `git push origin main`.
- Nunca subir `.env`, `node_modules`, `.next` ni secretos.

## Código
- Idioma de la interfaz: **español (México)**. Comentarios en español.
- Next.js 14 App Router, JavaScript (`.jsx`, sin TypeScript), alias `@/` a la raíz del proyecto.
- Estilos solo con **Tailwind** y las clases de `app/globals.css` (`card`, `input`, `label`, `btn-*`, `badge`). Los colores salen de `tailwind.config.js`; no pongas hex sueltos si ya existe una clase.
- Si el Figma pide un color/espaciado que no existe, agrégalo a `tailwind.config.js` con un nombre claro y repórtalo.
- No agregues dependencias nuevas sin preguntarlo en el reporte.

## Seguridad: lo que NO se puede romper al cambiar la interfaz
- La web y la API se sirven bajo el **mismo origen**: todas las llamadas van a `/api/*` con el cliente de `lib/api.js` (cabecera `X-SecDocs-CSRF`, `withCredentials`). No uses `fetch` a otros dominios.
- La sesión es una cookie `HttpOnly`: **no** guardes tokens ni JWT en `localStorage`/`sessionStorage`.
- La CSP de `next.config.mjs` solo permite recursos propios: nada de fuentes, imágenes, scripts o iconos desde CDNs. Las fuentes ya se cargan con `next/font`. Íconos: SVG en línea.
- La página `/s/[token]` contiene el token en la URL: no lo imprimas en consola, no lo mandes a terceros, no lo cachees.
- Las contraseñas de enlaces se generan en el navegador con `crypto.getRandomValues` (`generatePassword` en `lib/api.js`); no lo cambies por `Math.random`.

## Verificación mínima antes de reportar
- `npm install` y `npm run build` sin errores.
- Revisar la vista en `npm run dev` (http://localhost:3000, usa `localhost` y no la IP por las cookies). Si la API no está levantada, dilo en el reporte: las vistas protegidas necesitan el backend.
- Compararla contra el Figma que describe `siguiente.md`.
