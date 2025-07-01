#!/bin/bash

# Manual fix for VPS build issues
VPS_IP="162.19.67.3"
VPS_USER="ubuntu"

echo "🔧 MANUAL VPS BUILD FIX"
echo "======================="

ssh -o StrictHostKeyChecking=no -T $VPS_USER@$VPS_IP << 'REMOTE'
set -e

echo "Current directory: $(pwd)"
cd /var/www/bennespro

echo "Directory contents:"
ls -la

echo "Installing dependencies fresh..."
rm -rf node_modules package-lock.json
npm install

echo "Building frontend with Vite..."
npx vite build

echo "Building backend with esbuild..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Checking dist directory:"
ls -la dist/

echo "Creating start script with database setup..."
cat > start-production.sh << 'SCRIPT'
#!/bin/bash

# Setup database first
echo "Setting up database..."
sudo -u postgres psql << 'SQL'
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'remondis') THEN
        CREATE USER remondis WITH PASSWORD 'Remondis60110$';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'remondis_db') THEN
        CREATE DATABASE remondis_db OWNER remondis;
    END IF;
    
    GRANT ALL PRIVILEGES ON DATABASE remondis_db TO remondis;
END $$;
SQL

# Export environment variables
export DATABASE_URL="postgresql://remondis:Remondis60110$@localhost:5432/remondis_db"
export NODE_ENV="production"
export PORT="3000"
export SESSION_SECRET="f6b3e76ee636d248b8c85091425ae4fe9de4a8011b1fa17d30f0fcf13f5c2df2b5a5c1c4109dd6b8c5e22eaae33feb872434e71cc2f17f64a3b4e72d40e2d4f5"
export JWT_SECRET="85eb00206d3991c2ade3186cfad4e9265fc9d72cadbe698ba305884086bc3e29e5d11f92df517a684f4e4bd136507bb81b6ef79902e5eb96d98273f6c9bb1723"
export STRIPE_SECRET_KEY="sk_test_fake_key_for_development"
export STRIPE_PUBLISHABLE_KEY="pk_test_fake_key_for_development"
export STRIPE_WEBHOOK_SECRET="whsec_fake_webhook_secret"
export SENDGRID_API_KEY=""
export SENDGRID_VERIFIED_SENDER_EMAIL=""
export GOOGLE_MAPS_API_KEY=""
export REMONDIS_SALES_EMAIL="commercial@remondis.fr"
export APP_BASE_URL="http://purpleguy.world"

echo "🚀 Starting BennesPro on port 3000"
echo "Database: $DATABASE_URL"
echo "Environment: $NODE_ENV"

node dist/index.js
SCRIPT

chmod +x start-production.sh

echo "✅ Setup complete!"
echo "Files in dist:"
ls -la dist/
REMOTE

echo "Setup completed. On your VPS run:"
echo "cd /var/www/bennespro && sudo ./start-production.sh"