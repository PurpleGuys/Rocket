#!/bin/bash

# DIAGNOSTIC COMPLET VPS - IDENTIFIER LE PROBLÈME EXACT
echo "🔍 DIAGNOSTIC COMPLET VPS BENNESPRO"
echo "==================================="

# 1. État des containers
echo "📦 État des containers Docker:"
sudo docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🌐 Ports en écoute sur le système:"
sudo netstat -tlnp | grep -E ":80|:443|:8080|:5000|:5432|:6379"

echo ""
echo "🔥 Logs du container application (dernières 50 lignes):"
sudo docker logs --tail 50 bennespro_app

echo ""
echo "🐘 Test direct PostgreSQL:"
sudo docker exec bennespro_postgres psql -U postgres -d bennespro -c "SELECT COUNT(*) as services_count FROM services;"

echo ""
echo "📊 Test direct de l'API dans le container:"
sudo docker exec bennespro_app sh -c "curl -s http://localhost:5000/api/health" || echo "❌ API interne non accessible"

echo ""
echo "🔌 Test connectivité réseau container:"
sudo docker exec bennespro_app sh -c "netstat -tlnp | grep :5000" || echo "❌ Port 5000 non en écoute"

echo ""
echo "🌍 Test depuis l'hôte VPS:"
echo "Test localhost:8080:"
curl -s --connect-timeout 5 http://localhost:8080/api/health || echo "❌ Localhost:8080 non accessible"

echo ""
echo "Test 127.0.0.1:8080:"
curl -s --connect-timeout 5 http://127.0.0.1:8080/api/health || echo "❌ 127.0.0.1:8080 non accessible"

echo ""
echo "🔧 Configuration docker-compose actuelle:"
grep -A 20 "app:" docker-compose.yml 2>/dev/null || echo "❌ docker-compose.yml non trouvé"

echo ""
echo "📝 Variables d'environnement du container:"
sudo docker exec bennespro_app env | grep -E "NODE_ENV|DATABASE_URL|PORT"

echo ""
echo "🏗️ Processus dans le container:"
sudo docker exec bennespro_app ps aux

echo ""
echo "🔍 RÉSUMÉ DIAGNOSTIC:"
echo "===================="

# Test de base
if sudo docker exec bennespro_app curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Application fonctionne DANS le container"
else
    echo "❌ Application ne fonctionne PAS dans le container"
fi

if curl -s --connect-timeout 2 http://localhost:8080/api/health > /dev/null 2>&1; then
    echo "✅ Port 8080 accessible depuis l'hôte"
else
    echo "❌ Port 8080 NON accessible depuis l'hôte"
fi

# Vérifier si le port est mappé
PORT_MAPPING=$(sudo docker port bennespro_app 2>/dev/null)
if [ -n "$PORT_MAPPING" ]; then
    echo "✅ Port mapping: $PORT_MAPPING"
else
    echo "❌ Aucun port mapping trouvé"
fi

echo ""
echo "🎯 ACTIONS RECOMMANDÉES:"
echo "======================="
echo "1. Si l'app fonctionne dans le container mais pas sur 8080:"
echo "   → Problème de port mapping Docker"
echo "2. Si l'app ne fonctionne pas dans le container:"
echo "   → Problème de démarrage de l'application"
echo "3. Si aucune connexion DB:"
echo "   → Problème de configuration DATABASE_URL"