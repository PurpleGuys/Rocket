# 🌍 DÉPLOIEMENT BENNESPRO AVEC NGINX + HTTPS

## 🚀 Déploiement Automatique

### Pour développement local :
```bash
./deploy-final.sh
# Appuyez sur Entrée quand demandé pour le domaine
# Application disponible sur http://localhost:8080
```

### Pour production VPS avec HTTPS :
```bash
./deploy-final.sh
# Entrez votre domaine : bennespro.com
# Entrez votre email : admin@bennespro.com
```

## 🔧 Architecture Production HTTPS

### Services déployés :
- **PostgreSQL** : Base de données (port interne 5432)
- **Redis** : Cache et sessions (port interne 6379) 
- **BennesPro App** : Application Node.js (port interne 8080)
- **NGINX** : Reverse proxy avec SSL (ports 80/443)
- **Certbot** : Génération automatique certificats Let's Encrypt

### Configuration NGINX :
- ✅ Redirection HTTP → HTTPS automatique
- ✅ Certificats SSL Let's Encrypt
- ✅ Headers de sécurité (HSTS, CSP, etc.)
- ✅ Rate limiting (10 req/min login, 100 req/min API)
- ✅ Compression Gzip
- ✅ Proxy vers application sur port 8080
- ✅ Support WebSocket pour Vite HMR

## 📜 Génération Certificat SSL

Après le premier déploiement :

```bash
# 1. Générer le certificat SSL
sudo docker-compose run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  --email votre-email@domain.com \
  --agree-tos --no-eff-email \
  -d votre-domaine.com

# 2. Démarrer NGINX avec HTTPS
sudo docker-compose up -d nginx

# 3. Vérifier le fonctionnement
curl -I https://votre-domaine.com
```

## 🔄 Renouvellement Automatique SSL

Le container certbot renouvelle automatiquement les certificats toutes les 12h :

```bash
# Vérifier le statut du renouvellement
sudo docker logs bennespro_certbot

# Forcer un renouvellement manuel
sudo docker-compose exec certbot certbot renew --dry-run
```

## 📊 Surveillance et Logs

```bash
# Logs de l'application
sudo docker logs bennespro_app -f

# Logs NGINX
sudo docker logs bennespro_nginx -f

# Logs PostgreSQL
sudo docker logs bennespro_postgres -f

# Logs Redis
sudo docker logs bennespro_redis -f

# Status de tous les services
sudo docker-compose ps
```

## 🔒 Sécurité Production

### Headers de sécurité activés :
- `Strict-Transport-Security` : Force HTTPS
- `X-Frame-Options: DENY` : Prévient clickjacking
- `X-Content-Type-Options: nosniff` : Prévient MIME sniffing
- `X-XSS-Protection` : Protection XSS
- `Referrer-Policy` : Contrôle des referrers

### Rate limiting :
- **Login/Auth** : 10 requêtes/minute max
- **API générale** : 100 requêtes/minute max
- **Burst** : 20 requêtes en rafale autorisées

### Configuration SSL :
- **Protocoles** : TLS 1.2 et 1.3 uniquement
- **Ciphers** : Seulement les algorithmes sécurisés
- **Session cache** : 10 minutes de cache SSL

## 🌍 Accès Production

Une fois déployé avec HTTPS :

- **Application** : https://votre-domaine.com
- **API Health** : https://votre-domaine.com/api/health
- **Admin Panel** : https://votre-domaine.com/admin

## 🔧 Maintenance

### Mise à jour de l'application :
```bash
# Reconstruire et redéployer
sudo docker-compose down
./deploy-final.sh
```

### Backup base de données :
```bash
# Dump PostgreSQL
sudo docker exec bennespro_postgres pg_dump -U postgres bennespro > backup.sql

# Restaurer
sudo docker exec -i bennespro_postgres psql -U postgres bennespro < backup.sql
```

### Monitoring ressources :
```bash
# Usage CPU/RAM containers
sudo docker stats

# Espace disque volumes
sudo docker system df
```

## ✅ Points Clés SSL/HTTPS

1. **Pas de SSL entre containers** : PostgreSQL et Redis communiquent en HTTP interne
2. **SSL uniquement côté frontend** : NGINX gère le SSL pour les utilisateurs
3. **Certificats automatiques** : Let's Encrypt renouvelle tout seul
4. **Redirection forcée** : Tout HTTP redirige vers HTTPS
5. **Headers sécurisés** : Protection contre les attaques communes

## 🎯 Résultat Final

Votre application BennesPro sera accessible en HTTPS sécurisé avec :
- Certificat SSL valide et automatiquement renouvelé
- Performance optimisée avec compression et cache
- Sécurité renforcée avec rate limiting et headers
- Monitoring et logs centralisés via Docker

**URL finale** : https://votre-domaine.com 🚀