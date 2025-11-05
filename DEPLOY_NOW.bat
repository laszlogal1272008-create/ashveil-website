@echo off
echo ================================================
echo SUPER EASY VPS DEPLOYMENT - ZERO EFFORT NEEDED
echo ================================================
echo.
echo This will automatically:
echo 1. Upload the enhanced bridge to your VPS
echo 2. Install dependencies  
echo 3. Start the service with /slay command
echo 4. Your website will work immediately!
echo.
echo You only need to enter your VPS password ONCE
echo.
pause

echo.
echo [1/3] Uploading enhanced bridge file...
scp "rcon-bridge-enhanced-24x7.js" "root@104.131.111.229:/root/rcon-bridge-enhanced.js"

if %errorlevel% equ 0 (
    echo ✓ Upload successful!
    echo.
    echo [2/3] Installing and starting service...
    ssh "root@104.131.111.229" "cd /root && npm install express cors --save && pm2 stop rcon-bridge 2>/dev/null || true && pm2 start rcon-bridge-enhanced.js --name rcon-bridge && pm2 save && echo 'SUCCESS: Enhanced bridge is running!' && pm2 logs rcon-bridge --lines 5 --nostream"
    
    if %errorlevel% equ 0 (
        echo.
        echo ================================================
        echo          DEPLOYMENT SUCCESSFUL!
        echo ================================================
        echo ✓ Enhanced bridge running with /slay command
        echo ✓ 24/7 monitoring active
        echo ✓ Website slay button ready!
        echo.
        echo TEST NOW: https://ashveil.live
        echo Go to Profile page and click the Slay button!
        echo.
    ) else (
        echo × SSH command failed
    )
) else (
    echo × Upload failed - check VPS password
)

echo.
echo [3/3] Done! Press any key to exit...
pause >nul

420CookieMonster
