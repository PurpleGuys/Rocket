#!/bin/bash

# Script de déploiement pour serveur VPS
# Usage: ./deploy.sh [production|staging]

set -e

ENV=${1:-production}

echo "🚀 Déploiement de l'application Remondis en mode $ENV"

# Configuration des couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction de log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Vérification des prérequis
check_prerequisites() {
    log "Vérification des prérequis..."
    
    command -v node >/dev/null 2>&1 || error "Node.js n'est pas installé"
    command -v npm >/dev/null 2>&1 || error "npm n'est pas installé"
    command -v git >/dev/null 2>&1 || error "git n'est pas installé"
    
    # Vérifier la version de Node.js
    NODE_VERSION=$(node --version | cut -d'.' -f1 | cut -d'v' -f2)
    if [ "$NODE_VERSION" -lt 18 ]; then
        error "Node.js version 18 ou supérieure requise (version actuelle: $(node --version))"
    fi
    
    log "Prérequis validés ✅"
}

# Configuration de l'environnement
setup_environment() {
    log "Configuration de l'environnement $ENV..."
    
    # Créer les répertoires nécessaires
    mkdir -p logs uploads dist ssl
    
    # Vérifier la présence du fichier .env
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            warning "Fichier .env créé depuis .env.example. Veuillez le configurer avant de continuer."
            error "Configuration requise dans le fichier .env"
        else
            error "Fichier .env.example introuvable"
        fi
    fi
    
    # Définir NODE_ENV
    export NODE_ENV=$ENV
    
    log "Environnement configuré ✅"
}

# Installation des dépendances
install_dependencies() {
    log "Installation des dépendances..."
    
    if [ "$ENV" = "production" ]; then
        npm ci --only=production
    else
        npm ci
    fi
    
    log "Dépendances installées ✅"
}

# Build de l'application
build_application() {
    log "Construction de l'application..."
    
    npm run build
    
    if [ ! -f "dist/index.js" ]; then
        error "Le build a échoué - fichier dist/index.js introuvable"
    fi
    
    log "Application construite ✅"
}

# Configuration de la base de données
setup_database() {
    log "Configuration de la base de données..."
    
    # Vérifier la connexion à la base de données
    if ! npm run db:push --silent; then
        error "Impossible de se connecter à la base de données. Vérifiez DATABASE_URL dans .env"
    fi
    
    log "Base de données configurée ✅"
}

# Configuration des permissions
setup_permissions() {
    log "Configuration des permissions..."
    
    # Permissions pour les répertoires
    chmod 755 logs uploads
    chmod 600 .env
    
    # Permissions pour les scripts
    chmod +x deploy.sh
    
    log "Permissions configurées ✅"
}

# Configuration du serveur web
setup_web_server() {
    log "Configuration du serveur web..."
    
    # Vérifier si PM2 est installé
    if ! command -v pm2 >/dev/null 2>&1; then
        log "Installation de PM2..."
        npm install -g pm2
    fi
    
    # Vérifier si Nginx est installé (optionnel)
    if ! command -v nginx >/dev/null 2>&1; then
        warning "Nginx n'est pas installé. Considérez l'installer pour un reverse proxy."
    fi
    
    log "Serveur web configuré ✅"
}

# Démarrage de l'application
start_application() {
    log "Démarrage de l'application..."
    
    # Arrêter l'application si elle tourne déjà
    pm2 stop remondis-app 2>/dev/null || true
    pm2 delete remondis-app 2>/dev/null || true
    
    # Démarrer avec PM2
    pm2 start ecosystem.config.js --env $ENV
    
    # Sauvegarder la configuration PM2
    pm2 save
    
    # Configurer PM2 pour démarrer au boot (si pas déjà fait)
    pm2 startup 2>/dev/null || true
    
    log "Application démarrée ✅"
}

# Vérification de la santé de l'application
health_check() {
    log "Vérification de la santé de l'application..."
    
    # Attendre que l'application démarre
    sleep 5
    
    # Vérifier que l'application répond
    PORT=${PORT:-5000}
    if curl -f http://localhost:$PORT/api/health >/dev/null 2>&1; then
        log "Application accessible sur le port $PORT ✅"
    else
        warning "L'application ne semble pas répondre sur le port $PORT"
        log "Vérifiez les logs avec: pm2 logs remondis-app"
    fi
}

# Configuration du firewall (optionnel)
setup_firewall() {
    if command -v ufw >/dev/null 2>&1; then
        log "Configuration du firewall..."
        
        ufw allow 22/tcp    # SSH
        ufw allow 80/tcp    # HTTP
        ufw allow 443/tcp   # HTTPS
        ufw allow 5000/tcp  # Application (si pas de reverse proxy)
        
        log "Firewall configuré ✅"
    fi
}

# Affichage des informations post-déploiement
show_deployment_info() {
    log "🎉 Déploiement terminé avec succès!"
    echo ""
    echo "📋 Informations de déploiement:"
    echo "   - Environnement: $ENV"
    echo "   - Port: ${PORT:-5000}"
    echo "   - Logs: pm2 logs remondis-app"
    echo "   - Status: pm2 status"
    echo "   - Restart: pm2 restart remondis-app"
    echo ""
    echo "🔧 Commandes utiles:"
    echo "   - pm2 monit                    # Monitoring en temps réel"
    echo "   - pm2 logs remondis-app        # Voir les logs"
    echo "   - pm2 reload remondis-app      # Redémarrage sans downtime"
    echo "   - pm2 stop remondis-app        # Arrêter l'application"
    echo ""
    
    if [ "$ENV" = "production" ]; then
        echo "⚠️  N'oubliez pas de:"
        echo "   - Configurer SSL/HTTPS"
        echo "   - Mettre en place les sauvegardes de base de données"
        echo "   - Configurer la surveillance"
    fi
}

# Script principal
main() {
    check_prerequisites
    setup_environment
    install_dependencies
    build_application
    setup_database
    setup_permissions
    setup_web_server
    start_application
    health_check
    setup_firewall
    show_deployment_info
}

# Exécution du script principal
main "$@"