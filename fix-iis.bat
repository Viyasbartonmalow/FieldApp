@echo off
REM IIS Configuration Fix Script
REM This fixes common issues causing 500.19 errors on React SPA apps

echo.
echo ============================================
echo IIS React SPA Configuration Fix
echo ============================================
echo.

REM Check if URL Rewrite is installed
echo Checking for URL Rewrite module...
reg query "HKLM\SOFTWARE\Microsoft\IIS Extensions\URL Rewrite" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] URL Rewrite module is installed
) else (
    echo [WARNING] URL Rewrite module NOT found
    echo Please install from: https://www.iis.net/downloads/microsoft/url-rewrite
    echo.
)

REM Reset IIS
echo.
echo Resetting IIS...
iisreset /restart

echo.
echo ============================================
echo IIS Configuration Fix Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Open browser to: http://172.16.2.54/
echo 2. Press F12 to open DevTools
echo 3. Check Console tab for errors
echo.
echo If you still see 500.19 error:
echo - Verify URL Rewrite is installed
echo - Check Event Viewer for detailed error
echo - Run: certutil -verify "D:\Barton Malow\Field App\frontend\dist\web.config"
echo.
pause
