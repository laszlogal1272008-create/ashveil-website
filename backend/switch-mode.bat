@echo off
echo.
echo ========================================
echo   ASHVEIL WEBSITE MODE SWITCHER
echo ========================================
echo.
echo Current Mode: DEVELOPMENT (Simulation)
echo.
echo Choose mode:
echo [1] Development Mode (Simulation - No RCON needed)
echo [2] Production Mode (Real RCON commands)
echo [3] Show current status
echo [4] Exit
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto dev_mode
if "%choice%"=="2" goto prod_mode
if "%choice%"=="3" goto show_status
if "%choice%"=="4" goto exit
goto invalid

:dev_mode
echo.
echo Switching to DEVELOPMENT MODE...
cd /d "C:\Users\laszl\my-website\backend"
pm2 stop ashveil-backend >nul 2>&1

:: Update config file for dev mode
powershell -Command "(Get-Content ecosystem.config.js) -replace 'DEV_MODE.*:.*''false''', 'DEV_MODE: ''true''' | Set-Content ecosystem.config.js"

pm2 start ecosystem.config.js
echo.
echo ========================================
echo ✅ DEVELOPMENT MODE ENABLED
echo.
echo All features now work in simulation:
echo • SLAY DINOSAUR - Simulates killing
echo • PARK DINOSAUR - Simulates parking  
echo • REDEEM DINOSAUR - Simulates delivery
echo • Shop purchases - Mock transactions
echo • Player tracking - Demo data
echo.
echo Your website works fully without Isle server!
echo Website: https://ashveil.live
echo ========================================
goto end

:prod_mode
echo.
echo Switching to PRODUCTION MODE...
cd /d "C:\Users\laszl\my-website\backend"
pm2 stop ashveil-backend >nul 2>&1

:: Update config file for production mode
powershell -Command "(Get-Content ecosystem.config.js) -replace 'DEV_MODE.*:.*''true''', 'DEV_MODE: ''false''' | Set-Content ecosystem.config.js"

pm2 start ecosystem.config.js
echo.
echo ========================================
echo ✅ PRODUCTION MODE ENABLED
echo.
echo All features now use real RCON:
echo • SLAY DINOSAUR - Real kills on server
echo • PARK DINOSAUR - Real server commands
echo • REDEEM DINOSAUR - Real deliveries
echo • Shop purchases - Real transactions
echo.
echo ⚠️  Requires Isle server RCON connection!
echo Website: https://ashveil.live
echo ========================================
goto end

:show_status
echo.
echo Checking current status...
cd /d "C:\Users\laszl\my-website\backend"
pm2 status
echo.
curl -s http://localhost:5000/api/server/status
goto end

:invalid
echo.
echo Invalid choice. Please enter 1, 2, 3, or 4.
goto end

:exit
echo.
echo Goodbye!
goto end

:end
echo.
pause