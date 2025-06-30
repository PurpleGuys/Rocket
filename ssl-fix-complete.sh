#!/bin/bash

# Solution complète SSL pour purpleguy.world
# Gère tous les conflits nginx et obtient le certificat SSL

echo "🔐 SOLUTION COMPLÈTE SSL - purpleguy.world"
echo "=========================================="

DOMAIN="purpleguy.world"
EMAIL="admin@purpleguy.world"

# Étape 1: Identifier et arrêter les services qui utilisent le port 80
echo "🔍 Identification des services sur le port 80..."

# Vérifier qui utilise le port 80
PORT_80_USERS=$(sudo netstat -tlnp 2>/dev/null | grep :80 || sudo ss -tlnp | grep :80 || true)
echo "Services sur port 80:"
echo "$PORT_80_USERS"

# Arrêter nginx système s'il existe
if sudo systemctl is-active --quiet nginx 2>/dev/null; then
    echo "🛑 Arrêt nginx système..."
    sudo systemctl stop nginx
    echo "✅ Nginx système arrêté"
fi

# Arrêter apache s'il existe
if sudo systemctl is-active --quiet apache2 2>/dev/null; then
    echo "🛑 Arrêt Apache..."
    sudo systemctl stop apache2
    echo "✅ Apache arrêté"
fi

# Arrêter docker-compose actuel
echo "🛑 Arrêt services Docker..."
docker-compose down 2>/dev/null || true

# Attendre que le port soit libéré
echo "⏳ Attente libération port 80..."
sleep 5

# Vérifier que le port 80 est libre
if sudo netstat -tlnp 2>/dev/null | grep -q :80 || sudo ss -tlnp 2>/dev/null | grep -q :80; then
    echo "❌ Port 80 encore occupé. Forçage..."
    # Tuer tous les processus sur le port 80
    sudo fuser -k 80/tcp 2>/dev/null || true
    sleep 3
fi

# Étape 2: Créer les dossiers SSL
echo "📁 Création des dossiers SSL..."
mkdir -p ./certbot/conf
mkdir -p ./certbot/www
sudo chown -R $USER:$USER ./certbot/

# Étape 3: Lancer nginx temporaire pour validation ACME
echo "🚀 Démarrage nginx temporaire pour validation SSL..."

# Configuration nginx minimale pour ACME
cat > nginx-acme.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name purpleguy.world www.purpleguy.world;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
            try_files $uri $uri/ =404;
        }
        
        location / {
            return 200 "ACME validation server";
            add_header Content-Type text/plain;
        }
    }
}
EOF

# Lancer nginx temporaire
docker run -d --name nginx-acme \
    -p 80:80 \
    -v $(pwd)/nginx-acme.conf:/etc/nginx/nginx.conf \
    -v $(pwd)/certbot/www:/var/www/certbot \
    nginx:alpine

# Attendre démarrage
sleep 5

# Test du serveur ACME
echo "🧪 Test serveur ACME..."
if curl -s "http://$DOMAIN/" | grep -q "ACME validation"; then
    echo "✅ Serveur ACME opérationnel"
else
    echo "⚠️ Serveur ACME ne répond pas comme attendu"
fi

# Étape 4: Obtenir le certificat SSL
echo "🔐 Obtention certificat SSL Let's Encrypt..."

# Obtenir le certificat
docker run --rm \
    -v $(pwd)/certbot/conf:/etc/letsencrypt \
    -v $(pwd)/certbot/www:/var/www/certbot \
    certbot/certbot \
    certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --expand \
    -d $DOMAIN \
    -d www.$DOMAIN

# Vérifier l'obtention du certificat
if [ -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "✅ Certificat SSL obtenu avec succès!"
    
    # Afficher les détails du certificat
    echo "📋 Détails du certificat:"
    docker run --rm -v $(pwd)/certbot/conf:/etc/letsencrypt certbot/certbot certificates
else
    echo "❌ Échec obtention certificat SSL"
    
    # Essayer avec le domaine principal uniquement
    echo "🔄 Tentative avec domaine principal uniquement..."
    docker run --rm \
        -v $(pwd)/certbot/conf:/etc/letsencrypt \
        -v $(pwd)/certbot/www:/var/www/certbot \
        certbot/certbot \
        certonly --webroot \
        --webroot-path=/var/www/certbot \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN
fi

# Arrêter nginx temporaire
echo "🛑 Arrêt nginx temporaire..."
docker stop nginx-acme
docker rm nginx-acme
rm nginx-acme.conf

# Étape 5: Configurer l'environnement pour HTTPS
echo "⚙️ Configuration environnement HTTPS..."
cp docker-fix.env .env

# Générer paramètres DH si nécessaire
if [ ! -f "./certbot/conf/ssl-dhparams.pem" ]; then
    echo "🔑 Génération paramètres Diffie-Hellman..."
    openssl dhparam -out ./certbot/conf/ssl-dhparams.pem 2048
fi

# Étape 6: Créer configuration nginx finale
echo "🔧 Configuration nginx finale..."

# Si certificat obtenu, utiliser configuration HTTPS complète
if [ -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "✅ Utilisation configuration HTTPS complète"
    # Le nginx.conf est déjà configuré pour HTTPS
else
    echo "⚠️ Certificat non obtenu, configuration HTTP seulement"
    # Créer configuration nginx sans SSL
    cat > nginx-http-only.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    upstream app {
        server app:5000;
    }

    server {
        listen 80;
        server_name purpleguy.world www.purpleguy.world 162.19.67.3;
        
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
EOF
    cp nginx-http-only.conf nginx.conf
fi

# Étape 7: Démarrer les services finaux
echo "🚀 Démarrage services finaux..."
docker-compose build --no-cache app
docker-compose up -d

# Attendre démarrage
echo "⏳ Attente démarrage complet..."
sleep 30

# Étape 8: Tests finaux
echo "🧪 Tests finaux..."

# Test HTTP
if curl -s "http://$DOMAIN" > /dev/null; then
    echo "✅ Site accessible en HTTP"
else
    echo "❌ Site non accessible en HTTP"
fi

# Test HTTPS si certificat obtenu
if [ -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    if curl -s -k "https://$DOMAIN" > /dev/null; then
        echo "✅ Site accessible en HTTPS"
    else
        echo "⚠️ Site non accessible en HTTPS"
    fi
fi

# Redémarrer nginx système après si nécessaire
if [ -f "/etc/systemd/system/nginx.service" ]; then
    echo "ℹ️ Nginx système détecté mais laissé arrêté pour éviter les conflits"
fi

# Affichage final
echo ""
echo "🎉 DÉPLOIEMENT SSL TERMINÉ"
echo "========================="
echo ""

if [ -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "🔐 HTTPS activé:"
    echo "   https://$DOMAIN"
    echo "   https://www.$DOMAIN"
else
    echo "⚠️ HTTPS non activé (certificat non obtenu)"
    echo "   http://$DOMAIN"
fi

echo ""
echo "📊 État des services:"
docker-compose ps
echo ""
echo "🔍 Ports utilisés:"
sudo netstat -tlnp | grep -E ':80|:443' || sudo ss -tlnp | grep -E ':80|:443'
echo ""
echo "💡 Commandes utiles:"
echo "   docker-compose logs -f     # Logs en temps réel"
echo "   docker-compose restart     # Redémarrer tous les services"
echo "   curl -v https://$DOMAIN    # Test HTTPS"

# Nettoyage
rm -f nginx-http-only.conf