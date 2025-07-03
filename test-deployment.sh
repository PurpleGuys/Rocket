#!/bin/bash

echo "🧪 TEST DE DÉPLOIEMENT BENNESPRO"
echo "================================="

# Test des containers
echo "📋 Statut des containers:"
sudo docker-compose ps

echo ""
echo "🔍 Tests de connectivité:"

# Test PostgreSQL
echo -n "PostgreSQL (port 5433): "
if sudo docker-compose exec -T postgres pg_isready -U bennespro -d bennespro >/dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ ERREUR"
fi

# Test Redis
echo -n "Redis (port 6379): "
if sudo docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
    echo "✅ OK"
else
    echo "❌ ERREUR"
fi

# Test Application
echo -n "Application (port 8080): "
if curl -s http://localhost:8080/api/health >/dev/null 2>&1; then
    echo "✅ OK"
    echo ""
    echo "🌐 Application accessible sur: http://localhost:8080"
else
    echo "❌ ERREUR"
    echo ""
    echo "📋 Logs de l'application:"
    sudo docker-compose logs --tail=20 app
fi