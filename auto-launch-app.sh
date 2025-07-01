#!/bin/bash

# ===========================================
# SCRIPT DE LANCEMENT AUTOMATIQUE BENNESPRO
# ===========================================

echo "🚀 LANCEMENT AUTOMATIQUE DE BENNESPRO..."

APP_NAME="bennespro"
APP_DIR="/opt/$APP_NAME"

# Aller dans le répertoire de l'application
cd $APP_DIR

# Mettre à jour les permissions
chown -R www-data:www-data $APP_DIR
chmod +x $APP_DIR/scripts/*.sh

# Vérifier que les services Docker sont actifs
echo "🐳 Vérification des services Docker..."
if ! docker-compose ps | grep -q "Up"; then
    echo "🔄 Redémarrage des services Docker..."
    docker-compose down
    docker-compose up -d
    sleep 20
fi

# Vérifier PostgreSQL
echo "🗄️ Vérification PostgreSQL..."
while ! docker exec bennespro_postgres pg_isready -U postgres; do
    echo "⏳ Attente PostgreSQL..."
    sleep 5
done

# Initialiser/Mettre à jour la base de données
echo "📊 Mise à jour base de données..."
npm run db:push

# Démarrer l'application en production
echo "🚀 Démarrage BennesPro en mode production..."
export NODE_ENV=production
npm run start &

# Attendre que l'application soit prête
sleep 15

# Tests de fonctionnement
echo "🧪 Tests de fonctionnement..."

# Test HTTP local
if curl -f http://localhost:5000/api/health 2>/dev/null; then
    echo "✅ Application accessible en HTTP"
else
    echo "❌ Problème HTTP - Vérification des logs..."
    npm run logs
fi

# Test base de données
if docker exec bennespro_postgres psql -U postgres -d remondis_db -c "SELECT COUNT(*) FROM services;" 2>/dev/null; then
    echo "✅ Base de données fonctionnelle"
else
    echo "❌ Problème base de données"
fi

# Afficher le statut final
echo ""
echo "📊 STATUT BENNESPRO:"
echo "==================="
ps aux | grep node | grep -v grep || echo "❌ Processus Node.js non trouvé"
docker ps | grep bennespro || echo "❌ Containers Docker non trouvés"
echo ""

echo "🎯 LANCEMENT TERMINÉ!"
echo "📍 Application disponible sur: http://localhost:5000"
echo "🔧 Logs: docker-compose logs -f"
echo "🔄 Redémarrer: systemctl restart bennespro"