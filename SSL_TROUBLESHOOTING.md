# Résolution du problème SSL - purpleguy.world

## Problème identifié

L'erreur SSL indique que Let's Encrypt ne peut pas valider le domaine `www.purpleguy.world` car la validation ACME challenge échoue.

## Diagnostic

✅ **DNS configuré correctement** - `purpleguy.world` pointe vers `162.19.67.3`
❌ **Validation ACME échoue** - Le fichier challenge n'est pas accessible via HTTPS

## Solution corrigée

Utilisez le script corrigé qui gère le conflit de port:

```bash
./https-deployment-fixed.sh
```

## Améliorations du script corrigé

1. **Gestion du conflit de port**: N'essaie pas de lancer un nginx temporaire sur le port 80 déjà utilisé
2. **Configuration nginx temporaire**: Modifie nginx.conf pour supporter ACME challenge
3. **Validation progressive**: Teste chaque étape avant de continuer
4. **Rollback automatique**: Restaure la configuration en cas d'échec

## Si le problème persiste

### Option 1: Validation manuelle DNS

```bash
# Utiliser validation DNS au lieu de HTTP
docker run --rm \
    -v ./certbot/conf:/etc/letsencrypt \
    certbot/certbot \
    certonly --manual \
    --preferred-challenges dns \
    --email admin@purpleguy.world \
    --agree-tos \
    --no-eff-email \
    -d purpleguy.world \
    -d www.purpleguy.world
```

### Option 2: Certificat uniquement pour le domaine principal

```bash
# Obtenir certificat seulement pour purpleguy.world (sans www)
docker run --rm \
    -v ./certbot/conf:/etc/letsencrypt \
    -v ./certbot/www:/var/www/certbot \
    certbot/certbot \
    certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@purpleguy.world \
    --agree-tos \
    --no-eff-email \
    -d purpleguy.world
```

### Option 3: Test en mode staging

```bash
# Modifier le script pour utiliser staging (mode test)
# Dans https-deployment-fixed.sh, changez:
STAGING=1  # Mode test pour éviter les limites de rate
```

## Vérifications post-installation

```bash
# Vérifier certificat obtenu
ls -la ./certbot/conf/live/

# Tester manuellement HTTPS
curl -v https://purpleguy.world

# Vérifier logs nginx
docker-compose logs nginx

# Vérifier logs certbot
docker run --rm -v ./certbot/conf:/etc/letsencrypt certbot/certbot logs
```

## Configuration nginx pour www sans certificat

Si le certificat n'est obtenu que pour `purpleguy.world`, modifiez nginx.conf:

```nginx
# Redirection www vers domaine principal
server {
    listen 80;
    listen 443 ssl;
    server_name www.purpleguy.world;
    
    # Utiliser le certificat du domaine principal
    ssl_certificate /etc/letsencrypt/live/purpleguy.world/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/purpleguy.world/privkey.pem;
    
    return 301 https://purpleguy.world$request_uri;
}
```

## Commandes de dépannage

```bash
# Test connectivité ACME
curl -v http://purpleguy.world/.well-known/acme-challenge/test

# Vérifier configuration DNS
dig purpleguy.world
dig www.purpleguy.world

# Test port 80 et 443
nmap -p 80,443 purpleguy.world

# Logs détaillés certbot
docker run --rm -v ./certbot/conf:/etc/letsencrypt certbot/certbot certificates -v
```

Le script `https-deployment-fixed.sh` résout le problème principal en évitant le conflit de port et en utilisant votre infrastructure existante pour la validation ACME.