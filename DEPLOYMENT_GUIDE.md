# Guía de Deployment - Hotel Sebastian

Este proyecto se despliega como **dos servicios independientes** en una
plataforma administrada (Railway, Render, Fly.io, etc.), cada uno con su
propio Dockerfile. No usa Docker Compose ni un Nginx propio: la plataforma
maneja el proxy, el TLS y el puerto de cada servicio.

## Stack real

- **Backend**: Java 17 + Spring Boot, MySQL. Dockerfile en `backend/Dockerfile`.
- **Frontend**: Angular con SSR (Server-Side Rendering), Node/Express.
  Dockerfile en `Dockerfile` (raíz del repo).

Ambos servicios escuchan en el puerto que la plataforma inyecte por la
variable de entorno `PORT` (con un valor por defecto para desarrollo local).

## 1. Backend

Build: `docker build -f backend/Dockerfile -t hotel-sebastian-backend ./backend`

Variables de entorno requeridas (ver `.env.production.example`):

| Variable | Descripción |
|---|---|
| `DB_USERNAME` / `DB_PASSWORD` | Credenciales de la base de datos MySQL |
| `JWT_SECRET` | Clave para firmar los tokens JWT. **Obligatoria** — la app no arranca sin ella. Generá algo largo y aleatorio, nunca un valor predecible. |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | Cuenta de Gmail (con contraseña de aplicación) para el envío de emails de recuperación de contraseña |
| `CORS_ALLOWED_ORIGINS` | Dominio real donde vive el frontend desplegado |

Necesitás además una base de datos MySQL accesible desde el backend (la
mayoría de las plataformas administradas ofrecen un addon de MySQL, o podés
apuntar a uno externo). La URL de conexión está fija en
`application.properties` apuntando a `hotel_sebastian`; si tu proveedor exige
otro host/puerto, ajustá `spring.datasource.url` ahí.

Health check: `GET /api/health`.

## 2. Frontend

Build: `docker build -t hotel-sebastian-frontend .`

Antes de desplegar, actualizá `frontend/src/environments/environment.production.ts`
con la URL real del backend (`apiUrl`, `wsUrl`) — esto se resuelve en tiempo
de build de Angular, no por variable de entorno.

No requiere variables de entorno propias más allá de `PORT` (la inyecta la
plataforma).

## 3. Orden de despliegue

1. Desplegar la base de datos MySQL (addon o servicio externo).
2. Desplegar el backend, con las variables de entorno de la tabla anterior.
3. Confirmar `https://tu-backend/api/health`.
4. Actualizar `environment.production.ts` con la URL del backend ya desplegado.
5. Desplegar el frontend.

## Desarrollo local

```bash
# Backend (genera un JWT_SECRET local la primera vez)
cd backend
./start.ps1        # Windows
./run.sh           # Linux/macOS

# Frontend
cd frontend
npm start
```

- Frontend: http://localhost:4200
- Backend: http://localhost:8080/api
