#!/bin/bash

# Script de configuration HTTP/HTTPS compatible
# Corrige les erreurs trust proxy et WebSocket

echo "🌐 Configuration HTTP/HTTPS compatible"
echo "======================================"

# 1. Arrêter les services
echo "📦 Arrêt des services..."
docker-compose down

# 2. Appliquer la configuration corrigée
echo "📝 Application de la configuration HTTP/HTTPS..."
cp docker-fix.env .env

# 3. Reconstruire l'application avec les corrections
echo "🔨 Reconstruction avec corrections..."
docker-compose build --no-cache app

# 4. Redémarrer tous les services
echo "🚀 Démarrage des services..."
docker-compose up -d

# 5. Attendre le démarrage
echo "⏳ Attente du démarrage complet..."
sleep 20

# 6. Vérifier les logs (sans les erreurs corrigées)
echo "📋 Vérification des logs..."
docker-compose logs --tail=20 app

# 7. Tests de connectivité
echo ""
echo "🧪 Tests de connectivité..."

# Test HTTP
if curl -s http://162.19.67.3:5000 >/dev/null; then
    echo "✅ HTTP accessible sur http://162.19.67.3:5000"
else
    echo "❌ HTTP non accessible"
fi

# Test API
if curl -s http://162.19.67.3:5000/api/health | grep -q "healthy"; then
    echo "✅ API fonctionnelle"
else
    echo "❌ API non fonctionnelle"
fi

# Test favicon (assets statiques)
if curl -s -I http://162.19.67.3:5000/favicon.ico | grep -q "200"; then
    echo "✅ Assets statiques disponibles"
else
    echo "⚠️  Assets statiques - vérification nécessaire"
fi

echo ""
echo "🌐 URLs d'accès:"
echo "   HTTP: http://162.19.67.3:5000"
echo "   HTTPS (future): https://162.19.67.3 (à configurer)"
echo ""
echo "📊 État des conteneurs:"
docker-compose ps

echo ""
echo "✅ Configuration HTTP/HTTPS terminée!"
echo ""
echo "📝 Notes pour activation HTTPS future:"
echo "   1. Obtenir certificat SSL (Let's Encrypt recommandé)"
echo "   2. Décommenter la configuration HTTPS dans nginx.conf"
echo "   3. Mettre SSL_ENABLED=true dans .env"
echo "   4. Redémarrer les services"
echo ""
echo "🔍 Commandes utiles:"
echo "   docker-compose logs -f app     # Logs en temps réel"
echo "   docker-compose restart nginx  # Redémarrer nginx"
echo "   curl -v http://162.19.67.3:5000  # Test détaillé"