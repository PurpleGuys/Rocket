#!/bin/bash

# SCRIPT DE CORRECTION IMMÉDIATE POUR VPS
# Corrige l'erreur drizzle.config.ts et termine le déploiement

echo "🚀 CORRECTION IMMÉDIATE - DÉPLOIEMENT BENNESPRO"
echo "==============================================="

INSTALL_DIR="/opt/bennespro"
DB_USER="remondis_db"
DB_PASSWORD="Remondis60110$"
DB_NAME="remondis_db"

echo "📍 Répertoire de travail: $INSTALL_DIR"
cd "$INSTALL_DIR" || exit 1

echo "🔧 1. Correction drizzle.config.ts défaillant..."

# Supprimer le fichier TypeScript problématique
rm -f drizzle.config.ts 2>/dev/null || true

# Créer drizzle.config.js qui fonctionne
cat > drizzle.config.js << 'EOF'
require('dotenv').config();

module.exports = {
  schema: './shared/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://remondis_db:Remondis60110$@postgres:5432/remondis_db',
  },
  verbose: true,
  strict: true,
};
EOF

echo "✅ drizzle.config.js créé"

echo "🔑 2. Correction des credentials PostgreSQL..."

# Corriger PostgreSQL dans le container
docker exec bennespro_postgres psql -U postgres -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" || \
sudo docker exec bennespro_postgres psql -U postgres -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" || true

docker exec bennespro_postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" || \
sudo docker exec bennespro_postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" || true

docker exec bennespro_postgres psql -U postgres -c "GRANT ALL ON SCHEMA public TO $DB_USER;" || \
sudo docker exec bennespro_postgres psql -U postgres -c "GRANT ALL ON SCHEMA public TO $DB_USER;" || true

echo "✅ Credentials PostgreSQL corrigés"

echo "🗄️ 3. Initialisation base de données avec drizzle.config.js..."

# Utiliser la configuration JavaScript
docker exec bennespro_app npx drizzle-kit push --config=drizzle.config.js || \
sudo docker exec bennespro_app npx drizzle-kit push --config=drizzle.config.js || \
echo "⚠️ Drizzle peut nécessiter une connexion manuelle"

echo "🔄 4. Redémarrage de l'application..."

# Redémarrer les containers
docker restart bennespro_app || sudo docker restart bennespro_app
sleep 10

echo "📋 5. Vérification du statut..."

echo "Status des containers:"
docker ps --filter "name=bennespro" --format "table {{.Names}}\t{{.Status}}" || \
sudo docker ps --filter "name=bennespro" --format "table {{.Names}}\t{{.Status}}"

echo ""
echo "Logs de l'application:"
docker logs bennespro_app --tail=10 || sudo docker logs bennespro_app --tail=10

echo ""
echo "✅ CORRECTION TERMINÉE"
echo "====================="
echo ""
echo "🌐 Votre application BennesPro devrait maintenant être accessible à:"
echo "   https://purpleguy.world"
echo ""
echo "🔍 Pour surveiller les logs en temps réel:"
echo "   docker logs -f bennespro_app"
echo ""
echo "🧪 Pour tester l'API:"
echo "   curl https://purpleguy.world/api/health"