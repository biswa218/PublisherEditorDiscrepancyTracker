# ==============================================================================
# Taylor & Francis | Publisher–Editor Discrepancy Tracker
# Push to GitHub Script
# ==============================================================================

param(
    [string]$Token
)

$ErrorActionPreference = "Stop"

$RootPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RootPath

$GitPath = "C:\Users\Biswa\MinGit\cmd\git.exe"
if (-not (Test-Path $GitPath)) {
    $GitPath = "git"
}

Write-Host "Preparing to push code to GitHub repository:" -ForegroundColor Cyan
Write-Host "https://github.com/biswa218/PublisherEditorDiscrepancyTracker.git" -ForegroundColor Yellow
Write-Host ""

if ($Token) {
    Write-Host "Using provided Personal Access Token for authentication..." -ForegroundColor White
    $remoteUrl = "https://$($Token)@github.com/biswa218/PublisherEditorDiscrepancyTracker.git"
    & $GitPath push $remoteUrl main
} else {
    Write-Host "Running git push -u origin main..." -ForegroundColor White
    Write-Host "If prompted, please complete authentication in your browser or enter your GitHub credentials." -ForegroundColor DarkGray
    & $GitPath push -u origin main
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green

