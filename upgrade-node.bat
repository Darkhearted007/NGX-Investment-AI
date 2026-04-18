@echo off
REM NGX Investment AI - Node.js Upgrade Helper
REM This script helps upgrade Node.js to a compatible version

cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  Node.js Upgrade Helper for NGX Investment AI         ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo Current Node.js version:
node --version
echo.

echo ngx-terminal requires Node.js v20.19+ or v22.12+
echo.
echo OPTIONS:
echo.
echo 1. Download & Install Node.js 24 (Recommended - Latest Stable)
echo    https://nodejs.org/en/download/current/
echo.
echo 2. Use NVM (Node Version Manager - Recommended if multiple projects)
echo    Windows: https://github.com/coreybutler/nvm-windows
echo    macOS/Linux: https://github.com/nvm-sh/nvm
echo.
echo 3. Use NVM to upgrade (if already installed)
echo    Command: nvm install 24
echo             nvm use 24
echo.
echo 4. Docker is recommended instead (avoids version conflicts)
echo    See QUICK_FIX.md for Docker setup
echo.
pause
