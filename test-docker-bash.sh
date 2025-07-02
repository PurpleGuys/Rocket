#!/bin/bash

# Test script pour vérifier la compatibilité bash dans Docker
echo "🔍 Test de compatibilité Docker avec bash..."

# Test 1: Construire l'image Docker
echo "📦 Construction de l'image Docker..."
docker build -t bennespro-test . || {
    echo "❌ Erreur lors de la construction Docker"
    exit 1
}

# Test 2: Vérifier que bash est disponible dans le conteneur
echo "🐚 Test de l'exécutable bash dans le conteneur..."
docker run --rm bennespro-test bash -c "echo 'Bash fonctionne correctement'" || {
    echo "❌ Bash n'est pas disponible dans le conteneur"
    exit 1
}

# Test 3: Tester le serveur de production
echo "🚀 Test du serveur de production..."
docker run --rm -p 5000:5000 -d --name bennespro-test-server bennespro-test

# Attendre que le serveur démarre
sleep 5

# Test de santé du serveur
curl -f http://localhost:5000/api/health || {
    echo "❌ Le serveur ne répond pas correctement"
    docker stop bennespro-test-server
    exit 1
}

# Nettoyer
docker stop bennespro-test-server

echo "✅ Tous les tests Docker réussis !"
echo "🎯 L'image Docker est prête pour le déploiement production"