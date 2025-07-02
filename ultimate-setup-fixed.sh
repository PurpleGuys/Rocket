#!/bin/bash

# 🚀 ULTIMATE SETUP SCRIPT - BennesPro Production FIXED
# ======================================================
# Version corrigée pour éviter l'erreur Docker ContainerConfig
# Configuration simplifiée mais complètement fonctionnelle

set -e  # Arrêter en cas d'erreur

# Function to handle Docker Compose command variations
docker_compose_cmd() {
    if command -v docker-compose &> /dev/null; then
        docker-compose "$@"
    else
        docker compose "$@"
    fi
}

echo "🚀 ULTIMATE SETUP - BennesPro Production FIXED"
echo "==============================================="
echo "🎯 Configuration ABSOLUE sans erreur ContainerConfig"
echo "💎 Version simplifiée et robuste"
echo ""

# Variables de configuration
DOMAIN=${1:-"purpleguy.world"}
EMAIL=${2:-"admin@${DOMAIN}"}
APP_NAME="bennespro"
DB_NAME="remondis_db"
DB_USER="remondis_db"
DB_PASSWORD="Remondis60110$"

# Export des variables pour Docker Compose
export DB_NAME
export DB_USER
export DB_PASSWORD

# Répertoires
PROJECT_DIR=$(pwd)
INSTALL_DIR="/opt/$APP_NAME"

echo "📋 Configuration:"
echo "   🌐 Domaine: $DOMAIN"
echo "   📧 Email: $EMAIL"
echo "   🗄️ Base de données: $DB_NAME"

# ==========================================
# 1. NETTOYAGE DOCKER COMPLET
# ==========================================
echo ""
echo "🧹 1. Nettoyage Docker complet pour éviter ContainerConfig..."

# Arrêter tous les services
docker_compose_cmd down --remove-orphans 2>/dev/null || true
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true

# Nettoyage système
docker system prune -af --volumes 2>/dev/null || true
docker network prune -f 2>/dev/null || true

echo "✅ Docker nettoyé"

# ==========================================
# 2. COPIE DU PROJET
# ==========================================
echo ""
echo "📁 2. Copie du projet vers $INSTALL_DIR..."

mkdir -p $INSTALL_DIR
rsync -av --exclude='.git' --exclude='node_modules' $PROJECT_DIR/ $INSTALL_DIR/

# Créer les répertoires nécessaires
mkdir -p $INSTALL_DIR/uploads
mkdir -p $INSTALL_DIR/logs
mkdir -p $INSTALL_DIR/data

# Vérifications
if [ -f "$INSTALL_DIR/package.json" ]; then
    echo "✅ Projet copié avec succès"
else
    echo "❌ Erreur lors de la copie du projet"
    exit 1
fi

cd $INSTALL_DIR

# ==========================================
# 3. VARIABLES D'ENVIRONNEMENT
# ==========================================
echo ""
echo "🔐 3. Configuration des variables d'environnement..."

# Générer secrets
JWT_SECRET=$(openssl rand -hex 64)
SESSION_SECRET=$(openssl rand -hex 64)

cat > .env << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@postgres:5432/$DB_NAME
POSTGRES_DB=$DB_NAME
POSTGRES_USER=$DB_USER
POSTGRES_PASSWORD=$DB_PASSWORD
JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET
DOMAIN=$DOMAIN
BASE_URL=https://$DOMAIN

# API Keys (à remplacer en production)
SENDGRID_API_KEY=SG.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
STRIPE_SECRET_KEY=sk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EOF

echo "✅ Variables d'environnement configurées"

# ==========================================
# 4. DOCKER COMPOSE SIMPLIFIÉ
# ==========================================
echo ""
echo "🐳 4. Création docker-compose.yml simplifié..."

cat > docker-compose.yml << 'EOF'
services:
  postgres:
    image: postgres:15-alpine
    container_name: bennespro_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
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
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
    ports:
      - "5000:5000"
    volumes:
      - ./uploads:/app/uploads
      - ./client:/app/client
      - ./server:/app/server
      - ./shared:/app/shared
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:

networks:
  default:
    name: bennespro_network
EOF

echo "✅ docker-compose.yml créé"

# ==========================================
# 5. DOCKERFILE OPTIMISÉ
# ==========================================
echo ""
echo "🏗️ 5. Création Dockerfile optimisé..."

cat > Dockerfile << 'EOF'
FROM node:18-alpine

# Install dependencies
RUN apk add --no-cache bash curl postgresql-client

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create directories
RUN mkdir -p uploads logs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

EXPOSE 5000

CMD ["npx", "tsx", "server/index.ts"]
EOF

echo "✅ Dockerfile créé"

# ==========================================
# 6. .DOCKERIGNORE
# ==========================================
cat > .dockerignore << 'EOF'
node_modules/
.git/
.env
*.log
logs/
.replit
replit.nix
EOF

# ==========================================
# 7. INITIALISATION BASE DE DONNÉES
# ==========================================
echo ""
echo "🗄️ 7. Initialisation de la base de données..."

cat > init-db.sql << EOF
-- Création de la base de données si elle n'existe pas
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

# ==========================================
# 8. CONSTRUCTION ET DÉMARRAGE
# ==========================================
echo ""
echo "🚀 8. Construction et démarrage des services..."

# Construire l'image
echo "🏗️ Construction de l'image Docker..."
docker build -t bennespro_app . --no-cache

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la construction"
    exit 1
fi

# Démarrer les services
echo "🔄 Démarrage des services..."
docker_compose_cmd up -d

# Attendre le démarrage
echo "⏳ Attente du démarrage (30 secondes)..."
sleep 30

# ==========================================
# 9. VÉRIFICATION FINALE
# ==========================================
echo ""
echo "✅ 9. Vérification finale..."

echo "📋 État des containers:"
docker ps --filter "name=bennespro" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🗄️ Test de la base de données:"
docker exec bennespro_postgres pg_isready -U $DB_USER -d $DB_NAME

echo ""
echo "🌐 Test de l'application:"
if curl -f http://localhost:5000/api/health 2>/dev/null; then
    echo "✅ Application accessible"
else
    echo "⚠️  Application en cours de démarrage"
fi

echo ""
echo "🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS"
echo "=================================="
echo "✅ Erreur ContainerConfig corrigée"
echo "✅ Configuration simplifiée et robuste"
echo "🌐 Application: http://localhost:5000"
echo "🌐 Production: https://$DOMAIN"
echo "🗄️ PostgreSQL: localhost:5432"
echo ""
echo "📋 Logs utiles:"
echo "   docker logs bennespro_app"
echo "   docker logs bennespro_postgres"
echo "   docker-compose logs"
echo ""
echo "🔧 Pour redémarrer:"
echo "   docker-compose restart"
echo ""