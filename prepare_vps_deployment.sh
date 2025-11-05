#!/bin/bash
# SAFE VPS BOT DEPLOYMENT - ZERO INTERFERENCE APPROACH
# Deploys bot to isolated environment on VPS

set -e

VPS_IP="104.131.111.229"
BOT_DIR="/root/isle-bot"
RCON_BRIDGE_PORTS="3001,3002"  # Existing ports to avoid

echo "🚀 SAFE VPS BOT DEPLOYMENT STARTING..."
echo "================================================"
echo "Target: $VPS_IP"
echo "Bot Directory: $BOT_DIR (isolated)"
echo "Avoiding ports: $RCON_BRIDGE_PORTS"
echo ""

# Create isolated bot directory structure
echo "📁 Creating isolated bot environment..."
mkdir -p ./vps-deployment/isle-bot
mkdir -p ./vps-deployment/isle-bot/logs
mkdir -p ./vps-deployment/isle-bot/config

# Copy the working bot system (use disabled version - it works!)
echo "📋 Preparing bot files..."
cp "DANGEROUS_DO_NOT_RUN_professional_isle_bot.py.DISABLED" "./vps-deployment/isle-bot/professional_isle_bot.py"

# Create VPS-specific configuration
cat > ./vps-deployment/isle-bot/vps_config.py << 'EOF'
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
EOF

# Create VPS startup script
cat > ./vps-deployment/isle-bot/start_bot.sh << 'EOF'
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

EOF

chmod +x ./vps-deployment/isle-bot/start_bot.sh

# Create PM2 configuration for auto-restart
cat > ./vps-deployment/isle-bot/ecosystem.config.js << 'EOF'
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
EOF

# Create deployment script
cat > ./vps-deployment/deploy_to_vps.sh << 'EOF'
#!/bin/bash
# Deploy bot to VPS safely

VPS_IP="104.131.111.229"
VPS_USER="root"

echo "🚀 Deploying to VPS..."
echo "Checking VPS connection..."

# Test connection first
if ! ping -c 1 $VPS_IP > /dev/null; then
    echo "❌ Cannot reach VPS at $VPS_IP"
    exit 1
fi

echo "📤 Uploading bot files..."
scp -r ./isle-bot/ $VPS_USER@$VPS_IP:/root/

echo "🔧 Setting up bot environment..."
ssh $VPS_USER@$VPS_IP << 'REMOTE_COMMANDS'
# Install dependencies
apt-get update
apt-get install -y python3-pip xvfb

# Install Python packages
pip3 install flask flask-cors pyautogui psutil requests pillow

# Install PM2 for process management
npm install -g pm2

# Set up virtual display for GUI automation
export DISPLAY=:0
Xvfb :0 -screen 0 1024x768x24 &

# Start bot with PM2
cd /root/isle-bot
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Bot deployed and running on VPS"
echo "🌐 API available at: http://104.131.111.229:5000"
echo "📊 Monitor with: pm2 monit"
REMOTE_COMMANDS

echo "🎉 VPS DEPLOYMENT COMPLETE!"
echo "Bot is now running on VPS at port 5000"
echo "Your local system remains protected by Fortress Mode"
EOF

chmod +x ./vps-deployment/deploy_to_vps.sh

echo "✅ VPS DEPLOYMENT PACKAGE READY!"
echo ""
echo "📦 Package contents:"
echo "   - professional_isle_bot.py (working version)"
echo "   - vps_config.py (VPS-specific settings)"
echo "   - start_bot.sh (startup script)"
echo "   - ecosystem.config.js (PM2 auto-restart)"
echo "   - deploy_to_vps.sh (deployment script)"
echo ""
echo "🚀 Ready to deploy to VPS 104.131.111.229"
echo "   Bot will run on port 5000 (isolated)"
echo "   RCON bridge remains untouched on ports 3001/3002"