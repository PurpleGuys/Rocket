#!/bin/bash

echo "🔧 Correction rapide nginx Welcome - purpleguy.world"
echo "=================================================="

# 1. Arrêter nginx système (cause principale du problème)
echo "🛑 Arrêt nginx système..."
sudo systemctl stop nginx 2>/dev/null || true
sudo systemctl disable nginx 2>/dev/null || true
sudo systemctl stop apache2 2>/dev/null || true

# 2. Libérer le port 80
echo "🧹 Libération port 80..."
sudo fuser -k 80/tcp 2>/dev/null || true
sleep 3

# 3. Recreation complète conteneurs
echo "🔄 Recreation conteneurs Docker..."
docker-compose down -v --remove-orphans
sleep 5

# 4. Redémarrage propre
echo "🚀 Redémarrage services..."
docker-compose up -d --build

# 5. Attente et test
echo "⏳ Attente démarrage (20s)..."
sleep 20

echo "🧪 Test résultat:"
if curl -s "http://purpleguy.world" | grep -q "Welcome to nginx"; then
    echo "❌ ÉCHEC: Page Welcome nginx toujours présente"
    echo "   Debug - Configuration dans conteneur:"
    docker exec rem-bennes_nginx_1 head -5 /etc/nginx/nginx.conf 2>/dev/null || echo "Conteneur nginx non trouvé"
    echo "   → Essayez: docker-compose down && docker-compose up -d --force-recreate"
else
    echo "✅ SUCCÈS: Site accessible sans page Welcome"
    echo "   http://purpleguy.world fonctionne correctement"
fi

echo ""
echo "📊 État final:"
docker-compose ps