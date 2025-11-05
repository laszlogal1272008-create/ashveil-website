# Enhanced VPS Bridge Testing Script
# Run this after updating the VPS bridge

Write-Host "🔥 TESTING ENHANCED VPS RCON BRIDGE" -ForegroundColor Red
Write-Host "====================================" -ForegroundColor Red
Write-Host ""

$VPS_URL = "http://104.131.111.229:3001"
$playerName = "Misplacedcursor"

# Test 1: Health check
Write-Host "1️⃣ Testing bridge health..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "$VPS_URL/health" -TimeoutSec 5
    $healthData = $health.Content | ConvertFrom-Json
    Write-Host "✅ Bridge Status: $($healthData.status)" -ForegroundColor Green
    Write-Host "🎯 Features: $($healthData.features -join ', ')" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Command override functionality
$commands = @("kill", "murder", "admin_kill", "slaughter", "AdminKill", "KillPlayer")

foreach ($cmd in $commands) {
    Write-Host "🧪 Testing: $cmd $playerName" -ForegroundColor Cyan
    
    try {
        $body = @{
            playerName = $playerName
            commandOverride = $cmd
            reason = "Enhanced bridge test"
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$VPS_URL/rcon/slay" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 5
        $data = $response.Content | ConvertFrom-Json
        
        if ($data.success) {
            Write-Host "✅ SUCCESS: $($data.message)" -ForegroundColor Green
            Write-Host "   Command sent: $($data.command)" -ForegroundColor Gray
            if ($data.commandOverride) {
                Write-Host "   Override used: $($data.commandOverride)" -ForegroundColor Gray
            }
        } else {
            Write-Host "❌ FAILED: $($data.error)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Start-Sleep -Seconds 1
}

# Test 3: Raw command endpoint
Write-Host "🎯 Testing raw command endpoint..." -ForegroundColor Yellow

$rawCommands = @("kill $playerName", "murder $playerName", "admin_kill $playerName")

foreach ($rawCmd in $rawCommands) {
    Write-Host "🔥 Raw command: $rawCmd" -ForegroundColor Magenta
    
    try {
        $body = @{
            command = $rawCmd
            opcode = 0x02
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$VPS_URL/rcon/raw" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 5
        $data = $response.Content | ConvertFrom-Json
        
        if ($data.success) {
            Write-Host "✅ RAW SUCCESS: $($data.message)" -ForegroundColor Green
        } else {
            Write-Host "❌ RAW FAILED: $($data.error)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ RAW ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Start-Sleep -Seconds 1
}

Write-Host "🎉 ENHANCED BRIDGE TESTING COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Check which commands showed SUCCESS" -ForegroundColor White
Write-Host "   2. Go to https://ashveil.live/owner-admin" -ForegroundColor White
Write-Host "   3. Use the rapid testing feature" -ForegroundColor White
Write-Host "   4. One of these commands WILL kill you in-game!" -ForegroundColor White