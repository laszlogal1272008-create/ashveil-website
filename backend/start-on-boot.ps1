# Ashveil Backend Auto-Start Script
# This script runs at Windows startup to ensure your backend is always running

Write-Host "Starting Ashveil Backend Service..." -ForegroundColor Green

# Set working directory
Set-Location "C:\Users\laszl\my-website\backend"

# Wait for system to fully boot
Start-Sleep -Seconds 10

try {
    # Check if PM2 is running
    $pm2Status = pm2 list 2>$null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "PM2 not running, starting daemon..." -ForegroundColor Yellow
        pm2 resurrect
        Start-Sleep -Seconds 5
    }
    
    # Check if ashveil-backend is running
    $backendStatus = pm2 describe ashveil-backend 2>$null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Starting Ashveil Backend..." -ForegroundColor Yellow
        pm2 start ecosystem.config.js
    } else {
        Write-Host "Ashveil Backend already running, restarting to ensure fresh start..." -ForegroundColor Yellow
        pm2 restart ashveil-backend
    }
    
    # Wait for service to fully start
    Start-Sleep -Seconds 10
    
    # Test the service
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/server/status" -Method GET -TimeoutSec 10
        if ($response.success) {
            Write-Host "✅ Ashveil Backend is running successfully!" -ForegroundColor Green
            Write-Host "   Website: https://ashveil.live" -ForegroundColor Cyan
            Write-Host "   Server: $($response.data.ip):$($response.data.port)" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "⚠️  Backend started but API test failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    # Show PM2 status
    pm2 status
    
} catch {
    Write-Host "❌ Failed to start Ashveil Backend: $($_.Exception.Message)" -ForegroundColor Red
    
    # Log the error
    $errorLog = "C:\Users\laszl\my-website\backend\logs\startup-error.log"
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - Startup Error: $($_.Exception.Message)" | Add-Content $errorLog
}

Write-Host "Ashveil Backend startup script completed." -ForegroundColor Green