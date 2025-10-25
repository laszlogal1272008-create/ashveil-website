# Enhanced RCON Testing PowerShell Script
# Tests the enhanced bridge system with comprehensive monitoring

param(
    [string]$BridgeUrl = "http://104.131.111.229:3001",
    [int]$TestRounds = 5,
    [switch]$ContinuousMode
)

Write-Host "🚀 Enhanced RCON Testing System" -ForegroundColor Green
Write-Host "Bridge URL: $BridgeUrl" -ForegroundColor Yellow
Write-Host "Testing comprehensive slay system..." -ForegroundColor Cyan

function Test-EnhancedSlay {
    Write-Host "`n🎯 Testing Enhanced Slay System..." -ForegroundColor Yellow
    
    $slayBody = @{
        playerName = "Misplacedcursor"
        playerSteamId = "76561199520399511"
        reason = "Enhanced testing system"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BridgeUrl/rcon/slay" `
                                    -Method POST `
                                    -Body $slayBody `
                                    -ContentType "application/json" `
                                    -TimeoutSec 30
        
        Write-Host "✅ Enhanced Slay Response:" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
        
        if ($response.successFound) {
            Write-Host "🎉 SUCCESS FOUND! Player should be dead!" -ForegroundColor Green -BackgroundColor Black
        }
        
        return $response
    }
    catch {
        Write-Host "❌ Enhanced Slay Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Get-PlayerStatus {
    Write-Host "`n👁️ Checking Player Status..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-RestMethod -Uri "$BridgeUrl/rcon/status" `
                                    -Method GET `
                                    -TimeoutSec 15
        
        Write-Host "📊 Player Status:" -ForegroundColor Blue
        Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor White
        
        if ($response.playerStatus -and (($response.playerStatus -like "*Health: 0*") -or ($response.playerStatus -like "*dead*"))) {
            Write-Host "💀 PLAYER IS DEAD!" -ForegroundColor Red -BackgroundColor Yellow
        }
        
        return $response
    }
    catch {
        Write-Host "❌ Status Check Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Test-CustomCommand {
    param([string]$Command)
    
    Write-Host "`n🧪 Testing Custom Command: $Command" -ForegroundColor Magenta
    
    $commandBody = @{
        command = $Command
        opcode = 2
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BridgeUrl/rcon/command" `
                                    -Method POST `
                                    -Body $commandBody `
                                    -ContentType "application/json" `
                                    -TimeoutSec 20
        
        Write-Host "📨 Command Response:" -ForegroundColor Cyan
        Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor White
        
        return $response
    }
    catch {
        Write-Host "❌ Command Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Get-SuccessfulCommands {
    Write-Host "`n📈 Getting Successful Commands..." -ForegroundColor Green
    
    try {
        $response = Invoke-RestMethod -Uri "$BridgeUrl/rcon/successful" `
                                    -Method GET `
                                    -TimeoutSec 15
        
        Write-Host "🏆 Successful Commands Found:" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
        
        if ($response.successfulCommands -and $response.successfulCommands.Count -gt 0) {
            Write-Host "🎉 WE FOUND WORKING COMMANDS!" -ForegroundColor Green -BackgroundColor Black
            foreach ($cmd in $response.successfulCommands) {
                Write-Host "✅ $cmd" -ForegroundColor Yellow
            }
        }
        
        return $response
    }
    catch {
        Write-Host "❌ Success Check Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Run-ComprehensiveTest {
    param([int]$RoundNumber)
    
    Write-Host "`n" + ("="*60) -ForegroundColor Blue
    Write-Host "🔄 ENHANCED TEST ROUND $RoundNumber" -ForegroundColor Blue -BackgroundColor White
    Write-Host ("="*60) -ForegroundColor Blue
    
    # 1. Check initial status
    Write-Host "`n1️⃣ Initial Status Check" -ForegroundColor Cyan
    $initialStatus = Get-PlayerStatus
    
    # 2. Test enhanced slay system
    Write-Host "`n2️⃣ Enhanced Slay System Test" -ForegroundColor Cyan
    $slayResult = Test-EnhancedSlay
    
    # 3. Wait and check status again
    Write-Host "`n3️⃣ Waiting 10 seconds for results..." -ForegroundColor Cyan
    Start-Sleep -Seconds 10
    $postSlayStatus = Get-PlayerStatus
    
    # 4. Test some additional custom commands
    Write-Host "`n4️⃣ Additional Command Tests" -ForegroundColor Cyan
    $customCommands = @(
        "admin damage Misplacedcursor 1000",
        "force kill Misplacedcursor",
        "instant slay Misplacedcursor",
        "admin kill Misplacedcursor"
    )
    
    foreach ($cmd in $customCommands) {
        Test-CustomCommand -Command $cmd
        Start-Sleep -Seconds 2
    }
    
    # 5. Check for successful commands
    Write-Host "`n5️⃣ Success Analysis" -ForegroundColor Cyan
    $successResults = Get-SuccessfulCommands
    
    # 6. Final status check
    Write-Host "`n6️⃣ Final Status Check" -ForegroundColor Cyan
    $finalStatus = Get-PlayerStatus
    
    # Analysis
    Write-Host "`n📊 ROUND $RoundNumber ANALYSIS:" -ForegroundColor Yellow
    if ($finalStatus.playerStatus -and (($finalStatus.playerStatus -like "*Health: 0*") -or ($finalStatus.playerStatus -like "*dead*"))) {
        Write-Host "🎉 SUCCESS! Player died in this round!" -ForegroundColor Green -BackgroundColor Black
    } else {
        Write-Host "❌ Player still alive, continuing tests..." -ForegroundColor Red
    }
    
    if ($successResults.successfulCommands -and $successResults.successfulCommands.Count -gt 0) {
        Write-Host "🏆 Working commands identified!" -ForegroundColor Green
    }
    
    return @{
        Round = $RoundNumber
        SlayResult = $slayResult
        SuccessFound = $successResults.successfulCommands.Count -gt 0
        PlayerDead = (($finalStatus.playerStatus -like "*Health: 0*") -or ($finalStatus.playerStatus -like "*dead*"))
    }
}

# Main execution
Write-Host "`n🎯 Starting Enhanced RCON Testing..." -ForegroundColor Green

# Check bridge health first
try {
    $health = Invoke-RestMethod -Uri "$BridgeUrl/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Bridge Health:" -ForegroundColor Green
    Write-Host ($health | ConvertTo-Json) -ForegroundColor White
}
catch {
    Write-Host "❌ Bridge not responding! Make sure it's running." -ForegroundColor Red
    exit 1
}

$allResults = @()

if ($ContinuousMode) {
    Write-Host "`n🔄 CONTINUOUS MODE ENABLED - Running until success found..." -ForegroundColor Cyan
    $round = 1
    $successFound = $false
    
    while (-not $successFound) {
        $result = Run-ComprehensiveTest -RoundNumber $round
        $allResults += $result
        
        if ($result.SuccessFound -or $result.PlayerDead) {
            $successFound = $true
            Write-Host "`n🎉 SUCCESS ACHIEVED! Stopping continuous mode." -ForegroundColor Green -BackgroundColor Black
        } else {
            Write-Host "`nWaiting 30 seconds before next round..." -ForegroundColor Yellow
            Start-Sleep -Seconds 30
        }
        
        $round++
        
        if ($round -gt 100) {
            Write-Host "`n⚠️ Reached 100 rounds limit. Stopping." -ForegroundColor Yellow
            break
        }
    }
} else {
    # Run specified number of test rounds
    for ($i = 1; $i -le $TestRounds; $i++) {
        $result = Run-ComprehensiveTest -RoundNumber $i
        $allResults += $result
        
        if ($result.SuccessFound -or $result.PlayerDead) {
            Write-Host "`n🎉 SUCCESS FOUND! No need for more rounds." -ForegroundColor Green -BackgroundColor Black
            break
        }
        
        if ($i -lt $TestRounds) {
            Write-Host "`nWaiting 15 seconds before next round..." -ForegroundColor Yellow
            Start-Sleep -Seconds 15
        }
    }
}

# Final summary
Write-Host "`n" + ("="*80) -ForegroundColor Magenta
Write-Host "📊 FINAL ENHANCED TESTING SUMMARY" -ForegroundColor Magenta -BackgroundColor White
Write-Host ("="*80) -ForegroundColor Magenta

$successfulRounds = $allResults | Where-Object { $_.SuccessFound -or $_.PlayerDead }
$totalRounds = $allResults.Count

Write-Host "Total Rounds: $totalRounds" -ForegroundColor White
Write-Host "Successful Rounds: $($successfulRounds.Count)" -ForegroundColor Green
Write-Host "Success Rate: $([math]::Round(($successfulRounds.Count / $totalRounds) * 100, 2))%" -ForegroundColor Cyan

if ($successfulRounds.Count -gt 0) {
    Write-Host "`n🎉 SUCCESS ROUNDS:" -ForegroundColor Green
    foreach ($round in $successfulRounds) {
        Write-Host "   Round $($round.Round): Success Found = $($round.SuccessFound), Player Dead = $($round.PlayerDead)" -ForegroundColor Yellow
    }
    
    Write-Host "`n🏆 SOLUTION FOUND! Check the successful commands log!" -ForegroundColor Green -BackgroundColor Black
} else {
    Write-Host "`n❌ No successful rounds found. The search continues..." -ForegroundColor Red
    Write-Host "💡 Try running in continuous mode: -ContinuousMode" -ForegroundColor Yellow
}

Write-Host "`n📋 To continue monitoring, check:" -ForegroundColor Cyan
Write-Host "   - successful-commands.log file" -ForegroundColor White
Write-Host "   - kill-analysis.log file" -ForegroundColor White
Write-Host "   - Bridge continuous monitoring (still running)" -ForegroundColor White

Write-Host "`nEnhanced testing complete!" -ForegroundColor Green