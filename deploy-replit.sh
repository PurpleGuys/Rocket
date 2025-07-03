#!/bin/bash

echo "🚀 DÉPLOIEMENT BENNESPRO SUR REPLIT"
echo "================================="

# Vérifier les dépendances
echo "📦 Vérification des dépendances..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

# Installer les dépendances
echo "📥 Installation des dépendances..."
npm install

# Construire l'application
echo "🔨 Construction de l'application..."
npm run build

# Vérifier le build
if [ -d "dist" ]; then
    echo "✅ Build créé avec succès"
    ls -la dist/
else
    echo "❌ Erreur lors du build"
    exit 1
fi

# Démarrer l'application
echo "🚀 Démarrage de l'application..."
echo "Application disponible sur le port configuré par Replit"
npm start