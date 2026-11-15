# 01 · El proyecto

**SecDocs** es una bóveda digital para guardar y compartir documentos confidenciales. Se desarrolla para la materia de Seguridad Informática en la Universidad Politécnica de Chiapas (Alexander Jiménez y Sayd Quevedo).

## Qué hace (para entender qué muestra cada pantalla)
- **Cifrado en reposo:** cada archivo se cifra con AES-256-GCM con una llave única, protegida por una llave maestra.
- **Un enlace por receptor:** cada enlace expira y puede ser de un solo uso. La contraseña se manda por un canal distinto al del enlace (autenticación fuera de banda).
- **Protección contra ataques:** bloqueo tras 5 intentos fallidos, límite de intentos por IP y bitácora de auditoría.
- **Autodestrucción:** al agotarse los enlaces, el archivo se destruye borrando su llave (*crypto-shredding*).

## Repositorios (son tres, separados)
| Repo | Contenido | Estado |
|---|---|---|
| `SecDocs-Frontend` | Next.js 14 + Tailwind (**aquí trabajas**) | código subido |
| `SecDocs-Backend` | API Node.js/Express | código subido, **no se toca** desde esta tarea |
| `SecDocs-DB` | Esquema PostgreSQL | **no se toca** |

Despliegue futuro: Vercel (frontend), Railway (API) y Supabase (base de datos).

## Paleta (igual que las variables del Figma)
| Nombre | Hex | Clase Tailwind |
|---|---|---|
| Verde bosque | `#00412E` | `bosque` |
| Salvia | `#96BF8A` | `salvia` |
| Niebla | `#E8EAE5` | `niebla` |
| Blanco | `#FFFFFF` | `white` |

Los colores de alerta (`danger`, `warning`, `info`, `success`) se conservan en `tailwind.config.js` porque la paleta no trae rojo ni ámbar. Tipografías: Inter (texto) y JetBrains Mono (llaves, enlaces, datos técnicos).

## Diseño
El diseño está en Figma, archivo **SecDocs-Maquetado**. Claude Chat lee el Figma y traduce cada vista a medidas, colores, textos y estructura dentro de `ai/siguiente.md`. Si algo del Figma no está claro, **pregunta en `ai/reporte.md`**, no lo inventes.
