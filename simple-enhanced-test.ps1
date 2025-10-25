# Simple Enhanced RCON Tester
param(
    [string]$BridgeUrl = "http://104.131.111.229:3001",
    [int]$TestRounds = 3
)

Write-Host "Enhanced RCON Testing System" -ForegroundColor Green
Write-Host "Bridge URL: $BridgeUrl" -ForegroundColor Yellow

# Test Enhanced Slay
function Test-EnhancedSlay {
    Write-Host "`nTesting Enhanced Slay System..." -ForegroundColor Yellow
    
    $slayBody = @{
        playerName = "Misplacedcursor"
        playerSteamId = "76561199520399511"
        reason = "Enhanced testing system"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BridgeUrl/rcon/slay" -Method POST -Body $slayBody -ContentType "application/json" -TimeoutSec 30
        Write-Host "Enhanced Slay Response:" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
        
        if ($response.successFound) {
            Write-Host "SUCCESS FOUND! Player should be dead!" -ForegroundColor Green -BackgroundColor Black
        }
        
        return $response
    }
    catch {
        Write-Host "Enhanced Slay Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Get Player Status
function Get-PlayerStatus {
    Write-Host "`nChecking Player Status..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-RestMethod -Uri "$BridgeUrl/rcon/status" -Method GET -TimeoutSec 15
        Write-Host "Player Status:" -ForegroundColor Blue
        Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor White
        
        if ($response.playerStatus -and (($response.playerStatus -like "*Health: 0*") -or ($response.playerStatus -like "*dead*"))) {
            Write-Host "PLAYER IS DEAD!" -ForegroundColor Red -BackgroundColor Yellow
        }
        
        return $response
    }
    catch {
        Write-Host "Status Check Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Get Successful Commands
function Get-SuccessfulCommands {
    Write-Host "`nGetting Successful Commands..." -ForegroundColor Green
    
    try {
        $response = Invoke-RestMethod -Uri "$BridgeUrl/rcon/successful" -Method GET -TimeoutSec 15
        Write-Host "Successful Commands Found:" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
        
        if ($response.successfulCommands -and $response.successfulCommands.Count -gt 0) {
            Write-Host "WE FOUND WORKING COMMANDS!" -ForegroundColor Green -BackgroundColor Black
            foreach ($cmd in $response.successfulCommands) {
                Write-Host "$cmd" -ForegroundColor Yellow
            }
        }
        
        return $response
    }
    catch {
        Write-Host "Success Check Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Main execution
Write-Host "`nStarting Enhanced RCON Testing..." -ForegroundColor Green

# Check bridge health first
try {
    $health = Invoke-RestMethod -Uri "$BridgeUrl/health" -Method GET -TimeoutSec 10
    Write-Host "Bridge Health:" -ForegroundColor Green
    Write-Host ($health | ConvertTo-Json) -ForegroundColor White
}
catch {
    Write-Host "Bridge not responding! Make sure it's running." -ForegroundColor Red
    exit 1
}

$allResults = @()

# Run test rounds
for ($i = 1; $i -le $TestRounds; $i++) {
    Write-Host "`n============================================" -ForegroundColor Blue
    Write-Host "ENHANCED TEST ROUND $i" -ForegroundColor Blue -BackgroundColor White
    Write-Host "============================================" -ForegroundColor Blue
    
    # 1. Check initial status
    Write-Host "`n1. Initial Status Check" -ForegroundColor Cyan
    $initialStatus = Get-PlayerStatus
    
    # 2. Test enhanced slay system
    Write-Host "`n2. Enhanced Slay System Test" -ForegroundColor Cyan
    $slayResult = Test-EnhancedSlay
    
    # 3. Wait and check status again
    Write-Host "`n3. Waiting 10 seconds for results..." -ForegroundColor Cyan
    Start-Sleep -Seconds 10
    $postSlayStatus = Get-PlayerStatus
    
    # 4. Check for successful commands
    Write-Host "`n4. Success Analysis" -ForegroundColor Cyan
    $successResults = Get-SuccessfulCommands
    
    # Analysis
    Write-Host "`nROUND $i ANALYSIS:" -ForegroundColor Yellow
    if ($postSlayStatus.playerStatus -and (($postSlayStatus.playerStatus -like "*Health: 0*") -or ($postSlayStatus.playerStatus -like "*dead*"))) {
        Write-Host "SUCCESS! Player died in this round!" -ForegroundColor Green -BackgroundColor Black
        $playerDead = $true
    } else {
        Write-Host "Player still alive, continuing tests..." -ForegroundColor Red
        $playerDead = $false
    }
    
    if ($successResults.successfulCommands -and $successResults.successfulCommands.Count -gt 0) {
        Write-Host "Working commands identified!" -ForegroundColor Green
        $successFound = $true
    } else {
        $successFound = $false
    }
    
    $allResults += @{
        Round = $i
        SlayResult = $slayResult
        SuccessFound = $successFound
        PlayerDead = $playerDead
    }
    
    if ($successFound -or $playerDead) {
        Write-Host "`nSUCCESS FOUND! No need for more rounds." -ForegroundColor Green -BackgroundColor Black
        break
    }
    
    if ($i -lt $TestRounds) {
        Write-Host "`nWaiting 15 seconds before next round..." -ForegroundColor Yellow
        Start-Sleep -Seconds 15
    }
}

# Final summary
Write-Host "`n===============================================" -ForegroundColor Magenta
Write-Host "FINAL ENHANCED TESTING SUMMARY" -ForegroundColor Magenta -BackgroundColor White
Write-Host "===============================================" -ForegroundColor Magenta

$successfulRounds = $allResults | Where-Object { $_.SuccessFound -or $_.PlayerDead }
$totalRounds = $allResults.Count

Write-Host "Total Rounds: $totalRounds" -ForegroundColor White
Write-Host "Successful Rounds: $($successfulRounds.Count)" -ForegroundColor Green

if ($successfulRounds.Count -gt 0) {
    Write-Host "`nSUCCESS ROUNDS:" -ForegroundColor Green
    foreach ($round in $successfulRounds) {
        Write-Host "Round $($round.Round): Success Found = $($round.SuccessFound), Player Dead = $($round.PlayerDead)" -ForegroundColor Yellow
    }
    
    Write-Host "`nSOLUTION FOUND! Check the successful commands log!" -ForegroundColor Green -BackgroundColor Black
} else {
    Write-Host "`nNo successful rounds found. The search continues..." -ForegroundColor Red
}

Write-Host "`nTo continue monitoring, check:" -ForegroundColor Cyan
Write-Host "- successful-commands.log file" -ForegroundColor White
Write-Host "- kill-analysis.log file" -ForegroundColor White
Write-Host "- Bridge continuous monitoring (still running)" -ForegroundColor White

Write-Host "`nEnhanced testing complete!" -ForegroundColor Green