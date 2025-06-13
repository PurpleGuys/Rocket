#!/bin/bash

# Script de vérification de santé pour l'application Remondis
# Usage: ./health-check.sh [production|staging|development]

ENV=${1:-development}
PORT=${2:-5000}
HOST=${3:-localhost}

echo "🏥 Vérification de santé - Environnement: $ENV"
echo "==============================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# 1. Vérifier que l'application répond
echo "🌐 Vérification de la connectivité..."
if curl -f -s "http://$HOST:$PORT/api/health" > /dev/null; then
    print_result 0 "Application accessible sur http://$HOST:$PORT"
    
    # Récupérer les informations de santé
    HEALTH_DATA=$(curl -s "http://$HOST:$PORT/api/health")
    echo "📊 Informations système:"
    echo "$HEALTH_DATA" | grep -o '"[^"]*":[^,}]*' | sed 's/"//g' | while IFS=: read key value; do
        echo "   $key: $value"
    done
else
    print_result 1 "Application non accessible sur http://$HOST:$PORT"
    exit 1
fi

# 2. Vérifier les endpoints critiques
echo -e "\n🔍 Vérification des endpoints..."

# Test de l'API services
if curl -f -s "http://$HOST:$PORT/api/services" > /dev/null; then
    print_result 0 "Endpoint /api/services opérationnel"
else
    print_result 1 "Endpoint /api/services non accessible"
fi

# Test de l'authentification (doit retourner 401)
AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://$HOST:$PORT/api/auth/me")
if [ "$AUTH_STATUS" = "401" ]; then
    print_result 0 "Endpoint d'authentification sécurisé"
else
    print_result 1 "Problème avec l'endpoint d'authentification (code: $AUTH_STATUS)"
fi

# 3. Vérifier la base de données (si accessible)
echo -e "\n🗄️  Vérification de la base de données..."
DB_STATUS=$(curl -s "http://$HOST:$PORT/api/health" | grep -o '"database":"[^"]*"' | cut -d'"' -f4)
if [ "$DB_STATUS" = "connected" ]; then
    print_result 0 "Base de données connectée"
else
    print_result 1 "Problème de connexion base de données"
fi

# 4. Vérifier les ressources système (si PM2 est utilisé)
if command -v pm2 &> /dev/null; then
    echo -e "\n💻 Vérification des processus PM2..."
    
    PM2_STATUS=$(pm2 jlist 2>/dev/null | grep "remondis-app" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    if [ "$PM2_STATUS" = "online" ]; then
        print_result 0 "Processus PM2 en ligne"
        
        # Afficher les statistiques PM2
        echo "📈 Statistiques PM2:"
        pm2 show remondis-app 2>/dev/null | grep -E "(cpu|memory|uptime)" | while read line; do
            echo "   $line"
        done
    else
        print_result 1 "Processus PM2 hors ligne ou non trouvé"
    fi
fi

# 5. Vérifier l'espace disque
echo -e "\n💾 Vérification de l'espace disque..."
DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 90 ]; then
    print_result 0 "Espace disque suffisant ($DISK_USAGE% utilisé)"
else
    print_result 1 "Espace disque critique ($DISK_USAGE% utilisé)"
fi

# 6. Vérifier la mémoire
echo -e "\n🧠 Vérification de la mémoire..."
if command -v free &> /dev/null; then
    MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    if [ "$MEM_USAGE" -lt 85 ]; then
        print_result 0 "Utilisation mémoire normale ($MEM_USAGE%)"
    else
        print_result 1 "Utilisation mémoire élevée ($MEM_USAGE%)"
    fi
fi

# 7. Vérifier les logs récents pour les erreurs
echo -e "\n📝 Vérification des logs récents..."
if [ -f "logs/err.log" ]; then
    ERROR_COUNT=$(tail -100 logs/err.log 2>/dev/null | grep -c "ERROR\|FATAL" || echo "0")
    if [ "$ERROR_COUNT" -eq 0 ]; then
        print_result 0 "Aucune erreur récente dans les logs"
    else
        print_result 1 "$ERROR_COUNT erreurs trouvées dans les logs récents"
    fi
else
    echo -e "${YELLOW}⚠️  Fichier de logs d'erreur non trouvé${NC}"
fi

# 8. Test de performance basique
echo -e "\n⚡ Test de performance..."
RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null "http://$HOST:$PORT/api/health")
RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc 2>/dev/null || echo "N/A")

if [ "$RESPONSE_MS" != "N/A" ] && [ "$(echo "$RESPONSE_TIME < 2.0" | bc 2>/dev/null)" = "1" ]; then
    print_result 0 "Temps de réponse acceptable (${RESPONSE_MS}ms)"
else
    print_result 1 "Temps de réponse lent (${RESPONSE_MS}ms)"
fi

# Résumé final
echo -e "\n📋 RÉSUMÉ"
echo "=========="
echo "Application: Remondis Waste Management"
echo "Environnement: $ENV"
echo "URL: http://$HOST:$PORT"
echo "Timestamp: $(date)"

# Code de sortie basé sur les vérifications critiques
if curl -f -s "http://$HOST:$PORT/api/health" > /dev/null && [ "$DB_STATUS" = "connected" ]; then
    echo -e "\n${GREEN}🎉 Système opérationnel${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  Problèmes détectés - Intervention requise${NC}"
    exit 1
fi