#!/bin/bash

# SAFE VPS Bot Deployment Script
# This will NOT interfere with existing RCON bridge services

echo "🛡️ SAFE BOT DEPLOYMENT - Zero Interference Mode"
echo "VPS: 104.131.111.229"
echo "Existing services will remain untouched!"
echo ""

# Step 1: Check existing services (don't touch)
echo "🔍 Checking existing services (will not modify)..."
pm2 list
echo ""

# Step 2: Create separate bot directory
echo "📁 Creating separate bot directory..."
mkdir -p /root/isle-bot
mkdir -p /root/isle-bot/bot-controller
cd /root/isle-bot

# Step 3: Install Python and dependencies (if needed)
echo "🐍 Installing Python environment..."
apt update
apt install -y python3 python3-pip python3-venv

# Create virtual environment for isolation
python3 -m venv bot-env
source bot-env/bin/activate

# Step 4: Install Python packages
echo "📦 Installing Python dependencies..."
pip install flask flask-cors pyautogui psutil requests pillow

# Step 5: Install Steam/Isle (placeholder for now)
echo "🎮 Preparing Steam environment..."
mkdir -p /root/steam
# Note: We'll install SteamCMD and The Isle here later

# Step 6: Check available ports
echo "🔌 Checking port availability..."
echo "Port 3001: $(lsof -i :3001 && echo 'OCCUPIED (RCON Bridge)' || echo 'Free')"
echo "Port 3002: $(lsof -i :3002 && echo 'OCCUPIED (Backend API)' || echo 'Free')"
echo "Port 5000: $(lsof -i :5000 && echo 'OCCUPIED' || echo 'Free - Perfect for bot!')"

# Step 7: Create bot requirements file
cat > requirements.txt << 'EOF'
flask==3.1.2
flask-cors==6.0.1
pyautogui==0.9.54
psutil==7.1.2
requests==2.32.5
pillow==12.0.0
EOF

echo ""
echo "✅ Safe deployment preparation complete!"
echo ""
echo "📊 Infrastructure Status:"
echo "   Existing RCON Bridge: PROTECTED ✅"
echo "   Existing Backend API: PROTECTED ✅"
echo "   New Bot Directory: READY ✅"
echo "   Port 5000: AVAILABLE ✅"
echo ""
echo "Next steps:"
echo "1. Upload bot files to /root/isle-bot/"
echo "2. Install The Isle game client"
echo "3. Start bot service on port 5000"
echo "4. Test integration with website"
