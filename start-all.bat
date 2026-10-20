@echo off
echo ==========================================
echo HOSPEDAJE SEBASTIAN - Inicio Completo
echo ==========================================
echo.
echo Iniciando servicios en orden:
echo 1. Backend Spring Boot (puerto 8080)
echo 2. Frontend Angular (puerto 4200)
echo.
echo Cada servicio se abrira en una ventana separada
echo.
pause

REM 1. Iniciar Backend
echo [1/2] Iniciando Backend...
start "Backend API - Puerto 8080" cmd /k "cd /d %~dp0 && start-backend.bat"
timeout /t 10 /nobreak

REM 2. Iniciar Frontend
echo [2/2] Iniciando Frontend...
start "Frontend - Puerto 4200" cmd /k "cd /d %~dp0\frontend && npm start"

echo.
echo ==========================================
echo Todos los servicios estan iniciando...
echo ==========================================
echo.
echo Backend:  ventana "Backend API - Puerto 8080"
echo          http://localhost:8080/api
echo Frontend: ventana "Frontend - Puerto 4200"
echo          http://localhost:4200
echo.
echo Espera unos segundos y abre http://localhost:4200
echo.
pause
