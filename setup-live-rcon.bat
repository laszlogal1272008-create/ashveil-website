@echo off
echo ========================================
echo    ASHVEIL RCON BRIDGE - LIVE SETUP
echo ========================================
echo.

echo Step 1: Checking RCON Bridge Status...
pm2 list

echo.
echo Step 2: Starting ngrok tunnel...
echo This will make your RCON bridge accessible from the internet
echo.

start "ngrok" cmd /k "ngrok http 3002"

echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo 1. Check the ngrok window for your public URL
echo 2. Copy the HTTPS URL (like https://abc123.ngrok.io)
echo 3. Update your website config with this URL
echo 4. Rebuild and deploy your website
echo 5. Test slay command on live website!
echo.
echo Your RCON bridge is now accessible from the internet!
echo.
pause