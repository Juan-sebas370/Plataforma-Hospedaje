@echo off
setlocal

set "SSL_DIR=%~dp0"
set "DOMAIN=%~1"
set "DAYS=%~2"

if "%DOMAIN%"=="" set "DOMAIN=localhost"
if "%DAYS%"=="" set "DAYS=365"

where openssl >nul 2>&1
if errorlevel 1 (
    echo Error: openssl no esta instalado o no esta en PATH.
    exit /b 1
)

echo Generando certificado autofirmado para %DOMAIN%

openssl req -x509 -nodes -newkey rsa:2048 ^
 -keyout "%SSL_DIR%privkey.pem" ^
 -out "%SSL_DIR%fullchain.pem" ^
 -days %DAYS% ^
 -subj "/CN=%DOMAIN%" ^
 -addext "subjectAltName=DNS:%DOMAIN%,DNS:localhost,IP:127.0.0.1"

if errorlevel 1 (
    echo Error al generar certificados.
    exit /b 1
)

echo Listo. Archivos creados:
echo - %SSL_DIR%fullchain.pem
echo - %SSL_DIR%privkey.pem
