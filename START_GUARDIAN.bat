@echo off
echo Starting Fortress Guardian - Ultra-Aggressive Bot Protection
echo Will run in background and kill ANY automation threats
echo Press Ctrl+C to stop protection
echo.
pip install psutil watchdog >nul 2>&1
python fortress_guardian.py