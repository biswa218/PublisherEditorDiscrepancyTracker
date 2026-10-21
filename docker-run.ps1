<#
.SYNOPSIS
    Convenience script to build, run, or stop the Taylor & Francis Discrepancy Tracker in Docker.
.DESCRIPTION
    Manages the containerized application using Docker Compose.
.PARAMETER Action
    The action to perform: 'up' (default), 'down', 'build', 'logs', 'status', 'restart'
.EXAMPLE
    .\docker-run.ps1
    .\docker-run.ps1 -Action down
    .\docker-run.ps1 -Action logs
#>

[CmdletBinding()]
param(
    [ValidateSet('up', 'down', 'build', 'logs', 'status', 'restart')]
    [string]$Action = 'up'
)

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Check if Docker is available
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerInstalled) {
    Write-Host "[ERROR] Docker is not found in your PATH." -ForegroundColor Red
    Write-Host "Please install Docker Desktop for Windows or ensure 'docker' is added to your environment PATH." -ForegroundColor Yellow
    Write-Host "Download Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
    exit 1
}

# Verify Docker daemon is running
try {
    $null = docker info 2>&1
} catch {
    Write-Host "[ERROR] Docker daemon does not appear to be running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

switch ($Action) {
    'up' {
        Write-Host "==========================================================" -ForegroundColor Cyan
        Write-Host " Starting Publisher-Editor Discrepancy Tracker in Docker  " -ForegroundColor Cyan
        Write-Host "==========================================================" -ForegroundColor Cyan
        docker compose up -d --build
        Write-Host ""
        Write-Host "[SUCCESS] Container started successfully!" -ForegroundColor Green
        Write-Host "  -> Web Application & API: http://localhost:5000" -ForegroundColor White
        Write-Host "  -> Health Endpoint:       http://localhost:5000/health" -ForegroundColor White
        Write-Host "  -> View Live Logs:        .\docker-run.ps1 -Action logs" -ForegroundColor Gray
        Write-Host "  -> Stop Containers:       .\docker-run.ps1 -Action down" -ForegroundColor Gray
    }
    'down' {
        Write-Host "Stopping Discrepancy Tracker container..." -ForegroundColor Yellow
        docker compose down
        Write-Host "[SUCCESS] Containers stopped." -ForegroundColor Green
    }
    'build' {
        Write-Host "Building Docker image from scratch..." -ForegroundColor Cyan
        docker compose build --no-cache
        Write-Host "[SUCCESS] Build complete." -ForegroundColor Green
    }
    'logs' {
        docker compose logs -f discrepancy-tracker
    }
    'status' {
        docker compose ps
    }
    'restart' {
        Write-Host "Restarting Discrepancy Tracker container..." -ForegroundColor Yellow
        docker compose restart
        Write-Host "[SUCCESS] Restart complete." -ForegroundColor Green
    }
}

