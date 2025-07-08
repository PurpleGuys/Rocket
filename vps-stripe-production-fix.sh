#!/bin/bash

echo "🔧 CONFIGURATION STRIPE PRODUCTION POUR VPS"
echo "=========================================="

# 1. Vérifier et afficher les clés actuelles
echo -e "\n1️⃣ CLÉS STRIPE ACTUELLES DANS .ENV:"
echo "===================================="

STRIPE_PUBLIC=$(grep "VITE_STRIPE_PUBLIC_KEY" .env | cut -d'"' -f2)
STRIPE_SECRET=$(grep "STRIPE_SECRET_KEY" .env | cut -d'"' -f2)

if [[ $STRIPE_PUBLIC == pk_live* ]] && [[ $STRIPE_SECRET == sk_live* ]]; then
    echo "✅ Clés de production détectées:"
    echo "   - Publique: ${STRIPE_PUBLIC:0:15}..."
    echo "   - Secrète: ${STRIPE_SECRET:0:15}..."
else
    echo "❌ ERREUR: Les clés ne sont pas en production!"
    echo "   - Publique actuelle: ${STRIPE_PUBLIC:0:15}..."
    echo "   - Secrète actuelle: ${STRIPE_SECRET:0:15}..."
    exit 1
fi

# 2. Créer un fichier de configuration Vite forcé pour production
echo -e "\n2️⃣ CRÉATION CONFIGURATION VITE PRODUCTION..."

cat > vite.config.prod.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// Forcer les variables d'environnement de production
process.env.VITE_STRIPE_PUBLIC_KEY = process.env.VITE_STRIPE_PUBLIC_KEY || "pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@assets': path.resolve(__dirname, './attached_assets'),
      '@components': path.resolve(__dirname, './client/src/components'),
      '@hooks': path.resolve(__dirname, './client/src/hooks'),
      '@lib': path.resolve(__dirname, './client/src/lib'),
      '@pages': path.resolve(__dirname, './client/src/pages'),
      '@api': path.resolve(__dirname, './client/src/api'),
      '@shared': path.resolve(__dirname, './shared')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  define: {
    'import.meta.env.VITE_STRIPE_PUBLIC_KEY': JSON.stringify(process.env.VITE_STRIPE_PUBLIC_KEY)
  }
});
EOF

echo "✅ Configuration Vite production créée"

# 3. Build avec la configuration de production
echo -e "\n3️⃣ BUILD DE PRODUCTION AVEC CLÉS FORCÉES..."

# Exporter les variables pour le build
export NODE_ENV=production
export VITE_STRIPE_PUBLIC_KEY="$STRIPE_PUBLIC"

# Nettoyer et reconstruire
rm -rf dist
npm run build

# 4. Vérifier le résultat
echo -e "\n4️⃣ VÉRIFICATION DU BUILD..."

if grep -r "pk_test" dist/ 2>/dev/null; then
    echo "⚠️  Des clés de test trouvées dans le build!"
fi

if grep -r "pk_live" dist/ 2>/dev/null | head -1; then
    echo "✅ Clés de production présentes dans le build"
fi

# 5. Redémarrer l'application
echo -e "\n5️⃣ REDÉMARRAGE DE L'APPLICATION..."

if command -v pm2 &> /dev/null; then
    pm2 restart bennespro --update-env
    echo "✅ Application redémarrée avec PM2"
else
    echo "⚠️  PM2 non trouvé, redémarrage manuel nécessaire"
fi

echo -e "\n✅ CONFIGURATION TERMINÉE!"
echo "=========================="
echo ""
echo "⚠️  IMPORTANT - ACTIONS CÔTÉ CLIENT:"
echo "1. Vider COMPLÈTEMENT le cache du navigateur"
echo "2. Utiliser le mode incognito pour tester"
echo "3. Vérifier dans la console: 'Stripe configuré avec clé publique: pk_live...'"
echo ""
echo "Si le problème persiste, exécutez:"
echo "- curl -I http://votre-domaine.com"
echo "- pm2 logs bennespro --lines 50"