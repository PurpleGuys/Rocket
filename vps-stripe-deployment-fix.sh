#!/bin/bash

echo "🚀 DÉPLOIEMENT VPS AVEC STRIPE FORCÉ"

# Variables
STRIPE_KEY="pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"
APP_DIR="/var/www/bennespro"  # Ajustez selon votre installation

# 1. S'assurer que la clé est dans .env
echo "📝 Ajout de la clé Stripe au .env..."
cd $APP_DIR
if ! grep -q "VITE_STRIPE_PUBLIC_KEY" .env 2>/dev/null; then
  echo "VITE_STRIPE_PUBLIC_KEY=$STRIPE_KEY" >> .env
else
  sed -i "s/^VITE_STRIPE_PUBLIC_KEY=.*/VITE_STRIPE_PUBLIC_KEY=$STRIPE_KEY/" .env
fi

# 2. Build avec la clé forcée
echo "🏗️ Build de l'application..."
export VITE_STRIPE_PUBLIC_KEY="$STRIPE_KEY"
npm run build

# 3. Corriger les fichiers buildés au cas où
echo "🔧 Correction des fichiers buildés..."
find dist -name "*.js" -type f | while read file; do
  # Remplacer les clés vides ou undefined
  sed -i "s/VITE_STRIPE_PUBLIC_KEY:\"\"/VITE_STRIPE_PUBLIC_KEY:\"$STRIPE_KEY\"/g" "$file"
  sed -i "s/VITE_STRIPE_PUBLIC_KEY:void 0/VITE_STRIPE_PUBLIC_KEY:\"$STRIPE_KEY\"/g" "$file"
  sed -i "s/VITE_STRIPE_PUBLIC_KEY:null/VITE_STRIPE_PUBLIC_KEY:\"$STRIPE_KEY\"/g" "$file"
done

# 4. Créer un fichier de démarrage avec env forcé
cat > start-with-stripe.sh << 'STARTEOF'
#!/bin/bash
export VITE_STRIPE_PUBLIC_KEY="pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"
export NODE_ENV=production
node server/index.js
STARTEOF
chmod +x start-with-stripe.sh

# 5. Créer un service systemd mis à jour
cat > bennespro.service << 'SERVICEEOF'
[Unit]
Description=BennesPro Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/bennespro
Environment="NODE_ENV=production"
Environment="VITE_STRIPE_PUBLIC_KEY=pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"
ExecStart=/usr/bin/node server/index.js
Restart=always

[Install]
WantedBy=multi-user.target
SERVICEEOF

echo "📋 Service systemd créé dans bennespro.service"
echo "   Copiez-le dans /etc/systemd/system/ et activez avec:"
echo "   sudo cp bennespro.service /etc/systemd/system/"
echo "   sudo systemctl daemon-reload"
echo "   sudo systemctl restart bennespro"

echo "✅ STRIPE FORCÉ PARTOUT! Redémarrez votre application."
