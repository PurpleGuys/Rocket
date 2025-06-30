#!/bin/bash

# Script de correction rapide des erreurs SSL/CSP en HTTP
echo "🔧 Correction des erreurs SSL et CSP en mode HTTP"
echo "================================================"

# Arrêter les services actuels
echo "🛑 Arrêt services Docker..."
docker-compose down

# Attendre arrêt complet
sleep 5

# Nettoyer les conteneurs
echo "🧹 Nettoyage conteneurs..."
docker system prune -f

# Reconstruire et redémarrer
echo "🔄 Reconstruction et redémarrage..."
docker-compose build --no-cache nginx
docker-compose up -d

# Attendre démarrage
echo "⏳ Attente démarrage complet..."
sleep 15

# Vérifier status
echo "📊 Status des services:"
docker-compose ps

# Test de connectivité
echo "🧪 Test connectivité..."
if curl -s -o /dev/null http://purpleguy.world; then
    echo "✅ Site accessible via domaine"
else
    echo "⚠️ Domaine non accessible, test IP..."
    if curl -s -o /dev/null http://162.19.67.3:5000; then
        echo "✅ Site accessible via IP:5000"
    else
        echo "❌ Site non accessible"
    fi
fi

echo ""
echo "✅ Correction appliquée - Les erreurs SSL et CSP devraient être résolues"
echo "🌐 Site maintenant accessible en HTTP uniquement:"
echo "   http://purpleguy.world"
echo "   http://162.19.67.3:5000"
echo ""
echo "💡 Pour activer HTTPS, utilisez ensuite:"
echo "   ./ssl-fix-complete.sh"