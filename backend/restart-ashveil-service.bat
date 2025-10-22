@echo off
echo Restarting Ashveil Backend Service...
cd /d "C:\Users\laszl\my-website\backend"

:: Restart the service
pm2 restart ashveil-backend

:: Show status
pm2 status

echo.
echo ========================================
echo   Ashveil Backend restarted!
echo ========================================
echo.

pause