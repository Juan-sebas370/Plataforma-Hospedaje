@echo off
echo ==========================================
echo Verificando MongoDB y Backend
echo ==========================================
echo.

REM Verificar si MongoDB esta corriendo
echo [1/3] Verificando MongoDB en localhost:27017...
powershell -Command "try { $client = New-Object System.Net.Sockets.TcpClient('localhost', 27017); $client.Close(); Write-Host 'MongoDB esta corriendo!' -ForegroundColor Green } catch { Write-Host 'ERROR: MongoDB NO esta corriendo' -ForegroundColor Red; Write-Host 'Por favor inicia MongoDB con: mongod --dbpath C:\data\db' -ForegroundColor Yellow; pause; exit 1 }"

echo.
echo [2/3] Compilando backend (si no esta actualizado)...
cd backend
call mvn clean install -q

echo.
echo [3/3] Iniciando backend en http://localhost:3000...
echo.
java -jar target/hospedaje-sebastian-1.0.0.jar
