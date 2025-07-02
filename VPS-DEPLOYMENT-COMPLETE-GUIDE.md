# 🚀 Guide Complet Déploiement VPS BennesPro

## ⚡ SOLUTION RAPIDE ÉCRAN BLANC VPS

### 1. Build de l'application (AUTO-DÉTECTION AMÉLIORÉE)
```bash
# Sur votre VPS, dans le dossier BennesPro
# Le serveur créera automatiquement les fichiers nécessaires
# Plus besoin de build manuel - le serveur gère tout!

# OPTIONNEL: Build frontend si vous voulez la version complète
npx vite build

# Vérifier (le serveur fonctionne même sans build)
ls -la dist/ || echo "Le serveur créera dist/ automatiquement"
```

### 2. Démarrer en mode Production (SOLUTION ROBUSTE)
```bash
# SOLUTION RECOMMANDÉE: TSX avec auto-création des fichiers
NODE_ENV=production npx tsx server/index.ts

# Alternative standard (fonctionne aussi)
NODE_ENV=production npm start

# Le serveur crée automatiquement:
# - Dossier dist/ si manquant
# - index.html basique si manquant  
# - Configuration statique complète
```

### 3. Test de l'Application
```bash
# Tester que l'application répond
curl http://localhost:5000/

# Tester une route API
curl http://localhost:5000/api/health
```

## 🔧 Configuration VPS Complète

### Variables d'Environnement (.env)
```env
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Base de données PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/bennespro

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_VERIFIED_SENDER_EMAIL=noreply@votredomaine.com

# JWT
JWT_SECRET=your_super_secret_jwt_key_32_characters_minimum

# Google Maps (optionnel)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Serveur Web (Nginx)
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    # Proxy vers l'application Node.js
    location / {
        proxy_pass http://localhost:5000;
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
```

### Service Systemd (bennespro.service)
```ini
[Unit]
Description=BennesPro Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/bennespro
ExecStart=/usr/bin/node server/index.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

## 🐛 Debugging VPS

### 1. Vérifier les Logs
```bash
# Logs du service
sudo journalctl -u bennespro -f

# Logs de l'application
pm2 logs bennespro  # si vous utilisez PM2
```

### 2. Tester les Routes API
```bash
# Test du script de routes VPS
chmod +x test-all-vps-routes.sh
./test-all-vps-routes.sh http://localhost:5000
```

### 3. Vérifier les Fichiers Build
```bash
# Vérifier que le build existe
ls -la dist/
ls -la dist/index.html

# Vérifier les permissions
sudo chown -R www-data:www-data dist/
```

## 🚨 Solutions Problèmes Courants

### Écran Blanc = Pas de Build
```bash
# Solution immédiate
npm run build
NODE_ENV=production npm start
```

### Routes 404 = Nginx mal configuré
```bash
# Vérifier config Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Erreur Base de Données
```bash
# Tester la connexion PostgreSQL
psql $DATABASE_URL -c "SELECT version();"
```

### Permission Denied
```bash
# Corriger les permissions
sudo chown -R $USER:$USER .
chmod +x vps-build.sh
```

## ✅ Checklist Déploiement

- [ ] PostgreSQL installé et configuré
- [ ] Variables d'environnement créées (.env)
- [ ] `npm install` exécuté
- [ ] `npm run build` exécuté avec succès
- [ ] Dossier `dist/` créé avec `index.html`
- [ ] Serveur démarre avec `NODE_ENV=production`
- [ ] Nginx configuré (si utilisé)
- [ ] Firewall ouvert sur port 5000
- [ ] Tests API fonctionnels

## 🎯 Commandes de Déploiement Rapide

```bash
# 1. Préparation
git pull origin main
npm install

# 2. Build Production
NODE_ENV=production npm run build

# 3. Démarrer
NODE_ENV=production npm start

# 4. Vérifier
curl http://localhost:5000/
curl http://localhost:5000/api/health
```

L'application devrait maintenant fonctionner correctement sur votre VPS !