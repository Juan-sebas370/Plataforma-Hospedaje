#!/bin/bash

#
# Script de Deployment para Hotel Sebastian
# ==========================================
# Este script automatiza el proceso de deployment
# Uso: ./deploy.sh [dev|staging|production]
#

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
ENVIRONMENT=${1:-dev}
APP_NAME="hotel-sebastian"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/${ENVIRONMENT}/${TIMESTAMP}"

# Funciones
print_header() {
    echo -e "${BLUE}=================================== ${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=================================== ${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Verificar entrada
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|production)$ ]]; then
    print_error "Entorno inválido. Usa: dev, staging o production"
fi

print_header "DEPLOYMENT: $ENVIRONMENT"

# 1. VALIDACIONES PREVIAS
print_info "Validando ambiente..."

if [ ! -f ".env.${ENVIRONMENT}" ]; then
    print_error "Archivo .env.${ENVIRONMENT} no encontrado"
fi

if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado"
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose no está instalado"
fi

# Validaciones SSL para producción
if [ "$ENVIRONMENT" = "production" ]; then
    SSL_CERT_PATH="ssl/fullchain.pem"
    SSL_KEY_PATH="ssl/privkey.pem"
    NGINX_CONF_PATH="nginx.conf/default.conf"

    if [ ! -f "$NGINX_CONF_PATH" ]; then
        print_error "Falta configuración Nginx SSL: $NGINX_CONF_PATH"
    fi

    if [ ! -f "$SSL_CERT_PATH" ] || [ ! -f "$SSL_KEY_PATH" ]; then
        print_warning "No se encontraron certificados SSL locales en ./ssl"
        print_warning "Para pruebas locales:"
        print_warning "  - Linux/macOS: ./ssl/generate-local-cert.sh localhost 365"
        print_warning "  - Windows:      ssl\\generate-local-cert.bat localhost 365"
        print_warning "Para producción real usa Let's Encrypt y copia:"
        print_warning "  - ssl/fullchain.pem"
        print_warning "  - ssl/privkey.pem"
        print_error "SSL requerido para producción"
    fi

    print_success "Validación SSL completada"
fi

print_success "Pre-requisitos validados"

# 2. BACKUP
print_info "Creando backup..."
mkdir -p "$BACKUP_DIR"

# Backup de volúmenes Docker
if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose -f docker-compose.yml exec -T mongodb mongodump --uri="mongodb://admin:password123@localhost:27017" --archive="${BACKUP_DIR}/mongodb_backup.archive" 2>/dev/null || true
    print_success "Backup de base de datos completado"
fi

# 3. BUILD
print_info "Descargando dependencias..."
cd frontend
npm ci
print_success "Dependencias descargadas"

print_info "Compilando frontend..."
if [ "$ENVIRONMENT" = "production" ]; then
    npm run build -- --configuration production --optimization --source-map=false
else
    npm run build
fi
print_success "Frontend compilado"

cd ..

# 4. DOCKER
print_info "Construyendo imágenes Docker..."
docker-compose -f docker-compose.yml build --no-cache

print_success "Imágenes construidas"

# 5. DEPLOY
print_info "Iniciando servicios..."

if [ "$ENVIRONMENT" = "production" ]; then
    print_info "Modo producción con SSL habilitado"
    print_info "Asegúrate de montar:"
    print_info "  - ./nginx.conf/default.conf -> /etc/nginx/conf.d/default.conf"
    print_info "  - ./ssl/fullchain.pem       -> /etc/nginx/ssl/fullchain.pem"
    print_info "  - ./ssl/privkey.pem         -> /etc/nginx/ssl/privkey.pem"
fi

if [ "$ENVIRONMENT" = "production" ]; then
    # Detener servicios actuales
    docker-compose -f docker-compose.yml down || true
    
    # Esperar a que se liberen puertos
    sleep 5
fi

docker-compose -f docker-compose.yml up -d

print_success "Servicios iniciados"

# 6. POST-DEPLOYMENT CHECKS
print_info "Verificando salud de servicios..."
sleep 10

# Verificar backend
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    print_success "Backend está saludable"
else
    print_error "Backend no responde"
fi

# Verificar frontend
if curl -s http://localhost:4200 > /dev/null 2>&1; then
    print_success "Frontend está saludable"
else
    print_error "Frontend no responde"
fi

# 7. LOGS
print_info "Mostrando logs..."
docker-compose -f docker-compose.yml logs -f --tail=20

print_header "✓ DEPLOYMENT COMPLETADO"
echo ""
echo "Acceso:"
if [ "$ENVIRONMENT" = "production" ]; then
    echo "  Sitio:    https://localhost"
    echo "  API:      https://localhost/api"
else
    echo "  Frontend: http://localhost:4200"
    echo "  Backend:  http://localhost:3000"
fi
echo "  MongoDB:  mongodb://localhost:27017"
echo ""
echo "Comandos útiles:"
echo "  Ver logs:     docker-compose logs -f"
echo "  Parar:        docker-compose down"
echo "  Reiniciar:    docker-compose restart"
echo ""
