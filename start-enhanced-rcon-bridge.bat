@echo off
echo Starting Enhanced 24/7 RCON Bridge System...
echo This will run continuously to find working RCON commands.

cd /d "C:\Users\laszl\my-website"

echo Installing/updating dependencies...
npm install express cors fs

echo Starting enhanced bridge with comprehensive monitoring...
node rcon-bridge-enhanced-24x7.js

pause