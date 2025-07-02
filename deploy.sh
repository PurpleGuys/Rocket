#!/bin/bash

# 🚀 COMMANDE MAGIQUE - DÉPLOIE TOUT EN UNE FOIS !
# Une seule commande pour une application Docker complètement fonctionnelle

clear
echo "🚀 DÉPLOIEMENT BENNESPRO DOCKER - 100% AUTOMATIQUE"
echo "=================================================="
echo "Cette commande va TOUT faire automatiquement !"
echo ""

# Exécuter le script principal
if [ -f "docker-deploy-auto.sh" ]; then
    echo "🎯 Lancement du déploiement automatisé..."
    echo ""
    ./docker-deploy-auto.sh
else
    echo "❌ Fichier docker-deploy-auto.sh non trouvé !"
    echo "Assurez-vous d'être dans le bon dossier du projet."
    exit 1
fi

echo ""
echo "🎉 DÉPLOIEMENT TERMINÉ !"
echo "======================"
echo ""
echo "🌐 Votre application BennesPro est maintenant accessible :"
echo "   👉 http://localhost"
echo "   👉 http://votre-ip-serveur"
echo ""
echo "💡 CONSEIL : Éditez le fichier .env avec vos vraies clés API"
echo "pour activer SendGrid, Google Maps et Stripe"