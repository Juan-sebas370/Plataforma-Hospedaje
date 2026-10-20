# Liberar el puerto 4200 si ya está en uso
$proceso = Get-NetTCPConnection -LocalPort 4200 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($proceso) {
    Write-Host "Puerto 4200 ocupado por PID $proceso. Liberando..." -ForegroundColor Yellow
    Stop-Process -Id $proceso -Force
    Start-Sleep -Seconds 1
}

Write-Host "Iniciando frontend Angular en http://localhost:4200" -ForegroundColor Green
ng serve --port 4200
