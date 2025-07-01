#!/bin/bash

# Fix asset paths in the generated HTML to use relative paths instead of HTTPS
VPS_IP="162.19.67.3"
VPS_USER="ubuntu"

echo "FIXING ASSET PATHS"
echo "=================="

ssh -o StrictHostKeyChecking=no -T $VPS_USER@$VPS_IP << 'REMOTE'
cd /var/www/bennespro

echo "Current index.html content:"
cat dist/public/index.html

echo "Fixing asset paths to be relative..."

# Create a corrected index.html with relative asset paths
cat > dist/public/index.html << 'HTML'
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/container-icon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BennesPro - Location de Bennes</title>
    <script type="module" crossorigin src="/assets/index-CUaOr6u0.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-UROmFd9v.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
HTML

echo "Updated index.html:"
cat dist/public/index.html

echo "Checking if assets exist:"
ls -la dist/public/assets/

echo "Restarting server..."
pkill -f "node dist/index.js" || true
sleep 2

# Start with correct environment
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
export APP_BASE_URL="http://162.19.67.3:3000"

echo "Starting BennesPro on port 3000..."
node dist/index.js &

echo "Server started. Check http://162.19.67.3:3000"
REMOTE