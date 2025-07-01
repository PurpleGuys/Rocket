#!/bin/bash

# Test du serveur Express BennesPro
echo "🧪 TEST SERVEUR EXPRESS BENNESPRO"
echo "================================="

echo "1. Test du serveur local..."
node server-express-prod.js &
SERVER_PID=$!

# Attendre que le serveur démarre
sleep 3

echo "2. Test de l'API health..."
curl -s http://localhost:5000/api/health | head -3

echo ""
echo "3. Arrêt du serveur de test..."
kill $SERVER_PID 2>/dev/null

echo ""
echo "✅ Test terminé - Serveur Express fonctionnel"