#!/bin/bash

# CORRECTION ULTIME STRIPE - FORCE LA CLÉ PARTOUT
echo "🔧 FORÇAGE ULTIME STRIPE PRODUCTION..."

STRIPE_KEY="pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"

# 1. Modifier stripe.js directement pour hardcoder la clé
echo "📝 Modification de client/src/lib/stripe.js..."
cat > client/src/lib/stripe.js << EOF
import { loadStripe } from '@stripe/stripe-js';

// STRIPE PRODUCTION KEY - HARDCODED
const STRIPE_PUBLIC_KEY = '$STRIPE_KEY';

// Force key everywhere
if (typeof window !== 'undefined') {
  window.VITE_STRIPE_PUBLIC_KEY = STRIPE_PUBLIC_KEY;
  window.STRIPE_PUBLIC_KEY = STRIPE_PUBLIC_KEY;
  window.process = window.process || {};
  window.process.env = window.process.env || {};
  window.process.env.VITE_STRIPE_PUBLIC_KEY = STRIPE_PUBLIC_KEY;
}

// Create stripe promise with hardcoded key
export const stripePromise = loadStripe(STRIPE_PUBLIC_KEY, { locale: 'fr' });

console.log('✅ Stripe configured with hardcoded production key:', STRIPE_PUBLIC_KEY.substring(0, 15) + '...');
EOF

# 2. Modifier aussi stripe-config.js pour être sûr
echo "📝 Modification de client/src/lib/stripe-config.js..."
cat > client/src/lib/stripe-config.js << EOF
// STRIPE CONFIGURATION - HARDCODED PRODUCTION KEY
export const STRIPE_PUBLIC_KEY = '$STRIPE_KEY';

// Override any environment variable checks
if (typeof window !== 'undefined') {
  window.VITE_STRIPE_PUBLIC_KEY = STRIPE_PUBLIC_KEY;
  window.STRIPE_PUBLIC_KEY = STRIPE_PUBLIC_KEY;
  window.process = window.process || {};
  window.process.env = window.process.env || {};
  window.process.env.VITE_STRIPE_PUBLIC_KEY = STRIPE_PUBLIC_KEY;
}

console.log('✅ Stripe configuration loaded with production key');
EOF

# 3. Créer un vite.config.production.ts qui force la clé
echo "📝 Création de vite.config.production.ts..."
cat > vite.config.production.ts << EOF
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/public',
    sourcemap: false,
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          stripe: ['@stripe/stripe-js', '@stripe/react-stripe-js']
        }
      }
    }
  },
  define: {
    'process.env.VITE_STRIPE_PUBLIC_KEY': JSON.stringify('$STRIPE_KEY'),
    'import.meta.env.VITE_STRIPE_PUBLIC_KEY': JSON.stringify('$STRIPE_KEY'),
    'window.VITE_STRIPE_PUBLIC_KEY': JSON.stringify('$STRIPE_KEY')
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@/lib': path.resolve(__dirname, './client/src/lib'),
      '@/components': path.resolve(__dirname, './client/src/components'),
      '@/hooks': path.resolve(__dirname, './client/src/hooks'),
      '@/pages': path.resolve(__dirname, './client/src/pages'),
      '@assets': path.resolve(__dirname, './attached_assets'),
      '@shared': path.resolve(__dirname, './shared')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
EOF

# 4. Script pour build de production
echo "📝 Création du script de build production..."
cat > build-production-stripe.sh << 'EOF'
#!/bin/bash
echo "🏗️ BUILD PRODUCTION AVEC STRIPE HARDCODÉ..."

# Exporter la clé pour le build
export VITE_STRIPE_PUBLIC_KEY="pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"

# Build avec la config production
npm run build -- --config ./vite.config.production.ts

echo "✅ Build production terminé"
EOF

chmod +x build-production-stripe.sh

# 5. Script VPS final
echo "📝 Création du script VPS..."
cat > vps-stripe-deployment-fix.sh << 'VPSEOF'
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
VPSEOF

chmod +x vps-stripe-deployment-fix.sh

echo "✅ Scripts créés:"
echo "   - force-stripe-production.sh (ce script)"
echo "   - build-production-stripe.sh (build avec Stripe hardcodé)"
echo "   - vps-stripe-deployment-fix.sh (déploiement VPS complet)"
echo ""
echo "📋 POUR CORRIGER SUR VOTRE VPS:"
echo "1. Copiez vps-stripe-deployment-fix.sh sur votre VPS"
echo "2. Exécutez-le sur le VPS avec: ./vps-stripe-deployment-fix.sh"
echo ""
echo "✅ Stripe est maintenant hardcodé partout avec la clé:"
echo "   $STRIPE_KEY"