@echo off
echo 🚀 Deploying Enhanced RCON Bridge to VPS...
echo.
echo This will:
echo 1. Upload the enhanced bridge file
echo 2. Install dependencies
echo 3. Start the 24/7 monitoring system
echo.
pause

echo 📁 Uploading enhanced bridge...
scp rcon-bridge-enhanced-24x7.js root@104.131.111.229:/root/rcon-bridge-enhanced.js

echo.
echo ✅ File uploaded! Now connecting to VPS to set it up...
echo 🔐 You'll need to enter your VPS password when prompted.
echo.

ssh root@104.131.111.229 "cd /root && echo '🔧 Installing dependencies...' && npm install express cors && echo '🛑 Stopping old bridge...' && pm2 stop rcon-bridge 2>/dev/null || true && echo '🚀 Starting enhanced bridge...' && pm2 start rcon-bridge-enhanced.js --name rcon-bridge-enhanced && pm2 save && echo '✅ Enhanced bridge is running!' && echo '📊 Status:' && pm2 status && echo '📋 Logs available with: pm2 logs rcon-bridge-enhanced'"

echo.
echo 🎉 Deployment complete!
echo.
pause