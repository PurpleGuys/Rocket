#!/bin/bash

# Script corrigé de déploiement HTTPS pour purpleguy.world
# Gère le conflit de port existant

echo "🔐 Déploiement HTTPS PRODUCTION - purpleguy.world (CORRIGÉ)"
echo "=========================================================="

# Variables
DOMAIN="purpleguy.world"
EMAIL="admin@purpleguy.world"  # Remplacez par votre email
STAGING=0  # 0 pour production, 1 pour test

# Vérifications préalables
echo "🔍 Vérifications préalables..."

# Vérifier que le domaine pointe vers ce serveur
echo "📡 Vérification DNS pour $DOMAIN..."
DOMAIN_IP=$(dig +short $DOMAIN)
SERVER_IP=$(curl -s http://ipecho.net/plain)

echo "   Domaine $DOMAIN pointe vers: $DOMAIN_IP"
echo "   Serveur IP: $SERVER_IP"

if [ "$DOMAIN_IP" = "$SERVER_IP" ]; then
    echo "✅ DNS correctement configuré"
else
    echo "⚠️  DNS différent mais on continue..."
fi

# Créer les dossiers nécessaires
echo "📁 Création des dossiers SSL..."
mkdir -p ./certbot/conf
mkdir -p ./certbot/www

# Étape 1: Créer configuration nginx temporaire pour Let's Encrypt
echo "🔧 Création configuration nginx temporaire..."

# Sauvegarder nginx.conf actuel
cp nginx.conf nginx.conf.backup

# Configuration nginx temporaire pour validation HTTP-01
cat > nginx-ssl-temp.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Configuration des logs
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

    # Configuration temporaire pour Let's Encrypt
    server {
        listen 80;
        server_name purpleguy.world www.purpleguy.world;
        
        # ACME challenge pour Let's Encrypt
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
            try_files $uri $uri/ =404;
        }
        
        # Proxy vers l'application pour le reste
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

# Appliquer la configuration temporaire
echo "🔄 Application de la configuration temporaire..."
cp nginx-ssl-temp.conf nginx.conf

# Arrêter et redémarrer avec nouvelle configuration
echo "🔄 Redémarrage nginx avec configuration Let's Encrypt..."
docker-compose down nginx || true
docker-compose up -d nginx

# Attendre que nginx soit prêt
echo "⏳ Attente démarrage nginx..."
sleep 10

# Test du serveur web
echo "🧪 Test accès au serveur..."
if curl -s "http://$DOMAIN/.well-known/acme-challenge/test" | grep -q "404"; then
    echo "✅ Serveur accessible pour validation ACME"
else
    echo "⚠️  Serveur accessible mais réponse différente"
fi

# Obtenir le certificat SSL
echo "🔐 Obtention du certificat SSL Let's Encrypt..."

if [ $STAGING -eq 1 ]; then
    echo "   Mode TEST (staging)"
    STAGING_FLAG="--staging"
else
    echo "   Mode PRODUCTION"
    STAGING_FLAG=""
fi

# Commande certbot corrigée
docker run --rm --name certbot-run \
    -v ./certbot/conf:/etc/letsencrypt \
    -v ./certbot/www:/var/www/certbot \
    certbot/certbot \
    certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --expand \
    $STAGING_FLAG \
    -d $DOMAIN \
    -d www.$DOMAIN

# Vérifier l'obtention du certificat
if [ ! -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "❌ Échec de l'obtention du certificat SSL"
    echo ""
    echo "Debug:"
    echo "Contenu dossier certbot:"
    ls -la ./certbot/conf/
    echo ""
    echo "Logs certbot:"
    docker run --rm -v ./certbot/conf:/etc/letsencrypt certbot/certbot logs
    echo ""
    echo "Test manuel:"
    curl -v "http://$DOMAIN/.well-known/acme-challenge/"
    
    # Restaurer configuration
    cp nginx.conf.backup nginx.conf
    docker-compose restart nginx
    exit 1
fi

echo "✅ Certificat SSL obtenu avec succès!"

# Générer configuration DH pour sécurité renforcée
echo "🔑 Génération des paramètres Diffie-Hellman..."
if [ ! -f "./certbot/conf/ssl-dhparams.pem" ]; then
    openssl dhparam -out ./certbot/conf/ssl-dhparams.pem 2048
fi

# Restaurer la configuration nginx HTTPS complète
echo "🔧 Application de la configuration HTTPS finale..."
cp nginx.conf.backup nginx.conf

# Appliquer la configuration d'environnement HTTPS
echo "⚙️  Application de la configuration d'environnement HTTPS..."
cp docker-fix.env .env

# Redémarrer tous les services avec HTTPS
echo "🚀 Redémarrage avec configuration HTTPS complète..."
docker-compose down
docker-compose build --no-cache app
docker-compose up -d

# Attendre le démarrage complet
echo "⏳ Attente du démarrage complet..."
sleep 30

# Tests de fonctionnement
echo "🧪 Tests de fonctionnement HTTPS..."

# Test redirection HTTP vers HTTPS
echo "   Test redirection HTTP->HTTPS..."
HTTP_RESPONSE=$(curl -s -I "http://$DOMAIN" | head -n 1)
echo "   Réponse HTTP: $HTTP_RESPONSE"

# Test HTTPS
echo "   Test accès HTTPS..."
if curl -s -k --connect-timeout 10 "https://$DOMAIN" > /dev/null; then
    echo "   ✅ Site accessible en HTTPS"
else
    echo "   ⚠️  Site non accessible en HTTPS"
fi

# Test certificat SSL
echo "   Test validité certificat..."
if echo | timeout 10 openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates >/dev/null 2>&1; then
    echo "   ✅ Certificat SSL valide"
else
    echo "   ⚠️  Problème certificat SSL"
fi

# Test API HTTPS
echo "   Test API HTTPS..."
if curl -s -k --connect-timeout 10 "https://$DOMAIN/api/health" | grep -q "healthy"; then
    echo "   ✅ API accessible en HTTPS"
else
    echo "   ⚠️  API non accessible en HTTPS"
fi

# Nettoyage
rm -f nginx-ssl-temp.conf

# Affichage final
echo ""
echo "🎉 DÉPLOIEMENT HTTPS TERMINÉ!"
echo "=============================="
echo ""
echo "🌐 URLs d'accès:"
echo "   Production: https://$DOMAIN"
echo "   Alternative: https://www.$DOMAIN"
echo ""
echo "🔐 Certificat SSL:"
echo "   Émetteur: Let's Encrypt"
echo "   Renouvellement automatique: OUI"
echo ""
echo "📊 État des services:"
docker-compose ps
echo ""
echo "📋 Logs en temps réel:"
echo "   docker-compose logs -f"
echo ""
echo "🔄 Commandes utiles:"
echo "   docker-compose restart nginx  # Redémarrer nginx"
echo "   docker-compose logs nginx     # Logs nginx"
echo "   docker-compose logs app       # Logs application"
echo ""
echo "🧪 Tests manuels:"
echo "   curl -v https://$DOMAIN"
echo "   curl -I http://$DOMAIN  # Test redirection"
echo ""
echo "✅ Votre site est maintenant sécurisé HTTPS!"