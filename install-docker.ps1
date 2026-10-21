<#
.SYNOPSIS
    Automated installation script for Docker Desktop on Windows.
.DESCRIPTION
    Elevates to Administrator, enables required Windows VirtualMachinePlatform & WSL
    subsystems, and triggers the Docker Desktop Installer from the Downloads folder.
#>

$ScriptPath = $MyInvocation.MyCommand.Path

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[ELEVATION REQUIRED] Requesting Administrator access..." -ForegroundColor Yellow
    Write-Host "Please click 'Yes' on the Windows UAC confirmation dialog." -ForegroundColor Cyan
    Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`"" -Verb RunAs
    exit
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Docker Desktop Installation & Windows Virtualization Setup" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Enable Windows Features
Write-Host "`n[1/3] Enabling Windows VirtualMachinePlatform & WSL Subsystems..." -ForegroundColor Yellow
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# 2. Run Docker Desktop Installer
$installerPath = "C:\Users\Biswa\Downloads\docker\Docker Desktop Installer.exe"
if (-not (Test-Path $installerPath)) {
    Write-Host "[ERROR] Installer not found at: $installerPath" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "`n[2/3] Launching Docker Desktop Installer..." -ForegroundColor Yellow
$proc = Start-Process -FilePath $installerPath -ArgumentList "install", "--accept-license" -Wait -PassThru

Write-Host "`n[3/3] Installation completed with exit code: $($proc.ExitCode)" -ForegroundColor Green

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " NEXT STEPS & RESTART INSTRUCTIONS" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "1. If VirtualMachinePlatform was newly enabled, restart your PC." -ForegroundColor White
Write-Host "2. After restart, open 'Docker Desktop' from the Start Menu." -ForegroundColor White
Write-Host "3. In this directory, run: .\docker-run.ps1" -ForegroundColor Green
Write-Host "   This will build and deploy the containerized tracker!" -ForegroundColor Green
Write-Host "==========================================================`n" -ForegroundColor Cyan

Read-Host "Press Enter to exit..."
