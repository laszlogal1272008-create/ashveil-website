# Ashveil Server Information Collector (PowerShell Version)
# Run this script to gather all technical details needed for website integration

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🦕 ASHVEIL SERVER INFORMATION COLLECTOR" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📅 Collection Date: $(Get-Date)" -ForegroundColor Green
Write-Host "🖥️  Computer Name: $env:COMPUTERNAME" -ForegroundColor Green
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🔧 SYSTEM INFORMATION" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan
$os = Get-WmiObject -Class Win32_OperatingSystem
Write-Host "OS: $($os.Caption)" -ForegroundColor White
Write-Host "Version: $($os.Version)" -ForegroundColor White
Write-Host "Architecture: $($os.OSArchitecture)" -ForegroundColor White
Write-Host "Total RAM: $([math]::Round($os.TotalVisibleMemorySize/1MB, 2)) GB" -ForegroundColor White
Write-Host "Available RAM: $([math]::Round($os.FreePhysicalMemory/1MB, 2)) GB" -ForegroundColor White

$disk = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'"
Write-Host "C: Drive: $([math]::Round($disk.FreeSpace/1GB, 2)) GB free of $([math]::Round($disk.Size/1GB, 2)) GB" -ForegroundColor White
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🌐 NETWORK CONFIGURATION" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

try {
    $publicIP = Invoke-RestMethod -Uri "https://ifconfig.me/ip" -TimeoutSec 5
    Write-Host "Public IP: $publicIP" -ForegroundColor White
} catch {
    Write-Host "Public IP: Unable to fetch" -ForegroundColor Red
}

$networkAdapters = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*"}
foreach ($adapter in $networkAdapters) {
    Write-Host "Network Interface: $($adapter.InterfaceAlias) - IP: $($adapter.IPAddress)" -ForegroundColor White
}
Write-Host ""

Write-Host "Open Ports:" -ForegroundColor White
Get-NetTCPConnection | Where-Object {$_.State -eq "Listen"} | Select-Object LocalAddress, LocalPort | Sort-Object LocalPort | Format-Table -AutoSize
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🎮 THE ISLE SERVER STATUS" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "Checking for The Isle processes..." -ForegroundColor White
$isleProcesses = Get-Process | Where-Object {$_.ProcessName -like "*isle*" -or $_.ProcessName -like "*TheIsle*" -or $_.ProcessName -like "*unreal*"}
if ($isleProcesses) {
    $isleProcesses | Select-Object ProcessName, Id, CPU, WorkingSet | Format-Table -AutoSize
} else {
    Write-Host "No Isle processes found" -ForegroundColor Red
}
Write-Host ""

Write-Host "Checking for game server directories..." -ForegroundColor White
$gameDirectories = @()
$searchPaths = @("C:\", "D:\", "C:\Program Files", "C:\Program Files (x86)", "C:\Games", "C:\steamcmd")

foreach ($path in $searchPaths) {
    if (Test-Path $path) {
        try {
            $found = Get-ChildItem -Path $path -Directory -ErrorAction SilentlyContinue | Where-Object {$_.Name -like "*isle*" -or $_.Name -like "*TheIsle*"} | Select-Object -First 3
            if ($found) {
                $gameDirectories += $found.FullName
            }
        } catch {
            # Silently continue if access denied
        }
    }
}

if ($gameDirectories) {
    Write-Host "Found game directories:" -ForegroundColor Green
    $gameDirectories | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
} else {
    Write-Host "No Isle directories found" -ForegroundColor Red
}
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🗄️  DATABASE INFORMATION" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

$mysqlService = Get-Service -Name "*mysql*" -ErrorAction SilentlyContinue
if ($mysqlService) {
    Write-Host "MySQL Service Status:" -ForegroundColor White
    $mysqlService | Select-Object Name, Status, StartType | Format-Table -AutoSize
} else {
    Write-Host "MySQL service not found" -ForegroundColor Red
}

$mariadbService = Get-Service -Name "*mariadb*" -ErrorAction SilentlyContinue
if ($mariadbService) {
    Write-Host "MariaDB Service Status:" -ForegroundColor White
    $mariadbService | Select-Object Name, Status, StartType | Format-Table -AutoSize
}

Write-Host "Database processes:" -ForegroundColor White
$dbProcesses = Get-Process | Where-Object {$_.ProcessName -like "*mysql*" -or $_.ProcessName -like "*mariadb*"}
if ($dbProcesses) {
    $dbProcesses | Select-Object ProcessName, Id, CPU | Format-Table -AutoSize
} else {
    Write-Host "No database processes found" -ForegroundColor Red
}
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "📋 RUNNING SERVICES" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "Game/Server related services:" -ForegroundColor White
Get-Service | Where-Object {$_.Name -like "*game*" -or $_.Name -like "*server*" -or $_.Name -like "*isle*"} | Select-Object Name, Status, StartType | Format-Table -AutoSize
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🔥 WINDOWS FIREWALL" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

try {
    $firewallProfile = Get-NetFirewallProfile
    Write-Host "Firewall Profiles:" -ForegroundColor White
    $firewallProfile | Select-Object Name, Enabled | Format-Table -AutoSize
    
    Write-Host "Firewall Rules (Game related):" -ForegroundColor White
    Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*game*" -or $_.DisplayName -like "*isle*" -or $_.DisplayName -like "*server*"} | Select-Object DisplayName, Enabled, Direction | Format-Table -AutoSize
} catch {
    Write-Host "Unable to check firewall status" -ForegroundColor Red
}
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "📊 SYSTEM PERFORMANCE" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "Top CPU consuming processes:" -ForegroundColor White
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 ProcessName, CPU, WorkingSet | Format-Table -AutoSize
Write-Host ""

Write-Host "Memory usage:" -ForegroundColor White
$memory = Get-WmiObject -Class Win32_OperatingSystem
$totalMemory = [math]::Round($memory.TotalVisibleMemorySize/1MB, 2)
$freeMemory = [math]::Round($memory.FreePhysicalMemory/1MB, 2)
$usedMemory = $totalMemory - $freeMemory
Write-Host "Total: $totalMemory GB, Used: $usedMemory GB, Free: $freeMemory GB" -ForegroundColor White
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🔍 EVENT LOGS (Recent Errors)" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

try {
    Write-Host "Recent Application Errors:" -ForegroundColor White
    Get-EventLog -LogName Application -EntryType Error -Newest 5 -ErrorAction SilentlyContinue | Select-Object TimeGenerated, Source, Message | Format-Table -Wrap
} catch {
    Write-Host "Unable to access event logs" -ForegroundColor Red
}
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "✅ COLLECTION COMPLETE" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🦕 Please share this output with the Ashveil development team" -ForegroundColor Yellow
Write-Host "📋 This information will help integrate your server with the website" -ForegroundColor Yellow
Write-Host "🔒 Remove any sensitive information before sharing" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan