# Docker & CI/CD Setup Guide

This guide explains how to use Docker to run and deploy the Bloomberg Terminal application.

## Prerequisites

1. **Install Docker Desktop**: https://www.docker.com/products/docker-desktop/
   - Download for your OS (Mac/Windows/Linux)
   - Install and start Docker Desktop
   - Verify installation: `docker --version`

2. **Install Docker Compose** (usually included with Docker Desktop):
   - Verify: `docker-compose --version`

---

## Quick Start (Local Development)

### Run the Full Stack with One Command

```bash
# From the project root directory
docker-compose up --build
```

This will:
1. Build the backend image (Java/Spring Boot)
2. Build the frontend image (React/nginx)
3. Start both containers
4. Connect them via internal network

**Access the app:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api/market/price/AAPL

### Stop Everything

```bash
# Stop and remove containers
docker-compose down

# Stop, remove containers, AND delete images
docker-compose down --rmi all
```

### View Logs

```bash
# All logs
docker-compose logs -f

# Just backend logs
docker-compose logs -f backend

# Just frontend logs
docker-compose logs -f frontend
```

---

## Build Individual Images

If you want to build images separately:

### Backend
```bash
cd backend
docker build -t bloomberg-backend .
docker run -p 8080:8080 bloomberg-backend
```

### Frontend
```bash
cd frontend
docker build -t bloomberg-frontend .
docker run -p 3000:80 bloomberg-frontend
```

---

## CI/CD Pipeline Setup

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) automatically:
1. Runs tests on every push/PR
2. Builds Docker images
3. Pushes to Docker Hub
4. Deploys to Railway

### Step 1: Create Docker Hub Account

1. Go to https://hub.docker.com and sign up
2. Create an access token:
   - Click your username → Account Settings → Security
   - Click "New Access Token"
   - Give it a name, select "Read, Write, Delete" permissions
   - Copy the token (you won't see it again!)

### Step 2: Create Railway Account

1. Go to https://railway.app and sign up (use GitHub login)
2. Create a new project
3. Add two services: "backend" and "frontend"
4. Get your API token:
   - Click your avatar → Account Settings → Tokens
   - Create a new token and copy it

### Step 3: Add GitHub Secrets

Go to your GitHub repo → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `DOCKER_USERNAME` | Your Docker Hub username |
| `DOCKER_PASSWORD` | Your Docker Hub access token |
| `RAILWAY_TOKEN` | Your Railway API token |

### Step 4: Push to Main Branch

Once secrets are configured, push to `main` to trigger the pipeline:

```bash
git add .
git commit -m "Add Docker CI/CD setup"
git push origin main
```

---

## Railway Configuration

### Option A: Let Railway Build from GitHub (Recommended)

1. In Railway, connect your GitHub repo
2. Railway will auto-detect the Dockerfiles
3. Configure each service:
   - Backend: Set root directory to `/backend`
   - Frontend: Set root directory to `/frontend`

### Option B: Deploy Pre-built Images

Use the Docker images built by GitHub Actions:
- `your-username/bloomberg-backend:latest`
- `your-username/bloomberg-frontend:latest`

---

## Environment Variables

### Backend (set in Railway)
```
SPRING_PROFILES_ACTIVE=prod
```

### Frontend (set as build args)
```
VITE_API_URL=https://your-backend-url.railway.app
```

---

## Troubleshooting

### "Port already in use"
```bash
# Find what's using port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>
```

### "Cannot connect to Docker daemon"
- Make sure Docker Desktop is running

### "Image build fails"
```bash
# Rebuild without cache
docker-compose build --no-cache
```

### View container status
```bash
docker ps -a
```

### Enter a running container (for debugging)
```bash
docker exec -it bloomberg-backend /bin/sh
docker exec -it bloomberg-frontend /bin/sh
```

---

## File Structure

```
bloomberg-terminal/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions workflow
├── backend/
│   ├── Dockerfile             # Backend Docker config
│   ├── .dockerignore          # Files to exclude from build
│   └── ...
├── frontend/
│   ├── Dockerfile             # Frontend Docker config
│   ├── .dockerignore          # Files to exclude from build
│   ├── nginx.conf             # Web server config
│   └── ...
├── docker-compose.yml         # Multi-container orchestration
└── DOCKER.md                  # This file
```
