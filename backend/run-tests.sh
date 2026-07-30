#!/bin/bash

# 🏨 Script de Testing Automático - Hospedaje Sebastian API (Linux/Mac)
# Ejecuta la colección de Postman con Newman

set -e

# 🎨 Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_header() {
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_section() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Main
clear
print_header "🏨 HOSPEDAJE SEBASTIAN - SUITE DE TESTING AUTOMÁTICO"

# Verificar si Newman está instalado
if ! command -v newman &> /dev/null; then
    print_error "Newman no está instalado"
    echo ""
    echo "Instálalo con: npm install -g newman"
    exit 1
fi

# Crear directorio de reportes
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_DIR="test-reports/${TIMESTAMP}"

mkdir -p "$REPORT_DIR"

print_section "📁 Directorio de reportes: $REPORT_DIR"
echo ""

# 🟢 TESTS EN LOCAL
print_section "🟢 CORRIENDO TESTS EN LOCAL"
echo ""

newman run Hospedaje_Sebastian_API_v2.postman_collection.json \
  -e Hospedaje_Sebastian_Environment.postman_environment.json \
  --reporters cli,json,html \
  --reporter-json-export "${REPORT_DIR}/local-results.json" \
  --reporter-html-export "${REPORT_DIR}/local-report.html" \
  --delay 500 \
  --timeout 5000

if [ $? -eq 0 ]; then
    print_success "LOCAL completado exitosamente"
else
    print_error "ERROR en LOCAL"
    exit 1
fi

echo ""

# 🟡 TESTS EN STAGING (Opcional)
read -p "¿Ejecutar tests en STAGING? (s/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Ss]$ ]]; then
    print_section "🟡 CORRIENDO TESTS EN STAGING"
    echo ""
    
    newman run Hospedaje_Sebastian_API_v2.postman_collection.json \
      -e Hospedaje_Sebastian_Staging.postman_environment.json \
      --reporters cli,json,html \
      --reporter-json-export "${REPORT_DIR}/staging-results.json" \
      --reporter-html-export "${REPORT_DIR}/staging-report.html" \
      --delay 500 \
      --timeout 5000
    
    if [ $? -eq 0 ]; then
        print_success "STAGING completado exitosamente"
    else
        print_warning "Algunos tests en STAGING fallaron"
    fi
fi

echo ""
print_header "✅ TESTING COMPLETADO"
echo ""
print_section "📊 Abre los reportes en:"
echo "   ${REPORT_DIR}/local-report.html"
echo ""

# Abrir reporte automáticamente (MacOS)
if [ "$(uname)" = "Darwin" ]; then
    open "${REPORT_DIR}/local-report.html"
fi

# Abrir reporte automáticamente (Linux)
if command -v xdg-open &> /dev/null; then
    xdg-open "${REPORT_DIR}/local-report.html"
fi
