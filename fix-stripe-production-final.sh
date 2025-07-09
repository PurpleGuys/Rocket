#!/bin/bash

# CORRECTION DÉFINITIVE STRIPE VPS - PAS D'ENV VARS, HARDCODED DIRECT
echo "🔧 CORRECTION DÉFINITIVE STRIPE POUR VPS..."

# 1. Créer un fichier de configuration Stripe avec clé hardcodée
cat > client/src/lib/stripe-hardcoded.js << 'EOF'
// STRIPE PRODUCTION KEY - HARDCODED POUR VPS
const STRIPE_PUBLIC_KEY = 'pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS';

// Force la clé partout
if (typeof window !== 'undefined') {
  window.STRIPE_PUBLIC_KEY = STRIPE_PUBLIC_KEY;
  window.VITE_STRIPE_PUBLIC_KEY = STRIPE_PUBLIC_KEY;
}

export { STRIPE_PUBLIC_KEY };
EOF

# 2. Modifier stripe.js pour utiliser la clé hardcodée
cat > client/src/lib/stripe.js << 'EOF'
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLIC_KEY } from './stripe-hardcoded';

// Clé Stripe de production hardcodée
const stripeKey = 'pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS';

// Utiliser directement la clé hardcodée
export const stripePromise = loadStripe(stripeKey, { locale: 'fr' });

console.log('✅ Stripe configured with hardcoded production key');
EOF

# 3. Créer un vite.config spécial pour production
cat > vite.config.production.ts << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/public',
    sourcemap: true,
    chunkSizeWarningLimit: 2000,
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
    'process.env.VITE_STRIPE_PUBLIC_KEY': JSON.stringify('pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS'),
    'import.meta.env.VITE_STRIPE_PUBLIC_KEY': JSON.stringify('pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS')
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@/lib': path.resolve(__dirname, './client/src/lib'),
      '@/components': path.resolve(__dirname, './client/src/components'),
      '@/hooks': path.resolve(__dirname, './client/src/hooks'),
      '@shared': path.resolve(__dirname, './shared')
    }
  }
});
EOF

# 4. Script de build spécial pour VPS
cat > build-vps-stripe.sh << 'EOF'
#!/bin/bash
echo "🏗️ BUILD VPS AVEC STRIPE HARDCODÉ..."

# Build avec config production
npm run build -- --config ./vite.config.production.ts

# Vérifier que Stripe est dans le build
echo "🔍 Vérification Stripe dans le build..."
grep -r "pk_live_51RTkOE" dist/public/assets/ || echo "⚠️ Clé Stripe non trouvée dans le build!"

echo "✅ Build VPS terminé"
EOF

chmod +x build-vps-stripe.sh

# 5. Créer un script de déploiement VPS complet
cat > deploy-vps-stripe-final.sh << 'EOF'
#!/bin/bash

echo "🚀 DÉPLOIEMENT VPS AVEC STRIPE HARDCODÉ"

# 1. Build avec Stripe hardcodé
./build-vps-stripe.sh

# 2. Créer archive
tar -czf bennespro-vps.tar.gz \
  dist/ \
  server/ \
  shared/ \
  package*.json \
  drizzle.config.ts \
  .env.example

# 3. Instructions VPS
cat << 'INSTRUCTIONS'

=== DÉPLOIEMENT SUR VPS ===

1. Upload: scp bennespro-vps.tar.gz user@vps:/path/to/app/

2. Sur le VPS:
   cd /path/to/app
   tar -xzf bennespro-vps.tar.gz
   npm install --production
   
3. Variables d'environnement (.env):
   DATABASE_URL=your_database_url
   # PAS BESOIN DE VITE_STRIPE_PUBLIC_KEY - HARDCODÉ!

4. Démarrer:
   NODE_ENV=production node server/index.js

=== STRIPE EST HARDCODÉ - AUCUNE CONFIG NÉCESSAIRE ===

INSTRUCTIONS
EOF

chmod +x deploy-vps-stripe-final.sh

echo "✅ Scripts créés:"
echo "   - ./fix-stripe-production-final.sh (ce script)"
echo "   - ./build-vps-stripe.sh (build avec Stripe hardcodé)"
echo "   - ./deploy-vps-stripe-final.sh (déploiement complet)"
echo ""
echo "🚀 Exécutez ./deploy-vps-stripe-final.sh pour déployer"