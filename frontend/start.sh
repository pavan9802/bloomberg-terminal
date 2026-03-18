#!/bin/sh
# ============================================================
# STARTUP SCRIPT - Configure and start nginx
# ============================================================
# This script:
# 1. Prints the PORT for debugging
# 2. Creates nginx config with the correct port
# 3. Starts nginx
# ============================================================

# Default to port 80 if PORT not set
PORT="${PORT:-80}"

echo "========================================"
echo "Starting nginx on port: $PORT"
echo "========================================"

# Create the nginx config with the correct port
cat > /etc/nginx/conf.d/default.conf << EOF
server {
    listen $PORT;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

echo "nginx config created:"
cat /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g "daemon off;"
