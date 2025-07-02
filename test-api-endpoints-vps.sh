#!/bin/bash

# Configuration
BASE_URL="${1:-http://localhost:5000}"
TEST_DATE=$(date)

echo "==========================================="
echo "🚀 Test des endpoints API BennesPro"
echo "🌐 Base URL: $BASE_URL"
echo "📅 Date: $TEST_DATE"
echo "💡 Version avec correctifs VPS"
echo "==========================================="

# Function to test an endpoint
test_endpoint() {
    local method="$1"
    local endpoint="$2"
    local expected_status="$3"
    local description="$4"
    local data="$5"
    
    echo ""
    echo "🔍 Testing: $description"
    echo "   $method $BASE_URL$endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    fi
    
    http_status=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    body=$(echo "$response" | sed 's/HTTPSTATUS:[0-9]*$//')
    
    if [ "$http_status" = "$expected_status" ]; then
        echo "   ✅ Status: $http_status (Expected: $expected_status)"
    else
        echo "   ❌ Status: $http_status (Expected: $expected_status)"
    fi
    
    # Truncate long responses
    if [ ${#body} -gt 100 ]; then
        body="${body:0:100}..."
    fi
    
    echo "   📝 Response: $body"
    
    # Additional diagnostic for 500 errors
    if [ "$http_status" = "500" ]; then
        echo "   🔍 Diagnostic: Erreur serveur - vérifiez les logs PostgreSQL et les méthodes de storage"
    fi
}

echo ""
echo "🔓 ENDPOINTS PUBLICS CRITIQUES"
echo "------------------------------"

test_endpoint "GET" "/api/health" "200" "Health Check"
test_endpoint "GET" "/api/services" "200" "Liste des services/bennes (CORRIGÉ: Drizzle ORM)"
test_endpoint "GET" "/api/waste-types" "200" "Types de déchets (CORRIGÉ: Gestion d'erreurs)"
test_endpoint "GET" "/api/treatment-pricing" "200" "Tarifs de traitement (CORRIGÉ: Gestion d'erreurs)"

echo ""
echo "🔐 ENDPOINTS D'AUTHENTIFICATION"
echo "-------------------------------"

test_endpoint "GET" "/api/auth/me" "401" "Profil utilisateur (sans token)"
test_endpoint "POST" "/api/auth/login" "400" "Login (sans données)" "{}"

echo ""
echo "🛡️ ENDPOINTS ADMIN (Protection)"
echo "------------------------------"

test_endpoint "GET" "/api/admin/users" "401" "Liste utilisateurs (protection)"
test_endpoint "GET" "/api/admin/services" "401" "Gestion services (protection) - AJOUTÉ"
test_endpoint "GET" "/api/admin/orders" "401" "Gestion commandes (protection)"

echo ""
echo "🚫 ENDPOINTS INEXISTANTS"
echo "------------------------"

test_endpoint "GET" "/api/nonexistent" "404" "Endpoint inexistant (CORRIGÉ: Catch-all handler)"
test_endpoint "GET" "/api/fake/route" "404" "Route fake (CORRIGÉ: Catch-all handler)"

echo ""
echo "🆕 ENDPOINTS SPÉCIAUX"
echo "--------------------"

test_endpoint "GET" "/api/timeslots/2025-07-10" "200" "Créneaux horaires"

echo ""
echo "==========================================="
echo "✅ Test terminé pour: $BASE_URL"
echo "📊 Vérifiez les résultats ci-dessus"
echo ""
echo "🔧 CORRECTIFS APPLIQUÉS:"
echo "   ✅ Syntaxe Drizzle ORM corrigée (.orderBy avec asc())"
echo "   ✅ Ordre des routes API repositionné"
echo "   ✅ Route /api/admin/services ajoutée"
echo "   ✅ Gestion d'erreurs robuste dans storage.ts"
echo "   ✅ Catch-all handler pour routes 404"
echo "==========================================="