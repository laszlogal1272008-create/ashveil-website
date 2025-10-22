@echo off
echo Stopping Ashveil Backend Service...
cd /d "C:\Users\laszl\my-website\backend"

:: Stop the service
pm2 stop ashveil-backend

:: Show status
pm2 status

echo.
echo ========================================
echo   Ashveil Backend stopped.
echo ========================================
echo.

pause