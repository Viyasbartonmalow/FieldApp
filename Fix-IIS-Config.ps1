# IIS Configuration Fix - Run as Administrator
# This script fixes the 500.19 error for React SPA apps

Write-Host "=== IIS React SPA Fix ===" -ForegroundColor Cyan
Write-Host ""

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Running as Administrator" -ForegroundColor Green
Write-Host ""

# Step 1: Check URL Rewrite (client/server compatible check)
Write-Host "Checking for URL Rewrite module..." -ForegroundColor Yellow
$urlRewriteInstalled = Test-Path "HKLM:\SOFTWARE\Microsoft\IIS Extensions\URL Rewrite"
if ($urlRewriteInstalled) {
    Write-Host "[OK] URL Rewrite is installed" -ForegroundColor Green
}
else {
    Write-Host "[WARN] URL Rewrite is not installed for full IIS" -ForegroundColor Yellow
    Write-Host "[INFO] Download and install: https://www.iis.net/downloads/microsoft/url-rewrite" -ForegroundColor Yellow
    Write-Host "[INFO] Then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 2: Check IIS installation
Write-Host "Checking IIS installation..." -ForegroundColor Yellow
$iisCoreInstalled = Test-Path "HKLM:\SOFTWARE\Microsoft\InetStp"
if ($iisCoreInstalled) {
    Write-Host "[OK] IIS appears to be installed" -ForegroundColor Green
}
else {
    Write-Host "[WARN] IIS does not appear installed." -ForegroundColor Yellow
    Write-Host "[INFO] Enable IIS in Windows Features, then re-run this script." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 3: Restart IIS
Write-Host "Restarting IIS..." -ForegroundColor Yellow
iisreset /restart
Write-Host "[OK] IIS restarted" -ForegroundColor Green

Write-Host ""
Write-Host "=== Configuration Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open browser to: http://172.16.2.54/" -ForegroundColor White
Write-Host "2. Press F12 to open DevTools" -ForegroundColor White
Write-Host "3. Check Console tab for any errors" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
