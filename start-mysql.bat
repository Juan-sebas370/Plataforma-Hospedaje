@echo off
echo ============================================
echo  Starting MySQL Database for Hotel Sebastian
echo ============================================
echo.

cd backend

echo [1/2] Starting MySQL container...
docker-compose up -d mysql

echo.
echo [2/2] Waiting for MySQL to be ready...
timeout /t 10 /nobreak >nul

echo.
echo ============================================
echo  MySQL Started Successfully!
echo ============================================
echo.
echo Database Info:
echo   Host: localhost
echo   Port: 3306
echo   Database: hospedaje_db
echo   User: hospedaje_user
echo   Password: hospedaje_pass
echo   Root Password: root123
echo.
echo To stop MySQL: docker-compose down
echo To view logs: docker-compose logs mysql
echo ============================================

cd ..
