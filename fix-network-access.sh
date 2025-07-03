#!/bin/bash

# FIX ACCÈS RÉSEAU EXTERNE
clear
echo "🌐 CORRECTION ACCÈS RÉSEAU EXTERNE"
echo "================================="

# 1. Vérifier l'état actuel des services
echo "📊 État des services Docker..."
sudo docker ps

# 2. Vérifier les ports ouverts
echo "🔍 Ports ouverts sur le serveur..."
sudo netstat -tulpn | grep -E ':(80|443|8080|5000)'

# 3. Arrêter tous les services existants
echo "🛑 Arrêt des services existants..."
sudo docker stop $(sudo docker ps -q) 2>/dev/null || true

# 4. Nettoyer les conteneurs
echo "🧹 Nettoyage des conteneurs..."
sudo docker rm $(sudo docker ps -aq) 2>/dev/null || true

# 5. Configurer le firewall pour autoriser les connexions
echo "🔥 Configuration du firewall..."
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 5000/tcp

# 6. Créer une configuration Docker avec exposition sur toutes les interfaces
cat > docker-compose-exposed.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: bennespro_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: bennespro
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: BennesProSecure2024!
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "0.0.0.0:5433:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d bennespro"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: bennespro_redis
    restart: unless-stopped
    command: redis-server --bind 0.0.0.0 --protected-mode no
    volumes:
      - redis_data:/data
    ports:
      - "0.0.0.0:6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    container_name: bennespro_app
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:BennesProSecure2024!@postgres:5432/bennespro
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=ultraSecureJWTSecret2024BennesPro!
      - PORT=5000
    ports:
      - "0.0.0.0:5000:5000"
      - "0.0.0.0:8080:5000"
    volumes:
      - ./uploads:/app/uploads
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    container_name: bennespro_nginx
    restart: unless-stopped
    depends_on:
      - app
    ports:
      - "0.0.0.0:80:80"
      - "0.0.0.0:443:443"
    volumes:
      - ./nginx-simple.conf:/etc/nginx/nginx.conf
    command: ["nginx", "-g", "daemon off;"]

volumes:
  postgres_data:
  redis_data:
EOF

# 7. Créer une configuration NGINX simple
cat > nginx-simple.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:5000;
    }
    
    server {
        listen 80;
        server_name _;
        
        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 30s;
            proxy_read_timeout 30s;
            proxy_send_timeout 30s;
        }
        
        location /api/health {
            proxy_pass http://app/api/health;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
EOF

# 8. Démarrer les services avec exposition réseau
echo "🚀 Démarrage des services avec exposition réseau..."
sudo docker-compose -f docker-compose-exposed.yml up -d

# 9. Attendre le démarrage
echo "⏳ Attente du démarrage (30 secondes)..."
sleep 30

# 10. Vérifier l'accessibilité
echo "🔍 Tests d'accessibilité..."
echo "- Test local port 5000:"
curl -I http://localhost:5000/api/health 2>/dev/null || echo "❌ Port 5000 non accessible"

echo "- Test local port 8080:"
curl -I http://localhost:8080/api/health 2>/dev/null || echo "❌ Port 8080 non accessible"

echo "- Test local port 80:"
curl -I http://localhost:80/api/health 2>/dev/null || echo "❌ Port 80 non accessible"

# 11. Vérifier les ports écoutés
echo "🔍 Ports actuellement écoutés:"
sudo netstat -tulpn | grep -E ':(80|443|8080|5000)'

# 12. Afficher l'IP publique
echo "🌐 IP publique du serveur:"
curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "Impossible de déterminer l'IP"

echo ""
echo "🎉 CONFIGURATION TERMINÉE !"
echo "=========================="
echo "🔗 Accès direct: http://purpleguy.world:5000"
echo "🔗 Accès alternatif: http://purpleguy.world:8080"
echo "🔗 Accès NGINX: http://purpleguy.world"
echo ""
echo "🔧 Si toujours inaccessible, vérifiez:"
echo "1. DNS: purpleguy.world pointe vers cette IP"
echo "2. Firewall VPS provider (OVH, Digital Ocean, etc.)"
echo "3. Ports 80, 443, 5000, 8080 ouverts"