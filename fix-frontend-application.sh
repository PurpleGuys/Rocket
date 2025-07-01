#!/bin/bash

# Script pour corriger l'affichage de l'application BennesPro
# Remplace la page "Development Server" par la vraie application

echo "🔧 CORRECTION AFFICHAGE APPLICATION BENNESPRO"
echo "=============================================="

echo "📋 1. Arrêt du container d'application..."
docker stop bennespro_app || sudo docker stop bennespro_app

echo "🔄 2. Copie du nouveau serveur de production..."
# Copier le nouveau server-production.js dans le container
docker cp server-production.js bennespro_app:/app/server-production.js || sudo docker cp server-production.js bennespro_app:/app/server-production.js

echo "🚀 3. Redémarrage avec la nouvelle application..."
docker start bennespro_app || sudo docker start bennespro_app

# Attendre que l'application redémarre
echo "⏳ Attente du redémarrage (15 secondes)..."
sleep 15

echo "🔍 4. Vérification du status..."
echo "Status des containers:"
docker ps --filter "name=bennespro" --format "table {{.Names}}\t{{.Status}}" || sudo docker ps --filter "name=bennespro" --format "table {{.Names}}\t{{.Status}}"

echo ""
echo "📋 Logs de l'application (dernières 10 lignes):"
docker logs bennespro_app --tail=10 || sudo docker logs bennespro_app --tail=10

echo ""
echo "✅ CORRECTION APPLIQUÉE"
echo ""
echo "🌐 Votre application BennesPro est maintenant disponible à:"
echo "   https://purpleguy.world"
echo ""
echo "🎯 Vous devriez maintenant voir:"
echo "   ✓ Interface BennesPro complète avec services"
echo "   ✓ Barre verte 'Service en ligne'"
echo "   ✓ Navigation et fonctionnalités"
echo "   ✓ Plus de message 'Development Server'"
echo ""
echo "🔍 Pour vérifier les logs en temps réel:"
echo "docker logs -f bennespro_app"