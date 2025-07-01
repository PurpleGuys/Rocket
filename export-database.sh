#!/bin/bash

# =====================================
# EXPORT BASE DE DONNÉES BENNESPRO
# Pour migration vers VPS production
# =====================================

echo "🗄️ EXPORT BASE DE DONNÉES BENNESPRO"
echo "===================================="

# Variables de configuration
DB_HOST="${PGHOST:-localhost}"
DB_PORT="${PGPORT:-5432}"
DB_NAME="${PGDATABASE:-}"
DB_USER="${PGUSER:-}"

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL non définie"
    exit 1
fi

echo "📊 Export des données depuis Replit..."

# Créer le répertoire d'export
mkdir -p database-export

# Export complet avec structure et données
echo "📋 Export structure et données..."
pg_dump "$DATABASE_URL" \
    --verbose \
    --clean \
    --no-acl \
    --no-owner \
    --format=custom \
    --file=database-export/bennespro-complete.dump

# Export en SQL lisible
echo "📝 Export SQL lisible..."
pg_dump "$DATABASE_URL" \
    --verbose \
    --clean \
    --no-acl \
    --no-owner \
    --inserts \
    --file=database-export/bennespro-data.sql

# Export seulement la structure
echo "🏗️ Export structure uniquement..."
pg_dump "$DATABASE_URL" \
    --verbose \
    --schema-only \
    --clean \
    --no-acl \
    --no-owner \
    --file=database-export/bennespro-schema.sql

# Export seulement les données
echo "📊 Export données uniquement..."
pg_dump "$DATABASE_URL" \
    --verbose \
    --data-only \
    --no-acl \
    --no-owner \
    --inserts \
    --file=database-export/bennespro-data-only.sql

echo "✅ Export terminé !"
echo ""
echo "📁 Fichiers créés:"
echo "  • database-export/bennespro-complete.dump  (Format binaire complet)"
echo "  • database-export/bennespro-data.sql       (SQL complet lisible)"
echo "  • database-export/bennespro-schema.sql     (Structure uniquement)"
echo "  • database-export/bennespro-data-only.sql  (Données uniquement)"
echo ""
echo "📦 Pour inclure dans le déploiement:"
echo "tar -czf database-export.tar.gz database-export/"