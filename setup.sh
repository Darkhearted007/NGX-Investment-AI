#!/bin/bash
# NGX Investment AI - Quick Start Setup Script
# This script sets up the project for production deployment

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║  NGX Investment AI - Production Setup                  ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
info() {
    echo -e "${GREEN}✓${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
echo ""
echo "Checking prerequisites..."
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    error "Docker is not installed"
    echo "  Download from: https://www.docker.com/products/docker-desktop"
    exit 1
fi
info "Docker is installed: $(docker --version)"

# Check Docker Compose
if ! command -v docker compose &> /dev/null; then
    error "Docker Compose is not installed"
    echo "  It usually comes with Docker Desktop"
    exit 1
fi
info "Docker Compose is installed: $(docker compose version)"

# Check Node.js (optional, for local development)
if command -v node &> /dev/null; then
    info "Node.js is installed: $(node --version)"
else
    warn "Node.js is not installed (optional for local development)"
fi

# Check if Docker daemon is running
echo ""
echo "Checking Docker daemon..."
if ! docker ps &> /dev/null; then
    error "Docker daemon is not running"
    echo "  Please start Docker Desktop and try again"
    exit 1
fi
info "Docker daemon is running"

# Setup environment
echo ""
echo "Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    info "Created .env file from template"
    warn "Please edit .env with your Supabase credentials"
else
    info ".env file already exists"
fi

# Create SSL directory (optional)
if [ ! -d ssl ]; then
    mkdir -p ssl
    info "Created SSL directory"
fi

# Build Docker images
echo ""
echo "Building Docker images..."
docker compose build --no-cache

# Test the build
echo ""
echo "Testing Docker image..."
docker compose up -d
info "Containers started"

# Wait for services to be ready
echo ""
echo "Waiting for services to be ready..."
sleep 10

# Health check
if docker compose exec -T app curl -f http://localhost:3000/health &> /dev/null; then
    info "Application is healthy"
else
    warn "Could not verify application health"
fi

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  Setup Complete!                                       ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "Application is now running at:"
echo "  🌐 http://localhost:3000"
echo ""
echo "Useful commands:"
echo "  docker compose logs -f           # View logs"
echo "  docker compose down              # Stop containers"
echo "  docker compose restart           # Restart containers"
echo ""
echo "Next steps:"
echo "  1. Edit .env with your Supabase credentials"
echo "  2. Visit http://localhost:3000 in your browser"
echo "  3. For production, follow PRODUCTION_DEPLOYMENT.md"
echo ""
