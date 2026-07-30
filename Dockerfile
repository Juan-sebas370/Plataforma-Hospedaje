# Dockerfile para aplicación Angular
# ===================================
# Configuración para build y run de Hotel Sebastian frontend

# STAGE 1: BUILD
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json y package-lock.json
COPY frontend/package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY frontend/ .

# Build para producción
RUN npm run build -- --configuration production

# STAGE 2: SERVE
FROM node:20-alpine

WORKDIR /app

# Instalar http-server para servir archivos estáticos
RUN npm install -g http-server

# Copiar archivos built desde stage 1
COPY --from=builder /app/dist /app/dist

# Exponer puerto
EXPOSE 4200

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4200', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Comando para iniciar
CMD ["http-server", "dist", "-p", "4200", "--cors"]
