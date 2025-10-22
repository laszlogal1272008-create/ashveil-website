@echo off
echo Creating Windows Task Scheduler entry for Ashveil Backend...

:: Create the scheduled task to run at startup
schtasks /create /tn "Ashveil Backend Service" /tr "powershell.exe -ExecutionPolicy Bypass -File \"C:\Users\laszl\my-website\backend\start-on-boot.ps1\"" /sc onstart /ru "%USERNAME%" /rl highest /f

if errorlevel 1 (
    echo Failed to create scheduled task. Please run as Administrator.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  ✅ SUCCESS!
echo  Ashveil Backend will now start automatically
echo  every time Windows boots up!
echo ========================================
echo.
echo The service is configured to:
echo • Start automatically on Windows boot
echo • Restart automatically if it crashes
echo • Run 24/7 in the background
echo • Connect to your Isle server RCON
echo.
echo Your SLAY feature will work at:
echo https://ashveil.live
echo.

pause