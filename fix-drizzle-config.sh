#!/bin/bash

# FIX DRIZZLE CONFIG ET BASE DE DONNÉES
clear
echo "🔧 CORRECTION CONFIGURATION DRIZZLE"
echo "==================================="

# 1. Copier le fichier de configuration Drizzle dans le container
echo "📋 Copie de la configuration Drizzle..."
sudo docker cp drizzle.config.ts bennespro_app:/app/drizzle.config.ts

# 2. Copier le schéma de base de données
echo "📋 Copie du schéma de base de données..."
sudo docker cp shared/schema.ts bennespro_app:/app/shared/schema.ts

# 3. Installer les dépendances Drizzle si nécessaire
echo "📦 Installation des dépendances Drizzle..."
sudo docker exec bennespro_app npm install drizzle-kit drizzle-orm

# 4. Créer le dossier migrations
echo "📁 Création du dossier migrations..."
sudo docker exec bennespro_app mkdir -p /app/migrations

# 5. Initialiser le schéma avec la bonne configuration
echo "🗄️ Initialisation du schéma de base de données..."
sudo docker exec -e DATABASE_URL="postgresql://postgres:BennesProSecure2024!@postgres:5432/bennespro" bennespro_app npx drizzle-kit push --config=/app/drizzle.config.ts

# 6. Vérifier les tables créées
echo "🔍 Vérification des tables créées..."
sudo docker exec bennespro_app psql postgresql://postgres:BennesProSecure2024!@postgres:5432/bennespro -c "\dt"

# 7. Redémarrer l'application pour qu'elle détecte les tables
echo "🔄 Redémarrage de l'application..."
sudo docker restart bennespro_app

# 8. Attendre le redémarrage
echo "⏳ Attente du redémarrage (20 secondes)..."
sleep 20

# 9. Vérifier que l'application voit les tables
echo "🔍 Vérification de la connexion à la base de données..."
sudo docker logs bennespro_app | tail -20

# 10. Test de l'API
echo "🧪 Test de l'API..."
curl -I http://localhost:8080/api/health 2>/dev/null || echo "❌ API non accessible"

echo ""
echo "🎉 CORRECTION TERMINÉE !"
echo "======================"
echo "✅ Configuration Drizzle copiée"
echo "✅ Schéma de base de données initialisé"
echo "✅ Application redémarrée"
echo ""
echo "🔗 Testez: http://purpleguy.world:8080/api/health"