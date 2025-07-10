#!/bin/bash

# CORRECTION ERREUR DÉMARRAGE VPS
echo "🔧 CORRECTION ERREUR DÉMARRAGE VPS..."

# Script à exécuter sur le VPS
cat > vps-fix-startup.sh << 'EOF'
#!/bin/bash

echo "🔧 Correction du démarrage sur VPS..."

# 1. Créer un script de démarrage propre
cat > /home/ubuntu/JobDone/start.sh << 'STARTSCRIPT'
#!/bin/bash
cd /home/ubuntu/JobDone
export NODE_ENV=production
export VITE_STRIPE_PUBLIC_KEY="pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"

# Démarrer avec tsx
npx tsx server/index.ts
STARTSCRIPT

chmod +x /home/ubuntu/JobDone/start.sh

# 2. Créer un service systemd corrigé
cat > /tmp/bennespro.service << 'SERVICEEND'
[Unit]
Description=BennesPro Application
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/JobDone
Environment="NODE_ENV=production"
Environment="VITE_STRIPE_PUBLIC_KEY=pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"
ExecStart=/home/ubuntu/JobDone/start.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICEEND

# 3. Installer le service
sudo cp /tmp/bennespro.service /etc/systemd/system/
sudo systemctl daemon-reload

# 4. Alternative avec PM2 (si installé)
if command -v pm2 &> /dev/null; then
  echo "📌 Configuration PM2..."
  cd /home/ubuntu/JobDone
  pm2 delete bennespro 2>/dev/null || true
  pm2 start server/index.ts --name bennespro --interpreter tsx -- --node-env production
  pm2 save
  pm2 startup systemd -u ubuntu --hp /home/ubuntu || true
else
  echo "⚠️ PM2 non installé, utilisation de systemd"
fi

# 5. Démarrage direct pour test
echo "🚀 Test de démarrage direct..."
cd /home/ubuntu/JobDone
export NODE_ENV=production
export VITE_STRIPE_PUBLIC_KEY="pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"

# Vérifier que le fichier existe
if [ -f "server/index.ts" ]; then
  echo "✅ server/index.ts trouvé"
  # Démarrer en arrière-plan
  nohup npx tsx server/index.ts > app.log 2>&1 &
  echo "✅ Application démarrée, PID: $!"
  echo "📋 Logs dans app.log"
else
  echo "❌ server/index.ts non trouvé!"
  ls -la server/
fi

echo "✅ Configuration terminée!"
echo ""
echo "Pour démarrer avec systemd:"
echo "  sudo systemctl start bennespro"
echo "  sudo systemctl status bennespro"
echo ""
echo "Pour voir les logs:"
echo "  sudo journalctl -u bennespro -f"
echo "  ou: tail -f app.log"
EOF

chmod +x vps-fix-startup.sh

# Instructions
echo "📋 INSTRUCTIONS POUR CORRIGER L'ERREUR VPS:"
echo ""
echo "1. Copiez le script sur votre VPS:"
echo "   scp vps-fix-startup.sh ubuntu@purpleguy.world:/home/ubuntu/"
echo ""
echo "2. Sur le VPS, exécutez:"
echo "   cd /home/ubuntu"
echo "   ./vps-fix-startup.sh"
echo ""
echo "3. L'application devrait démarrer correctement"