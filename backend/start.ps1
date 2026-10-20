# Carga las variables de entorno locales desde .env.local (ignorado por git).
# La primera vez genera un JWT_SECRET aleatorio y lo guarda ahí, en vez de usar
# una clave fija dentro del script (que quedaría expuesta en el repositorio).
$envLocalPath = Join-Path $PSScriptRoot ".env.local"

if (-not (Test-Path $envLocalPath)) {
    Write-Host "No se encontró .env.local, generando uno nuevo con un JWT_SECRET aleatorio..." -ForegroundColor Yellow
    $bytes = New-Object byte[] 48
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $rng.Dispose()
    $jwtSecret = [Convert]::ToBase64String($bytes)
    @(
        "JWT_SECRET=$jwtSecret"
        "DB_USERNAME=hotel_user"
        "DB_PASSWORD=hotel_password_123"
    ) | Set-Content -Path $envLocalPath
}

Get-Content $envLocalPath | ForEach-Object {
    if ($_ -match '^\s*([^#=][^=]*)=(.*)$') {
        [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
    }
}

# Liberar el puerto 8080 si ya está en uso
$proceso = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($proceso) {
    Write-Host "Puerto 8080 ocupado por PID $proceso. Liberando..." -ForegroundColor Yellow
    Stop-Process -Id $proceso -Force
    Start-Sleep -Seconds 1
}

Write-Host "Iniciando backend Spring Boot en http://localhost:8080/api" -ForegroundColor Green
mvn spring-boot:run
