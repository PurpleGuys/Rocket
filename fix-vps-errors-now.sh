#!/bin/bash

# Script pour corriger TOUTES les erreurs VPS immédiatement

echo "==================================="
echo "FIX VPS ERRORS - CORRECTION TOTALE"
echo "==================================="

# 1. Corriger le CSP dans Nginx
echo "1. Mise à jour de la configuration Nginx..."
cat > /tmp/nginx-fix.conf << 'EOF'
# Dans votre configuration Nginx, remplacez l'en-tête CSP par :
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.stripe.com https://*.stripe.com https://js.stripe.com https://r.stripe.com https://m.stripe.com https://m.stripe.network https://maps.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://js.stripe.com;" always;
EOF

# 2. Réinitialiser les tentatives de connexion dans la base de données
echo "2. Création du script SQL pour débloquer les comptes..."
cat > /tmp/unlock-accounts.sql << 'EOF'
-- Réinitialiser toutes les tentatives de connexion
UPDATE users SET 
    login_attempts = 0,
    lock_until = NULL,
    is_active = true
WHERE email = 'ethan.petrovic@remondis.fr' OR login_attempts > 0;

-- Vérifier le résultat
SELECT email, login_attempts, lock_until, is_active FROM users;
EOF

# 3. Script de déploiement rapide
echo "3. Création du script de déploiement..."
cat > deploy-vps-fix.sh << 'EOF'
#!/bin/bash
# Déploiement rapide des corrections

# Pull des derniers changements
git pull origin main

# Rebuild
npm install
npm run build

# Redémarrer l'application
pm2 restart bennespro || systemctl restart bennespro || docker-compose restart app

echo "Déploiement terminé!"
EOF

chmod +x deploy-vps-fix.sh

echo ""
echo "==================================="
echo "COMMANDES À EXÉCUTER SUR LE VPS:"
echo "==================================="
echo ""
echo "1. Débloquer les comptes verrouillés:"
echo "   sudo -u postgres psql -d bennespro < /tmp/unlock-accounts.sql"
echo ""
echo "2. Mettre à jour Nginx (remplacer le CSP):"
echo "   sudo nano /etc/nginx/sites-available/purpleguy.world"
echo "   # Coller le CSP du fichier /tmp/nginx-fix.conf"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "3. Déployer les corrections:"
echo "   ./deploy-vps-fix.sh"
echo ""
echo "==================================="
echo "CORRECTION RAPIDE SANS REDÉPLOIEMENT:"
echo "==================================="
echo ""
echo "Si vous ne pouvez pas redéployer immédiatement, exécutez juste:"
echo "sudo -u postgres psql -d bennespro -c \"UPDATE users SET login_attempts = 0, lock_until = NULL WHERE email = 'ethan.petrovic@remondis.fr';\""
echo ""