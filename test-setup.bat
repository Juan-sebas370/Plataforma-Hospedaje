@echo off
REM Script para iniciar Backend y Frontend para pruebas

echo ====================================
echo Hospedaje Sebastian - Test Setup
echo ====================================
echo.

REM Verificar que estamos en la carpeta correcta
if not exist backend (
    echo Error: No se encuentra carpeta 'backend'
    pause
    exit /b 1
)

if not exist frontend (
    echo Error: No se encuentra carpeta 'frontend'
    pause
    exit /b 1
)

REM Compilar Backend
echo [1/4] Compilando Backend...
cd backend
call mvn clean install -q
if errorlevel 1 (
    echo Error en compilacion del Backend
    pause
    exit /b 1
)
cd ..

REM Iniciar Backend en background
echo [2/4] Iniciando Backend en http://localhost:3000...
start cmd /k "cd backend && java -jar target/hospedaje-sebastian-1.0.0.jar"

REM Esperar a que el backend este listo
echo [3/4] Esperando a que Backend este disponible...
timeout /t 5 /nobreak

REM Iniciar Frontend en background
echo [4/4] Iniciando Frontend en http://localhost:4200...
start cmd /k "cd frontend && npm start"

echo.
echo ====================================
echo Servicios iniciando...
echo ====================================
echo.
echo Backend: http://localhost:3000/api
echo Frontend: http://localhost:4200
echo.
echo Abre tu navegador cuando estes listo
pause
