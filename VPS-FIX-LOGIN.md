# 🔧 CORRECTION DU PROBLÈME DE CONNEXION SUR VPS

## ❌ Problème identifié
L'erreur "Email ou mot de passe incorrect" sur https://purpleguy.world indique que l'utilisateur admin n'existe pas dans la base de données du VPS ou que le mot de passe n'est pas synchronisé.

## ✅ Solution rapide

### Option 1: Script automatique (RECOMMANDÉ)
```bash
# Sur le VPS, exécutez:
cd /path/to/your/app
./vps-create-admin.sh
```

### Option 2: Commande directe
```bash
# Sur le VPS, dans le dossier de l'application:
node reset-admin-password.mjs
```

### Option 3: Via Docker (si utilisé)
```bash
# Si vous utilisez Docker:
docker exec -it bennespro-app node reset-admin-password.mjs
```

## 📝 Vérification

Après avoir exécuté le script, testez la connexion:

1. Allez sur https://purpleguy.world/test-login
2. Utilisez ces identifiants:
   - Email: `ethan.petrovic@remondis.fr`
   - Mot de passe: `LoulouEP150804@`
3. Cliquez sur "Test avec fetch direct"

## 🔍 Debug supplémentaire

Si le problème persiste, vérifiez sur le VPS:

```bash
# Vérifier si l'utilisateur existe
node check-admin-user.mjs

# Vérifier les logs du serveur
pm2 logs
# ou
journalctl -u bennespro -n 100

# Vérifier la connexion à la base de données
node -e "require('dotenv').config(); console.log('DB URL:', process.env.DATABASE_URL?.substring(0,30) + '...')"
```

## 🚨 Points importants

1. **Base de données**: Assurez-vous que le VPS utilise la bonne base de données (production, pas développement)
2. **Variables d'environnement**: Vérifiez que `.env` sur le VPS contient `DATABASE_URL` correct
3. **SSL**: Si PostgreSQL est sur un serveur distant, SSL peut être requis

## 💡 Alternative: Créer un nouvel admin

Si vous préférez un autre utilisateur admin:

```javascript
// Créez un fichier create-custom-admin.mjs sur le VPS
import dotenv from 'dotenv';
dotenv.config();

// ... (code pour créer votre utilisateur personnalisé)
```

Puis exécutez: `node create-custom-admin.mjs`