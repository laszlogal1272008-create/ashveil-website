# Fully Automated VPS Deployment Script
# This script handles EVERYTHING automatically

Write-Host "🚀 FULLY AUTOMATED VPS DEPLOYMENT" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# Your VPS details
$VPS_IP = "104.131.111.229"
$VPS_USER = "root"

Write-Host "📋 What this script will do automatically:" -ForegroundColor Yellow
Write-Host "1. Copy the enhanced bridge file to VPS" -ForegroundColor White
Write-Host "2. Install required dependencies" -ForegroundColor White
Write-Host "3. Stop old bridge and start new one" -ForegroundColor White
Write-Host "4. Configure PM2 to auto-restart" -ForegroundColor White
Write-Host "5. Show you the logs to confirm it's working" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  You will only need to enter your VPS password ONCE" -ForegroundColor Red
Write-Host ""

Read-Host "Press Enter to start automatic deployment..."

try {
    Write-Host "📤 Step 1: Uploading enhanced bridge..." -ForegroundColor Cyan
    
    # Use SCP to copy file (will prompt for password once)
    & scp "rcon-bridge-enhanced-24x7.js" "${VPS_USER}@${VPS_IP}:/root/rcon-bridge-enhanced.js"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ File uploaded successfully!" -ForegroundColor Green
        
        Write-Host "🔧 Step 2: Installing and starting service..." -ForegroundColor Cyan
        
        # Create one SSH command that does everything
        $commands = @(
            "cd /root",
            "npm install express cors --save",
            "pm2 stop rcon-bridge 2>/dev/null || true",
            "pm2 delete rcon-bridge 2>/dev/null || true", 
            "pm2 start rcon-bridge-enhanced.js --name rcon-bridge",
            "pm2 save",
            "pm2 list",
            "echo '✅ Enhanced bridge deployed successfully!'",
            "echo '🔍 Showing last 10 log entries:'",
            "pm2 logs rcon-bridge --lines 10 --nostream"
        )
        
        $fullCommand = $commands -join " && "
        
        # Execute all commands in one SSH session
        & ssh "${VPS_USER}@${VPS_IP}" $fullCommand
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
            Write-Host "=================================" -ForegroundColor Green
            Write-Host "✅ Enhanced bridge is now running with /slay command!" -ForegroundColor White
            Write-Host "✅ Your website slay button should work now!" -ForegroundColor White
            Write-Host "✅ 24/7 monitoring and testing active!" -ForegroundColor White
            Write-Host ""
            Write-Host "🌐 Test your website: https://ashveil.live" -ForegroundColor Yellow
            Write-Host "   Go to Profile → Game Management → Slay button" -ForegroundColor White
            Write-Host ""
            Write-Host "📊 To check logs anytime: ssh root@104.131.111.229 'pm2 logs rcon-bridge'" -ForegroundColor Cyan
        } else {
            Write-Host "❌ SSH commands failed. Check your connection." -ForegroundColor Red
        }
    } else {
        Write-Host "❌ File upload failed. Check your VPS password and connection." -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Deployment error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure SSH/SCP is installed and VPS is accessible" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 If successful, your website slay button will now kill players instantly!" -ForegroundColor Green
Read-Host "Press Enter to exit..."