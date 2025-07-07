#!/bin/bash

# ===============================================
# VÉRIFICATION UTILISATION VARIABLES ENV
# ===============================================

echo "🔍 VÉRIFICATION DE L'UTILISATION DES VARIABLES D'ENVIRONNEMENT"
echo ""

# Vérifier l'utilisation dans le code serveur
echo "📋 UTILISATION CÔTÉ SERVEUR:"
echo "============================"

echo ""
echo "✅ Variables utilisées dans server/:"
grep -r "process.env\." server/ | grep -E "(GOOGLE_MAPS_API_KEY|STRIPE_SECRET_KEY|DATABASE_URL|JWT_SECRET|SESSION_SECRET|SENDGRID_API_KEY)" | head -20

echo ""
echo "📋 UTILISATION CÔTÉ CLIENT:"
echo "==========================="

echo ""
echo "✅ Variables VITE_ utilisées dans client/:"
grep -r "import.meta.env\." client/src/ | grep -E "(VITE_STRIPE_PUBLIC_KEY|VITE_API_URL)" | head -20

echo ""
echo "📋 CHARGEMENT DOTENV:"
echo "===================="

echo ""
echo "✅ Fichiers qui chargent dotenv:"
grep -r "dotenv" server/ --include="*.ts" --include="*.js" | grep -v node_modules

echo ""
echo "📊 RÉSUMÉ DES CLÉS CRITIQUES:"
echo "============================="

# Vérifier les clés critiques
echo ""
echo "🔑 Google Maps API:"
if grep -q "GOOGLE_MAPS_API_KEY" server/distanceService.ts; then
  echo "✅ GOOGLE_MAPS_API_KEY utilisée dans distanceService.ts"
else
  echo "❌ GOOGLE_MAPS_API_KEY non trouvée dans distanceService.ts"
fi

echo ""
echo "💳 Stripe:"
if grep -q "STRIPE_SECRET_KEY" server/routes.ts; then
  echo "✅ STRIPE_SECRET_KEY utilisée dans routes.ts"
else
  echo "❌ STRIPE_SECRET_KEY non trouvée dans routes.ts"
fi

if grep -q "VITE_STRIPE_PUBLIC_KEY" client/src/lib/stripe.ts 2>/dev/null || grep -q "VITE_STRIPE_PUBLIC_KEY" client/src/lib/stripe.js 2>/dev/null; then
  echo "✅ VITE_STRIPE_PUBLIC_KEY utilisée côté client"
else
  echo "⚠️  VITE_STRIPE_PUBLIC_KEY peut-être non utilisée côté client"
fi

echo ""
echo "🗄️ Base de données:"
if grep -q "DATABASE_URL" server/db.ts; then
  echo "✅ DATABASE_URL utilisée dans db.ts"
else
  echo "❌ DATABASE_URL non trouvée dans db.ts"
fi

echo ""
echo "🔒 Sécurité:"
if grep -q "JWT_SECRET" server/auth.ts; then
  echo "✅ JWT_SECRET utilisée dans auth.ts"
else
  echo "❌ JWT_SECRET non trouvée dans auth.ts"
fi

echo ""
echo "✅ Vérification terminée!"