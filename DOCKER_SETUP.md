# Docker Setup for NGX Investment AI

This document explains how to run the NGX Investment AI project using Docker, which provides an isolated environment with the correct Node.js version (v24+) and all dependencies.

## Prerequisites

- **Docker**: Download and install from https://docker.com/get-started/
- **Docker Compose**: Usually comes with Docker Desktop

### Verify Installation

```bash
docker --version
docker-compose --version
```

## Quick Start

### 1. Build and Run with Docker Compose (Recommended)

```bash
cd NGX-Investment-AI
docker-compose up
```

This will:
- Build the Docker image
- Install dependencies inside the container
- Start the development server on http://localhost:5173

### 2. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

### 3. Stop the Container

Press `Ctrl+C` in the terminal, or run:
```bash
docker-compose down
```

## Manual Docker Commands

### Build the Image

```bash
docker build -t ngx-investment-ai .
```

### Run the Container

```bash
docker run -it --rm \
  -p 5173:5173 \
  -v $(pwd):/app \
  ngx-investment-ai
```

On Windows (PowerShell):
```powershell
docker run -it --rm `
  -p 5173:5173 `
  -v ${PWD}:/app `
  ngx-investment-ai
```

## File Explanations

### **Dockerfile**
- Uses `node:24-slim` image (latest stable Node.js)
- Sets up working directory `/app`
- Copies package files and installs dependencies
- Exposes port 5173 for the dev server
- Runs `npm run dev` on startup

### **docker-compose.yml**
- Orchestrates the Docker setup
- Maps port 5173 on your machine to the container
- Mounts current directory for live code editing
- Sets Node environment to `development`

### **.dockerignore**
- Excludes files that don't need to be in the Docker image
- Reduces image size and build time

## Key Benefits

✅ **Version Compatibility** - Uses Node.js v24 (compatible with all dependencies)
✅ **Isolated Environment** - No conflicts with system Node.js
✅ **Live Reloading** - Code changes reflect immediately (volume mounting)
✅ **Consistent Setup** - Same environment for all team members
✅ **Easy Cleanup** - No system-wide installation mess

## Troubleshooting

### "Docker command not found"
Docker isn't installed or not in PATH. Download from https://docker.com/get-started/

### "Port 5173 already in use"
Change the port in `docker-compose.yml`:
```yaml
ports:
  - "5174:5173"  # Use 5174 instead
```

### "Cannot connect to Docker daemon"
- Make sure Docker Desktop is running
- On Linux, you may need to use `sudo` or add your user to the docker group

### "Slow file sync on Windows"
This is normal with Docker Desktop on Windows. For faster development, consider:
- Using WSL 2 backend (recommended)
- Switching to named volumes instead of bind mounts

## Building for Production

To build the application for production inside Docker:

```bash
docker run --rm -v $(pwd):/app node:24-slim sh -c "cd /app && npm install && npm run build"
```

This generates a `dist/` folder with the optimized build.

## Running Multiple Environments

Create separate compose files:

```bash
# Development (default)
docker-compose up

# Production-like testing
docker-compose -f docker-compose.prod.yml up
```

## Security Notes

- Keep your `.env` files out of Docker images (use `.dockerignore`)
- Use `node-slim` for smaller attack surface
- Regularly update Node.js image: `docker pull node:24-slim`
- Don't run containers as root for production

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Node.js Docker Hub](https://hub.docker.com/_/node)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Best Practices for Node.js in Docker](https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/)
