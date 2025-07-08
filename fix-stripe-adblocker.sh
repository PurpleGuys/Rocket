#!/bin/bash

echo "🛠️ FIX STRIPE ADBLOCKER ISSUE"
echo "============================="
echo ""

cat << 'EOF'
PROBLÈME IDENTIFIÉ:
==================
- Erreur: POST https://r.stripe.com/b net::ERR_BLOCKED_BY_ADBLOCKER
- Cause: Votre bloqueur de publicités (AdBlock, uBlock, etc.) bloque Stripe

SOLUTIONS:
=========

1. SOLUTION RAPIDE (Recommandée):
   - Désactivez votre AdBlocker sur purpleguy.world
   - Ou ajoutez purpleguy.world à la liste blanche

2. SOLUTION PERMANENTE:
   - Dans votre navigateur, ouvrez les paramètres de l'AdBlocker
   - Ajoutez ces domaines à la liste blanche:
     * purpleguy.world
     * *.stripe.com
     * r.stripe.com
     * m.stripe.com

3. POUR CHROME/EDGE:
   - Cliquez sur l'icône AdBlock dans la barre d'outils
   - Sélectionnez "Ne pas bloquer sur ce site"
   - Rafraîchissez la page

4. POUR FIREFOX:
   - Cliquez sur l'icône uBlock Origin
   - Cliquez sur le bouton power pour désactiver
   - Rafraîchissez la page

IMPORTANT:
=========
- Cette erreur Stripe N'EST PAS liée à l'erreur 404 sur calculate-pricing
- Les deux problèmes sont indépendants
- Stripe a besoin d'être autorisé pour les paiements

POUR L'ERREUR 404 CALCULATE-PRICING:
===================================
Exécutez sur votre VPS:
cd /home/ubuntu/JobDone
git pull
npm run build
pm2 restart bennespro

EOF

echo ""
echo "✅ Instructions créées!"