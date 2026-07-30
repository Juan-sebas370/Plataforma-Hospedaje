# Dockerfile para aplicación Backend Node.js
# ==========================================
# Configuración para build y run de Hotel Sebastian backend

# STAGE 1: BUILD
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json y package-lock.json
COPY backend/package*.json ./

# Instalar dependencias
RUN npm install --only=production

# STAGE 2: RUN
FROM node:20-alpine

WORKDIR /app

# Copiar node_modules desde stage 1
COPY --from=builder /app/node_modules ./node_modules

# Copiar código fuente del backend
COPY backend/ .

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Comando para iniciar
CMD ["node", "server.js"]
