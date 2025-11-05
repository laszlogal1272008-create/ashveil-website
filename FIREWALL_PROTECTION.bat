@echo off
echo FIREWALL PROTECTION SETUP - BLOCKING BOT AUTOMATION
echo ===================================================

echo Creating firewall rules to block Python automation...

:: Block all Python executables from network access (prevents remote bot control)
netsh advfirewall firewall add rule name="BLOCK_PYTHON_AUTOMATION_IN" dir=in action=block program="python.exe" enable=yes
netsh advfirewall firewall add rule name="BLOCK_PYTHON_AUTOMATION_OUT" dir=out action=block program="python.exe" enable=yes

:: Block specific ports that bots might use
netsh advfirewall firewall add rule name="BLOCK_BOT_PORT_5000" dir=in action=block protocol=TCP localport=5000 enable=yes
netsh advfirewall firewall add rule name="BLOCK_BOT_PORT_5001" dir=in action=block protocol=TCP localport=5001 enable=yes

:: Block Steam automation (prevent bots from controlling Steam)
netsh advfirewall firewall add rule name="BLOCK_STEAM_AUTOMATION" dir=in action=block program="steam.exe" remoteip=LocalSubnet enable=yes

echo Creating registry protection (prevent startup automation)...

:: Block Python from running on startup
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\python.exe" /v "Debugger" /t REG_SZ /d "BLOCKED_BY_FIREWALL" /f

:: Create monitoring task
schtasks /create /tn "BOT_MONITOR" /tr "powershell.exe -Command \"if (Get-Process python -ErrorAction SilentlyContinue) { taskkill /f /im python.exe }\"" /sc minute /mo 5 /f

echo FIREWALL PROTECTION COMPLETE!
echo - Python network access BLOCKED
echo - Bot ports 5000-5001 BLOCKED  
echo - Steam automation BLOCKED
echo - Startup protection ENABLED
echo - Auto-kill monitoring ACTIVE

pause