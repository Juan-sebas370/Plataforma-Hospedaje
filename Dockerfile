# Dockerfile para el frontend Angular (con SSR)
# ===================================

# STAGE 1: BUILD
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json y package-lock.json
COPY frontend/package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY frontend/ .

# Build para producción (genera dist/frontend/browser y dist/frontend/server)
RUN npm run build -- --configuration production

# STAGE 2: SERVE
FROM node:20-alpine

WORKDIR /app

# Copiar solo el build desde el stage anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/assets ./src/assets

# El servidor SSR (dist/frontend/server/server.mjs) escucha en la variable de
# entorno PORT (por defecto 4000 en local) — así funciona igual en Railway,
# Render, Fly, etc.
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 4000), (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "dist/frontend/server/server.mjs"]
