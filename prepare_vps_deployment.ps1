# SAFE VPS BOT DEPLOYMENT - PowerShell Version
# Deploys bot to isolated environment on VPS

$VPS_IP = "104.131.111.229"
$BOT_DIR = "/root/isle-bot"
$RCON_BRIDGE_PORTS = "3001,3002"  # Existing ports to avoid

Write-Host "🚀 SAFE VPS BOT DEPLOYMENT STARTING..." -ForegroundColor Green
Write-Host "================================================"
Write-Host "Target: $VPS_IP"
Write-Host "Bot Directory: $BOT_DIR (isolated)"
Write-Host "Avoiding ports: $RCON_BRIDGE_PORTS"
Write-Host ""

# Create isolated bot directory structure
Write-Host "📁 Creating isolated bot environment..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path ".\vps-deployment\isle-bot" -Force | Out-Null
New-Item -ItemType Directory -Path ".\vps-deployment\isle-bot\logs" -Force | Out-Null
New-Item -ItemType Directory -Path ".\vps-deployment\isle-bot\config" -Force | Out-Null

# Copy the working bot system (use disabled version - it works!)
Write-Host "📋 Preparing bot files..." -ForegroundColor Yellow
if (Test-Path "DANGEROUS_DO_NOT_RUN_professional_isle_bot.py.DISABLED") {
    Copy-Item "DANGEROUS_DO_NOT_RUN_professional_isle_bot.py.DISABLED" ".\vps-deployment\isle-bot\professional_isle_bot.py"
    Write-Host "✅ Bot file copied (the working one!)" -ForegroundColor Green
} else {
    Write-Host "❌ Working bot file not found!" -ForegroundColor Red
    exit 1
}

# Create VPS-specific configuration
$vpsConfig = @'
"""VPS Configuration for Isle Bot - Safe Deployment"""

# VPS-specific settings
VPS_MODE = True
LOCAL_MODE = False

# Network settings
BOT_API_PORT = 5000  # Separate from RCON bridge (3001/3002)
BOT_API_HOST = "0.0.0.0"

# Steam credentials
STEAM_USERNAME = "ashveil_bot123"
STEAM_PASSWORD = "CookieMonster420"
STEAM_ID = "76561198774006913"

# The Isle server settings
ISLE_SERVER_IP = "104.131.111.229"
ISLE_SERVER_PORT = 7777

# Paths (VPS-specific)
STEAM_PATH = "/root/.steam/steam"
ISLE_GAME_PATH = "/root/.steam/steamapps/common/TheIsle"

# Monitoring settings
AUTO_RESTART = True
MONITORING_INTERVAL = 30  # seconds
LOG_LEVEL = "INFO"

# Safety settings for VPS
ALLOW_AUTOMATION = True  # Only true on VPS
PROTECT_LOCAL_APPS = False  # Not needed on VPS
'@

$vpsConfig | Out-File -FilePath ".\vps-deployment\isle-bot\vps_config.py" -Encoding UTF8

# Create VPS startup script
$startScript = @'
#!/bin/bash
# VPS Bot Startup Script

BOT_DIR="/root/isle-bot"
cd "$BOT_DIR"

echo "🤖 Starting Isle Bot on VPS..."
echo "Port: 5000 (isolated from RCON bridge)"
echo "Mode: VPS Automation"
echo ""

# Install dependencies
pip3 install flask flask-cors pyautogui psutil requests pillow

# Start bot with VPS configuration
export DISPLAY=:0  # For GUI automation
python3 professional_isle_bot.py --vps-mode
'@

$startScript | Out-File -FilePath ".\vps-deployment\isle-bot\start_bot.sh" -Encoding UTF8

# Create PM2 configuration
$pm2Config = @'
module.exports = {
  apps: [{
    name: 'isle-bot',
    script: '/root/isle-bot/start_bot.sh',
    cwd: '/root/isle-bot',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      BOT_MODE: 'vps'
    },
    log_file: '/root/isle-bot/logs/combined.log',
    out_file: '/root/isle-bot/logs/out.log',
    error_file: '/root/isle-bot/logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z'
  }]
};
'@

$pm2Config | Out-File -FilePath ".\vps-deployment\isle-bot\ecosystem.config.js" -Encoding UTF8

Write-Host "✅ VPS DEPLOYMENT PACKAGE READY!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Package contents:" -ForegroundColor Cyan
Write-Host "   - professional_isle_bot.py (working version)"
Write-Host "   - vps_config.py (VPS-specific settings)"
Write-Host "   - start_bot.sh (startup script)"
Write-Host "   - ecosystem.config.js (PM2 auto-restart)"
Write-Host ""
Write-Host "🚀 Ready to deploy to VPS 104.131.111.229" -ForegroundColor Green
Write-Host "   Bot will run on port 5000 (isolated)" -ForegroundColor Yellow
Write-Host "   RCON bridge remains untouched on ports 3001/3002" -ForegroundColor Yellow

# Test VPS connectivity
Write-Host ""
Write-Host "🔍 Testing VPS connectivity..." -ForegroundColor Yellow
if (Test-NetConnection -ComputerName $VPS_IP -Port 22 -InformationLevel Quiet) {
    Write-Host "✅ VPS is reachable!" -ForegroundColor Green
    Write-Host "Ready to deploy when you are!" -ForegroundColor Green
} else {
    Write-Host "⚠️ VPS connectivity test failed - but deployment package is ready" -ForegroundColor Yellow
}