#!/bin/bash

# DIAGNOSTIC RAPIDE VPS - IDENTIFIER LE PROBLÈME
echo "🔍 DIAGNOSTIC RAPIDE VPS PURPLEGUY.WORLD"
echo "========================================"

# 1. Vérifier les containers
echo "📦 CONTAINERS ACTIFS:"
sudo docker ps

echo ""
echo "📊 LOGS APPLICATION (20 dernières lignes):"
if sudo docker ps | grep -q "bennespro_app\|app"; then
    CONTAINER_NAME=$(sudo docker ps --format "table {{.Names}}" | grep -E "bennespro_app|app" | head -1)
    echo "Container trouvé: $CONTAINER_NAME"
    sudo docker logs $CONTAINER_NAME --tail 20
else
    echo "❌ Container application non trouvé"
fi

echo ""
echo "🗄️ LOGS POSTGRESQL (10 dernières lignes):"
if sudo docker ps | grep -q "postgres"; then
    POSTGRES_CONTAINER=$(sudo docker ps --format "table {{.Names}}" | grep postgres | head -1)
    echo "Container PostgreSQL: $POSTGRES_CONTAINER"
    sudo docker logs $POSTGRES_CONTAINER --tail 10
else
    echo "❌ Container PostgreSQL non trouvé"
fi

echo ""
echo "🌐 TEST CONNEXION LOCALE:"
echo "Health check (port 8080):"
curl -s -w "Status: %{http_code}\n" http://localhost:8080/api/health || echo "❌ Échec connexion port 8080"

echo "Health check (port 5000):"
curl -s -w "Status: %{http_code}\n" http://localhost:5000/api/health || echo "❌ Échec connexion port 5000"

echo ""
echo "🔧 VARIABLES D'ENVIRONNEMENT DANS LE CONTAINER:"
if sudo docker ps | grep -q "bennespro_app\|app"; then
    CONTAINER_NAME=$(sudo docker ps --format "table {{.Names}}" | grep -E "bennespro_app|app" | head -1)
    echo "STRIPE_SECRET_KEY présent:"
    sudo docker exec $CONTAINER_NAME printenv STRIPE_SECRET_KEY | head -c 20 || echo "❌ STRIPE_SECRET_KEY manquant"
    
    echo "VITE_STRIPE_PUBLIC_KEY présent:"
    sudo docker exec $CONTAINER_NAME printenv VITE_STRIPE_PUBLIC_KEY | head -c 20 || echo "❌ VITE_STRIPE_PUBLIC_KEY manquant"
    
    echo "DATABASE_URL présent:"
    sudo docker exec $CONTAINER_NAME printenv DATABASE_URL | head -c 30 || echo "❌ DATABASE_URL manquant"
fi

echo ""
echo "🗂️ FICHIERS .ENV DISPONIBLES:"
ls -la .env* 2>/dev/null || echo "❌ Aucun fichier .env trouvé"

echo ""
echo "📁 STRUCTURE DU PROJET:"
ls -la | grep -E "Dockerfile|docker-compose|package.json"

echo ""
echo "🔍 DIAGNOSTIC TERMINÉ"
echo "===================="