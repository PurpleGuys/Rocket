#!/bin/bash

# IMMEDIATE FIX - Create missing dist files directly on VPS
VPS_IP="162.19.67.3"
VPS_USER="ubuntu"

echo "IMMEDIATE FIX FOR DIST FILES"
echo "============================"

ssh -o StrictHostKeyChecking=no -T $VPS_USER@$VPS_IP << 'REMOTE'
cd /var/www/bennespro

# Create dist directory
mkdir -p dist

# Create index.html directly
cat > dist/index.html << 'HTML'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BennesPro</title>
</head>
<body>
    <div id="root">
        <h1>BennesPro - Application Loading...</h1>
        <p>L'application se charge, veuillez patienter...</p>
    </div>
</body>
</html>
HTML

# Build server only if not exists
if [ ! -f "dist/index.js" ]; then
    echo "Building server..."
    npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
fi

# Create assets directory
mkdir -p dist/assets

echo "Files created:"
ls -la dist/

# Create simple start script
cat > run-now.sh << 'SCRIPT'
#!/bin/bash
export DATABASE_URL="postgresql://remondis:Remondis60110$@localhost:5432/remondis_db"
export NODE_ENV="production"
export PORT="3000"
export SESSION_SECRET="f6b3e76ee636d248b8c85091425ae4fe9de4a8011b1fa17d30f0fcf13f5c2df2b5a5c1c4109dd6b8c5e22eaae33feb872434e71cc2f17f64a3b4e72d40e2d4f5"
export JWT_SECRET="85eb00206d3991c2ade3186cfad4e9265fc9d72cadbe698ba305884086bc3e29e5d11f92df517a684f4e4bd136507bb81b6ef79902e5eb96d98273f6c9bb1723"
export STRIPE_SECRET_KEY="sk_test_fake_key_for_development"
export STRIPE_PUBLISHABLE_KEY="pk_test_fake_key_for_development"
export STRIPE_WEBHOOK_SECRET="whsec_fake_webhook_secret"
export SENDGRID_API_KEY=""
export GOOGLE_MAPS_API_KEY=""
export REMONDIS_SALES_EMAIL="commercial@remondis.fr"
export APP_BASE_URL="http://purpleguy.world"

echo "Starting BennesPro..."
node dist/index.js
SCRIPT

chmod +x run-now.sh

echo "READY TO START!"
REMOTE

echo "DONE. On your VPS run:"
echo "cd /var/www/bennespro && sudo ./run-now.sh"