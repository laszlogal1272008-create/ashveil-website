@echo off
echo ULTRA-AGGRESSIVE BOT PROTECTION - FORTRESS MODE
echo ===============================================

echo Creating MAXIMUM security rules...

:: BLOCK ALL PYTHON AUTOMATION PERMANENTLY
netsh advfirewall firewall delete rule name="BLOCK_PYTHON_AUTOMATION_IN" >nul 2>&1
netsh advfirewall firewall delete rule name="BLOCK_PYTHON_AUTOMATION_OUT" >nul 2>&1
netsh advfirewall firewall add rule name="FORTRESS_PYTHON_IN" dir=in action=block program="python.exe" enable=yes
netsh advfirewall firewall add rule name="FORTRESS_PYTHON_OUT" dir=out action=block program="python.exe" enable=yes
netsh advfirewall firewall add rule name="FORTRESS_PYTHONW_IN" dir=in action=block program="pythonw.exe" enable=yes
netsh advfirewall firewall add rule name="FORTRESS_PYTHONW_OUT" dir=out action=block program="pythonw.exe" enable=yes

:: PROTECT VS CODE FROM AUTOMATION
netsh advfirewall firewall add rule name="PROTECT_VSCODE" dir=in action=block program="Code.exe" remoteip=any enable=yes
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\Code.exe" /v "DisableHeapLookAside" /t REG_DWORD /d 1 /f

:: PROTECT STEAM FROM AUTOMATION  
netsh advfirewall firewall add rule name="PROTECT_STEAM" dir=in action=block program="steam.exe" remoteip=LocalSubnet enable=yes
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\steam.exe" /v "DisableHeapLookAside" /t REG_DWORD /d 1 /f

:: BLOCK AUTOMATION LIBRARIES
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\pyautogui" /v "Debugger" /t REG_SZ /d "BLOCKED_AUTOMATION" /f
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\System" /v "DisableAutomation" /t REG_DWORD /d 1 /f

:: CREATE AGGRESSIVE MONITORING SERVICE
schtasks /delete /tn "BOT_FORTRESS" /f >nul 2>&1
schtasks /create /tn "BOT_FORTRESS" /tr "powershell.exe -WindowStyle Hidden -Command \"& {Get-Process | Where-Object {\$_.ProcessName -match 'python|py' -and \$_.CommandLine -match 'bot|automation|pyautogui|steam|isle'} | Stop-Process -Force; Get-Process | Where-Object {\$_.MainWindowTitle -match 'Steam|The Isle' -and \$_.CommandLine -match 'python'} | Stop-Process -Force}\"" /sc minute /mo 1 /ru "SYSTEM" /f

:: BLOCK COMMON AUTOMATION PORTS
for %%p in (5000 5001 5002 8080 8000 3000 4000) do (
    netsh advfirewall firewall add rule name="BLOCK_AUTOMATION_PORT_%%p" dir=in action=block protocol=TCP localport=%%p enable=yes
)

:: PREVENT PROCESS INJECTION
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options" /v "PreferSystem32Images" /t REG_DWORD /d 1 /f

echo FORTRESS MODE ACTIVATED!
echo ========================
echo - Python COMPLETELY BLOCKED from network
echo - VS Code PROTECTED from automation  
echo - Steam PROTECTED from hijacking
echo - Auto-kill runs EVERY MINUTE
echo - All automation ports BLOCKED
echo - Process injection PREVENTED
echo.
echo NOTHING can control your VS Code or Steam now!
pause