# ============================================================
# FRONTEND DOCKERFILE - React / Vite / TypeScript
# ============================================================
# This file builds and serves your React frontend.
# We use a multi-stage build:
#   1. BUILD stage: Install deps and build static files
#   2. SERVE stage: Serve static files with nginx (a web server)
# ============================================================

# ============================================================
# STAGE 1: BUILD
# ============================================================
# "node:20-alpine" is Node.js version 20 on Alpine Linux.
# - "alpine" is a tiny Linux distribution (~5MB vs ~100MB)
# - This makes our image smaller and faster to download
FROM node:20-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for caching).
# The "*" in "package*.json" matches both files.
#
# Why copy these separately? Docker caches each layer.
# If these files haven't changed, "npm install" is skipped!
# This makes rebuilds MUCH faster during development.
COPY package*.json ./

# Install all dependencies listed in package.json.
# This creates the node_modules folder inside the container.
RUN npm install

# Now copy ALL other source files.
# This includes: src/, public/, index.html, vite.config.ts, etc.
COPY . .

# "ARG" defines a build-time variable (like a parameter).
# This lets us pass the backend URL when building the image.
#
# Example: docker build --build-arg VITE_API_URL=https://api.example.com .
#
# Default value is empty (will use relative URLs in production)
ARG VITE_API_URL=""

# "ENV" sets an environment variable inside the container.
# Vite requires env vars to start with "VITE_" to be exposed to the app.
# This makes the API URL available during the build process.
ENV VITE_API_URL=$VITE_API_URL

# Build the production version of the app.
# - "npm run build" runs "tsc && vite build" (from package.json)
# - "tsc" = TypeScript compiler (checks for type errors)
# - "vite build" = creates optimized static files in /app/dist
#
# The output is pure HTML, CSS, and JS files - no Node.js needed to run!
RUN npm run build

# ============================================================
# STAGE 2: SERVE (Production)
# ============================================================
# Now we switch to nginx to serve the static files.
#
# nginx (pronounced "engine-x") is a fast, lightweight web server.
# It's perfect for serving static files (HTML, CSS, JS).
# We don't need Node.js at runtime - just a web server!
#
# "alpine" version is tiny (~20MB total image size)
FROM nginx:alpine

# Copy our built files from the build stage to nginx's web folder.
# /usr/share/nginx/html is where nginx looks for files to serve.
COPY --from=build /app/dist /usr/share/nginx/html

# Copy startup script that configures nginx with the correct PORT
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Set default port (Railway will override this via environment variable)
ENV PORT=80

# Run the startup script
# This script:
# 1. Reads the PORT environment variable
# 2. Creates nginx config with that port
# 3. Starts nginx
CMD ["/start.sh"]
