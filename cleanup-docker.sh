#!/bin/bash

echo "🧹 NETTOYAGE COMPLET DOCKER BENNESPRO"
echo "===================================="

# Arrêter tous les containers BennesPro
echo "🛑 Arrêt des containers BennesPro..."
sudo docker stop bennespro_postgres bennespro_redis bennespro_app 2>/dev/null || true

# Supprimer les containers par nom
echo "🗑️ Suppression des containers..."
sudo docker rm -f bennespro_postgres bennespro_redis bennespro_app 2>/dev/null || true

# Supprimer par ID exact de l'erreur
echo "🔍 Suppression des containers problématiques..."
sudo docker rm -f ab21ac68159d5ad886c635c08e79d189be3d7cec093d052fd5c22d4fe19e4315 2>/dev/null || true
sudo docker rm -f 39603229c017acba15b91585a76041bc44458e25ab2563b12ea34dca2dfe5564 2>/dev/null || true

# Supprimer tous les containers avec nom contenant "bennespro"
for container in $(sudo docker ps -aq --filter "name=bennespro"); do
    echo "Suppression: $container"
    sudo docker rm -f $container 2>/dev/null || true
done

# Arrêter docker-compose
echo "🔻 Arrêt docker-compose..."
sudo docker-compose down --remove-orphans --volumes 2>/dev/null || true

# Nettoyer les réseaux
echo "🌐 Nettoyage des réseaux..."
sudo docker network rm bennespro_network 2>/dev/null || true
sudo docker network prune -f

# Nettoyer les volumes
echo "💾 Nettoyage des volumes..."
sudo docker volume rm bennespro_postgres_data bennespro_redis_data 2>/dev/null || true
sudo docker volume prune -f

# Nettoyer les images
echo "🖼️ Nettoyage des images..."
sudo docker rmi rem-bennes_app bennespro_app 2>/dev/null || true

# Nettoyage système complet
echo "🧽 Nettoyage système complet..."
sudo docker system prune -af

echo ""
echo "✅ Nettoyage terminé !"
echo "Vous pouvez maintenant relancer: ./deploy-final.sh"