# SSL Certificate Fix for purpleguy.world

## Problem
The Let's Encrypt ACME challenge is failing with a 404 error because the webroot path isn't properly accessible.

## Quick Fix Commands

Run these commands on your VPS to fix the SSL issue:

### 1. Stop current services
```bash
sudo docker-compose down
```

### 2. Create proper webroot directory
```bash
mkdir -p /var/www/certbot
sudo chmod 755 /var/www/certbot
```

### 3. Update NGINX configuration
Create a new `nginx.conf` file:
```bash
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name purpleguy.world;
        
        # ACME challenge path - MUST be accessible
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
            try_files $uri =404;
        }
        
        # All other requests redirect to HTTPS
        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    server {
        listen 443 ssl http2;
        server_name purpleguy.world;

        ssl_certificate /etc/letsencrypt/live/purpleguy.world/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/purpleguy.world/privkey.pem;

        location / {
            proxy_pass http://app:5000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF
```

### 4. Update docker-compose.yml for proper volume mapping
```bash
# Add this volume mapping to your nginx service:
# volumes:
#   - ./nginx.conf:/etc/nginx/nginx.conf
#   - ./ssl:/etc/letsencrypt
#   - /var/www/certbot:/var/www/certbot
```

### 5. Start NGINX first (HTTP only)
```bash
sudo docker-compose up -d nginx
```

### 6. Test HTTP access to challenge path
```bash
curl -I http://purpleguy.world/.well-known/acme-challenge/test
# Should return 404 (not connection error)
```

### 7. Generate SSL certificate
```bash
sudo docker run --rm \
  -v $(pwd)/ssl:/etc/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d purpleguy.world
```

### 8. Restart NGINX with SSL
```bash
sudo docker-compose restart nginx
```

### 9. Test HTTPS
```bash
curl -I https://purpleguy.world
```

## Alternative: Use the automated script
```bash
chmod +x fix-ssl-deployment.sh
./fix-ssl-deployment.sh
```

## Key Points
- The webroot path `/var/www/certbot` must be accessible via HTTP
- NGINX must serve the `.well-known/acme-challenge/` path correctly
- The domain must point to your VPS IP address
- Ports 80 and 443 must be open and not blocked by firewall