@echo off
REM NGX Investment AI - Quick Start Setup Script (Windows)
REM This script sets up the project for production deployment

setlocal enabledelayedexpansion

title NGX Investment AI - Production Setup

cls

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║ NGX Investment AI - Production Setup                   ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check Docker
echo Checking prerequisites...
echo.

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ✗ Docker is not installed
    echo   Download from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
for /f "tokens=3" %%i in ('docker --version') do set DOCKER_VERSION=%%i
echo ✓ Docker is installed: version %DOCKER_VERSION%

where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo ✗ Docker Compose is not installed
    echo   It usually comes with Docker Desktop
    pause
    exit /b 1
)
echo ✓ Docker Compose is installed

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠ Node.js is not installed (optional for local development)
) else (
    for /f "tokens=*" %%i in ('node --version') do echo ✓ Node.js is installed: %%i
)

REM Check if Docker daemon is running
echo.
echo Checking Docker daemon...
docker ps >nul 2>nul
if %errorlevel% neq 0 (
    echo ✗ Docker daemon is not running
    echo   Please start Docker Desktop and try again
    echo.
    echo   You can:
    echo   1. Open Docker Desktop from Start Menu
    echo   2. Wait for it to start (may take 30-60 seconds)
    echo   3. Run this script again
    pause
    exit /b 1
)
echo ✓ Docker daemon is running

REM Setup environment
echo.
echo Setting up environment...
if not exist .env (
    copy .env.example .env >nul
    echo ✓ Created .env file from template
    echo ⚠ Please edit .env with your Supabase credentials
) else (
    echo ✓ .env file already exists
)

REM Create SSL directory
if not exist ssl (
    mkdir ssl
    echo ✓ Created SSL directory
)

REM Build Docker images
echo.
echo Building Docker images...
echo This may take a few minutes on first run...
echo.
docker compose build --no-cache
if %errorlevel% neq 0 (
    echo ✗ Docker build failed
    pause
    exit /b 1
)

REM Start containers
echo.
echo Starting containers...
docker compose up -d
if %errorlevel% neq 0 (
    echo ✗ Failed to start containers
    pause
    exit /b 1
)
echo ✓ Containers started

REM Wait for services to be ready
echo.
echo Waiting for services to be ready (10 seconds)...
timeout /t 10 /nobreak

REM Health check
echo.
echo Checking application health...
docker compose exec -T app curl -f http://localhost:3000/health >nul 2>nul
if %errorlevel% equ 0 (
    echo ✓ Application is healthy
) else (
    echo ⚠ Could not verify application health - it may still be starting
    echo   Check logs with: docker compose logs -f app
)

cls

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║ Setup Complete!                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo Application is now running at:
echo   🌐 http://localhost:3000
echo.
echo Useful commands:
echo   docker compose logs -f              - View logs
echo   docker compose down                 - Stop containers
echo   docker compose restart              - Restart containers
echo   docker compose ps                   - List containers
echo.
echo Next steps:
echo   1. Edit .env with your Supabase credentials
echo   2. Visit http://localhost:3000 in your browser
echo   3. For production deployment, read PRODUCTION_DEPLOYMENT.md
echo.
pause
