#!/bin/bash

# Script de dépannage Docker pour résoudre l'erreur de chemin
# Usage: ./docker-troubleshoot.sh

echo "🔧 Résolution du problème Docker - Erreur de chemin undefined"
echo "============================================================="

# 1. Arrêter tous les conteneurs
echo "📦 Arrêt des conteneurs Docker..."
docker-compose down

# 2. Nettoyer les conteneurs et images
echo "🧹 Nettoyage des conteneurs..."
docker system prune -f

# 3. Copier la configuration corrigée
echo "📝 Configuration des variables d'environnement..."
cp docker-fix.env .env

# 4. Reconstruire l'image avec une nouvelle approche
echo "🔨 Reconstruction de l'image Docker..."
docker-compose build --no-cache

# 5. Démarrer avec la nouvelle configuration
echo "🚀 Démarrage des services..."
docker-compose up -d

# 6. Attendre que les services démarrent
echo "⏳ Attente du démarrage des services..."
sleep 10

# 7. Vérifier les logs
echo "📋 Vérification des logs..."
docker-compose logs app | tail -20

# 8. Tester la connectivité
echo "🧪 Test de connectivité..."
if curl -f http://162.19.67.3:5000/api/health >/dev/null 2>&1; then
    echo "✅ Application accessible sur http://162.19.67.3:5000"
else
    echo "❌ Application non accessible, vérification des logs..."
    docker-compose logs app | tail -50
fi

echo "🔍 Commandes utiles pour le débogage:"
echo "- Voir les logs: docker-compose logs -f app"
echo "- Redémarrer: docker-compose restart app"
echo "- Entrer dans le conteneur: docker-compose exec app sh"
echo "- Vérifier les variables: docker-compose exec app env | grep -E 'DATABASE|PORT|HOST'"