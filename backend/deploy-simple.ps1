# Simple Railway deployment via GitHub
Write-Host "🚀 Deploying to Railway via GitHub..." -ForegroundColor Green

# Install Railway CLI
Write-Host "📥 Installing Railway CLI globally..." -ForegroundColor Yellow
npm install -g @railway/cli

# Initialize Railway
Write-Host "🔐 Starting Railway setup..." -ForegroundColor Yellow
railway login

# Create project
Write-Host "📦 Creating Railway project..." -ForegroundColor Yellow
railway create ashveil-backend

# Deploy current directory
Write-Host "🚢 Deploying backend..." -ForegroundColor Yellow
railway up

Write-Host "✅ Deployment complete! Check Railway dashboard." -ForegroundColor Green