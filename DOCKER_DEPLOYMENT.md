# Docker Deployment Guide

This guide explains how to deploy the Go Sample Pertamina application using Docker, following Ant Design Pro deployment best practices.

## Files Overview

- `Dockerfile` - Production build with nginx
- `Dockerfile.dev` - Development build 
- `docker-compose.yml` - Orchestration for both environments
- `.dockerignore` - Excludes unnecessary files from build context

## Quick Start

### Production Deployment

```bash
# Build and run production container
docker-compose up --build

# Or run directly with Docker
docker build -t go-sample-pertamina .
docker run -p 80:80 go-sample-pertamina
```

The application will be available at `http://localhost`

### Development Mode

```bash
# Run development container with hot reload
docker-compose --profile dev up dev --build
```

The development server will be available at `http://localhost:8000`

## Production Features

### Nginx Configuration
- **Gzip compression** for better performance
- **Client-side routing support** for React Router (browserHistory)
- **Security headers** (X-Frame-Options, X-Content-Type-Options, etc.)
- **Static asset caching** with long expiration times
- **Health checks** for container monitoring

### Security
- Runs as non-root user
- Denies access to sensitive files (.git, .htaccess)
- Includes security headers
- Regular security updates during build

### Performance
- Multi-stage build reduces final image size
- Static asset caching
- Gzip compression
- Optimized nginx configuration

## API Proxy Configuration

If your application needs to proxy API requests, uncomment and modify the API location block in the Dockerfile:

```nginx
location /api {
    proxy_pass http://your-backend-server;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

## Environment Variables

You can customize the deployment by setting environment variables:

```bash
# Production
docker run -p 80:80 -e NODE_ENV=production go-sample-pertamina

# With custom API endpoint
docker run -p 80:80 -e API_URL=https://api.example.com go-sample-pertamina
```

## Custom nginx Configuration

To use a custom nginx configuration, mount your config file:

```bash
docker run -p 80:80 \
  -v /path/to/your/nginx.conf:/etc/nginx/conf.d/default.conf \
  go-sample-pertamina
```

## Scaling and Production Deployment

### With Load Balancer

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "80"
    deploy:
      replicas: 3
  
  nginx-lb:
    image: nginx:alpine
    ports:
      - "80:80"
    depends_on:
      - app
```

### Health Checks

The container includes built-in health checks. Monitor with:

```bash
docker inspect --format='{{.State.Health.Status}}' <container_id>
```

## Troubleshooting

### Build Issues
```bash
# Clear Docker cache and rebuild
docker system prune -a
docker-compose build --no-cache
```

### Container Logs
```bash
# View logs
docker-compose logs -f

# Or for specific service
docker logs <container_id>
```

### Permission Issues
If you encounter permission issues, ensure the nginx user has proper access:

```bash
# Check inside container
docker exec -it <container_id> ls -la /usr/share/nginx/html
```

## Performance Optimization

1. **Use .dockerignore** - Already configured to exclude unnecessary files
2. **Multi-stage builds** - Reduces final image size
3. **Static asset caching** - Configured in nginx
4. **Gzip compression** - Enabled for all text-based assets

## Security Best Practices

1. **Non-root user** - Container runs as nginx user
2. **Security headers** - Configured in nginx
3. **Regular updates** - Use `npm audit fix` during build
4. **Minimal attack surface** - Only necessary files in final image

For more deployment options, refer to the [Ant Design Pro deployment documentation](https://pro.ant.design/docs/deploy).
