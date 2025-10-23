# Ashveil Website Deployment Script
# Handles environment switching and deployment preparation

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment,
    
    [switch]$BuildOnly,
    [switch]$TestFirst,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Ashveil Website Deployment Script

Usage: .\deploy.ps1 -Environment <env> [options]

Parameters:
  -Environment <env>  Target environment (development, staging, production)
  -BuildOnly          Only build the project, don't deploy
  -TestFirst          Run integration tests before deployment
  -Help               Show this help message

Examples:
  .\deploy.ps1 -Environment development
  .\deploy.ps1 -Environment production -TestFirst
  .\deploy.ps1 -Environment staging -BuildOnly
"@
    exit 0
}

# Configuration
$Config = @{
    ProjectName = "Ashveil Website"
    BuildDir = "build"
    NodeModulesCheck = "node_modules"
}

# Helper functions
function Write-Step($Message) {
    Write-Host "🚀 $Message" -ForegroundColor Cyan
}

function Write-Success($Message) {
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error($Message) {
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning($Message) {
    Write-Host "⚠️ $Message" -ForegroundColor Yellow
}

function Test-Prerequisites {
    Write-Step "Checking prerequisites..."
    
    # Check if Node.js is installed
    try {
        $nodeVersion = node --version
        Write-Success "Node.js version: $nodeVersion"
    }
    catch {
        Write-Error "Node.js is not installed or not in PATH"
        return $false
    }
    
    # Check if npm is installed
    try {
        $npmVersion = npm --version
        Write-Success "npm version: $npmVersion"
    }
    catch {
        Write-Error "npm is not installed or not in PATH"
        return $false
    }
    
    # Check if node_modules exists
    if (-not (Test-Path $Config.NodeModulesCheck)) {
        Write-Warning "node_modules not found. Running npm install..."
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Error "npm install failed"
            return $false
        }
    }
    
    return $true
}

function Set-Environment {
    param([string]$Env)
    
    Write-Step "Setting up environment: $Env"
    
    # Copy appropriate environment file
    $envFile = ".env.$Env"
    $targetFile = ".env.local"
    
    if (Test-Path $envFile) {
        Copy-Item $envFile $targetFile -Force
        Write-Success "Copied $envFile to $targetFile"
        
        # Show current configuration
        Write-Host ""
        Write-Host "Current environment configuration:" -ForegroundColor Yellow
        Get-Content $targetFile | ForEach-Object {
            if ($_ -match "^REACT_APP_" -and $_ -notmatch "^#") {
                Write-Host "  $_" -ForegroundColor Gray
            }
        }
        Write-Host ""
    }
    else {
        Write-Warning "Environment file $envFile not found. Using default configuration."
    }
}

function Invoke-BuildProcess {
    Write-Step "Building React application..."
    
    # Clean build directory
    if (Test-Path $Config.BuildDir) {
        Remove-Item $Config.BuildDir -Recurse -Force
        Write-Success "Cleaned build directory"
    }
    
    # Run build
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build failed"
        return $false
    }
    
    # Check build output
    if (Test-Path "$($Config.BuildDir)/index.html") {
        $buildSize = (Get-ChildItem $Config.BuildDir -Recurse | Measure-Object -Property Length -Sum).Sum
        $buildSizeMB = [math]::Round($buildSize / 1MB, 2)
        Write-Success "Build completed successfully ($buildSizeMB MB)"
        return $true
    }
    else {
        Write-Error "Build output not found"
        return $false
    }
}

function Invoke-Tests {
    Write-Step "Running integration tests..."
    
    # Check if test script exists
    if (Test-Path "test-data-integration.ps1") {
        .\test-data-integration.ps1
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Integration tests failed"
            return $false
        }
        Write-Success "All tests passed"
        return $true
    }
    else {
        Write-Warning "Test script not found, skipping tests"
        return $true
    }
}

function Invoke-Deployment {
    param([string]$Env)
    
    Write-Step "Preparing deployment for $Env environment..."
    
    switch ($Env) {
        "development" {
            Write-Success "Development build ready for local testing"
            Write-Host "Run 'npm start' to start development server" -ForegroundColor Yellow
        }
        "staging" {
            Write-Success "Staging build ready"
            Write-Host "Deploy build folder to staging server" -ForegroundColor Yellow
        }
        "production" {
            Write-Success "Production build ready for deployment"
            Write-Host "Next steps:" -ForegroundColor Yellow
            Write-Host "  1. Upload build folder to production server" -ForegroundColor Gray
            Write-Host "  2. Update server environment variables" -ForegroundColor Gray
            Write-Host "  3. Restart backend services if needed" -ForegroundColor Gray
            Write-Host "  4. Verify deployment with integration tests" -ForegroundColor Gray
        }
    }
}

# Main execution
Write-Host ""
Write-Host "=== $($Config.ProjectName) Deployment ===" -ForegroundColor White
Write-Host "Environment: $Environment" -ForegroundColor White
Write-Host ""

# Check prerequisites
if (-not (Test-Prerequisites)) {
    Write-Error "Prerequisites check failed"
    exit 1
}

# Set up environment
Set-Environment $Environment

# Run tests if requested
if ($TestFirst) {
    if (-not (Invoke-Tests)) {
        Write-Error "Tests failed, aborting deployment"
        exit 1
    }
}

# Build the project
if (-not (Invoke-BuildProcess)) {
    Write-Error "Build failed"
    exit 1
}

# Deploy if not build-only
if (-not $BuildOnly) {
    Invoke-Deployment $Environment
}

Write-Host ""
Write-Success "Deployment process completed successfully! 🎉"
Write-Host ""

# Show next steps based on environment
if ($Environment -eq "production") {
    Write-Host "Production Checklist:" -ForegroundColor Yellow
    Write-Host "□ Verify all environment variables are set correctly" -ForegroundColor Gray
    Write-Host "□ Test server endpoints with: .\test-data-integration.ps1" -ForegroundColor Gray
    Write-Host "□ Verify Steam authentication is working" -ForegroundColor Gray
    Write-Host "□ Check server status integration" -ForegroundColor Gray
    Write-Host "□ Test real data integration when RCON is fixed" -ForegroundColor Gray
}