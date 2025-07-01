#!/bin/bash

# Script de correction rapide pour créer les fichiers dist manquants
VPS_IP="162.19.67.3"
VPS_USER="ubuntu"

echo "🚀 CORRECTION RAPIDE DIST"
echo "========================="

# Créer un index.html minimal si nécessaire
cat > temp-index.html << 'HTML'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BennesPro - Plateforme de Gestion de Déchets</title>
    <script type="module" crossorigin src="/assets/index.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index.css">
</head>
<body>
    <div id="root"></div>
</body>
</html>
HTML

# Transférer le fichier temporaire
echo "📤 Transfert index.html temporaire..."
scp -o StrictHostKeyChecking=no temp-index.html $VPS_USER@$VPS_IP:/tmp/

# Installation sur VPS
ssh -o StrictHostKeyChecking=no -T $VPS_USER@$VPS_IP << 'REMOTE'
cd /var/www/bennespro

# Créer le dossier dist s'il n'existe pas
mkdir -p dist

# Copier l'index temporaire
if [ ! -f "dist/index.html" ]; then
    cp /tmp/temp-index.html dist/index.html
    echo "✅ index.html temporaire créé"
fi

# Vérifier que le serveur compilé existe
if [ ! -f "dist/index.js" ]; then
    echo "⚠️ Compilation du serveur nécessaire..."
    # Essayer de compiler le serveur seulement
    npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
    echo "✅ Serveur compilé"
fi

echo "📁 Contenu dist:"
ls -la dist/
REMOTE

# Nettoyer
rm temp-index.html

echo "✅ Correction terminée"
echo "Testez maintenant: cd /var/www/bennespro && sudo ./start-app.sh"