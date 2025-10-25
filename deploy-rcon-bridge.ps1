# Deploy RCON Bridge to VPS
# Run this script when you're ready to deploy tonight

# Upload the RCON bridge file
Write-Host "🚀 Deploying RCON Bridge to VPS..." -ForegroundColor Green
Write-Host "📁 Uploading rcon-bridge-final.js..." -ForegroundColor Yellow

# Copy the RCON bridge to VPS
scp rcon-bridge-final.js root@104.131.111.229:/root/rcon-bridge.js

Write-Host "✅ File uploaded successfully!" -ForegroundColor Green

# Connect to VPS and set up the service
Write-Host "🔧 Setting up RCON bridge service..." -ForegroundColor Yellow
Write-Host "🔗 Connecting to VPS..." -ForegroundColor Cyan

# SSH into VPS and run setup commands
ssh root@104.131.111.229 @"
echo '🔧 Installing dependencies...'
cd /root
npm install express cors

echo '🛠️ Creating PM2 ecosystem file...'
cat > ecosystem.rcon.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'rcon-bridge',
    script: '/root/rcon-bridge.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/root/logs/rcon-bridge.err.log',
    out_file: '/root/logs/rcon-bridge.out.log',
    log_file: '/root/logs/rcon-bridge.combined.log',
    time: true
  }]
};
EOF

echo '📁 Creating logs directory...'
mkdir -p /root/logs

echo '🚀 Starting RCON bridge with PM2...'
pm2 start ecosystem.rcon.config.js
pm2 save
pm2 startup

echo '🔥 Opening firewall port 3001...'
ufw allow 3001

echo '✅ RCON Bridge deployed and running!'
echo '🌐 Available at: http://104.131.111.229:3001'
echo '🔍 Test with: curl http://104.131.111.229:3001/health'
echo '📊 Check status: pm2 status rcon-bridge'
echo '📋 View logs: pm2 logs rcon-bridge'

echo '🎯 Endpoints available:'
echo '   GET  /health - Health check'
echo '   GET  /rcon/test - Test RCON connection'
echo '   GET  /rcon/players - Get player list'
echo '   POST /rcon/slay - Slay a player'
echo '   POST /rcon/command - Execute custom command'
"@

Write-Host "🎉 RCON Bridge deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your RCON bridge will be running at: http://104.131.111.229:3001" -ForegroundColor Cyan
Write-Host "🔍 Test it with: curl http://104.131.111.229:3001/health" -ForegroundColor Yellow