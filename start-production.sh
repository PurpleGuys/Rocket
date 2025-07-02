
#!/bin/bash

echo "🚀 Démarrage BennesPro en mode production sur Replit"

# Définir les variables d'environnement
export NODE_ENV=production
export PORT=5000
export HOST=0.0.0.0

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Construire le frontend si nécessaire
if [ ! -d "client/dist" ]; then
    echo "🏗️ Construction du frontend..."
    npm run build
fi

# Démarrer l'application
echo "🎯 Lancement de l'application..."
npm start
