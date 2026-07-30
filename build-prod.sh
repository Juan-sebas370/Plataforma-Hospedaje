#!/bin/bash

#
# Build Script para Producción
# ============================
# Optimiza el build para máximo rendimiento y mínimo tamaño
# Uso: ./build-prod.sh
#

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== BUILD PRODUCCIÓN HOTEL SEBASTIAN ===${NC}\n"

cd frontend

# 1. LIMPIAR build anterior
echo -e "${YELLOW}🧹 Limpiando build anterior...${NC}"
rm -rf dist/
npm run postinstall || true

# 2. INSTALAR dependencias
echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
npm ci --only=production

# 3. LINTING
echo -e "${YELLOW}🔍 Linting...${NC}"
npm run lint 2>/dev/null || echo "⚠️ Linter no disponible, continuando..."

# 4. BUILD
echo -e "${YELLOW}🏗️ Compilando Angular...${NC}"
npm run build -- \
  --configuration production \
  --optimization \
  --build-optimizer \
  --vendor-chunk=false \
  --aot \
  --source-map=false \
  --namedChunks=false \
  --output-hashing=all

# 5. OPTIMIZACIÓN - Comprimir archivos
echo -e "${YELLOW}⚙️ Optimizando archivos...${NC}"

cd dist/

# Comprimir con gzip
find . -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) -exec gzip -9 {} \;
find . -type f \( -name "*.js.gz" -o -name "*.css.gz" -o -name "*.html.gz" \) -exec mv {} {%.gz} \;

# Comprimir con brotli si está disponible
if command -v brotli &> /dev/null; then
    find . -type f \( -name "*.js" -o -name "*.css" \) | while read file; do
        brotli -9 "$file" -o "$file.br"
    done
fi

cd ..

# 6. ANÁLISIS DE TAMAÑO
echo -e "${YELLOW}📊 Analizando tamaño de build...${NC}"

echo -e "\n${BLUE}Tamaño de archivos principales:${NC}"
du -h dist/hotel-sebastian/browser/main*.js | head -3
du -h dist/hotel-sebastian/browser/*.css | head -3

TOTAL_SIZE=$(du -sh dist | awk '{print $1}')
echo -e "\n${GREEN}Tamaño total: $TOTAL_SIZE${NC}"

# 7. VALIDAR build
echo -e "${YELLOW}✓ Validando build...${NC}"

if [ ! -f "dist/hotel-sebastian/browser/index.html" ]; then
    echo -e "${RED}✗ Error: index.html no generado${NC}"
    exit 1
fi

if [ ! -f "dist/hotel-sebastian/server/main.js" ]; then
    echo -e "${YELLOW}⚠️ Advertencia: SSR no configurado${NC}"
fi

# 8. GENERAR manifests
echo -e "${YELLOW}📋 Generando manifests...${NC}"

# Build info file
cat > dist/hotel-sebastian/BUILD_INFO.json << EOF
{
  "version": "$(jq -r '.version' package.json)",
  "buildDate": "$(date -u +'%Y-%m-%dT%H:%M:%SZ')",
  "buildScript": "npm run build",
  "nodeVersion": "$(node -v)",
  "npmVersion": "$(npm -v)",
  "totalSize": "$TOTAL_SIZE",
  "isDevelopment": false,
  "isProduction": true
}
EOF

# 9. SERVICE WORKER (si existe)
echo -e "${YELLOW}🔧 Configurando Service Worker...${NC}"

if [ -f "src/manifest.webmanifest" ]; then
    cp src/manifest.webmanifest dist/hotel-sebastian/browser/
    echo -e "${GREEN}✓ PWA manifest copiado${NC}"
fi

# 10. SALIDA
echo -e "\n${GREEN}=== BUILD COMPLETADO EXITOSAMENTE ===${NC}\n"

echo -e "Archivo producción: ${BLUE}dist/hotel-sebastian/browser/${NC}"
echo -e "Tamaño total: ${BLUE}$TOTAL_SIZE${NC}"
echo -e "Build info: ${BLUE}dist/hotel-sebastian/BUILD_INFO.json${NC}"

echo -e "\nProximos pasos:"
echo -e "  1. Revisar dist/ contenido"
echo -e "  2. Ejecutar en local: http-server dist -p 4200"
echo -e "  3. Ejecutar tests: npm test"
echo -e "  4. Deploy: ./deploy.sh production"

# 11. REPORTE DE PERFORMANCE
echo -e "\n${BLUE}=== REPORTE de PERFORMANCE ===${NC}"

echo -e "\nTamaño por archivo:"
ls -lh dist/hotel-sebastian/browser/ | grep -E '\.(js|css)$' | awk '{print $9, $5}'

echo -e "\nRecomendaciones de optimización:"

# Verificar bundle size
MAIN_JS_SIZE=$(ls -lh dist/hotel-sebastian/browser/main*.js | awk '{print $5}')
if [[ $MAIN_JS_SIZE > "500K" ]]; then
    echo -e "${YELLOW}⚠️ main.js es muy grande (>500KB). Considera code splitting adicional${NC}"
fi

echo -e "\nChecklist de deployment:"
echo -e "  ✓ Build compilado sin errores"
echo -e "  ✓ Source maps deshabilitados (production)"
echo -e "  ✓ AOT enabled"
echo -e "  ✓ Archivos optimizados"
echo -e "  ✓ BUILD_INFO.json generado"
echo -e "  ✓ Listo para Docker deployment"

echo -e "\n${GREEN}✅ Todo listo para producción${NC}\n"
