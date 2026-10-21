@echo off
:: ==============================================================================
:: Taylor & Francis | Publisher-Editor Discrepancy Tracker
:: Docker Desktop Automated Installer & Deployer
:: ==============================================================================

:: Check for Administrative elevation
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ====================================================================
    echo [ELEVATION REQUIRED] Requesting Administrator privileges...
    echo Please click "Yes" on the Windows User Account Control (UAC) prompt.
    echo ====================================================================
    powershell -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

echo ====================================================================
echo   Docker Desktop Setup & Deployment for Discrepancy Tracker
echo ====================================================================
echo.

:: 1. Enable Windows Virtualization Subsystem Features
echo [1/3] Enabling Windows VirtualMachinePlatform & WSL kernel features...
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

:: 2. Launch Docker Desktop Installer
echo.
echo [2/3] Installing Docker Desktop from C:\Users\Biswa\Downloads\docker...
"C:\Users\Biswa\Downloads\docker\Docker Desktop Installer.exe" install --accept-license

:: 3. Post-Install Guidance
echo.
echo ====================================================================
echo [IMPORTANT NOTICE ABOUT WINDOWS VIRTUALIZATION]
echo.
echo If this is the first time Virtual Machine Platform has been enabled on
echo this computer, Windows requires a computer restart to initialize the
echo hypervisor kernel.
echo.
echo After rebooting:
echo   1. Launch "Docker Desktop" from your Windows Start Menu.
echo   2. Run .\docker-run.ps1 in PowerShell to deploy the application!
echo ====================================================================
echo.
pause
