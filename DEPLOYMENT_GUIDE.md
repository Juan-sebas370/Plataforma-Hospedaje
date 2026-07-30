# 📦 Guía de Deployment - Hotel Sebastian

## Tabla de Contenidos
- [Desarrollo Local](#desarrollo-local)
- [Staging](#staging)
- [Producción](#producción)
- [CI/CD Pipeline](#cicd-pipeline)
- [Docker](#docker)
- [Troubleshooting](#troubleshooting)

---

## Desarrollo Local

### Requisitos Previos
```bash
Node.js 18+
npm 8+
Docker Desktop
docker-compose v2+
Git
```

### Setup Inicial

1. **Clonar repositorio**
```bash
git clone https://github.com/tu-usuario/hotel-sebastian.git
cd hotel-sebastian
```

2. **Instalación de dependencias**
```bash
# Frontend
cd frontend
npm ci
npm install

# Backend (si aplica)
cd ../backend
npm ci
```

3. **Variables de entorno - Desarrollo**
```bash
# Copiar archivo de ejemplo
cp .env.development.example .env.development

# Configurar valores (opcional para dev)
# La mayoría de valores por defecto funcionan
```

4. **Iniciar desarrollo local**
```bash
# Opción 1: Con Docker Compose (recomendado)
docker-compose up -d

# Opción 2: Desarrollo local sin Docker
# Terminal 1 - Frontend
cd frontend
npm start

# Terminal 2 - Backend
cd backend
npm start
```

5. **Acceder a la aplicación**
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000/api
- MongoDB: mongodb://localhost:27017
- RedisCommander: http://localhost:8081

### Comandos Útiles - Desarrollo
```bash
# Ver logs
docker-compose logs -f

# Logs de un servicio específico
docker-compose logs -f frontend

# Detener servicios
docker-compose down

# Reiniciar servicios
docker-compose restart

# Limpiar volúmenes (cuidado: elimina datos)
docker-compose down -v

# Ejecutar comando en contenedor
docker-compose exec frontend npm test
```

---

## Staging

### Requisitos
- Servidor Ubuntu 20.04+
- 4GB RAM mínimo
- 20GB almacenamiento
- Docker + Docker Compose
- Let's Encrypt DNS configurado

### Deployment Staging

1. **Preparar servidor**
```bash
ssh user@staging-server.com

# Instalar dependencias
sudo apt-get update
sudo apt-get install -y docker.io docker-compose git

# Clonar repositorio
git clone https://github.com/tu-usuario/hotel-sebastian.git
cd hotel-sebastian
```

2. **Configurar variables**
```bash
# Crear archivo .env.staging
cp .env.staging.example .env.staging

# Editar con valores reales
nano .env.staging
```

3. **Build y deploy**
```bash
# Hacer ejecutable el script
chmod +x deploy.sh

# Ejecutar deployment
./deploy.sh staging
```

4. **Verificar deployment**
```bash
# Verificar logs
docker-compose logs -f

# Hacer request al API
curl https://staging-api.hospedaje-sebastian.com/health

# Ver estatus de contenedores
docker-compose ps
```

### Monitoring Staging
```bash
# Ver uso de recursos
docker stats

# Ver logs de error
docker-compose logs -f | grep -i error

# Entrar a base de datos
docker-compose exec mongodb mongosh
```

---

## Producción

### Requisitos Críticos
```
✓ Servidor Ubuntu 20.04+ LTS
✓ 8GB RAM mínimo
✓ 50GB SSD almacenamiento
✓ Conexión a Internet 100+ Mbps
✓ IP estática
✓ Dominio configurado
✓ SSL/TLS con Let's Encrypt
✓ Backups automáticos
✓ Monitoreo 24/7
```

### Pre-deployment Checklist

```bash
☐ Code review completada
☐ Todos los tests pasando (100% en critical paths)
☐ Security audit completado
☐ Performance testing realizado
☐ Load testing completado (min 1000 usuarios concurrentes)
☐ Database migration tested
☐ Rollback plan ready
☐ Documentación actualizada
☐ Team notificado
☐ Ventana de deployment confirmada
```

### Deployment Paso a Paso

#### 1. Preparar Servidor de Producción
```bash
# Conectar al servidor
ssh deploy@prod-server.com

# Actualizar sistema
sudo apt-get update && sudo apt-get upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker deploy

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Crear directorios
mkdir -p /opt/hotel-sebastian/{backups,logs,ssl}
cd /opt/hotel-sebastian
```

#### 2. Clonar y Configurar
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/hotel-sebastian.git app
cd app

# Crear archivo de variables
cp .env.production.example .env.production

# Editar con secretos reales
nano .env.production

# Importante: NUNCA commitear .env.production a Git!
echo ".env.production" >> .gitignore
```

#### 3. Configurar SSL/TLS
```bash
# Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generar certificado
sudo certbot certonly --standalone -d hospedaje-sebastian.com -d api.hospedaje-sebastian.com

# Los certificados están en: /etc/letsencrypt/live/hospedaje-sebastian.com/
```

#### 4. Ejecutar Deployment
```bash
# Hacer ejecutable
chmod +x deploy.sh

# Ejecutar con logging
./deploy.sh production > logs/deploy_$(date +%Y%m%d_%H%M%S).log 2>&1

# Monitorear durante deployment
tail -f logs/deploy_*.log
```

#### 5. Post-Deployment Verification
```bash
# Verificar servicios
docker-compose ps

# Verificar salud
curl https://hospedaje-sebastian.com/health
curl https://api.hospedaje-sebastian.com/health

# Verificar logs
docker-compose logs --tail=50

# Test de API
curl -X GET https://api.hospedaje-sebastian.com/api/health \
  -H "Content-Type: application/json"

# Smoke testing
npm run test:e2e
```

### Monitoring y Mantenimiento

#### Daily Tasks
```bash
# Revisar logs
docker-compose logs --tail=100 | grep -i error

# Verificar disk space
df -h

# Verificar CPU/Memory
htop

# Verificar database
docker-compose exec mongodb mongosh \
  --eval "db.adminCommand('dbstats')"
```

#### Weekly Tasks
```bash
# Actualizar sistema
sudo apt-get update && sudo apt-get upgrade -y

# Backup manual
docker-compose exec -T mongodb mongodump \
  --uri="mongodb://user:pass@localhost:27017" \
  --archive=backup_$(date +%Y%m%d).archive

# Revisar logs de error
docker-compose logs | grep -i error | tail -20
```

#### Monthly Tasks
```bash
# Renovar certificados SSL
sudo certbot renew --dry-run

# Verificar updates de Docker
docker ps

# Security audit
npm audit

# Performance review
# Revisar Datadog/Sentry dashboards
```

### Rollback en Caso de Error

```bash
# Si algo salió mal, volver a versión anterior
docker-compose down

# Restaurar backup
docker-compose up -d mongodb
docker-compose exec -T mongodb mongorestore \
  --uri="mongodb://user:pass@localhost:27017" \
  --archive=backup_anterior.archive

# Rebuild y reiniciar
docker-compose pull
docker-compose up -d

# Verificar
docker-compose logs -f
```

---

## CI/CD Pipeline

### Flujo Automático (GitHub Actions)

```
Push a Main Branch
    ↓
[1. RUN TESTS] ← Unit + Integration tests
    ↓
[2. BUILD] ← Compile Angular + Create artifacts
    ↓
[3. SECURITY SCAN] ← OWASP Check + npm audit
    ↓
[4. DOCKER BUILD & PUSH] ← Build and push to registry
    ↓
[5. DEPLOY TO PRODUCTION] ← SSH and deploy
    ↓
[6. HEALTH CHECKS] ← Verify all services
    ↓
[7. NOTIFICATION] ← Slack/Email alert
```

### Configuración de Secrets (GitHub)
```
DEPLOY_HOST: servidor.com
DEPLOY_USER: deploy
DEPLOY_KEY: SSH private key
SLACK_WEBHOOK: https://hooks.slack.com/services/...
```

### Trigger Deployment Manual
```bash
# GitHub CLI
gh workflow run ci-cd.yml --ref main

# O directo en GitHub Actions UI
# Actions → CI/CD Pipeline → Run workflow
```

---

## Docker

### Build Manual
```bash
# Build solo frontend
docker build -f Dockerfile -t hotel-sebastian-frontend:latest .

# Build solo backend
docker build -f backend/Dockerfile -t hotel-sebastian-backend:latest ./backend

# Tag y push a registry
docker tag hotel-sebastian-frontend:latest ghcr.io/usuario/hotel-sebastian-frontend:latest
docker push ghcr.io/usuario/hotel-sebastian-frontend:latest
```

### Registry Privado
```bash
# Login a GitHub Container Registry
docker login ghcr.io -u username -p token

# Pull imagen
docker pull ghcr.io/usuario/hotel-sebastian-frontend:latest

# Ver imágenes locales
docker images
```

---

## Troubleshooting

### Frontend no carga

```bash
# 1. Verificar contenedor
docker-compose ps

# 2. Ver logs
docker-compose logs frontend

# 3. Verificar puerto
netstat -tlnp | grep 4200

# 4. Reiniciar
docker-compose restart frontend

# 5. Rebuild si persiste
docker-compose up --build frontend
```

### Backend devuelve errores 500

```bash
# 1. Verificar logs
docker-compose logs backend | tail -50

# 2. Verificar base de datos
docker-compose exec backend curl http://localhost:3000/health

# 3. Conectar a DB
docker-compose exec mongodb mongosh

# 4. Ver variables de entorno
docker-compose exec backend env | grep DATABASE

# 5. Restart backend
docker-compose restart backend
```

### Base de datos no inicia

```bash
# 1. Ver logs
docker-compose logs mongodb

# 2. Verificar volumen
docker volume ls

# 3. Verificar permisos
docker-compose exec mongodb ls -la /data/db

# 4. Limpiar y reiniciar (CUIDADO: elimina datos)
docker-compose down -v
docker-compose up -d mongodb
```

### SSL/HTTPS no funciona

```bash
# 1. Verificar certificado
sudo certbot certificates

# 2. Ver certificado instalado
openssl s_client -connect hospedaje-sebastian.com:443

# 3. Renovación manual
sudo certbot renew --force-renewal

# 4. Verificar nginx config
docker-compose exec nginx nginx -t
```

### Performance lento

```bash
# 1. Ver recursos
docker stats

# 2. Analizar database
docker-compose exec mongodb mongosh
> db.stats()

# 3. Ver queries lentas
docker-compose logs backend | grep "slow"

# 4. Aumentar recursos en docker-compose.yml
# Editar: services → backend/mongodb → resources → limits
```

---

## Recursos Útiles

- [Docker Documentation](https://docs.docker.com)
- [Docker Compose](https://docs.docker.com/compose)
- [Angular Build Guide](https://angular.io/guide/build)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [OWASP Security](https://owasp.org)

---

## Contacto

Para preguntas o problemas:
- Email: deployadmin@hospedaje-sebastian.com
- Slack: #devops-team
- Issues: GitHub Issues
