#!/bin/bash

echo "🔧 REDIS DIAGNOSTIC TOOL"
echo "========================"

# Test 1: Vérifier si Redis fonctionne sur le host
echo "📋 Test 1: Redis sur localhost"
if redis-cli ping 2>/dev/null; then
    echo "✅ Redis localhost OK"
else
    echo "❌ Redis localhost KO"
fi

# Test 2: Vérifier si Redis fonctionne sur Docker
echo "📋 Test 2: Redis sur Docker (redis:6379)"
if redis-cli -h redis -p 6379 ping 2>/dev/null; then
    echo "✅ Redis Docker OK"
else
    echo "❌ Redis Docker KO"
fi

# Test 3: Vérifier connectivité port
echo "📋 Test 3: Port connectivity"
if nc -z redis 6379 2>/dev/null; then
    echo "✅ Port 6379 ouvert sur redis"
else
    echo "❌ Port 6379 fermé sur redis"
fi

# Test 4: Logs Redis
echo "📋 Test 4: Logs Redis container"
docker logs bennespro_redis --tail=10 2>/dev/null || echo "❌ Container Redis introuvable"

# Test 5: Redis container status
echo "📋 Test 5: Status container Redis"
docker ps | grep redis || echo "❌ Container Redis non running"

echo ""
echo "✅ Diagnostic terminé"