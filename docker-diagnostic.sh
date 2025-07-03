#!/bin/bash

echo "🔍 DIAGNOSTIC DOCKER BENNESPRO"
echo "=============================="

# Vérifier les containers existants
echo "📋 Containers actifs:"
sudo docker ps -a

echo ""
echo "📋 Containers avec 'bennespro' dans le nom:"
sudo docker ps -a | grep bennespro || echo "Aucun container bennespro trouvé"

echo ""
echo "📋 Containers avec 'postgres' dans le nom:"
sudo docker ps -a | grep postgres || echo "Aucun container postgres trouvé"

echo ""
echo "🌐 Réseaux existants:"
sudo docker network ls

echo ""
echo "💾 Volumes existants:"
sudo docker volume ls

echo ""
echo "🖼️ Images existantes:"
sudo docker images

echo ""
echo "🔧 Statut du service Docker:"
sudo systemctl status docker --no-pager

echo ""
echo "📝 Fichiers Docker Compose:"
ls -la docker-compose.yml 2>/dev/null || echo "docker-compose.yml non trouvé"

echo ""
echo "🔍 Contenu docker-compose.yml:"
head -20 docker-compose.yml 2>/dev/null || echo "Impossible de lire docker-compose.yml"

echo ""
echo "✅ Diagnostic terminé"