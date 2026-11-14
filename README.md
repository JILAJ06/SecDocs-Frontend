# SecDocs · Frontend

Interfaz web de **SecDocs**, bóveda digital para guardar y compartir documentos confidenciales.
Proyecto de Seguridad Informática, Universidad Politécnica de Chiapas.

## Stack
Next.js 14 (App Router) · Tailwind CSS · Axios · tipografías Inter y JetBrains Mono.

## Repositorios del proyecto
- **SecDocs-Frontend** (este repositorio)
- [SecDocs-Backend](https://github.com/JILAJ06/SecDocs-Backend): API en Node.js/Express
- [SecDocs-DB](https://github.com/JILAJ06/SecDocs-DB): esquema y migraciones de PostgreSQL

## Estructura
```
app/          rutas: login, register, dashboard, audit y s/[token] (vista del receptor)
components/   componentes de interfaz
lib/          cliente de la API
public/       archivos estáticos
```

## Configuración
La web y la API se sirven bajo el mismo origen: `/api/*` se reenvía al backend con una *rewrite* de Next.js.
La URL del backend se define con la variable `API_INTERNAL_URL` (por defecto `http://localhost:4000`).

## Desarrollo
```bash
npm install
npm run dev      # http://localhost:3000
```

## Paleta
Verde bosque `#00412E` · Salvia `#96BF8A` · Niebla `#E8EAE5` · Blanco `#FFFFFF`.
