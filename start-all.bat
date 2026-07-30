@echo off
echo ==========================================
echo HOSPEDAJE SEBASTIAN - Inicio Completo
echo ==========================================
echo.
echo Iniciando servicios en orden:
echo 1. MongoDB
echo 2. Backend (puerto 3000)
echo 3. Frontend (puerto 4200)
echo.
echo Cada servicio se abrira en una ventana separada
echo.
pause

REM 1. Iniciar MongoDB
echo [1/3] Iniciando MongoDB...
start "MongoDB - Hospedaje Sebastian" cmd /k "cd /d %~dp0 && start-mongodb.bat"
timeout /t 5 /nobreak

REM 2. Iniciar Backend
echo [2/3] Iniciando Backend...
start "Backend API - Puerto 3000" cmd /k "cd /d %~dp0 && start-backend.bat"
timeout /t 10 /nobreak

REM 3. Iniciar Frontend
echo [3/3] Iniciando Frontend...
start "Frontend - Puerto 4200" cmd /k "cd /d %~dp0\frontend && npm start"

echo.
echo ==========================================
echo Todos los servicios estan iniciando...
echo ==========================================
echo.
echo MongoDB:  ventana "MongoDB - Hospedaje Sebastian"
echo Backend:  ventana "Backend API - Puerto 3000"
echo          http://localhost:3000/api
echo Frontend: ventana "Frontend - Puerto 4200"
echo          http://localhost:4200
echo.
echo Espera unos segundos y abre http://localhost:4200
echo.
pause
