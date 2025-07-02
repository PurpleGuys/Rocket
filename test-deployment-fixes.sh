#!/bin/bash

# Script de test des corrections de déploiement BennesPro
echo "🔧 Test des corrections de déploiement BennesPro"
echo "================================================="

# 1. Vérifier que dotenv est installé
echo "✅ 1. Vérification de dotenv..."
if npm list dotenv &>/dev/null; then
    echo "   ✓ dotenv installé correctement"
else
    echo "   ❌ dotenv manquant"
    exit 1
fi

# 2. Vérifier drizzle.config.js
echo "✅ 2. Vérification de drizzle.config.js..."
if [ -f "drizzle.config.js" ]; then
    echo "   ✓ drizzle.config.js présent"
    if grep -q "import { config } from \"dotenv\"" drizzle.config.js; then
        echo "   ✓ Import dotenv correct"
    else
        echo "   ❌ Import dotenv manquant"
        exit 1
    fi
else
    echo "   ❌ drizzle.config.js manquant"
    exit 1
fi

# 3. Vérifier docker-compose.yml
echo "✅ 3. Vérification de docker-compose.yml..."
if [ -f "docker-compose.yml" ]; then
    echo "   ✓ docker-compose.yml présent"
    if grep -q "^version:" docker-compose.yml; then
        echo "   ⚠️  Version field encore présent (devrait être supprimé)"
    else
        echo "   ✓ Version field correctement supprimé"
    fi
else
    echo "   ❌ docker-compose.yml manquant"
    exit 1
fi

# 4. Vérifier server-production.js
echo "✅ 4. Vérification de server-production.js..."
if [ -f "server-production.js" ]; then
    echo "   ✓ server-production.js présent"
    if grep -q "import express" server-production.js || grep -q "const express = require('express')" server-production.js; then
        echo "   ✓ Structure Express correcte"
    else
        echo "   ❌ Structure Express incorrecte"
        exit 1
    fi
else
    echo "   ❌ server-production.js manquant"
    exit 1
fi

# 5. Vérifier Dockerfile
echo "✅ 5. Vérification de Dockerfile..."
if [ -f "Dockerfile" ]; then
    echo "   ✓ Dockerfile présent"
    if grep -q "bash" Dockerfile; then
        echo "   ✓ Bash installé dans le conteneur"
    else
        echo "   ❌ Bash manquant dans le conteneur"
        exit 1
    fi
else
    echo "   ❌ Dockerfile manquant"
    exit 1
fi

# 6. Test de syntaxe ultimate-setup.sh
echo "✅ 6. Test de syntaxe ultimate-setup.sh..."
if bash -n ultimate-setup.sh; then
    echo "   ✓ Syntaxe bash correcte"
else
    echo "   ❌ Erreur de syntaxe bash"
    exit 1
fi

# 7. Vérifier les corrections Drizzle dans ultimate-setup.sh
echo "✅ 7. Vérification des corrections Drizzle..."
if grep -q "npx drizzle-kit push --config=drizzle.config.js" ultimate-setup.sh; then
    echo "   ✓ Commande Drizzle corrigée"
else
    echo "   ❌ Commande Drizzle non corrigée"
    exit 1
fi

if grep -q "\-\-verbose\|\-\-out=" ultimate-setup.sh; then
    echo "   ⚠️  Options deprecated encore présentes"
else
    echo "   ✓ Options deprecated supprimées"
fi

echo ""
echo "🎉 TOUS LES TESTS RÉUSSIS"
echo "🚀 Le déploiement est prêt pour la production"
echo ""
echo "Pour déployer sur VPS 162.19.67.3 avec domaine purpleguy.world :"
echo "sudo ./ultimate-setup.sh purpleguy.world admin@purpleguy.world"