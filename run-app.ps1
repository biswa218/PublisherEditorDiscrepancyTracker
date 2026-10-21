# ==============================================================================
# Taylor & Francis | Publisher–Editor Discrepancy Tracker
# PowerShell Startup Script
# ==============================================================================

param (
    [switch]$Rebuild,
    [switch]$Seed,
    [switch]$OpenBrowser = $true
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "   Taylor & Francis | Publisher-Editor Discrepancy Tracker" -ForegroundColor Yellow
Write-Host "   SQLite Architecture Monolith (API + React SPA)" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

$RootPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RootPath

# 1. Check Node.js prerequisite
Write-Host "[1/4] Checking Node.js environment..." -ForegroundColor White
try {
    $nodeVer = node -v
    Write-Host "      Detected Node.js version: $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not found in PATH. Please install Node.js (v20+)." -ForegroundColor Red
    exit 1
}

# 2. Re-seed database if requested or if DB does not exist
$DbFile = Join-Path $RootPath "backend\data\discrepancy_tracker.db"
if ($Seed -or (-not (Test-Path $DbFile))) {
    Write-Host "[2/4] Initializing / Reseeding SQLite database with baseline data..." -ForegroundColor White
    Set-Location (Join-Path $RootPath "backend")
    npm run seed
    Set-Location $RootPath
    Write-Host "      Database initialized successfully." -ForegroundColor Green
} else {
    Write-Host "[2/4] SQLite database found: $DbFile" -ForegroundColor Green
}

# 3. Build frontend and backend if requested or if dist missing
$FrontendDist = Join-Path $RootPath "frontend\dist\index.html"
$BackendDist = Join-Path $RootPath "backend\dist\index.js"

if ($Rebuild -or (-not (Test-Path $FrontendDist)) -or (-not (Test-Path $BackendDist))) {
    Write-Host "[3/4] Building production assets (Frontend Vite + Backend TypeScript)..." -ForegroundColor White
    
    Write-Host "      Building frontend..." -ForegroundColor DarkGray
    Set-Location (Join-Path $RootPath "frontend")
    npm run build

    Write-Host "      Building backend..." -ForegroundColor DarkGray
    Set-Location (Join-Path $RootPath "backend")
    npm run build

    Set-Location $RootPath
    Write-Host "      Production builds completed." -ForegroundColor Green
} else {
    Write-Host "[3/4] Production build assets already compiled." -ForegroundColor Green
}

# 4. Launch the application
Write-Host "[4/4] Starting Discrepancy Tracker Server on http://localhost:5000..." -ForegroundColor White
Write-Host ""
Write-Host "------------------------------------------------------------------------" -ForegroundColor DarkCyan
Write-Host "  Web Application:   http://localhost:5000" -ForegroundColor Yellow
Write-Host "  REST API Base:     http://localhost:5000/api/v1" -ForegroundColor Yellow
Write-Host "  Health Endpoint:   http://localhost:5000/health" -ForegroundColor Yellow
Write-Host "------------------------------------------------------------------------" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "Press [Ctrl+C] to stop the server." -ForegroundColor DarkGray
Write-Host ""

# Optional: Open default browser
if ($OpenBrowser) {
    Start-Job -ScriptBlock {
        Start-Sleep -Seconds 2
        Start-Process "http://localhost:5000"
    } | Out-Null
}

# Start Node server
node backend/dist/index.js

