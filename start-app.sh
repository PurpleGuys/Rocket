#!/bin/bash

# Script de démarrage avec variable d'environnement
set -e

# Variables de base de données
export DATABASE_URL="postgresql://remondis:Remondis60110$@localhost:5432/remondis_db"
export NODE_ENV="production"
export PORT="3000"
export SESSION_SECRET="f6b3e76ee636d248b8c85091425ae4fe9de4a8011b1fa17d30f0fcf13f5c2df2b5a5c1c4109dd6b8c5e22eaae33feb872434e71cc2f17f64a3b4e72d40e2d4f5"
export JWT_SECRET="85eb00206d3991c2ade3186cfad4e9265fc9d72cadbe698ba305884086bc3e29e5d11f92df517a684f4e4bd136507bb81b6ef79902e5eb96d98273f6c9bb1723"

echo "🚀 Démarrage BennesPro"
echo "======================"
echo "DATABASE_URL configuré : ✅"
echo "Variables d'environnement : ✅"

# Démarrage de l'application
node dist/index.js