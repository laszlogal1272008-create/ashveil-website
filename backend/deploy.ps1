# Ashveil Backend Auto-Deploy Script for Windows
Write-Host "🚀 Setting up Railway deployment..." -ForegroundColor Green

# Install Railway CLI if not installed
if (!(Get-Command "railway" -ErrorAction SilentlyContinue)) {
    Write-Host "📥 Installing Railway CLI..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

# Login to Railway
Write-Host "🔐 Logging into Railway..." -ForegroundColor Yellow
railway login

# Create new project
Write-Host "📦 Creating Railway project..." -ForegroundColor Yellow
railway new ashveil-backend --template blank

# Set environment variables
Write-Host "🔧 Setting environment variables..." -ForegroundColor Yellow
railway variables set PORT=5000
railway variables set NODE_ENV=production
railway variables set ISLE_SERVER_IP=45.45.238.134
railway variables set ISLE_RCON_PORT=16007
railway variables set ISLE_RCON_PASSWORD=CookieMonster420

# Deploy
Write-Host "🚢 Deploying backend..." -ForegroundColor Yellow
railway up

Write-Host "✅ Backend deployed! Check Railway dashboard for your URL." -ForegroundColor Green
Write-Host "🌐 Update the Netlify functions with your Railway URL." -ForegroundColor Cyan