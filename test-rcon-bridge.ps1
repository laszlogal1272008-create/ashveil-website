# Quick Test Script for RCON Bridge
# Run this after deployment to verify everything works

Write-Host "🧪 Testing RCON Bridge..." -ForegroundColor Green

# Test health endpoint
Write-Host "🔍 Testing health endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://104.131.111.229:3001/health" -Method GET
    Write-Host "✅ Health check: $($healthResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test RCON connection
Write-Host "🔍 Testing RCON connection..." -ForegroundColor Yellow
try {
    $rconResponse = Invoke-RestMethod -Uri "http://104.131.111.229:3001/rcon/test" -Method GET
    Write-Host "✅ RCON test: $($rconResponse.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ RCON test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test slay command (with fake player)
Write-Host "🔍 Testing slay command..." -ForegroundColor Yellow
try {
    $slayBody = @{
        playerName = "TestPlayer"
        reason = "Test from deployment script"
    } | ConvertTo-Json

    $slayResponse = Invoke-RestMethod -Uri "http://104.131.111.229:3001/rcon/slay" -Method POST -Body $slayBody -ContentType "application/json"
    Write-Host "✅ Slay test: $($slayResponse.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Slay test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🎉 RCON Bridge testing complete!" -ForegroundColor Green