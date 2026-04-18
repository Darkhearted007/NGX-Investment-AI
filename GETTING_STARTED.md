# 🎬 Getting Started - NGX Investment AI Production Setup

Complete step-by-step guide to get your production-ready SaaS up and running.

---

## ⏱️ Time Required

- **Setup**: 10 minutes
- **First Deploy (Local)**: 15 minutes  
- **First Deploy (Production)**: 30 minutes

---

## 📋 Pre-Deployment Checklist

### System Requirements
- [ ] Docker Desktop installed
- [ ] Docker Compose v2+  
- [ ] 4GB+ RAM available
- [ ] 20GB+ free disk space
- [ ] Administrator access

### Supabase Setup
- [ ] Supabase account created (https://supabase.com)
- [ ] Project created
- [ ] API URL obtained
- [ ] Anon key obtained
- [ ] CORS configured (if needed)

### GitHub (For CI/CD)
- [ ] Repository created
- [ ] Code pushed to main branch
- [ ] Deploy secrets configured (if deploying)

### Domain & SSL (For Production)
- [ ] Domain name acquired
- [ ] Domain points to server IP (if applicable)
- [ ] SSL provider selected (Let's Encrypt or self-signed cert)

---

## 🚀 Step 1: Local Development Setup

### 1.1 Prepare System

**Windows**:
```powershell
# Start Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker.exe"

# Wait 30-60 seconds for startup
Start-Sleep -Seconds 60

# Verify
docker ps
```

**macOS**:
```bash
# Start Docker Desktop
open /Applications/Docker.app

# Wait for startup indicator in menu bar
sleep 30

# Verify
docker ps
```

**Linux**:
```bash
# Docker usually starts automatically
sudo systemctl status docker

# If not running:
sudo systemctl start docker
```

### 1.2 Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/NGX-Investment-AI.git
cd NGX-Investment-AI

# Verify you're in the right directory
ls -la | grep Dockerfile
# Should show: Dockerfile
```

### 1.3 Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your Supabase credentials
# Windows: notepad .env
# macOS/Linux: nano .env

# Add these values:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 1.4 Run Setup Script

**Windows (Command Prompt or PowerShell)**:
```bash
setup.bat
```

**macOS/Linux**:
```bash
chmod +x setup.sh
bash setup.sh
```

The script will:
- ✅ Check Docker installation
- ✅ Build Docker images (may take 5-10 minutes)
- ✅ Start containers
- ✅ Verify health checks

### 1.5 Access Application

Open browser and visit:
- **Application**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Logs**: `docker compose logs -f app`

---

## 📝 Step 2: Verify Setup

### 2.1 Test Health Endpoint

```bash
# Should return: {"status":"ok","environment":"production"}
curl http://localhost:3000/health
```

### 2.2 Check Logs

```bash
# View application logs
docker compose logs app -f --tail 50

# View Nginx logs
docker compose logs nginx -f --tail 50

# View all logs
docker compose logs -f
```

### 2.3 Verify Services

```bash
# List running containers
docker compose ps

# Should show:
# NAME                    STATUS              PORTS
# ngx-investment-ai       Up (healthy)        3000/3000
# ngx-investment-ai-nginx Up (healthy)        80/80, 443/443
```

---

## 🌐 Step 3: Production Deployment

Choose your deployment platform below:

### Option A: VPS Deployment (Docker Compose)

**Prerequisites**:
- VPS with 2+ cores, 4GB+ RAM
- Linux OS (Ubuntu 20.04+ recommended)
- SSH access
- Domain name pointing to server

**Step 1: Prepare Server**
```bash
ssh user@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Check versions
docker --version
docker compose version
```

**Step 2: Deploy Application**
```bash
# Create app directory
sudo mkdir -p /opt/ngx-investment-ai
cd /opt/ngx-investment-ai

# Clone repository
sudo git clone https://github.com/your-org/NGX-Investment-AI.git .
sudo chown -R $USER:$USER .

# Copy and configure environment
cp .env.example .env
nano .env  # Edit with production values

# Start application
docker compose up -d

# Check status
docker compose ps
curl http://localhost:3000/health
```

**Step 3: Setup SSL (Let's Encrypt)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy to project
mkdir -p ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*
chmod 600 ssl/key.pem

# Restart containers
docker compose restart
```

**Step 4: Setup Auto-Start**
```bash
# Create systemd service
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

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable ngx-investment-ai
sudo systemctl start ngx-investment-ai

# Verify
sudo systemctl status ngx-investment-ai
```

### Option B: Cloud Platform Deployment

See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md#production-deployment) for:
- **Heroku** - 5-minute setup
- **AWS ECS** - Full AWS integration
- **Google Cloud Run** - Serverless option
- **DigitalOcean** - App Platform (managed)

---

## ✅ Step 4: Post-Deployment Verification

### 4.1 Test Application

```bash
# Health check
curl https://yourdomain.com/health

# Expected: {"status":"ok","environment":"production"}
```

### 4.2 Check SSL

```bash
# Verify HTTPS works
curl -v https://yourdomain.com/

# Check certificate validity
openssl s_client -connect yourdomain.com:443
```

### 4.3 Monitor Logs

```bash
# Production (VPS)
ssh user@your-server-ip
cd /opt/ngx-investment-ai
docker compose logs -f

# Local
docker compose logs -f
```

### 4.4 Performance Check

```bash
# Load time
time curl https://yourdomain.com

# Concurrent connections
ab -n 100 -c 10 https://yourdomain.com/

# Resource usage
docker stats
```

---

## 🔄 Step 5: CI/CD Pipeline Configuration

### 5.1 GitHub Actions Setup

1. **Add Secrets** (GitHub repository settings)
   - Settings → Secrets and variables → Actions
   - Add these secrets:
     - `PRODUCTION_HOST` - Your server IP
     - `PRODUCTION_USERNAME` - SSH user
     - `PRODUCTION_SSH_KEY` - SSH private key
     - `PRODUCTION_SSH_PORT` - SSH port (default: 22)
     - `PRODUCTION_DOMAIN` - Your domain
     - `SLACK_WEBHOOK_URL` - (optional) For notifications

2. **Test Workflow**
   ```bash
   # Push to repository
   git commit -am "Test CI/CD"
   git push origin main
   
   # Check GitHub Actions
   # github.com/your-org/NGX-Investment-AI/actions
   # Should see workflow running
   ```

### 5.2 Deploy Updates

```bash
# Make changes
git commit -am "Update feature"

# Push to main - triggers automatic deployment
git push origin main

# Monitor deployment
# GitHub Actions tab → Deploy to Production → Watch logs
```

---

## 📊 Step 6: Monitoring & Maintenance

### 6.1 Daily Monitoring

```bash
# Check application health
curl https://yourdomain.com/health

# View logs (last 100 lines)
docker compose logs --tail 100

# Check resource usage
docker stats --no-stream
```

### 6.2 Weekly Tasks

- [ ] Review logs for errors
- [ ] Check disk space: `df -h /`
- [ ] Review Docker stats
- [ ] Test recovery procedures
- [ ] Update dependencies

### 6.3 Monthly Tasks

- [ ] Renew SSL certificates (automated)
- [ ] Backup data (Supabase handles this)
- [ ] Review security logs
- [ ] Update Docker images
- [ ] Test disaster recovery

### 6.4 SSL Certificate Renewal

```bash
# Let's Encrypt auto-renews via systemd timer
sudo systemctl status certbot.timer

# Manual renew
sudo certbot renew --quiet

# Copy new cert
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/ngx-investment-ai/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /opt/ngx-investment-ai/ssl/key.pem
sudo chown $USER:$USER /opt/ngx-investment-ai/ssl/*
```

---

## 🆘 Troubleshooting

### Issue: Docker Not Running
**Solution**: See [DOCKER_TROUBLESHOOTING.md](./DOCKER_TROUBLESHOOTING.md#issue-1-docker-daemon-is-not-running)

### Issue: Port Already in Use
**Solution**: See [DOCKER_TROUBLESHOOTING.md](./DOCKER_TROUBLESHOOTING.md#issue-2-port-already-in-use)

### Issue: Build Fails  
**Solution**: 
```bash
# Clean and rebuild
docker compose down -v
docker system prune -a
docker compose build --no-cache
```

### Issue: Supabase Connection Failed
**Solution**:
```bash
# Verify environment variables
docker compose config | grep VITE_SUPABASE

# Test connection
docker compose exec app curl https://your-project.supabase.co
```

---

## 📚 Additional Resources

- [README.md](./README.md) - Project overview
- [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) - Full deployment guide
- [DOCKER_TROUBLESHOOTING.md](./DOCKER_TROUBLESHOOTING.md) - Docker issues & solutions
- [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Docker development setup

---

## 🎉 What's Next?

After deployment:

1. **Configure Monitoring**
   - Set up error tracking (Sentry, Rollbar)
   - Configure uptime monitoring
   - Setup backup alerts

2. **Scale Application**
   - Load test the application
   - Add caching layer (Redis)
   - Configure auto-scaling

3. **Security Hardening**
   - Setup WAF (Web Application Firewall)
   - Enable VPC/security groups
   - Configure DDoS protection
   - Regular security audits

4. **Documentation**
   - Document custom settings
   - Create runbooks for common tasks
   - Document recovery procedures

---

## 📞 Support

**Local Issues?**
- Check [DOCKER_TROUBLESHOOTING.md](./DOCKER_TROUBLESHOOTING.md)
- Run: `docker compose logs -f` to see detailed errors
- Check [README.md](./README.md) for common questions

**Production Issues?**
- Check application logs: `docker compose logs app`
- Check Nginx logs: `docker compose logs nginx`
- Verify environment variables: `docker compose config`
- SSH to server and check system logs: `sudo journalctl -xe`

**Still Stuck?**
1. Gather logs: `docker compose logs > logs.txt`
2. Check GitHub Issues
3. Ask in Docker/Vite community forums
4. Contact support

---

**Last Updated**: April 2024  
**Version**: 1.0.0  

🚀 **You're ready to deploy!**
