# Guide de Déploiement VPS BennesPro

## 🚨 Diagnostic du Problème Actuel

Votre VPS retourne des erreurs 404 HTML au lieu des réponses API JSON. Cela signifie:
- ✅ Nginx fonctionne (port 80/443)
- ❌ Node.js ne fonctionne pas ou n'est pas accessible
- ❌ Configuration Nginx manquante pour proxy vers Node.js

## 📋 Étapes de Résolution

### 1. Diagnostic Initial

```bash
# Sur votre machine locale, exécutez:
./debug-vps.sh 162.19.67.3

# Ou manuellement:
./test-api-endpoints-vps.sh 162.19.67.3 5000
```

### 2. Vérification sur le VPS

Connectez-vous à votre VPS et exécutez:

```bash
# Vérifier si Node.js tourne
sudo netstat -tlnp | grep :5000
sudo systemctl status bennespro

# Vérifier les logs
sudo journalctl -u bennespro -f

# Vérifier les processus Node.js
ps aux | grep node
```

### 3. Redémarrage du Service Node.js

```bash
# Redémarrer le service
sudo systemctl restart bennespro
sudo systemctl enable bennespro

# Ou si vous utilisez PM2:
pm2 restart bennespro
pm2 list
```

### 4. Configuration Nginx (CRITIQUE)

Éditez `/etc/nginx/sites-available/default`:

```nginx
server {
    listen 80;
    server_name 162.19.67.3 your-domain.com;

    # Proxy pour les API routes
    location /api/ {
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

    # Servir les fichiers statiques React
    location / {
        root /var/www/bennespro/dist/public;
        try_files $uri $uri/ /index.html;
    }
}
```

Puis redémarrez Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Variables d'Environnement

Vérifiez que votre `.env` sur le VPS contient:

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=your_postgres_connection
VITE_STRIPE_PUBLIC_KEY=your_stripe_key
```

### 6. Test de l'API Node.js Directement

```bash
# Test direct sur le port 5000
curl http://localhost:5000/api/health
curl http://localhost:5000/api/services

# Si ça marche, le problème est dans Nginx
# Si ça ne marche pas, le problème est dans Node.js
```

## 🔧 Scripts de Déploiement Corrigés

### Utilisation Correcte des Scripts

```bash
# Script de diagnostic
./debug-vps.sh 162.19.67.3

# Script de test API (syntaxe corrigée)
./test-api-endpoints-vps.sh 162.19.67.3 5000
# OU
./test-api-endpoints-vps.sh http://162.19.67.3:5000
```

## 🎯 Ordre de Dépannage

1. **Vérifiez Node.js** - Le service doit tourner sur :5000
2. **Vérifiez Nginx** - Doit proxy /api/ vers localhost:5000
3. **Vérifiez la base de données** - PostgreSQL doit être accessible
4. **Testez les endpoints** - Utilisez les scripts fournis

## 📞 Support

Les correctifs API suivants ont été appliqués dans le code:
- ✅ Syntaxe Drizzle ORM corrigée
- ✅ Gestion d'erreurs robuste dans toutes les méthodes
- ✅ Routes API dans le bon ordre
- ✅ Catch-all handler pour routes inexistantes

Le problème actuel est **infrastructure** (VPS), pas **code**.

## 🚀 Test Final

Une fois la configuration fixée, cette commande doit fonctionner:

```bash
curl http://162.19.67.3/api/health
# Réponse attendue: {"status":"ok","timestamp":"..."}
```