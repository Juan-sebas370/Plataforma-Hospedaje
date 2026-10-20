@echo off
REM Script para iniciar el ambiente de desarrollo del backend Java

echo.
echo ========================================
echo   Hospedaje Sebastian - Backend Java
echo ========================================
echo.

REM Verificar si existe pom.xml
if not exist "pom.xml" (
    echo Error: Este script debe ejecutarse desde la carpeta backend
    pause
    exit /b 1
)

REM Mostrar menu
:menu
echo.
echo Selecciona una opcion:
echo 1. Compilar el proyecto
echo 2. Ejecutar la aplicacion
echo 3. Compilar y ejecutar
echo 4. Limpiar compilaciones
echo 5. Ver dependencias
echo 6. Salir
echo.

set /p choice="Ingresa el numero de la opcion: "

if "%choice%"=="1" (
    echo.
    echo Compilando proyecto...
    call mvn clean install
    pause
    goto menu
)

if "%choice%"=="2" (
    echo.
    echo Iniciando aplicacion (puerto 8080 por defecto, ver application.properties)...
    call mvn spring-boot:run
    pause
    goto menu
)

if "%choice%"=="3" (
    echo.
    echo Compilando y ejecutando...
    call mvn clean install spring-boot:run
    pause
    goto menu
)

if "%choice%"=="4" (
    echo.
    echo Limpiando compilaciones...
    call mvn clean
    echo Limpieza completada
    pause
    goto menu
)

if "%choice%"=="5" (
    echo.
    echo Dependencias del proyecto:
    call mvn dependency:tree
    pause
    goto menu
)

if "%choice%"=="6" (
    echo Hasta luego!
    exit /b 0
)

echo Opcion invalida
goto menu
