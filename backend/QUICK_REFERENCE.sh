#!/usr/bin/env bash
# POSTMAN QUICK REFERENCE CHEAT SHEET
# Hospedaje Sebastian API v2

echo "
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║     🏨 HOSPEDAJE SEBASTIAN - POSTMAN QUICK REFERENCE SHEET       ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
"

echo "
📚 ARCHIVOS PRINCIPALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 COLECCIÓN API:
   Hospedaje_Sebastian_API_v2.postman_collection.json

🌍 AMBIENTES:
   • Hospedaje_Sebastian_Environment.postman_environment.json      (Local)
   • Hospedaje_Sebastian_Staging.postman_environment.json         (Staging)
   • Hospedaje_Sebastian_Production.postman_environment.json      (Prod)
   • Hospedaje_Sebastian_Globals.postman_globals.json             (Global)

🤖 SCRIPTS:
   • run-tests.bat      (Windows)
   • run-tests.sh       (Linux/Mac)
   • run-tests.js       (Node.js)

📖 DOCUMENTACIÓN:
   • INICIO_POSTMAN.md  (EMPIEZA AQUÍ)
   • POSTMAN_SUMMARY.md (Resumen 5 min)
   • POSTMAN_GUIDE.md   (Guía 10 min)
   • POSTMAN_COMPLETE_GUIDE.md (Guía 30+ min)
   • FILE_INDEX.md      (Índice detallado)
"

echo "
🚀 COMANDOS RÁPIDOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 INSTALAR NEWMAN (una sola vez):
   npm install -g newman
   npm install -g newman-reporter-htmlextra

📌 EJECUTAR TESTS (Local):
   newman run Hospedaje_Sebastian_API_v2.postman_collection.json \\
     -e Hospedaje_Sebastian_Environment.postman_environment.json

📌 EJECUTAR TESTS (Staging):
   newman run Hospedaje_Sebastian_API_v2.postman_collection.json \\
     -e Hospedaje_Sebastian_Staging.postman_environment.json

📌 EJECUTAR TESTS (Production):
   newman run Hospedaje_Sebastian_API_v2.postman_collection.json \\
     -e Hospedaje_Sebastian_Production.postman_environment.json

📌 GENERAR REPORTE HTML:
   newman run collection.json -e environment.json \\
     --reporters html \\
     --reporter-html-export report.html

📌 GENERAR REPORTES MÚLTIPLES:
   newman run collection.json -e environment.json \\
     --reporters cli,json,html \\
     --reporter-json-export report.json \\
     --reporter-html-export report.html

📌 SCRIPT WINDOWS (automático):
   .\\run-tests.bat

📌 SCRIPT MAC/LINUX (automático):
   bash run-tests.sh

📌 SCRIPT NODE.JS (avanzado):
   node run-tests.js
"

echo "
🌐 URLS POR AMBIENTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 LOCAL:
   Base URL: http://localhost:3000/api
   Timeout: 5000ms
   Ambiente: Desarrollo

🟡 STAGING:
   Base URL: https://staging-api.hospedaje-sebastian.com/api
   Timeout: 5000ms
   Ambiente: QA/Integración

🔴 PRODUCTION:
   Base URL: https://api.hospedaje-sebastian.com/api
   Timeout: 10000ms
   Ambiente: Servidor en vivo

🌐 GLOBALS:
   Compartido entre todos los ambientes
   Variables: appName, version, buildNumber, etc.
"

echo "
🔐 AUTENTICACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 CREDENCIALES POR DEFECTO:
   Email:    admin@hotel.com
   Password: admin123

🔑 HEADER REQUERIDO:
   Authorization: Bearer {{authToken}}

💾 TOKEN SE GUARDA AUTOMÁTICAMENTE:
   Login endpoint → Extrae token
   Lo guarda en: {{authToken}}
   Lo usan: Todos los otros endpoints

⏱️  EXPIRACIÓN:
   Token expira en: 3600 segundos (1 hora)
"

echo "
📊 ENDPOINTS POR CATEGORÍA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💚 HEALTH CHECK (2)
   GET  /health
   GET  /api/status

🔐 AUTENTICACIÓN (5)
   POST /auth/login
   POST /auth/register
   POST /auth/refresh
   POST /auth/logout
   GET  /auth/me

🛏️  HABITACIONES (6)
   GET    /habitaciones
   GET    /habitaciones/:id
   POST   /habitaciones
   PUT    /habitaciones/:id
   DELETE /habitaciones/:id
   GET    /habitaciones/disponibles

📅 RESERVAS (7)
   GET    /reservas
   GET    /reservas/:id
   POST   /reservas
   PUT    /reservas/:id
   DELETE /reservas/:id
   GET    /reservas/usuario/:userId
   POST   /reservas/confirmar

👥 USUARIOS (4)
   GET    /usuarios
   GET    /usuarios/:id
   PUT    /usuarios/:id
   DELETE /usuarios/:id

💳 PAGOS (3)
   POST   /pagos
   GET    /pagos/:id
   PUT    /pagos/:id/estado

💬 CHAT SOPORTE (3)
   GET    /soporte/mensajes
   POST   /soporte/mensaje
   GET    /soporte/ticket/:id
"

echo "
🔄 FLUJO TÍPICO DE PRUEBA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  HEALTH CHECK
    GET /api/health
    ✅ Verifica que server esté corriendo

2️⃣  LOGIN
    POST /auth/login
    📥 Email + Password
    📤 Token (se guarda automáticamente)

3️⃣  GET USUARIO LOGUEADO
    GET /auth/me
    📤 Datos del usuario actual

4️⃣  GET HABITACIONES
    GET /habitaciones
    📤 Lista de todas las habitaciones

5️⃣  CREAR RESERVA
    POST /reservas
    📥 habitacionId, fechaIngreso, fechaSalida
    📤 ID de reserva (se guarda automáticamente)

6️⃣  CONFIRMAR RESERVA
    POST /reservas/confirmar
    📥 reservaId, codigoConfirmacion
    📤 Confirmación

7️⃣  PROCESAR PAGO
    POST /pagos
    📥 reservaId, monto, método
    📤 ID de pago

8️⃣  VERIFICAR PAGO
    GET /pagos/:id
    📤 Estado del pago
"

echo "
📝 VARIABLES DISPONIBLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔒 AUTENTICACIÓN:
   {{authToken}}              ← Token JWT (guardado por Login)
   {{userId}}                 ← ID del usuario (guardado por Login)

🛏️  HABITACIONES:
   {{habitacionId}}           ← ID creado por habitación
   {{codigoHabitacion}}       ← Código de referencia

📅 RESERVAS:
   {{reservaId}}              ← ID de reserva (guardado por POST)
   {{codigoConfirmacion}}     ← Código de confirmación
   {{fechaIngreso}}           ← Fecha calculada (+7 días)
   {{fechaSalida}}            ← Fecha calculada (+14 días)

💳 PAGOS:
   {{pagoId}}                 ← ID del pago
   {{monto}}                  ← Monto en USD
   {{metodoPago}}             ← Método de pago (tarjeta, etc)

👤 USUARIOS:
   {{nuevoUsuarioId}}         ← ID usuario creado
   {{emailPrueba}}            ← Email de prueba
   {{passwordPrueba}}         ← Password de prueba

📱 DINÁMICAS (Postman genera automáticamente):
   {{$randomEmail}}           → email@example.com
   {{$randomFirstName}}       → Nombre aleatorio
   {{$randomLastName}}        → Apellido aleatorio
   {{$randomPhoneNumber}}     → +1 234 567 8900
   {{$randomInt}}             → Número entero
   {{$randomPrice}}           → \$42.50
"

echo "
🎯 VARIABLES POR CARPETA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💚 HEALTH CHECK:
   NO REQUIERE variables

🔐 AUTENTICACIÓN:
   PRE-REQUEST: Calcula fecha
   POST-TEST:   Guarda {{authToken}}, {{userId}}

🛏️  HABITACIONES:
   USES: {{authToken}}
   SAVES: {{habitacionId}}

📅 RESERVAS:
   USES: {{authToken}}, {{habitacionId}}, {{fechaIngreso}}, {{fechaSalida}}
   SAVES: {{reservaId}}, {{codigoConfirmacion}}

👥 USUARIOS:
   USES: {{authToken}}, {{userId}}
   SAVES: {{nuevoUsuarioId}}

💳 PAGOS:
   USES: {{authToken}}, {{reservaId}}, {{monto}}
   SAVES: {{pagoId}}

💬 CHAT:
   USES: {{authToken}}, {{userId}}
   SAVES: {{ticketId}}
"

echo "
⚠️  PRE-REQUISITOS ANTES DE EJECUTAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Backend está corriendo en http://localhost:3000
   Verifica con: curl http://localhost:3000/api/health

✅ Base de datos está configurada
   Necesaria para guardar datos

✅ Usuario de prueba existe:
   Email: admin@hotel.com
   Password: admin123

✅ Postman está instalado:
   Descargar en: https://www.postman.com/downloads/

✅ Newman instalado (para CLI):
   npm install -g newman

✅ Internet está disponible
   Para requests a staging/production
"

echo "
🐛 TROUBLESHOOTING RÁPIDO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ PROBLEMA: 'Cannot connect to localhost:3000'
   ✅ SOLUCIÓN: Verifica que backend esté corriendo
               Ejecuta: npm start (en carpeta backend)

❌ PROBLEMA: '401 Unauthorized'
   ✅ SOLUCIÓN: Ejecuta Login primero para obtener token

❌ PROBLEMA: 'Token is invalid or expired'
   ✅ SOLUCIÓN: Ejecuta Login de nuevo

❌ PROBLEMA: 'Reservation date is in the past'
   ✅ SOLUCIÓN: Usa fechas futuras (script calcula automáticamente)

❌ PROBLEMA: 'Room is not available'
   ✅ SOLUCIÓN: Verifica disponibilidad con GET /habitaciones/disponibles

❌ PROBLEMA: 'Script run-tests.bat no funciona'
   ✅ SOLUCIÓN: Abre PowerShell como Admin

❌ PROBLEMA: 'Script run-tests.sh no funciona'
   ✅ SOLUCIÓN: chmod +x run-tests.sh

❌ PROBLEMA: 'Newman command not found'
   ✅ SOLUCIÓN: npm install -g newman

❌ PROBLEMA: 'Reporte no se abre'
   ✅ SOLUCIÓN: Abre manualmente: test-reports/latest/report.html
"

echo "
💡 TIPS Y TRUCOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 TIP 1: Guardar variables en post-test
   pm.environment.set('variableName', response.data.id);

💡 TIP 2: Usar variables en requests
   {{variableName}}

💡 TIP 3: Limpiar variables antes de tests
   pm.environment.clear();

💡 TIP 4: Ejecutar solo una carpeta
   newman run collection.json --folder '🔐 Autenticación'

💡 TIP 5: Añadir delay entre requests
   newman run collection.json --delay 1000

💡 TIP 6: Ver logs detallados
   newman run collection.json --verbose

💡 TIP 7: Exportar a archivo
   newman run collection.json > test-output.txt

💡 TIP 8: Comparar dos colecciones
   Descargar ambas versiones y comparar JSON
"

echo "
📚 ORDEN DE LECTURA RECOMENDADO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  Este archivo (QUICK_REFERENCE.sh)        ⏱️ 3 min
2️⃣  POSTMAN_SUMMARY.md                       ⏱️ 5 min
3️⃣  POSTMAN_GUIDE.md                         ⏱️ 10 min
4️⃣  POSTMAN_COMPLETE_GUIDE.md                ⏱️ 30 min
5️⃣  FILE_INDEX.md (como referencia)          ⏱️ 10 min

Total: ~1 hora para dominar todo
"

echo "
✨ RESUMEN FINAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 30 Endpoints documentados
✅ 80+ Tests automáticos
✅ 4 Ambientes configurados
✅ 3 Scripts de automatización
✅ Reportes HTML/JSON
✅ 3000+ líneas de documentación
✅ Ready para CI/CD

🎯 PRÓXIMO PASO:
   1. Importa colección en Postman
   2. Ejecuta Health Check
   3. Ejecuta Login
   4. ¡Listo! Todos los tests disponibles

═════════════════════════════════════════════════════════════════════

Versión: 2.0.0 | Fecha: Febrero 2026 | Status: ✅ LISTO

═════════════════════════════════════════════════════════════════════
"
