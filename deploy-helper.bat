@echo off
echo =================================================
echo   ASHVEIL WEBSITE - AUTO DEPLOYMENT SCRIPT
echo =================================================
echo.
echo Your website is ready for deployment!
echo.
echo Build files are located at:
echo C:\Users\laszl\my-website\build\
echo.
echo AUTOMATIC DEPLOYMENT OPTIONS:
echo.
echo Option 1: Manual Netlify Upload (Recommended)
echo 1. Go to: https://app.netlify.com/projects/ashveil
echo 2. Click "Deploys" tab
echo 3. Drag ALL files from the build folder into the deploy area
echo 4. Wait for upload to complete
echo.
echo Option 2: Open Build Folder (For manual upload)
echo Press 1 to open the build folder
echo Press 2 to open Netlify admin
echo Press 3 to exit
echo.
set /p choice="Enter your choice (1, 2, or 3): "

if "%choice%"=="1" (
    echo Opening build folder...
    explorer "C:\Users\laszl\my-website\build"
    echo.
    echo BUILD FOLDER OPENED!
    echo Select ALL files (Ctrl+A) and drag them to Netlify
    pause
)

if "%choice%"=="2" (
    echo Opening Netlify admin...
    start https://app.netlify.com/projects/ashveil
    echo.
    echo NETLIFY ADMIN OPENED!
    echo Go to "Deploys" tab and drag your build files there
    pause
)

if "%choice%"=="3" (
    echo Exiting...
    exit
)

echo.
echo =================================================
echo   DEPLOYMENT HELPER COMPLETE
echo =================================================
echo.
echo Your Daily Challenge History System is ready!
echo.
echo FEATURES TO TEST AFTER DEPLOYMENT:
echo - Admin Access: Species code "tyrannosaurus-apex-2024"
echo - 5-Hour Delay System with 30-second test
echo - Complete Admin History Dashboard
echo - Real-time Notifications
echo - Pending Update Management
echo.
echo Happy testing! 🚀
echo.
pause