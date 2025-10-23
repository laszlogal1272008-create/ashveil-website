# Data Integration Test Suite (PowerShell)
# Tests the real/mock data switching functionality
# Run with: .\test-data-integration.ps1

param(
    [string]$SteamId = "76561198000000000",
    [int]$Timeout = 10000,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Data Integration Test Suite (PowerShell)

Usage: .\test-data-integration.ps1 [options]

Parameters:
  -SteamId <ID>     Use custom Steam ID for testing (default: 76561198000000000)
  -Timeout <MS>     Set request timeout in milliseconds (default: 10000)
  -Help             Show this help message

Examples:
  .\test-data-integration.ps1
  .\test-data-integration.ps1 -SteamId "76561198123456789"
  .\test-data-integration.ps1 -Timeout 5000
"@
    exit 0
}

# Test configuration
$Config = @{
    BaseUrl = "https://ashveil-website.onrender.com"
    LocalUrl = "http://localhost:3001"
    TestSteamId = $SteamId
    Timeout = $Timeout
}

# Results tracking
$Results = @{
    Passed = 0
    Failed = 0
    Total = 0
}

# Helper functions
function Write-TestInfo {
    param([string]$Message)
    Write-Host "i $Message" -ForegroundColor Cyan
}

function Write-TestSuccess {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-TestError {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-TestWarn {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-TestRunning {
    param([string]$Message)
    Write-Host "→ $Message" -ForegroundColor Blue
}

# HTTP request helper
function Invoke-TestRequest {
    param([string]$Url)
    
    try {
        $response = Invoke-RestMethod -Uri $Url -TimeoutSec ($Config.Timeout / 1000) -ErrorAction Stop
        return @{
            Success = $true
            StatusCode = 200
            Data = $response
        }
    }
    catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = $_.Exception.Response.StatusCode.value__
        }
    }
}

# Test functions
function Test-ServerHealth {
    param([string]$BaseUrl)
    
    Write-TestRunning "Testing server health at $BaseUrl"
    
    $response = Invoke-TestRequest "$BaseUrl/api/test"
    
    if ($response.Success) {
        Write-TestSuccess "Server is healthy (200)"
        return $true
    }
    else {
        Write-TestError "Server health check failed: $($response.Error)"
        return $false
    }
}

function Test-PlayerInventory {
    param([string]$BaseUrl, [string]$SteamId)
    
    Write-TestRunning "Testing player inventory endpoint for Steam ID: $SteamId"
    
    $response = Invoke-TestRequest "$BaseUrl/api/player/$SteamId/inventory"
    
    if ($response.Success -and $response.Data -is [Array]) {
        Write-TestSuccess "Inventory endpoint working - $($response.Data.Count) items returned"
        if ($response.Data.Count -gt 0) {
            Write-Host "   Sample item: $($response.Data[0] | ConvertTo-Json -Compress)" -ForegroundColor Gray
        }
        return $true
    }
    else {
        Write-TestWarn "Inventory endpoint failed: $($response.Error)"
        return $false
    }
}

function Test-PlayerCurrency {
    param([string]$BaseUrl, [string]$SteamId)
    
    Write-TestRunning "Testing player currency endpoint for Steam ID: $SteamId"
    
    $response = Invoke-TestRequest "$BaseUrl/api/player/$SteamId/currency"
    
    if ($response.Success -and $response.Data) {
        Write-TestSuccess "Currency endpoint working"
        Write-Host "   Currency data: $($response.Data | ConvertTo-Json -Compress)" -ForegroundColor Gray
        return $true
    }
    else {
        Write-TestWarn "Currency endpoint failed: $($response.Error)"
        return $false
    }
}

function Test-PlayerData {
    param([string]$BaseUrl, [string]$SteamId)
    
    Write-TestRunning "Testing player data endpoint for Steam ID: $SteamId"
    
    $response = Invoke-TestRequest "$BaseUrl/api/player/$SteamId"
    
    if ($response.Success -and $response.Data) {
        Write-TestSuccess "Player data endpoint working"
        Write-Host "   Player info: $($response.Data | ConvertTo-Json -Compress)" -ForegroundColor Gray
        return $true
    }
    else {
        Write-TestWarn "Player data endpoint failed: $($response.Error)"
        return $false
    }
}

function Test-ServerStatus {
    param([string]$BaseUrl)
    
    Write-TestRunning "Testing server status endpoint"
    
    $response = Invoke-TestRequest "$BaseUrl/api/server/status"
    
    if ($response.Success -and $response.Data) {
        Write-TestSuccess "Server status endpoint working"
        Write-Host "   Server online: $($response.Data.online)" -ForegroundColor Gray
        Write-Host "   Players: $($response.Data.players | ConvertTo-Json -Compress)" -ForegroundColor Gray
        return $true
    }
    else {
        Write-TestWarn "Server status endpoint failed: $($response.Error)"
        return $false
    }
}

# Test runner helper
function Invoke-Test {
    param([string]$TestName, [scriptblock]$TestFunction)
    
    $Results.Total++
    Write-TestInfo "Running test: $TestName"
    
    try {
        $success = & $TestFunction
        if ($success) {
            $Results.Passed++
            Write-TestSuccess "$TestName - PASSED"
        }
        else {
            $Results.Failed++
            Write-TestError "$TestName - FAILED"
        }
    }
    catch {
        $Results.Failed++
        Write-TestError "$TestName - ERROR: $($_.Exception.Message)"
    }
    
    Write-Host "" # Empty line for readability
}

# Main test execution
Write-Host "=== Data Integration Test Suite ===" -ForegroundColor White
Write-Host "Testing Ashveil website data endpoints" -ForegroundColor White
Write-Host ""

# Test production server
Write-TestInfo "Testing production server endpoints..."
Invoke-Test "Production Server Health" { Test-ServerHealth $Config.BaseUrl }
Invoke-Test "Production Player Inventory" { Test-PlayerInventory $Config.BaseUrl $Config.TestSteamId }
Invoke-Test "Production Player Currency" { Test-PlayerCurrency $Config.BaseUrl $Config.TestSteamId }
Invoke-Test "Production Player Data" { Test-PlayerData $Config.BaseUrl $Config.TestSteamId }
Invoke-Test "Production Server Status" { Test-ServerStatus $Config.BaseUrl }

# Test local server (if available)
Write-TestInfo "Testing local development server endpoints..."
$localHealthy = Test-ServerHealth $Config.LocalUrl

if ($localHealthy) {
    Invoke-Test "Local Player Inventory" { Test-PlayerInventory $Config.LocalUrl $Config.TestSteamId }
    Invoke-Test "Local Player Currency" { Test-PlayerCurrency $Config.LocalUrl $Config.TestSteamId }
    Invoke-Test "Local Player Data" { Test-PlayerData $Config.LocalUrl $Config.TestSteamId }
    Invoke-Test "Local Server Status" { Test-ServerStatus $Config.LocalUrl }
}
else {
    Write-TestWarn "Local server not available - skipping local tests"
    $Results.Total -= 4 # Adjust total count
}

# Print summary
Write-Host "=== Test Results ===" -ForegroundColor White
Write-Host "Total Tests: $($Results.Total)"
Write-Host "Passed: $($Results.Passed)" -ForegroundColor Green
Write-Host "Failed: $($Results.Failed)" -ForegroundColor Red

$successRate = [math]::Round(($Results.Passed / $Results.Total) * 100, 1)
Write-Host "Success Rate: $successRate%"

if ($Results.Failed -eq 0) {
    Write-TestSuccess "All tests passed! 🎉"
    exit 0
}
else {
    Write-TestError "$($Results.Failed) test(s) failed"
    exit 1
}