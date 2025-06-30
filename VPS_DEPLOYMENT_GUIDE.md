# Guide de Déploiement VPS - IP: 162.19.67.3

## Configuration Spécifique VPS

Votre application a été configurée pour fonctionner sur votre VPS avec l'adresse IP **162.19.67.3**.

### Étapes de Déploiement

#### 1. Préparation du VPS

```bash
# Connexion au VPS
ssh root@162.19.67.3

# Mise à jour du système
apt update && apt upgrade -y

# Installation des dépendances
apt install -y curl wget git nginx docker.io docker-compose nodejs npm postgresql-client
```

#### 2. Configuration de l'Application

```bash
# Cloner ou copier les fichiers du projet
# Copier tous les fichiers vers /opt/remondis-app/

# Se déplacer dans le répertoire
cd /opt/remondis-app/

# Copier la configuration VPS
cp vps-config.env .env

# Éditer le fichier .env avec vos vraies clés API
nano .env
```

#### 3. Configuration de la Base de Données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données et l'utilisateur
CREATE DATABASE remondis_db;
CREATE USER remondis_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE remondis_db TO remondis_user;
\q

# Configurer PostgreSQL pour accepter les connexions
nano /etc/postgresql/*/main/postgresql.conf
# Changer: listen_addresses = '162.19.67.3'

nano /etc/postgresql/*/main/pg_hba.conf
# Ajouter: host all all 162.19.67.3/32 md5

# Redémarrer PostgreSQL
systemctl restart postgresql
```

#### 4. Lancement avec Docker

```bash
# Construire et lancer l'application
docker-compose up -d

# Vérifier les conteneurs
docker-compose ps

# Voir les logs
docker-compose logs -f
```

#### 5. Configuration Nginx

```bash
# Le fichier nginx.conf est déjà configuré pour votre IP
# Vérifier la configuration
nginx -t

# Redémarrer nginx
systemctl restart nginx
```

#### 6. Vérification du Déploiement

```bash
# Utiliser le script de vérification
./health-check.sh production

# Test manuel
curl http://162.19.67.3:5000/api/health
curl http://162.19.67.3/api/health
```

### URLs d'Accès

- **Application principale**: http://162.19.67.3
- **API**: http://162.19.67.3/api/
- **Admin**: http://162.19.67.3/admin

### Fichiers Modifiés pour Votre VPS

Les fichiers suivants ont été mis à jour avec votre adresse IP:

1. **.env.example** - Configuration de base de données et URLs
2. **nginx.conf** - Server name et proxy
3. **health-check.sh** - Host par défaut
4. **deploy.sh** - URL de vérification
5. **ecosystem.config.js** - Configuration PM2
6. **vps-config.env** - Configuration complète VPS

### Variables d'Environnement Importantes

```bash
# Dans votre fichier .env
DATABASE_URL="postgresql://remondis_user:your_password@162.19.67.3:5432/remondis_db"
APP_BASE_URL="http://162.19.67.3:5000"
ALLOWED_ORIGINS="http://162.19.67.3:5000,http://162.19.67.3"
VPS_IP=162.19.67.3
HOST=0.0.0.0
PORT=5000
```

### Sécurité et Configuration

#### Génération des Clés Secrètes

```bash
# Générer des clés sécurisées
node scripts/generate-secrets.js
```

#### Firewall (Recommandé)

```bash
# Configurer ufw
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 5000
ufw enable
```

### Surveillance et Maintenance

#### Logs de l'Application

```bash
# Docker logs
docker-compose logs -f app

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

#### Sauvegarde de la Base de Données

```bash
# Créer une sauvegarde
pg_dump -h 162.19.67.3 -U remondis_user remondis_db > backup_$(date +%Y%m%d).sql
```

### Dépannage

#### Problèmes Courants

1. **Port 5000 non accessible**
   ```bash
   # Vérifier que l'application écoute sur 0.0.0.0
   netstat -tlnp | grep 5000
   ```

2. **Base de données non accessible**
   ```bash
   # Tester la connexion
   psql -h 162.19.67.3 -U remondis_user -d remondis_db
   ```

3. **Nginx ne démarre pas**
   ```bash
   # Vérifier la configuration
   nginx -t
   systemctl status nginx
   ```

### Support SSL (Optionnel)

Pour activer HTTPS avec Let's Encrypt:

```bash
# Installer certbot
apt install certbot python3-certbot-nginx

# Obtenir un certificat (si vous avez un domaine)
certbot --nginx -d votre-domaine.com

# Ou configurer manuellement dans nginx.conf
```

### Commandes Utiles

```bash
# Redémarrer l'application
docker-compose restart

# Voir l'utilisation des ressources
docker stats

# Nettoyer les anciens conteneurs
docker system prune -a

# Sauvegarder les données
tar -czf backup.tar.gz uploads/ logs/ .env
```

L'application est maintenant configurée spécifiquement pour votre VPS avec l'IP 162.19.67.3 et prête pour le déploiement en production.