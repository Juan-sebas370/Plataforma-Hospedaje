@echo off
setlocal EnableExtensions
echo ==========================================
echo Verificando MySQL y Backend
echo ==========================================
echo.

set "ENV_FILE=%~dp0backend\.env"
if exist "%ENV_FILE%" (
    for /f "usebackq eol=# tokens=1,* delims==" %%A in ("%ENV_FILE%") do (
		if "%%A"=="DB_PASSWORD" if "%DB_PASSWORD%"=="" if not "%%B"=="" set "DB_PASSWORD=%%B"
		if "%%A"=="JWT_SECRET" if "%JWT_SECRET%"=="" if not "%%B"=="" set "JWT_SECRET=%%B"
    )
)

if "%DB_PASSWORD%"=="" (
	echo ERROR: Define DB_PASSWORD en backend\.env o en PowerShell.
	pause
	exit /b 1
)
if "%JWT_SECRET%"=="" (
	echo ERROR: Define JWT_SECRET en backend\.env o en PowerShell.
	pause
	exit /b 1
)
if "%JWT_SECRET%"=="replace-with-a-long-random-secret" (
	echo ERROR: Sustituye el JWT_SECRET de ejemplo por una clave real.
	pause
	exit /b 1
)
if "%JWT_SECRET:~63,1%"=="" (
	echo ERROR: JWT_SECRET debe tener al menos 64 caracteres.
	pause
	exit /b 1
)

echo.
echo [1/2] Compilando backend...
cd backend
call mvn clean install -q

echo.
echo [2/2] Iniciando backend en http://localhost:8080...
echo.
java -jar target/hospedaje-sebastian-1.0.0.jar
