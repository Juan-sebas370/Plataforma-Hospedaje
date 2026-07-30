# 🚀 Guía Completa: Qué Hacer Ahora

## 📋 Índice
1. [Quick Start (5 minutos)](#quick-start)
2. [Ejecutar Tests Automáticos (15 minutos)](#tests-automáticos)
3. [Ambientes Múltiples (10 minutos)](#ambientes)
4. [Automatización con Scripts (20 minutos)](#automatización)
5. [Generar Reportes (10 minutos)](#reportes)
6. [CI/CD Pipeline (30 minutos)](#cicd)

---

## <a name="quick-start"></a>⚡ Quick Start (5 minutos)

### Paso 1: Importar en Postman

```bash
# En tu carpeta backend/:
1. Abre Postman
2. Click "Import" (esquina superior izquierda)
3. Selecciona los 5 archivos:
   - Hospedaje_Sebastian_API_v2.postman_collection.json
   - Hospedaje_Sebastian_Environment.postman_environment.json
   - Hospedaje_Sebastian_Staging.postman_environment.json
   - Hospedaje_Sebastian_Production.postman_environment.json
   - Hospedaje_Sebastian_Globals.postman_globals.json
```

### Paso 2: Seleccionar Entorno

```
En Postman:
- Arriba a la derecha, hay un dropdown de "Ambientes"
- Selecciona "🟢 Hospedaje Sebastian - Local"
```

### Paso 3: Ejecutar Login

```
1. Navega a: 🔐 Autenticación → 🔑 Login
2. Click "Send"
3. Verifica que obtengas un token JWT ✅
4. Token se guarda automáticamente en {{authToken}}
```

### Paso 4: Probar Endpoint

```
1. Navega a: 💚 Health Check → ❤️ Health Check
2. Click "Send"
3. Verifica que obtengas respuesta exitosa ✅
```

✅ **¡Listo! Ya tienes Postman funcionando**

---

## <a name="tests-automáticos"></a>🧪 Ejecutar Tests Automáticos (15 minutos)

### Opción 1: Postman GUI (Recomendado para principiantes)

```
1. En Postman, click derecho en la colección
2. Selecciona "Run collection"
3. En la ventana que aparece:
   - Selecciona todos los requests
   - Delay entre requests: 500ms
   - Timeout: 5000ms
4. Click "Run Hospedaje Sebastian API"
5. Observa los tests ejecutándose ✅
6. Al terminar, revisa:
   - ✅ Total de requests pasados
   - ✅ Total de tests exitosos
   - ✅ Tiempo de respuesta
```

### Opción 2: Newman CLI (Recomendado para automatización)

#### Instalación
```bash
npm install -g newman
```

#### Ejecutar Tests Locales
```bash
cd "c:\Users\JUAN SEBASTIAN\OneDrive\Desktop\Hotel Sebastian\backend"

# Tests en LOCAL
newman run Hospedaje_Sebastian_API_v2.postman_collection.json \
  -e Hospedaje_Sebastian_Environment.postman_environment.json \
  --reporters cli,json,html \
  --reporter-html-export report.html
```

#### Ejecutar Tests en Staging
```bash
newman run Hospedaje_Sebastian_API_v2.postman_collection.json \
  -e Hospedaje_Sebastian_Staging.postman_environment.json \
  --reporters cli,json,html \
  --reporter-html-export staging-report.html
```

#### Resultados
- Se crea: `report.html` 📊
- Abre en navegador para ver resultados detallados

---

## <a name="ambientes"></a>🌍 Trabajar con Múltiples Ambientes (10 minutos)

### 🟢 Local (Desarrollo)
```
Archivo: Hospedaje_Sebastian_Environment.postman_environment.json
URL Base: http://localhost:3000/api
Propósito: Desarrollo y pruebas locales
Estado: ✅ Activo

Uso:
1. Selecciona entorno "Local" en Postman
2. Ejecuta requests normalmente
3. Ideal para debugging
```

### 🟡 Staging (Pruebas)
```
Archivo: Hospedaje_Sebastian_Staging.postman_environment.json
URL Base: https://staging-api.hospedaje-sebastian.com/api
Propósito: Pruebas previas a producción
Estado: ⏳ Configurar URL

Uso:
1. Selecciona entorno "Staging" en Postman
2. Ejecuta requests igual que Local
3. Simula entorno de producción
```

### 🔴 Production (Producción)
```
Archivo: Hospedaje_Sebastian_Production.postman_environment.json
URL Base: https://api.hospedaje-sebastian.com/api
Propósito: Entorno real (⚠️ CUIDADO)
Estado: 🔒 Restringido

Advertencias:
- ⚠️ SOLO para usuarios autorizados
- ⚠️ NO ejecutar requests de escritura (POST, PUT, DELETE)
- ✅ Solo GET para lectura y validación
```

### Cambiar Entorno en Postman

```
1. Arriba a la derecha → Dropdown "Ambientes"
2. Selecciona el deseado
3. Variables se cargan automáticamente
4. Todos los placeholders {{variable}} se reemplazan
```

---

## <a name="automatización"></a>🤖 Automatización con Scripts (20 minutos)

### Windows

```bash
# 1. Abre PowerShell en la carpeta backend/
cd "c:\Users\JUAN SEBASTIAN\OneDrive\Desktop\Hotel Sebastian\backend"

# 2. Ejecuta el script
.\run-tests.bat

# Resultado:
# - Se crean reportes en: test-reports/TIMESTAMP/
# - Se abrirá automáticamente HTML report
```

### Linux / Mac

```bash
# 1. Navega a la carpeta backend/
cd "~/Desktop/Hotel Sebastian/backend"

# 2. Dale permisos de ejecución
chmod +x run-tests.sh

# 3. Ejecuta el script
./run-tests.sh

# Resultado:
# - Se crean reportes en: test-reports/TIMESTAMP/
# - Se abrirá automáticamente en navegador
```

### Node.js Script (Avanzado)

```bash
# Instalar dependencias de testing
npm install -g newman newman-reporter-htmlextra

# Ejecutar suite de tests
node run-tests.js

# Resultado:
# - Reportes HTML, JSON, CSV
# - Métricas de rendimiento
# - Notificaciones automáticas
```

---

## <a name="reportes"></a>📈 Generar Reportes (10 minutos)

### Reporte HTTP Básico
```bash
newman run Hospedaje_Sebastian_API_v2.postman_collection.json \
  -e Hospedaje_Sebastian_Environment.postman_environment.json \
  --reporters html \
  --reporter-html-export my-report.html
```

### Reporte con Extra Features
```bash
newman run Hospedaje_Sebastian_API_v2.postman_collection.json \
  -e Hospedaje_Sebastian_Environment.postman_environment.json \
  --reporters cli,json,html \
  --reporter-json-export results.json \
  --reporter-html-export report.html
```

### Estructura de Reportes
```
test-reports/
├── 20260226_225300/
│   ├── local-report.html      ← Abre esto en navegador
│   ├── local-results.json      ← Datos en JSON
│   ├── staging-report.html
│   ├── staging-results.json
│   └── consolidated-report.html ← Reporte final
```

### Ver Reportes
```bash
# Windows
start my-report.html

# Mac
open my-report.html

# Linux
xdg-open my-report.html
```

---

## <a name="cicd"></a>🔄 CI/CD Pipeline (30 minutos)

### GitHub Actions (Automatización en la nube)

Crea archivo: `.github/workflows/api-tests.yml`

```yaml
name: 🏨 API Testing

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 9 * * *'  # Diario a las 9 AM

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Newman
        run: npm install -g newman
      
      - name: Run Tests
        run: |
          newman run ./Hospedaje_Sebastian_API_v2.postman_collection.json \
            -e ./Hospedaje_Sebastian_Environment.postman_environment.json \
            --reporters cli,json \
            --reporter-json-export results.json
      
      - name: Upload Results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: results.json
      
      - name: Comment PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ Tests de API pasados\n📊 [Ver Detalles](https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }})'
            })
```

### Azure DevOps Pipeline

Crea archivo: `azure-pipelines.yml`

```yaml
trigger:
  - main
  - develop

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '18.x'
  
  - script: npm install -g newman
    displayName: 'Install Newman'
  
  - script: |
      newman run ./Hospedaje_Sebastian_API_v2.postman_collection.json \
        -e ./Hospedaje_Sebastian_Environment.postman_environment.json \
        --reporters cli,junit \
        --reporter-junit-export test-results.xml
    displayName: 'Run API Tests'
  
  - task: PublishTestResults@2
    condition: succeededOrFailed()
    inputs:
      testResultsFormat: 'JUnit'
      testResultsFiles: '**/test-results.xml'
```

### Jenkins Pipeline

Crear: `Jenkinsfile`

```groovy
pipeline {
    agent any
    
    stages {
        stage('Prepare') {
            steps {
                sh 'npm install -g newman'
            }
        }
        
        stage('Test') {
            steps {
                sh '''
                    newman run ./Hospedaje_Sebastian_API_v2.postman_collection.json \
                      -e ./Hospedaje_Sebastian_Environment.postman_environment.json \
                      --reporters json,html \
                      --reporter-json-export results.json \
                      --reporter-html-export report.html
                '''
            }
        }
        
        stage('Publish') {
            steps {
                publishHTML([
                    reportDir: '.',
                    reportFiles: 'report.html',
                    reportName: 'API Test Report'
                ])
            }
        }
    }
}
```

---

## 📊 Checklist de Implementación

- [ ] Importar colección de Postman
- [ ] Importar 4 archivos de entorno
- [ ] Ejecutar Login para verificar autenticación
- [ ] Ejecutar Health Check
- [ ] Ejecutar Collection Runner en Postman
- [ ] Instalar Newman globalmente
- [ ] Ejecutar tests desde CLI
- [ ] Generar reportes HTML
- [ ] Revisar reportes en navegador
- [ ] Configurar scripts (Windows/Linux)
- [ ] Ejecutar scripts de automatización
- [ ] Validar ambientes múltiples
- [ ] Configurar CI/CD en GitHub/Azure/Jenkins
- [ ] Programar ejecuciones automáticas

---

## 🎯 Paso a Paso: Flujo Completo

### Para Desarrollador (Tú Ahora)

```bash
# 1. Abre Terminal/PowerShell en: backend/
cd "c:\Users\JUAN SEBASTIAN\OneDrive\Desktop\Hotel Sebastian\backend"

# 2. Instala Newman
npm install -g newman

# 3. Ejecuta tests en local
newman run Hospedaje_Sebastian_API_v2.postman_collection.json \
  -e Hospedaje_Sebastian_Environment.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export test-report.html

# 4. Abre el reporte
start test-report.html
```

### Para DevOps (Pipeline)

```bash
# 1. Sube cambios a GitHub
git push origin feature/api-tests

# 2. GitHub Actions automáticamente:
#    ✅ Ejecuta tests
#    ✅ Genera reportes
#    ✅ Comenta en el PR

# 3. Si todos pasan, merge automático

# 4. Deploy automático a staging
```

---

## 🔧 Troubleshooting

### Newman no está instalado
```bash
npm install -g newman
newman --version  # Debe mostrar versión
```

### Error: "Cannot find module"
```bash
npm install -g newman newman-reporter-htmlextra
```

### Tests fallan en staging
```bash
# Verifica que la URL sea correcta
# Ingresa credenciales válidas de staging
# Revisa logs: newman run ... --verbose
```

### Reportes no se generan
```bash
# Verifica permisos de carpeta
# Asegúrate que el comando completo es correcto
# Revisa que Newman esté instalado: newman --version
```

---

## 📚 Recursos Adicionales

- **Documentación Postman**: https://learning.postman.com
- **Documentación Newman**: https://www.npmjs.com/package/newman
- **GitHub Actions**: https://docs.github.com/en/actions
- **API Backend**: `backend/README.md`

---

## 🎉 ¡Siguiente Paso!

Ahora que tienes todo configurado:

1. **Ejecuta los tests** siguiendo los pasos arriba
2. **Genera reportes** para documentar
3. **Configura CI/CD** para automatización
4. **Conecta Frontend** con la API de Backend
5. **Despliega a Producción** cuando esté todo listo

**¡Felicitaciones por tener una suite de testing profesional! 🚀**

---

**Última actualización:** 26 de febrero de 2026  
**Archivo:** `POSTMAN_COMPLETE_GUIDE.md`
