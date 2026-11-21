# Tarea T-20 · Arreglos tras la revisión del PR #5

**Rama:** `fix/02-vistas-v2` (ya creada desde `develop`, que incluye el merge del PR #5)
**Pull Request:** nuevo, hacia `develop`. **No hagas merge.**

La revisión del PR #5 salió bien. Quedan **dos** arreglos pequeños. No toques nada más.

## 1. Token de invitación sin `Math.random`
- **Archivo:** `lib/services/vaults.js`, función `generateMockToken` (hoy usa `Math.random`).
- **Qué hacer:** genera los 43 caracteres con `crypto.getRandomValues` (Web Crypto, disponible en el navegador y en Node; sin dependencias nuevas). Mantén el mismo alfabeto y la misma longitud (43) para que el token siga viéndose igual en el enlace. Evita el sesgo del módulo: descarta los bytes que caigan fuera del rango más grande múltiplo del tamaño del alfabeto (rechazo) o usa un método equivalente.
- **No cambies** los `Math.random` de las esperas simuladas (300–500 ms) ni el de `lib/mock/audit.js`: no son secretos.
- Regla del proyecto (`03-reglas-del-repo.md`): los valores secretos del navegador no se generan con `Math.random`.

## 2. Corregir la nota de Docker en el reporte
- En el reporte anterior dijiste que `next.config.mjs` no tiene `output: 'standalone'`. **Sí lo tiene** y el `Dockerfile` copia `.next/standalone`. No hay nada que arreglar en el código.
- En el nuevo `ai/reporte.md` deja claro que lo único sin verificar es el `docker build` (por permisos de Docker Desktop en tu consola), y que debe probarlo el usuario con `docker build -t secdocs-frontend .`.
- Si puedes correrlo tú con éxito, anótalo.

## Verificación
- `npm run build` sin errores.
- Prueba en `npm run dev`: crea una invitación en `/vaults/v-1`; el enlace debe seguir teniendo 43 caracteres tras `/invitacion/` y abrirse (el token nuevo se resuelve con `getInvitation`).
- `grep -rn "Math.random" lib/services/vaults.js` solo debe mostrar la espera simulada.

## Entrega
- Commits pequeños, sin prefijo, en español, **sin mención a Claude**, con la fecha y hora reales (no uses `--date` ni `GIT_*_DATE`). Revisa con `git log -1 --format=%B`.
- Actualiza `ai/grafo.md` (T-20 pasa a `hecho` al abrir el PR; el nodo `C-services` sin cambios de ruta) y reescribe `ai/reporte.md` completo (T-20, rama, PR, qué hiciste, verificación, dudas).
- `git push -u origin fix/02-vistas-v2` y abre el PR con `gh api repos/JILAJ06/SecDocs-Frontend/pulls -f title='…' -f head='fix/02-vistas-v2' -f base='develop' -f body='…'` (la CLI `gh pr create` falla por GraphQL en esta sesión; usa la API REST). Sin menciones a Claude en el título ni en la descripción.
