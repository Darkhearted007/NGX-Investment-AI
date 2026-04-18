# 🐳 Docker Desktop Troubleshooting Guide

If you're experiencing issues with Docker Desktop, follow this guide to diagnose and fix common problems.

## Prerequisites Checklist

- [ ] Docker Desktop installed (4GB+ RAM allocation)
- [ ] WSL 2 backend enabled (Windows)
- [ ] Virtualization enabled in BIOS (Linux/Windows)
- [ ] Enough disk space (20GB+)
- [ ] Administrator access (for installation)

---

## Common Issues & Solutions

### Issue 1: Docker Daemon is Not Running

**Error**: `Cannot connect to Docker daemon` or `Docker daemon is not running`

**Solutions**:

#### Windows
1. **Start Docker Desktop**
   - Open Start Menu
   - Search for "Docker"
   - Click "Docker Desktop"
   - Wait for it to fully start (30-60 seconds)

2. **Check if it's running**
   ```powershell
   docker ps
   # Should list containers (even if empty)
   ```

3. **Increase RAM allocation**
   - Docker Desktop Settings → Resources
   - Set Memory to at least 4GB
   - Click "Apply & Restart"

4. **Enable WSL 2 backend**
   - Docker Desktop Settings → General
   - Check "Use WSL 2 based engine"
   - Click "Apply & Restart"

#### macOS
1. **Start Docker Desktop**
   - Finder → Applications → Docker.app
   - Or use Spotlight (Cmd+Space) to search "Docker"

2. **Check Docker resources**
   - Docker menu → Preferences → Resources
   - Increase memory to at least 4GB

#### Linux
```bash
# Start Docker service
sudo systemctl start docker

# Enable auto-start
sudo systemctl enable docker

# Check status
sudo systemctl status docker

# Add user to docker group (avoid sudo)
sudo usermod -aG docker $USER
newgrp docker
```

---

### Issue 2: "Port Already in Use"

**Error**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solutions**:

#### Windows (PowerShell)
```powershell
# Find process using port 3000
Get-netstat = netstat -ano | findstr :3000

# Get PID from the output, then kill it
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
# ports:
#   - "3001:3000"
```

#### macOS/Linux
```bash
# Find process using port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
```

---

### Issue 3: "No Space Left on Device"

**Error**: `no space left on device` during build

**Solutions**:

1. **Clean up Docker** (removes unused images/containers)
   ```bash
   docker system prune -a --volumes
   ```

2. **Check disk space**
   ```bash
   # Windows
   Get-PSDrive C

   # macOS/Linux
   df -h /
   ```

3. **Free up space**
   - Delete unused applications
   - Clear temporary files
   - Move files to external storage

4. **Increase Docker disk space** (if using Docker VM)
   - Docker Settings → Resources  
   - Increase "Disk Image Size"
   - Click "Apply & Restart"

---

### Issue 4: "Permission Denied"

**Error**: `permission denied while trying to connect to Docker daemon`

**Solutions**:

#### Linux
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Apply group membership
newgrp docker

# Verify
docker ps
```

#### macOS
```bash
# Check Docker socket permissions
ls -l /var/run/docker.sock

# Usually just need to restart Docker
killall Docker
open /Applications/Docker.app
```

---

### Issue 5: "Build Cache Issues"

**Error**: Build hangs or uses stale cache

**Solutions**:

```bash
# Rebuild without cache
docker compose build --no-cache

# Remove all images /containers
docker system prune -a

# Pull fresh base images
docker pull node:24-slim
docker pull nginx:alpine
```

---

### Issue 6: "Out of Memory"

**Error**: `Cannot allocate memory` or container crashes

**Solutions**:

1. **Increase Docker Desktop memory**
   - Docker Settings → Resources
   - Memory: 8GB or more
   - Click "Apply & Restart"

2. **Optimize images**
   ```bash
   # Use multi-stage builds (already in Dockerfile)
   # Remove unused dependencies
   # Use slim base images (already using node:24-slim)
   ```

3. **Monitor usage**
   ```bash
   docker stats
   ```

---

### Issue 7: "WSL 2 Backend Issues" (Windows)

**Error**: `WSL 2 installation is incomplete`

**Solutions**:

1. **Install WSL 2**
   ```powershell
   # Open PowerShell as Admin
   wsl --install

   # Restart your computer
   ```

2. **Update WSL**
   ```powershell
   wsl --update
   ```

3. **Set WSL version**
   ```powershell
   wsl --set-default-version 2
   ```

4. **Troubleshoot WSL**
   ```powershell
   wsl --list --verbose
   wsl --status
   ```

See: https://docs.microsoft.com/en-us/windows/wsl/install

---

### Issue 8: "Network Issues"

**Error**: Container can't reach the internet or other services

**Solutions**:

```bash
# Check docker network
docker network ls

# Inspect network
docker network inspect ngx-network

# Test network connectivity
docker compose exec app curl https://www.google.com

# Check DNS
docker compose exec app cat /etc/resolv.conf
```

**If DNS fails**:
```bash
# Stop Docker
# Edit /etc/docker/daemon.json (create if doesn't exist)
{
  "dns": ["8.8.8.8", "8.8.4.4"]
}
# Restart Docker
```

---

### Issue 9: "Supabase Connection Issues"

**Error**: Cannot connect to Supabase

**Solutions**:

1. **Verify environment variables**
   ```bash
   docker compose config | grep VITE_SUPABASE
   ```

2. **Check .env file**
   ```bash
   cat .env | grep VITE_SUPABASE
   ```

3. **Test Supabase URL**
   ```bash
   docker compose exec app curl https://your-project.supabase.co
   ```

4. **Check CORS settings**
   - Supabase Dashboard → Authentication → URL Configuration
   - Add your application URL to allowed URLs

---

### Issue 10: "Container Crashes"

**Error**: Container starts then immediately stops

**Solutions**:

1. **Check logs**
   ```bash
   docker compose logs app -f --tail 50
   ```

2. **View error details**
   ```bash
   docker compose up app
   ```

3. **Common causes**:
   - Missing environment variables
   - Supabase credentials invalid
   - Port already in use
   - Insufficient memory

---

## Diagnostic Commands

Here are helpful commands to diagnose Docker issues:

```bash
# System information
docker info

# Resource usage
docker stats

# Container logs
docker logs <container-id>

# Detailed container info
docker inspect <container-id>

# Network diagnostics
docker network inspect <network-name>

# Image inspection
docker images

# Volume inspection
docker volume ls

# Complete system cleanup (WARNING!)
docker system prune -a --volumes
```

---

## Getting Help

1. **Check logs first**
   ```bash
   docker compose logs -f
   ```

2. **Docker Desktop troubleshoot**
   - Docker menu → Troubleshoot
   - Click "Reset" if necessary

3. **Reinstall Docker**
   - Uninstall Docker Desktop completely
   - Restart computer
   - Reinstall from: https://www.docker.com/products/docker-desktop

4. **Community Support**
   - Docker Community Forums: https://forums.docker.com
   - Stack Overflow: https://stackoverflow.com/questions/tagged/docker
   - GitHub Issues: [This repository]

---

## Performance Tips

- ✅ Use WSL 2 backend on Windows (faster than Hyper-V)
- ✅ Allocate 4GB+ RAM to Docker
- ✅ Enable Docker BuildKit: `export DOCKER_BUILDKIT=1`
- ✅ Use `.dockerignore` to exclude large files
- ✅ Use `--no-cache` sparingly (rebuilds everything)
- ✅ Monitor with `docker stats`
- ✅ Regular cleanup: `docker system prune`

---

**Last Updated**: 2024  
**Docker Desktop Version**: 4.0+
