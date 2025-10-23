@echo off
echo Starting Ashveil RCON Bridge Service...

REM Change to the correct directory
cd /d "C:\Users\laszl\my-website\rcon-bridge"

REM Start with PM2
pm2 resurrect

echo Ashveil RCON Bridge is now running 24/7!
echo Check status with: pm2 list
echo View logs with: pm2 logs ashveil-rcon-bridge

pause