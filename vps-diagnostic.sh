#!/bin/bash

echo "🔍 Diagnostic VPS Build Files"
echo "============================"

echo "📁 Répertoire actuel :"
pwd

echo ""
echo "📋 Contenu du répertoire racine :"
ls -la

echo ""
echo "🔍 Recherche des dossiers dist :"
find . -name "dist" -type d 2>/dev/null || echo "Aucun dossier dist trouvé"

echo ""
echo "🔍 Recherche des fichiers index.html :"
find . -name "index.html" -type f 2>/dev/null || echo "Aucun index.html trouvé"

echo ""
echo "🔍 Recherche des fichiers build :"
find . -name "build" -type d 2>/dev/null || echo "Aucun dossier build trouvé"

echo ""
echo "📦 Vérification package.json :"
if [ -f "package.json" ]; then
    echo "✅ package.json trouvé"
    echo "Scripts disponibles :"
    grep -A 10 '"scripts"' package.json
else
    echo "❌ package.json non trouvé"
fi

echo ""
echo "🔧 Test de build :"
echo "Exécution de: npm run build"
npm run build

echo ""
echo "🔍 Vérification post-build :"
if [ -d "dist" ]; then
    echo "✅ Dossier dist créé"
    ls -la dist/
    if [ -f "dist/index.html" ]; then
        echo "✅ index.html trouvé"
        echo "Taille du fichier :"
        wc -c dist/index.html
    else
        echo "❌ index.html manquant"
    fi
else
    echo "❌ Dossier dist non créé"
fi

echo ""
echo "🎯 Diagnostic terminé"