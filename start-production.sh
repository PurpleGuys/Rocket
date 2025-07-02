
#!/bin/bash

echo "🚀 Démarrage BennesPro en mode production"

# Variables d'environnement
export NODE_ENV=production
export PORT=5000
export HOST=0.0.0.0

# Vérifier et installer les dépendances
echo "📦 Vérification des dépendances..."
npm ci --production

# Build du frontend
echo "🏗️ Construction du frontend..."
npm run build

# Vérification de la construction
if [ ! -d "client/dist" ]; then
    echo "❌ Erreur: Build du frontend échoué"
    exit 1
fi

# Démarrage de l'application
echo "🎯 Démarrage de l'application en production..."
exec npm start
