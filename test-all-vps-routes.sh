#!/bin/bash

# Script de test complet des routes API pour vérification VPS
# Usage: ./test-all-vps-routes.sh [BASE_URL]
# Exemple: ./test-all-vps-routes.sh http://162.19.67.3:5000

BASE_URL=${1:-http://localhost:5000}
PASSED=0
FAILED=0

echo "==================================================================="
echo "🔍 TEST COMPLET DES ROUTES API BENNESPRO"
echo "📡 URL de base: $BASE_URL"
echo "==================================================================="

# Function to test a route
test_route() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    local data=${5:-""}
    
    echo -n "🧪 [$method] $endpoint - $description: "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X PUT -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL$endpoint")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        echo "✅ PASS ($status_code)"
        ((PASSED++))
    else
        echo "❌ FAIL (attendu: $expected_status, reçu: $status_code)"
        echo "   Response: $(echo "$body" | head -c 100)"
        ((FAILED++))
    fi
}

echo ""
echo "🔗 === ROUTES DE STATUT ET SANTÉ ==="
test_route "GET" "/api/health" "200" "Health check"
test_route "GET" "/api/database/info" "200" "Database status"

echo ""
echo "🏢 === ROUTES PUBLIQUES (DONNÉES) ==="
test_route "GET" "/api/services" "200" "Services publics"
test_route "GET" "/api/waste-types" "200" "Types de déchets"
test_route "GET" "/api/treatment-pricing" "200" "Tarifs de traitement"

echo ""
echo "🔐 === ROUTES D'AUTHENTIFICATION ==="
test_route "POST" "/api/auth/login" "401" "Login avec credentials invalides" '{"email":"test@test.com","password":"test"}'
test_route "POST" "/api/auth/register" "400" "Register avec mot de passe trop court" '{"email":"test@test.com","password":"test","firstName":"Test","lastName":"User","phone":"0123456789"}'

echo ""
echo "🛡️ === ROUTES PROTÉGÉES (DOIVENT RETOURNER 401) ==="
test_route "GET" "/api/admin/services" "401" "Admin services sans auth"
test_route "GET" "/api/admin/users" "401" "Admin users sans auth"
test_route "GET" "/api/admin/treatment-pricing" "401" "Admin pricing sans auth"

echo ""
echo "📊 === ROUTES OPTIONNELLES (PEUVENT RETOURNER 404) ==="
test_route "GET" "/api/time-slots" "200,404" "Time slots"
test_route "GET" "/api/rental-pricing" "200,404" "Rental pricing"
test_route "GET" "/api/company-activities" "200,404" "Company activities"
test_route "GET" "/api/transport-pricing" "200,404" "Transport pricing"

echo ""
echo "🌐 === TEST DE FICHIERS STATIQUES ==="
static_response=$(curl -s -I "$BASE_URL/" | head -n1)
if [[ $static_response == *"200"* ]] || [[ $static_response == *"404"* ]]; then
    echo "✅ Serveur statique accessible"
    ((PASSED++))
else
    echo "❌ Problème serveur statique: $static_response"
    ((FAILED++))
fi

echo ""
echo "==================================================================="
echo "📈 RÉSULTATS DU TEST"
echo "✅ Tests réussis: $PASSED"
echo "❌ Tests échoués: $FAILED"
echo "📊 Total: $((PASSED + FAILED))"

if [ $FAILED -eq 0 ]; then
    echo "🎉 TOUS LES TESTS SONT PASSÉS ! VPS PRÊT POUR LE DÉPLOIEMENT"
    exit 0
else
    echo "⚠️  Certains tests ont échoué. Vérifiez les routes manquantes."
    exit 1
fi