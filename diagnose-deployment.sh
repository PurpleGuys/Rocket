#!/bin/bash

echo "🔍 DIAGNOSTIC COMPLET DÉPLOIEMENT - purpleguy.world"
echo "=================================================="

echo "📊 1. État des conteneurs Docker"
echo "--------------------------------"
docker-compose ps

echo ""
echo "📋 2. Logs des conteneurs (dernières 10 lignes)"
echo "----------------------------------------------"

echo "🔧 App logs:"
docker logs rem-bennes_app_1 2>&1 | tail -10 || echo "Conteneur app non trouvé"

echo ""
echo "🌐 Nginx logs:"
docker logs rem-bennes_nginx_1 2>&1 | tail -10 || echo "Conteneur nginx non trouvé"

echo ""
echo "🗄️ Postgres logs:"
docker logs rem-bennes_postgres_1 2>&1 | tail -5 || echo "Conteneur postgres non trouvé"

echo ""
echo "🔌 3. Tests de connectivité"
echo "---------------------------"

# Test direct application port 5000
echo "🧪 Test application directe (port 5000):"
curl -s -o /dev/null -w "Status: %{http_code}, Time: %{time_total}s\n" "http://162.19.67.3:5000" 2>/dev/null || echo "❌ Échec connexion port 5000"

# Test nginx port 80
echo "🧪 Test nginx (port 80):"
curl -s -o /dev/null -w "Status: %{http_code}, Time: %{time_total}s\n" "http://purpleguy.world" 2>/dev/null || echo "❌ Échec connexion port 80"

# Test avec headers détaillés
echo "🧪 Test détaillé nginx:"
curl -I -s "http://purpleguy.world" 2>/dev/null | head -5 || echo "❌ Pas de réponse nginx"

echo ""
echo "🔌 4. Ports et processus"
echo "------------------------"
echo "Ports 80, 443, 5000 utilisés par:"
sudo lsof -i :80,443,5000 2>/dev/null || sudo ss -tlnp | grep -E ":80|:443|:5000"

echo ""
echo "📁 5. Configuration et fichiers"
echo "-------------------------------"
echo "nginx.conf existe:" 
ls -la nginx.conf 2>/dev/null || echo "❌ nginx.conf manquant"

echo "docker-compose.yml existe:"
ls -la docker-compose.yml 2>/dev/null || echo "❌ docker-compose.yml manquant"

echo ".env existe:"
ls -la .env 2>/dev/null || echo "❌ .env manquant"

echo ""
echo "🔧 6. Configuration nginx dans conteneur"
echo "----------------------------------------"
echo "Configuration nginx chargée dans le conteneur:"
docker exec rem-bennes_nginx_1 head -20 /etc/nginx/nginx.conf 2>/dev/null || echo "❌ Impossible d'accéder à la config nginx"

echo ""
echo "🌍 7. DNS et réseau"
echo "-------------------"
echo "Résolution DNS purpleguy.world:"
nslookup purpleguy.world 2>/dev/null | grep -A2 "Name:" || echo "❌ Problème DNS"

echo "Ping vers purpleguy.world:"
ping -c 2 purpleguy.world 2>/dev/null | grep "bytes from" || echo "❌ Ping échec"

echo ""
echo "🚨 8. Erreurs SSL/TLS"
echo "---------------------"
echo "Test SSL direct:"
echo | openssl s_client -connect purpleguy.world:443 -servername purpleguy.world 2>/dev/null | grep -E "Verify|Certificate chain|Protocol" || echo "❌ Pas de SSL actif"

echo ""
echo "📈 9. Utilisation ressources"
echo "----------------------------"
echo "Utilisation mémoire Docker:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null || echo "❌ Statistiques non disponibles"

echo ""
echo "🎯 RÉSUMÉ DIAGNOSTIC"
echo "===================="

# Tests simplifiés
APP_STATUS="❌"
NGINX_STATUS="❌"
DNS_STATUS="❌"

if curl -s -o /dev/null -w "%{http_code}" "http://162.19.67.3:5000" 2>/dev/null | grep -q "200"; then
    APP_STATUS="✅"
fi

if curl -s -I "http://purpleguy.world" 2>/dev/null | grep -q "HTTP"; then
    NGINX_STATUS="✅"
fi

if nslookup purpleguy.world >/dev/null 2>&1; then
    DNS_STATUS="✅"
fi

echo "Application (port 5000): $APP_STATUS"
echo "Nginx (port 80): $NGINX_STATUS"  
echo "DNS résolution: $DNS_STATUS"

echo ""
echo "💡 RECOMMANDATIONS"
echo "=================="

if [ "$APP_STATUS" = "❌" ]; then
    echo "🚨 Application ne répond pas sur port 5000"
    echo "   → Vérifiez: docker logs rem-bennes_app_1"
    echo "   → Redémarrez: docker-compose restart app"
fi

if [ "$NGINX_STATUS" = "❌" ]; then
    echo "🚨 Nginx ne répond pas"
    echo "   → Utilisez: ./fix-ssl-error.sh (configuration HTTP pure)"
    echo "   → Vérifiez: docker logs rem-bennes_nginx_1"
fi

if [ "$DNS_STATUS" = "❌" ]; then
    echo "🚨 Problème DNS"
    echo "   → Testez avec IP directe: http://162.19.67.3"
fi

echo ""
echo "🛠️ Scripts de correction disponibles:"
echo "   ./fix-ssl-error.sh     → Correction SSL_ERROR_RX_RECORD_TOO_LONG"
echo "   ./quick-nginx-fix.sh   → Correction Welcome nginx"
echo "   ./ssl-fix-complete.sh  → Activation HTTPS (quand HTTP fonctionne)"