@echo off
REM 🏨 Script de Testing Automático - Hospedaje Sebastian API (Windows)
REM Ejecuta la colección de Postman con Newman

setlocal enabledelayedexpansion

REM 🎨 Colores
cls
echo.
echo ============================================================
echo   🏨  HOSPEDAJE SEBASTIAN - SUITE DE TESTING AUTOMÁTICO
echo ============================================================
echo.

REM Verificar si Newman está instalado
where newman >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Newman no está instalado
    echo.
    echo Instálalo con: npm install -g newman
    pause
    exit /b 1
)

REM Crear directorio de reportes
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set timestamp=!mydate!!mytime!
set reportDir=test-reports\!timestamp!

if not exist !reportDir! mkdir !reportDir!

echo 📁 Reportes en: %cd%\!reportDir!
echo.

REM 🟢 TESTS EN LOCAL
echo ======================================================
echo   🟢 CORRIENDO TESTS EN LOCAL
echo ======================================================
echo.

newman run Hospedaje_Sebastian_API_v2.postman_collection.json ^
  -e Hospedaje_Sebastian_Environment.postman_environment.json ^
  --reporters cli,json,html ^
  --reporter-json-export !reportDir!\local-results.json ^
  --reporter-html-export !reportDir!\local-report.html ^
  --delay 500 ^
  --timeout 5000

if %ERRORLEVEL% EQU 0 (
    echo ✅ LOCAL completado exitosamente
) else (
    echo ❌ ERROR en LOCAL
)

echo.
echo ======================================================
echo   ✅ TESTING COMPLETADO
echo ======================================================
echo.
echo 📊 Abre los reportes en:
echo    !reportDir!\local-report.html
echo.
pause
