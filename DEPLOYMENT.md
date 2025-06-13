# Guide de Déploiement VPS - Application Remondis

## 🚀 Préparation du Serveur VPS

### Prérequis système
```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation des dépendances essentielles
sudo apt install -y curl wget git nginx postgresql postgresql-contrib nodejs npm certbot python3-certbot-nginx

# Installation de Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installation de PM2 globalement
sudo npm install -g pm2

# Vérification des versions
node --version  # Doit être >= 18.0.0
npm --version   # Doit être >= 8.0.0
psql --version  # Doit être >= 15.0
```

### Configuration PostgreSQL
```bash
# Démarrer PostgreSQL
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Créer un utilisateur et une base de données
sudo -u postgres psql
```

```sql
-- Dans PostgreSQL
CREATE USER remondis_user WITH PASSWORD 'mot_de_passe_securise';
CREATE DATABASE remondis_db OWNER remondis_user;
GRANT ALL PRIVILEGES ON DATABASE remondis_db TO remondis_user;
\q
```

## 📦 Déploiement de l'Application

### 1. Cloner et configurer le projet
```bash
# Se placer dans le répertoire web
cd /var/www

# Cloner le projet
sudo git clone https://github.com/votre-repo/remondis-app.git
sudo chown -R $USER:$USER remondis-app
cd remondis-app

# Générer les secrets sécurisés
node scripts/generate-secrets.js

# Configurer l'environnement
cp .env.example .env
nano .env  # Configurer les variables
```

### 2. Configuration du fichier .env
```bash
# Variables critiques à configurer
DATABASE_URL="postgresql://remondis_user:mot_de_passe_securise@localhost:5432/remondis_db"
SENDGRID_API_KEY="votre_cle_sendgrid"
GOOGLE_MAPS_API_KEY="votre_cle_google_maps"
STRIPE_SECRET_KEY="votre_cle_stripe"
APP_BASE_URL="https://votre-domaine.com"
```

### 3. Installation et build
```bash
# Installation des dépendances
npm ci --only=production

# Build de l'application
npm run build

# Configuration de la base de données
npm run db:push

# Test du build
node dist/index.js
```

### 4. Déploiement automatique
```bash
# Utiliser le script de déploiement
chmod +x deploy.sh
./deploy.sh production
```

## 🌐 Configuration Nginx

### 1. Configuration de base
```bash
# Créer la configuration Nginx
sudo nano /etc/nginx/sites-available/remondis
```

```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;
    
    # Redirection temporaire vers HTTPS (après configuration SSL)
    # return 301 https://$server_name$request_uri;
    
    # Configuration temporaire pour les tests
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
    
    # Gestion des fichiers statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:5000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Activer la configuration
```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/remondis /etc/nginx/sites-enabled/

# Désactiver le site par défaut
sudo rm /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

## 🔒 Configuration SSL/HTTPS

### 1. Obtenir un certificat SSL
```bash
# Installer Certbot si pas encore fait
sudo apt install certbot python3-certbot-nginx

# Obtenir un certificat SSL
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Vérifier le renouvellement automatique
sudo certbot renew --dry-run
```

### 2. Configuration HTTPS dans Nginx
```nginx
# Configuration HTTPS (générée automatiquement par Certbot)
server {
    listen 443 ssl http2;
    server_name votre-domaine.com www.votre-domaine.com;
    
    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;
    
    # En-têtes de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
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

# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;
    return 301 https://$server_name$request_uri;
}
```

## 🔥 Configuration du Firewall

```bash
# Configurer UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 5000  # Port de l'application (optionnel si Nginx proxy)

# Vérifier le statut
sudo ufw status
```

## 📊 Monitoring et Logs

### 1. Configuration PM2
```bash
# Voir les logs en temps réel
pm2 logs remondis-app

# Monitoring
pm2 monit

# Redémarrer l'application
pm2 restart remondis-app

# Configurer le démarrage automatique
pm2 startup
pm2 save
```

### 2. Logs système
```bash
# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs application
tail -f logs/combined.log
tail -f logs/err.log

# Logs PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

## 🔄 Maintenance et Sauvegardes

### 1. Sauvegarde automatique de la base de données
```bash
# Créer un script de sauvegarde
sudo nano /usr/local/bin/backup-remondis-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/remondis"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="remondis_db"
DB_USER="remondis_user"

mkdir -p $BACKUP_DIR
pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/remondis_db_$DATE.sql

# Garder seulement les 7 dernières sauvegardes
find $BACKUP_DIR -name "remondis_db_*.sql" -mtime +7 -delete

echo "Backup completed: remondis_db_$DATE.sql"
```

```bash
# Rendre le script exécutable
sudo chmod +x /usr/local/bin/backup-remondis-db.sh

# Ajouter une tâche cron pour sauvegarde quotidienne
sudo crontab -e
# Ajouter: 0 2 * * * /usr/local/bin/backup-remondis-db.sh
```

### 2. Mise à jour de l'application
```bash
# Script de mise à jour
cd /var/www/remondis-app

# Arrêter l'application
pm2 stop remondis-app

# Sauvegarder les données importantes
cp .env .env.backup
pg_dump -U remondis_user remondis_db > backup_before_update.sql

# Mettre à jour le code
git pull origin main

# Installer les nouvelles dépendances
npm ci --only=production

# Rebuild
npm run build

# Appliquer les migrations DB
npm run db:push

# Redémarrer
pm2 restart remondis-app

# Vérifier le statut
pm2 status
curl -f https://votre-domaine.com/api/health
```

## 🔍 Vérifications Post-Déploiement

### 1. Tests de fonctionnalité
```bash
# Test de l'API
curl -f https://votre-domaine.com/api/health
curl -f https://votre-domaine.com/api/services

# Test de la base de données
psql -U remondis_user -d remondis_db -c "SELECT COUNT(*) FROM users;"

# Test des emails (si configuré)
curl -X POST https://votre-domaine.com/api/test-email
```

### 2. Monitoring des performances
```bash
# Surveiller les ressources
htop
iostat 1
free -h

# Surveiller les connexions
netstat -tulpn | grep :5000
netstat -tulpn | grep :80
netstat -tulpn | grep :443
```

## 🚨 Dépannage

### Problèmes courants et solutions

1. **Application ne démarre pas**
   ```bash
   pm2 logs remondis-app
   node dist/index.js  # Test direct
   ```

2. **Erreur de base de données**
   ```bash
   sudo systemctl status postgresql
   psql -U remondis_user -d remondis_db
   ```

3. **Problème SSL**
   ```bash
   sudo certbot certificates
   sudo nginx -t
   sudo systemctl status nginx
   ```

4. **Permissions de fichiers**
   ```bash
   sudo chown -R $USER:$USER /var/www/remondis-app
   chmod 600 .env
   chmod 755 logs uploads
   ```

## 📋 Checklist de Déploiement

- [ ] Serveur VPS configuré avec les bonnes versions
- [ ] PostgreSQL installé et configuré
- [ ] Base de données créée avec utilisateur dédié
- [ ] Application clonée et dépendances installées
- [ ] Fichier .env configuré avec toutes les clés API
- [ ] Build de l'application réussi
- [ ] PM2 configuré et application démarrée
- [ ] Nginx configuré et fonctionnel
- [ ] SSL/HTTPS configuré avec Certbot
- [ ] Firewall configuré
- [ ] Sauvegardes automatiques configurées
- [ ] Monitoring en place
- [ ] Tests de fonctionnalité passés
- [ ] Documentation d'exploitation remise

## 📞 Support

En cas de problème:
1. Vérifiez les logs d'application et système
2. Consultez la documentation technique
3. Vérifiez la configuration réseau et firewall
4. Contactez l'équipe de développement avec les logs d'erreur