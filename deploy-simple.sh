#!/bin/bash

# Simple deployment script - no bullshit
set -e

VPS_IP="162.19.67.3"
VPS_USER="ubuntu"
DOMAIN="purpleguy.world"

echo "🚀 SIMPLE DEPLOYMENT"
echo "===================="

# Create temp directory and transfer files
ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "mkdir -p /tmp/bennespro"
scp -o StrictHostKeyChecking=no -r dist/ server/ client/ shared/ package.json $VPS_USER@$VPS_IP:/tmp/bennespro/

# Install and run on VPS
ssh -o StrictHostKeyChecking=no -T $VPS_USER@$VPS_IP << 'REMOTE'
set -e

# Install Node.js if needed
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install nginx and postgresql
sudo apt update
sudo apt install -y nginx postgresql postgresql-contrib

# Setup app directory
sudo mkdir -p /var/www/bennespro
sudo chown $USER:$USER /var/www/bennespro
cp -r /tmp/bennespro/* /var/www/bennespro/

cd /var/www/bennespro

# Create .env
cat > .env << 'ENV'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://remondis_db:Remondis60110$@localhost:5432/remondis_db
SESSION_SECRET=f6b3e76ee636d248b8c85091425ae4fe9de4a8011b1fa17d30f0fcf13f5c2df2b5a5c1c4109dd6b8c5e22eaae33feb872434e71cc2f17f64a3b4e72d40e2d4f5
JWT_SECRET=85eb00206d3991c2ade3186cfad4e9265fc9d72cadbe698ba305884086bc3e29e5d11f92df517a684f4e4bd136507bb81b6ef79902e5eb96d98273f6c9bb1723
ENV

# Install dependencies
npm ci --only=production

# Install PM2 globally
sudo npm install -g pm2

# Setup database
sudo -u postgres psql << 'SQL'
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'remondis_db') THEN
        CREATE USER remondis_db WITH PASSWORD 'Remondis60110$';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'remondis_db') THEN
        CREATE DATABASE remondis_db OWNER remondis_db;
    END IF;
    
    GRANT ALL PRIVILEGES ON DATABASE remondis_db TO remondis_db;
END $$;
SQL

# Setup nginx
sudo tee /etc/nginx/sites-available/bennespro << 'NGINX'
server {
    listen 80;
    server_name purpleguy.world www.purpleguy.world;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/bennespro /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# Start app with PM2
pm2 start dist/index.js --name bennespro
pm2 save
pm2 startup

echo "✅ DEPLOYED"
echo "Visit: http://purpleguy.world"
REMOTE

echo "✅ DONE"
echo "Visit: http://$DOMAIN"