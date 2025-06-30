#!/bin/bash

# Script de mise à jour en production pour corriger les derniers problèmes
# Résout les erreurs d'assets et la configuration de trust proxy

echo "🚀 Mise à jour en production - Correction finale"
echo "==============================================="

# 1. Arrêter les services
echo "📦 Arrêt des services pour mise à jour..."
docker-compose down

# 2. Reconstruire avec les corrections récentes
echo "🔨 Reconstruction avec les corrections..."
docker-compose build --no-cache app

# 3. Redémarrer tous les services
echo "🚀 Démarrage des services mis à jour..."
docker-compose up -d

# 4. Attendre que tout démarre
echo "⏳ Attente du démarrage complet..."
sleep 15

# 5. Vérifier le statut
echo "📋 Vérification du statut..."
docker-compose logs --tail=10 app

# 6. Test complet de l'application
echo ""
echo "🧪 Tests de fonctionnement..."

# Test de la page principale
if curl -s http://162.19.67.3:5000 | grep -q "REM Bennes"; then
    echo "✅ Page principale accessible"
else
    echo "⚠️  Page principale - vérification nécessaire"
fi

# Test de l'API
if curl -s http://162.19.67.3:5000/api/health >/dev/null 2>&1; then
    echo "✅ API opérationnelle"
else
    echo "⚠️  API - vérification nécessaire"
fi

# Test des assets statiques
if curl -s -I http://162.19.67.3:5000/favicon.ico | grep -q "200 OK"; then
    echo "✅ Assets statiques accessibles"
else
    echo "⚠️  Assets statiques - vérification nécessaire"
fi

echo ""
echo "🌐 Application disponible sur:"
echo "   Interface utilisateur: http://162.19.67.3:5000"
echo "   API: http://162.19.67.3:5000/api/"
echo ""
echo "📊 État des services:"
docker-compose ps

echo ""
echo "🔍 Commandes utiles:"
echo "   docker-compose logs -f app     # Logs en temps réel"
echo "   docker-compose restart app     # Redémarrage"
echo "   docker-compose exec app sh     # Accès au conteneur"
echo ""
echo "✅ Mise à jour terminée!"