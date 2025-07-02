#!/bin/bash

# 🛠️ CORRECTION DES CONFLITS DE PORTS DOCKER
# Nettoie et redémarre avec des ports libres

clear
echo "🛠️ CORRECTION CONFLITS DE PORTS DOCKER"
echo "======================================="

# Arrêter tous les containers existants
echo "🛑 Arrêt des containers existants..."
sudo docker-compose down 2>/dev/null || true
sudo docker stop $(sudo docker ps -aq) 2>/dev/null || true

# Nettoyer les containers et réseaux
echo "🧹 Nettoyage des containers et réseaux..."
sudo docker system prune -af

# Vérifier les ports occupés
echo "🔍 Vérification des ports occupés..."
echo "Port 5432 (PostgreSQL standard):"
sudo netstat -tlnp | grep :5432 || echo "  ✅ Port libre"

echo "Port 5433 (PostgreSQL Docker):"
sudo netstat -tlnp | grep :5433 || echo "  ✅ Port libre"

echo "Port 80 (HTTP):"
sudo netstat -tlnp | grep :80 || echo "  ✅ Port libre"

echo "Port 6379 (Redis):"
sudo netstat -tlnp | grep :6379 || echo "  ✅ Port libre"

# Relancer le déploiement avec les bons ports
echo ""
echo "🚀 Relancement du déploiement avec ports corrigés..."
./docker-deploy-auto.sh

echo ""
echo "✅ Correction terminée !"
echo "Votre application devrait maintenant fonctionner sur les ports :"
echo "  - PostgreSQL Docker : 5433"
echo "  - Application web : 80"
echo "  - Redis : 6379"