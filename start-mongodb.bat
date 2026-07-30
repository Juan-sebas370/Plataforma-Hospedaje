@echo off
echo ==========================================
echo Iniciando MongoDB
echo ==========================================
echo.

REM Verificar si existe el directorio de datos
if not exist "C:\data\db" (
    echo Creando directorio C:\data\db...
    mkdir "C:\data\db"
)

echo Iniciando MongoDB en localhost:27017...
echo Presiona Ctrl+C para detener MongoDB
echo.

REM Intentar iniciar mongod
mongod --dbpath "C:\data\db"

if errorlevel 1 (
    echo.
    echo ERROR: No se pudo iniciar MongoDB
    echo.
    echo Posibles soluciones:
    echo 1. Verifica que MongoDB este instalado
    echo 2. Agrega MongoDB al PATH de Windows
    echo 3. O ejecuta: "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath "C:\data\db"
    echo.
    pause
)
