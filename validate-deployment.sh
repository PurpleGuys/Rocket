#!/bin/bash

# =====================================
# VALIDATION DÉPLOIEMENT BENNESPRO
# Vérifications avant déploiement production
# =====================================

echo "🔍 VALIDATION DÉPLOIEMENT BENNESPRO"
echo "==================================="

ERRORS=0
WARNINGS=0

# Fonction pour afficher les erreurs
error() {
    echo "❌ ERREUR: $1"
    ((ERRORS++))
}

# Fonction pour afficher les avertissements
warning() {
    echo "⚠️ ATTENTION: $1"
    ((WARNINGS++))
}

# Fonction pour afficher les succès
success() {
    echo "✅ $1"
}

echo "📦 1. Vérification des fichiers requis..."

# Vérifier les fichiers essentiels
if [ -f "package.json" ]; then
    success "package.json présent"
else
    error "package.json manquant"
fi

if [ -f ".env" ]; then
    success ".env présent"
else
    error ".env manquant"
fi

if [ -d "server" ]; then
    success "Dossier server/ présent"
else
    error "Dossier server/ manquant"
fi

if [ -d "client" ]; then
    success "Dossier client/ présent"
else
    error "Dossier client/ manquant"
fi

if [ -f "server/index.ts" ]; then
    success "server/index.ts présent"
else
    error "server/index.ts manquant"
fi

echo ""
echo "🏗️ 2. Vérification de la construction..."

# Vérifier si l'application peut être construite
if [ -d "dist" ]; then
    success "Dossier dist/ présent (application construite)"
else
    warning "Dossier dist/ absent - sera créé lors du build"
fi

# Vérifier node_modules
if [ -d "node_modules" ]; then
    success "Dépendances installées"
else
    error "node_modules manquant - exécuter npm install"
fi

echo ""
echo "🗄️ 3. Vérification base de données..."

# Vérifier la configuration de la base de données
if grep -q "DATABASE_URL" .env; then
    success "DATABASE_URL configurée"
else
    error "DATABASE_URL non configurée dans .env"
fi

if [ -f "drizzle.config.ts" ]; then
    success "Configuration Drizzle présente"
else
    error "drizzle.config.ts manquant"
fi

echo ""
echo "🔐 4. Vérification configuration sécurité..."

# Vérifier les secrets
if grep -q "SESSION_SECRET" .env; then
    success "SESSION_SECRET configuré"
else
    error "SESSION_SECRET manquant dans .env"
fi

if grep -q "JWT_SECRET" .env; then
    success "JWT_SECRET configuré"
else
    error "JWT_SECRET manquant dans .env"
fi

echo ""
echo "🌐 5. Vérification configuration serveur..."

# Vérifier la configuration du serveur
if grep -q "PORT" .env; then
    success "PORT configuré"
else
    warning "PORT non configuré - utilisera valeur par défaut"
fi

if grep -q "NODE_ENV" .env; then
    success "NODE_ENV configuré"
else
    warning "NODE_ENV non configuré"
fi

echo ""
echo "📝 6. Vérification scripts NPM..."

# Vérifier les scripts NPM
if grep -q '"build"' package.json; then
    success "Script build configuré"
else
    error "Script build manquant dans package.json"
fi

if grep -q '"start"' package.json; then
    success "Script start configuré"
else
    error "Script start manquant dans package.json"
fi

echo ""
echo "🧪 7. Test de fonctionnement local..."

# Test de compilation TypeScript (rapide)
if command -v npx &> /dev/null; then
    if npx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then
        success "Code TypeScript valide"
    else
        warning "Erreurs TypeScript détectées"
    fi
else
    warning "npx non disponible - impossible de vérifier TypeScript"
fi

echo ""
echo "📊 RÉSUMÉ DE LA VALIDATION"
echo "========================="

if [ $ERRORS -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo "🎉 PARFAIT ! Aucun problème détecté."
        echo "✅ Prêt pour le déploiement production"
    else
        echo "⚠️ $WARNINGS avertissement(s) détecté(s)"
        echo "✅ Déploiement possible avec précautions"
    fi
else
    echo "❌ $ERRORS erreur(s) détectée(s)"
    echo "🚫 Corriger les erreurs avant déploiement"
fi

echo ""
echo "🚀 COMMANDES DE DÉPLOIEMENT"
echo "==========================="
echo "1. Export base de données: ./export-database.sh"
echo "2. Déploiement production: ./deploy-production.sh"
echo "3. Validation post-déploiement: curl https://purpleguy.world/api/health"

echo ""
if [ $ERRORS -eq 0 ]; then
    echo "🔥 TOUT EST PRÊT POUR LE DÉPLOIEMENT !"
    exit 0
else
    echo "⚠️ CORRIGER LES ERREURS AVANT DE CONTINUER"
    exit 1
fi