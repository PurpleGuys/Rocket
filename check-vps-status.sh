#!/bin/bash

# Vérification du statut sur VPS
VPS_IP="162.19.67.3"
VPS_USER="ubuntu"

echo "🔍 VÉRIFICATION STATUT VPS"
echo "=========================="

ssh -o StrictHostKeyChecking=no -T $VPS_USER@$VPS_IP << 'REMOTE'
echo "📁 Contenu /var/www/bennespro:"
if [ -d /var/www/bennespro ]; then
    ls -la /var/www/bennespro/
    echo ""
    echo "📂 Contenu dossier dist:"
    if [ -d /var/www/bennespro/dist ]; then
        ls -la /var/www/bennespro/dist/
    else
        echo "❌ Dossier dist non trouvé"
    fi
    echo ""
    echo "📋 Script de démarrage:"
    if [ -f /var/www/bennespro/start-app.sh ]; then
        echo "✅ start-app.sh trouvé"
    else
        echo "❌ start-app.sh non trouvé"
    fi
else
    echo "❌ Répertoire /var/www/bennespro non trouvé"
fi
REMOTE