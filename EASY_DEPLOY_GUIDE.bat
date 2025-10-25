@echo off
echo ============================================
echo Enhanced RCON Bridge Deployment Assistant
echo ============================================
echo.
echo This will help you deploy the 24/7 RCON testing system
echo.
echo STEP 1: Copy the enhanced bridge file to clipboard
echo ----------------------------------------
type "rcon-bridge-enhanced-24x7.js" | clip
echo ✅ File copied to clipboard!
echo.
echo STEP 2: Access your VPS
echo ----------------------------------------
echo 1. Go to DigitalOcean dashboard
echo 2. Click your droplet (ashveil-isle-rcon)
echo 3. Click "Console" button
echo 4. Login as root
echo.
echo STEP 3: Create the file on VPS
echo ----------------------------------------
echo Run this command on VPS:
echo   nano rcon-bridge-enhanced.js
echo.
echo Then paste (Ctrl+Shift+V) and save (Ctrl+X, Y, Enter)
echo.
echo STEP 4: Install and start
echo ----------------------------------------
echo Run these commands on VPS:
echo   npm install express cors
echo   pm2 stop rcon-bridge
echo   pm2 start rcon-bridge-enhanced.js --name rcon-enhanced
echo   pm2 save
echo   pm2 logs rcon-enhanced
echo.
echo ============================================
echo File is ready in clipboard - follow steps above!
echo ============================================
pause