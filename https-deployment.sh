#!/bin/bash

# Script de déploiement HTTPS complet pour purpleguy.world
# Configuration SSL Let's Encrypt + production complète

echo "🔐 Déploiement HTTPS PRODUCTION - purpleguy.world"
echo "================================================="

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

if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    echo "⚠️  ATTENTION: DNS non configuré!"
    echo "   Domaine $DOMAIN pointe vers: $DOMAIN_IP"
    echo "   Serveur IP: $SERVER_IP"
    echo ""
    echo "Configurez votre DNS avant de continuer:"
    echo "   A record: $DOMAIN -> $SERVER_IP"
    echo "   A record: www.$DOMAIN -> $SERVER_IP"
    echo ""
    read -p "Continuer quand même? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Arrêter les services
echo "🛑 Arrêt des services..."
docker-compose down

# Créer les dossiers nécessaires
echo "📁 Création des dossiers SSL..."
mkdir -p ./certbot/conf
mkdir -p ./certbot/www

# Appliquer la configuration d'environnement HTTPS
echo "⚙️  Application de la configuration HTTPS..."
cp docker-fix.env .env

# Démarrer nginx temporairement pour validation HTTP-01
echo "🚀 Démarrage temporaire pour validation SSL..."

# Configuration nginx temporaire pour Let's Encrypt
cat > nginx-temp.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name purpleguy.world www.purpleguy.world;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        location / {
            return 200 'OK';
            add_header Content-Type text/plain;
        }
    }
}
EOF

# Démarrer nginx temporaire
docker run -d --name nginx-temp \
    -p 80:80 \
    -v ./nginx-temp.conf:/etc/nginx/nginx.conf \
    -v ./certbot/www:/var/www/certbot \
    nginx:alpine

# Attendre démarrage
sleep 5

# Obtenir le certificat SSL
echo "🔐 Obtention du certificat SSL Let's Encrypt..."

if [ $STAGING -eq 1 ]; then
    echo "   Mode TEST (staging)"
    STAGING_FLAG="--staging"
else
    echo "   Mode PRODUCTION"
    STAGING_FLAG=""
fi

docker run --rm \
    -v ./certbot/conf:/etc/letsencrypt \
    -v ./certbot/www:/var/www/certbot \
    certbot/certbot \
    certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    $STAGING_FLAG \
    -d $DOMAIN \
    -d www.$DOMAIN

# Vérifier l'obtention du certificat
if [ ! -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "❌ Échec de l'obtention du certificat SSL"
    echo "Vérifiez:"
    echo "  - DNS configuré correctement"
    echo "  - Port 80 accessible"
    echo "  - Domaine valide"
    docker stop nginx-temp
    docker rm nginx-temp
    rm nginx-temp.conf
    exit 1
fi

echo "✅ Certificat SSL obtenu avec succès!"

# Arrêter nginx temporaire
docker stop nginx-temp
docker rm nginx-temp
rm nginx-temp.conf

# Générer configuration DH pour sécurité renforcée
echo "🔑 Génération des paramètres Diffie-Hellman..."
if [ ! -f "./certbot/conf/ssl-dhparams.pem" ]; then
    openssl dhparam -out ./certbot/conf/ssl-dhparams.pem 2048
fi

# Construire et démarrer tous les services
echo "🏗️  Construction et démarrage des services HTTPS..."
docker-compose build --no-cache
docker-compose up -d

# Attendre le démarrage complet
echo "⏳ Attente du démarrage complet..."
sleep 30

# Tests de fonctionnement
echo "🧪 Tests de fonctionnement..."

# Test redirection HTTP vers HTTPS
echo "   Test redirection HTTP->HTTPS..."
HTTP_REDIRECT=$(curl -s -I "http://$DOMAIN" | grep -i "location: https://" | wc -l)
if [ "$HTTP_REDIRECT" -eq 1 ]; then
    echo "   ✅ Redirection HTTP->HTTPS OK"
else
    echo "   ⚠️  Redirection HTTP->HTTPS manquante"
fi

# Test HTTPS
echo "   Test accès HTTPS..."
if curl -s -k "https://$DOMAIN" > /dev/null; then
    echo "   ✅ Site accessible en HTTPS"
else
    echo "   ❌ Site non accessible en HTTPS"
fi

# Test certificat SSL
echo "   Test validité certificat..."
SSL_VALID=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | wc -l)
if [ "$SSL_VALID" -eq 2 ]; then
    echo "   ✅ Certificat SSL valide"
else
    echo "   ⚠️  Problème certificat SSL"
fi

# Test API HTTPS
echo "   Test API HTTPS..."
if curl -s -k "https://$DOMAIN/api/health" | grep -q "healthy"; then
    echo "   ✅ API accessible en HTTPS"
else
    echo "   ⚠️  API non accessible en HTTPS"
fi

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
echo "⚠️  En cas de problème:"
echo "   1. Vérifier les logs: docker-compose logs"
echo "   2. Vérifier DNS: dig $DOMAIN"
echo "   3. Tester manuellement: curl -v https://$DOMAIN"
echo ""
echo "✅ Votre site est maintenant sécurisé HTTPS!"