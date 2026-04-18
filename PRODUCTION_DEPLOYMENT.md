# 🚀 NGX Investment AI - Production Deployment Guide

Complete guide to deploying NGX Investment AI as a production-ready SaaS application with Docker, Kubernetes, and cloud platforms.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development with Docker](#local-development-with-docker)
3. [Production Deployment](#production-deployment)
4. [SSL/HTTPS Configuration](#sslhttps-configuration)
5. [Environment Management](#environment-management)
6. [Monitoring & Logging](#monitoring--logging)
7. [CI/CD Pipeline Setup](#cicd-pipeline-setup)
8. [Scaling & Performance](#scaling--performance)
9. [Troubleshooting](#troubleshooting)
10. [Security Checklist](#security-checklist)

---

## Prerequisites

### Required Tools
- **Docker** v20+ ([Install](https://docs.docker.com/get-docker/))
- **Docker Compose** v2+ (usually included with Docker Desktop)
- **Git** v2+
- **Node.js** v24+ (for local development only)

### Optional Tools
- **Docker Desktop** (recommended for Mac/Windows)
- **VS Code** with Docker extension
- **Kubernetes** (for advanced deployments)
- **Helm** (for Kubernetes package management)

### System Requirements
- **RAM**: Minimum 4GB (8GB+ recommended)
- **Disk**: Minimum 10GB free space
- **CPU**: 2+ cores
- **OS**: Linux, macOS, or Windows (with WSL2)

### Verify Installation

```bash
docker --version          # v20.0+
docker compose version    # v2.0+
node --version           # v24.0+
npm --version            # v10.0+
git --version            # v2.0+
```

---

## Local Development with Docker

### Quick Start (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd NGX-Investment-AI

# Copy environment template
cp .env.example .env

# Update .env with your Supabase credentials
nano .env

# Build and start containers
docker compose up --build

# Application will be available at:
# - App: http://localhost:3000
# - API: http://localhost:3000/api
# - Nginx: http://localhost:80 (redirects to app)
```

### Health Check

```bash
# Check application health
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","environment":"production"}
```

### Stopping Development Environment

```bash
# Stop containers
docker compose down

# Stop and remove volumes (careful!)
docker compose down -v

# View container logs
docker compose logs -f app

# Restart containers
docker compose restart
```

### Debugging

```bash
# View live logs
docker compose logs -f app

# Execute command in container
docker compose exec app npm run build

# Open shell in container
docker compose exec app /bin/sh

# Inspect container details
docker inspect ngx-investment-ai

# View resource usage
docker stats ngx-investment-ai
```

---

## Production Deployment

### Option 1: Docker Compose (VPS/Dedicated Server)

#### Prerequisites
- VPS with 2+ cores, 4GB+ RAM, 20GB+ storage
- Linux OS (Ubuntu 20.04+ recommended)
- Docker & Docker Compose installed
- SSH access to server
- Domain name pointing to server IP

#### Deployment Steps

1. **Prepare Server**
```bash
ssh user@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker compose version
```

2. **Clone Repository**
```bash
# Create deployment directory
sudo mkdir -p /opt/ngx-investment-ai
cd /opt/ngx-investment-ai

# Clone repository
sudo git clone <repository-url> .

# Fix permissions
sudo chown -R $USER:$USER .
```

3. **Setup Environment**
```bash
# Copy environment file
cp .env.example .env

# Edit envvars with production values
nano .env

# Set secure permissions
chmod 600 .env
```

4. **Generate SSL Certificates** (See [SSL Configuration](#sslhttps-configuration))

5. **Deploy Application**
```bash
# Build and start containers
docker compose up -d

# Verify containers are running
docker compose ps

# Check logs
docker compose logs -f app

# Test health endpoint
curl http://localhost:3000/health
```

6. **Setup Systemd Service** (Auto-start on reboot)
```bash
sudo tee /etc/systemd/system/ngx-investment-ai.service > /dev/null <<EOF
[Unit]
Description=NGX Investment AI
After=docker.service
Requires=docker.service

[Service]
Type=simple
WorkingDirectory=/opt/ngx-investment-ai
ExecStart=/usr/local/bin/docker-compose up
ExecStop=/usr/local/bin/docker-compose down
Restart=unless-stopped
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable ngx-investment-ai
sudo systemctl status ngx-investment-ai
```

### Option 2: Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set \
  VITE_SUPABASE_URL=https://your-project.supabase.co \
  VITE_SUPABASE_ANON_KEY=your_anon_key

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Option 3: AWS (ECS + RDS)

```bash
# Setup AWS CLI
aws configure

# Create ECS cluster
aws ecs create-cluster --cluster-name ngx-investment

# Build and push to ECR
aws ecr create-repository --repository-name ngx-investment-ai
docker build -t ngx-investment-ai .
docker tag ngx-investment-ai:latest <aws-account>.dkr.ecr.<region>.amazonaws.com/ngx-investment-ai:latest
docker push <aws-account>.dkr.ecr.<region>.amazonaws.com/ngx-investment-ai:latest

# Create ECS task definition and service
# (See AWS documentation for detailed steps)
```

### Option 4: Google Cloud Run

```bash
# Setup gcloud CLI
gcloud init

# Build and push to Cloud Registry
gcloud builds submit --tag gcr.io/<project-id>/ngx-investment-ai

# Deploy
gcloud run deploy ngx-investment-ai \
  --image gcr.io/<project-id>/ngx-investment-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "VITE_SUPABASE_URL=https://your-project.supabase.co"
```

### Option 5: DigitalOcean App Platform

```bash
# Push to GitHub
git push origin main

# Connect DigitalOcean to GitHub
# 1. Go to DigitalOcean Dashboard
# 2. Apps > Create App
# 3. Select GitHub repository
# 4. Configure environment variables
# 5. Deploy
```

---

## SSL/HTTPS Configuration

### Using Let's Encrypt (Recommended - Free)

1. **Install Certbot**
```bash
sudo apt install certbot python3-certbot-nginx -y
```

2. **Generate Certificate**
```bash
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
```

3. **Copy Certificates to Nginx Volume**
```bash
# Create SSL directory
mkdir -p ./ssl

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/key.pem

# Fix permissions
sudo chown $USER:$USER ./ssl/*
chmod 600 ./ssl/key.pem
```

4. **Update nginx.conf** - Certificates are now in place

5. **Setup Auto-Renewal**
```bash
# Certbot handles auto-renewal via systemd timer
sudo systemctl enable certbot.timer
sudo systemctl status certbot.timer
```

### Using Self-Signed Certificates (Development)

```bash
# Generate self-signed certificate (valid for 365 days)
mkdir -p ./ssl
openssl req -x509 -newkey rsa:4096 -nodes \
  -out ./ssl/cert.pem -keyout ./ssl/key.pem -days 365 \
  -subj "/C=US/ST=State/L=City/O=Company/CN=localhost"

# Fix permissions
chmod 600 ./ssl/key.pem
```

### Update Docker Compose

```yaml
# Add SSL variables to docker-compose.yml
environment:
  - SSL_ENABLED=true
  - SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
  - SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

---

## Environment Management

### Environment Variables

Create `.env` file (use `.env.example` as template):

```bash
# Copy template
cp .env.example .env

# Edit with production values
nano .env
```

### Required Variables (Production)

```env
# Application
NODE_ENV=production
PORT=3000

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# SSL
SSL_ENABLED=true

# Logging
LOG_LEVEL=info

# Security
CORS_ORIGIN=yourdomain.com
CSRF_PROTECTION=true
```

### Secret Management

#### Using Environment Files (Simple)
```bash
# Store sensitive data in .env
cp .env.example .env
nano .env  # Edit with real secrets
chmod 600 .env  # Restrict permissions
```

#### Using Docker Secrets (Swarm)
```bash
# Create secret
echo "your_secret_value" | docker secret create my_secret -

# Reference in docker-compose.yml
secrets:
  my_secret:
    external: true

services:
  app:
    secrets:
      - my_secret
```

#### Using External Services
- **HashiCorp Vault**: Enterprise secret management
- **AWS Secrets Manager**: AWS-native solution
- **Google Secret Manager**: GCP-native solution
- **Azure Key Vault**: Azure-native solution

---

## Monitoring & Logging

### Container Logs

```bash
# View application logs
docker compose logs app -f --tail 100

# View nginx logs
docker compose logs nginx -f --tail 100

# View combined logs
docker compose logs -f
```

### Health Monitoring

```bash
# Check container health
docker inspect ngx-investment-ai | grep -A 5 Health

# Manual health check
curl http://localhost:3000/health
```

### Resource Monitoring

```bash
# View resource usage
docker stats ngx-investment-ai

# View detailed stats
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### Log Aggregation (Optional)

#### Using ELK Stack (Elasticsearch, Logstash, Kibana)

```yaml
# Add to docker-compose.yml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      discovery.type: single-node
    ports:
      - "9200:9200"

  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    ports:
      - "5601:5601"

  app:
    # ... existing config
    logging:
      driver: "splunk"
      options:
        splunk-token: "${SPLUNK_TOKEN}"
        splunk-url: "https://your-splunk-instance.com"
```

#### Using CloudWatch (AWS)

```bash
# Install CloudWatch agent
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY \
  -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET \
  amazon/cloudwatch-agent:latest
```

---

## CI/CD Pipeline Setup

### GitHub Actions (Already Configured)

The repository includes GitHub Actions workflows in `.github/workflows/`:

1. **build.yml** - Builds and tests on every push
2. **deploy.yml** - Deploys to production on merge to main

#### Setup Production Secrets

In GitHub repository settings, add these secrets:

```
PRODUCTION_HOST              # VPS IP or domain
PRODUCTION_USERNAME          # SSH user
PRODUCTION_SSH_KEY           # SSH private key
PRODUCTION_SSH_PORT          # SSH port (default: 22)
PRODUCTION_DOMAIN            # Domain name for deployment
SLACK_WEBHOOK_URL            # For notifications (optional)
```

#### Trigger Deployment

```bash
# Automatic: Push to main branch
git push origin main

# Manual: Trigger workflow through GitHub UI
# GitHub Actions > Deploy > Run workflow
```

---

## Scaling & Performance

### Horizontal Scaling (Multiple Instances)

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      replicas: 3  # Run 3 instances
    
  load-balancer:
    image: nginx:alpine
    ports:
      - "80:80"
    # Routes traffic to multiple app instances
```

### Vertical Scaling (Increase Resources)

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
```

### Caching

- **Browser Caching**: Nginx sets aggressive cache headers
- **CDN**: Use CloudFlare or AWS CloudFront
- **Application Cache**: Implement Redis for session/data caching

```bash
# Add Redis to docker-compose.yml
docker compose up redis
```

### Database Optimization

- Use Supabase connection pooling
- Implement query caching
- Monitor slow queries
- Scale Supabase plan as needed

```bash
# Monitor Supabase performance
# 1. Go to Supabase Dashboard
# 2. Project Settings > Statistics
# 3. View query performance and connections
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs app

# Verify image exists
docker images

# Rebuild image
docker compose build --no-cache

# Try without cache
docker compose up --force-recreate
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000 (Linux/Mac)
netstat -ano | findstr :3000 (Windows)

# Kill process
kill -9 <PID>

# Alternative: Change port in docker-compose.yml
ports:
  - "3001:3000"  # Map to different port
```

### Out of Memory

```bash
# Increase Docker memory limit
# Docker Desktop: Preferences > Resources

# Check container memory
docker stats

# Reduce memory usage:
# 1. Optimize dependencies
# 2. Implement pagination
# 3. Add caching
# 4. Increase instance resources
```

### SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in ./ssl/cert.pem -text -noout

# Verify certificate matches key
openssl x509 -noout -modulus -in ./ssl/cert.pem | openssl md5
openssl rsa -noout -modulus -in ./ssl/key.pem | openssl md5

# Test HTTPS
curl -v https://localhost --insecure
```

### Supabase Connection Issues

```bash
# Verify env variables
docker compose config | grep VITE_SUPABASE

# Test Supabase connection
# Add to server.js:
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
console.log('Connected to Supabase:', !!supabase)
```

---

## Security Checklist

- [ ] **SSL/TLS Enabled** - HTTPS configured with valid certificate
- [ ] **Secrets Secured** - No credentials in version control
- [ ] **Nginx Security Headers** - CSP, X-Frame-Options configured
- [ ] **Non-Root User** - Containers run as unprivileged user
- [ ] **Network Isolation** - Containers use internal network
- [ ] **Rate Limiting** - Enabled to prevent abuse
- [ ] **CORS Configured** - Restricted to trusted domains
- [ ] **Health Checks** - Configured and monitored
- [ ] **Logs Monitored** - Error logs reviewed regularly
- [ ] **Dependencies Updated** - Docker images patched regularly
- [ ] **Backups** - Data backups configured (Supabase)
- [ ] **Firewall** - Ports restricted appropriately
- [ ] **Regular Testing** - Security scans (Trivy) enabled
- [ ] **Incident Response** - Plan documented

---

## Quick Reference

### Common Commands

```bash
# Start application
docker compose up

# Start in background
docker compose up -d

# Stop application
docker compose down

# View logs
docker compose logs -f

# Rebuild containers
docker compose build --no-cache

# Execute command
docker compose exec app <command>

# Update and restart
git pull
docker compose pull
docker compose up -d
```

### Directory Structure

```
.
├── Dockerfile              # Production build definition
├── docker-compose.yml      # Container orchestration
├── nginx.conf              # Web server configuration
├── server.js               # Node.js production server
├── .env.example            # Environment template
├── .dockerignore           # Files excluded from image
├── .github/workflows/      # CI/CD pipelines
│   ├── build.yml          # Build on push
│   └── deploy.yml         # Deploy on merge
├── src/                   # Application source code
├── public/                # Static assets
└── dist/                  # Built application (generated)
```

---

## Support & Resources

- **Documentation**: See [README.md](./README.md)
- **Docker Docs**: https://docs.docker.com
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Actions**: https://docs.github.com/en/actions
- **Nginx Docs**: https://nginx.org/en/docs

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Maintainer**: NGX Investment AI Team
