#!/bin/bash

# ===============================================
# DIAGNOSTIC RAPIDE VPS PURPLEGUY.WORLD
# ===============================================

echo "🔍 DIAGNOSTIC RAPIDE VPS PURPLEGUY.WORLD"
echo "========================================"

# 1. Vérifier les processus
echo -e "\n📊 PM2 Status:"
pm2 list

# 2. Vérifier les ports
echo -e "\n🔌 Ports en écoute:"
sudo netstat -tlnp | grep -E "(5000|80|443)"

# 3. Vérifier Nginx
echo -e "\n🌐 Nginx Status:"
sudo systemctl status nginx --no-pager | head -n 5

# 4. Tester l'API locale
echo -e "\n🧪 Test API locale:"
echo -n "Health Check: "
curl -s http://localhost:5000/api/health && echo " ✓" || echo " ✗"

# 5. Tester l'accès externe
echo -e "\n🌍 Test accès externe:"
echo -n "Frontend HTTPS: "
curl -s -o /dev/null -w "%{http_code}" https://purpleguy.world

echo -e "\n"
echo -n "API HTTPS: "
curl -s -o /dev/null -w "%{http_code}" https://purpleguy.world/api/health

# 6. Vérifier les logs récents
echo -e "\n\n📋 Dernières erreurs PM2:"
pm2 logs bennespro --lines 5 --err --nostream

# 7. Vérifier l'espace disque
echo -e "\n💾 Espace disque:"
df -h | grep -E "(Filesystem|/$)"

# 8. Vérifier les variables d'environnement
echo -e "\n🔐 Variables d'environnement chargées:"
cd /home/ubuntu/REM-Bennes 2>/dev/null && grep -E "^(NODE_ENV|PORT|DATABASE_URL|GOOGLE_MAPS|STRIPE)" .env | sed 's/=.*/=***/'

echo -e "\n✅ Diagnostic terminé"