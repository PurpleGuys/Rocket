#!/bin/bash

# Script de test des endpoints API pour BennesPro
# Usage: ./test-api-endpoints.sh [HOST] [PORT]
# Exemple: ./test-api-endpoints.sh localhost 5000
# Exemple VPS: ./test-api-endpoints.sh votre-ip-vps 5000

HOST=${1:-localhost}
PORT=${2:-5000}
BASE_URL="http://${HOST}:${PORT}"

echo "===========================================" 
echo "🚀 Test des endpoints API BennesPro"
echo "🌐 Base URL: $BASE_URL"
echo "📅 Date: $(date)"
echo "==========================================="

# Fonction pour tester un endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local expected_status=${4:-200}
    
    echo ""
    echo "🔍 Testing: $description"
    echo "   $method $BASE_URL$endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X "$method" "$BASE_URL$endpoint")
    fi
    
    http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
    response_body=$(echo "$response" | grep -v "HTTP_STATUS:")
    
    if [ "$http_status" = "$expected_status" ]; then
        echo "   ✅ Status: $http_status (Expected: $expected_status)"
        if [ ${#response_body} -gt 100 ]; then
            echo "   📝 Response: ${response_body:0:100}..."
        else
            echo "   📝 Response: $response_body"
        fi
    else
        echo "   ❌ Status: $http_status (Expected: $expected_status)"
        echo "   📝 Response: $response_body"
    fi
}

# Tests des endpoints publics
echo ""
echo "🔓 ENDPOINTS PUBLICS"
echo "-------------------"

test_endpoint "GET" "/api/health" "Health Check"
test_endpoint "GET" "/api/services" "Liste des services/bennes"
test_endpoint "GET" "/api/waste-types" "Types de déchets"
test_endpoint "GET" "/api/treatment-pricing" "Tarifs de traitement"

# Tests des endpoints d'authentification
echo ""
echo "🔐 ENDPOINTS D'AUTHENTIFICATION"
echo "-------------------------------"

test_endpoint "GET" "/api/auth/me" "Profil utilisateur (sans token)" 401
test_endpoint "POST" "/api/auth/login" "Login (sans données)" 400

# Tests des endpoints admin (doivent retourner 401 sans auth)
echo ""
echo "🛡️ ENDPOINTS ADMIN (Protection)"
echo "------------------------------"

test_endpoint "GET" "/api/admin/users" "Liste utilisateurs (protection)" 401
test_endpoint "GET" "/api/admin/services" "Gestion services (protection)" 401
test_endpoint "GET" "/api/admin/orders" "Gestion commandes (protection)" 401

# Tests des endpoints inexistants
echo ""
echo "🚫 ENDPOINTS INEXISTANTS"
echo "------------------------"

test_endpoint "GET" "/api/nonexistent" "Endpoint inexistant" 404
test_endpoint "GET" "/api/fake/route" "Route fake" 404

# Résumé
echo ""
echo "==========================================="
echo "✅ Test terminé pour: $BASE_URL"
echo "📊 Vérifiez les résultats ci-dessus"
echo "==========================================="

# Instructions pour l'utilisateur
echo ""
echo "📋 INSTRUCTIONS POUR VPS:"
echo "1. Copiez ce script sur votre VPS"
echo "2. Rendez-le exécutable: chmod +x test-api-endpoints.sh"
echo "3. Exécutez: ./test-api-endpoints.sh VOTRE_IP_VPS 5000"
echo "4. Tous les endpoints publics doivent retourner 200"
echo "5. Les endpoints protégés doivent retourner 401"
echo "6. Les endpoints inexistants doivent retourner 404"