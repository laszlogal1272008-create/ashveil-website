@echo off
echo Starting Ashveil Backend Server...
cd /d "C:\Users\laszl\my-website\backend"

:: Kill any existing node processes to prevent conflicts
taskkill /f /im node.exe >nul 2>&1

:: Wait a moment
timeout /t 2 /nobreak >nul

:: Start PM2 daemon if not running
pm2 ping >nul 2>&1
if errorlevel 1 (
    echo Starting PM2 daemon...
    pm2 resurrect
)

:: Start the backend service
echo Starting Ashveil Backend...
pm2 start ecosystem.config.js

:: Show status
pm2 status

echo.
echo ========================================
echo   Ashveil Backend is now running 24/7!
echo   Website: https://ashveil.live
echo   RCON: 45.45.238.134:16007
echo ========================================
echo.

pause