#!/bin/bash

# Script de diagnostic pour VPS BennesPro
VPS_IP="${1:-162.19.67.3}"

echo "=========================================="
echo "🔍 Diagnostic VPS BennesPro - $VPS_IP"
echo "📅 $(date)"
echo "=========================================="

echo ""
echo "1️⃣ TEST DE CONNECTIVITÉ"
echo "------------------------"
if ping -c 1 $VPS_IP > /dev/null 2>&1; then
    echo "✅ VPS accessible"
else
    echo "❌ VPS non accessible"
    exit 1
fi

echo ""
echo "2️⃣ VÉRIFICATION DES PORTS"
echo "-------------------------"
echo "Port 80 (HTTP): $(nc -z -v $VPS_IP 80 2>&1 | grep -q 'succeeded' && echo '✅ Ouvert' || echo '❌ Fermé')"
echo "Port 443 (HTTPS): $(nc -z -v $VPS_IP 443 2>&1 | grep -q 'succeeded' && echo '✅ Ouvert' || echo '❌ Fermé')"
echo "Port 5000 (Node.js): $(nc -z -v $VPS_IP 5000 2>&1 | grep -q 'succeeded' && echo '✅ Ouvert' || echo '❌ Fermé')"
echo "Port 3000 (Alt Node.js): $(nc -z -v $VPS_IP 3000 2>&1 | grep -q 'succeeded' && echo '✅ Ouvert' || echo '❌ Fermé')"

echo ""
echo "3️⃣ TEST DES SERVICES WEB"
echo "------------------------"

# Test direct sur port 5000
echo "🔍 Test direct port 5000:"
curl -s -w "Status: %{http_code} | Time: %{time_total}s\n" "http://$VPS_IP:5000/api/health" -o /dev/null 2>/dev/null || echo "❌ Pas de réponse sur :5000"

# Test via port 80 (Nginx)
echo "🔍 Test via port 80:"
response=$(curl -s -w "HTTPSTATUS:%{http_code}" "http://$VPS_IP/api/health" 2>/dev/null)
status=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
body=$(echo "$response" | sed 's/HTTPSTATUS:[0-9]*$//')

if [ "$status" = "200" ]; then
    echo "✅ API accessible via port 80"
elif [ "$status" = "404" ]; then
    echo "❌ 404 - Configuration Nginx incorrecte"
elif [ "$status" = "502" ]; then
    echo "❌ 502 - Service Node.js down"
else
    echo "❌ Status: $status"
fi

echo ""
echo "4️⃣ ANALYSE DES RÉPONSES"
echo "-----------------------"
echo "Page racine:"
curl -s -I "http://$VPS_IP/" | head -3

echo ""
echo "API Health endpoint:"
curl -s -I "http://$VPS_IP/api/health" | head -3

echo ""
echo "5️⃣ RECOMMANDATIONS"
echo "------------------"

if nc -z -v $VPS_IP 5000 2>&1 | grep -q 'succeeded'; then
    echo "✅ Node.js semble tourner sur :5000"
    echo "📝 Testez: curl http://$VPS_IP:5000/api/health"
else
    echo "❌ Node.js n'est pas accessible sur :5000"
    echo "📝 Vérifiez que le service Node.js est démarré"
    echo "📝 Commandes VPS à exécuter:"
    echo "   - sudo systemctl status bennespro"
    echo "   - sudo systemctl start bennespro"
    echo "   - sudo netstat -tlnp | grep :5000"
fi

if [ "$status" = "404" ]; then
    echo ""
    echo "🔧 CONFIGURATION NGINX MANQUANTE"
    echo "Ajoutez dans /etc/nginx/sites-available/default:"
    echo ""
    echo "location /api/ {"
    echo "    proxy_pass http://localhost:5000;"
    echo "    proxy_http_version 1.1;"
    echo "    proxy_set_header Upgrade \$http_upgrade;"
    echo "    proxy_set_header Connection 'upgrade';"
    echo "    proxy_set_header Host \$host;"
    echo "    proxy_set_header X-Real-IP \$remote_addr;"
    echo "    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
    echo "    proxy_set_header X-Forwarded-Proto \$scheme;"
    echo "    proxy_cache_bypass \$http_upgrade;"
    echo "}"
fi

echo ""
echo "=========================================="
echo "📋 Résumé: Utilisez les commandes suggérées sur votre VPS"
echo "=========================================="