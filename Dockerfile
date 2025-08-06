# Multi-stage build for Ant Design Pro application
# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with security updates
RUN npm ci --only=production=false && \
    npm audit fix --force || true

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production image with nginx
FROM nginx:alpine

# Copy nginx configuration
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    
    # Gzip configuration for better performance
    gzip on;
    gzip_min_length 1k;
    gzip_comp_level 9;
    gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;
    gzip_vary on;
    gzip_disable "MSIE [1-6]\.";
    
    # Document root
    root /usr/share/nginx/html;
    index index.html;
    
    # Handle client-side routing for React apps
    location / {
        # Support browserHistory routing
        try_files \$uri \$uri/index.html /index.html;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    }
    
    # Handle API proxying (optional - adjust URL as needed)
    # Uncomment and modify if you need to proxy API requests
    # location /api {
    #     proxy_pass http://your-backend-server;
    #     proxy_set_header X-Forwarded-Proto \$scheme;
    #     proxy_set_header Host \$http_host;
    #     proxy_set_header X-Real-IP \$remote_addr;
    #     proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    # }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Security: deny access to sensitive files
    location ~ /\.(ht|git) {
        deny all;
    }
}
EOF

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx user and set permissions
RUN addgroup -g 101 -S nginx \
    && adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx \
    && chown -R nginx:nginx /usr/share/nginx/html \
    && chmod -R 755 /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
