# Quick Start - Résolution du problème DATABASE_URL

## Problème Actuel
```
Error: DATABASE_URL must be set. Did you forget to provision a database?
```

## Solution Rapide

### Option 1: Configuration Automatique (Recommandée)
```bash
# Sur votre VPS, dans le dossier REM-Bennes
chmod +x vps-setup.sh
./vps-setup.sh
```

### Option 2: Configuration Manuelle

#### 1. Créer le fichier .env
```bash
# Dans le dossier ~/REM-Bennes/
nano .env
```

#### 2. Ajouter cette configuration minimale:
```bash
# Copiez-collez ceci dans le fichier .env
DATABASE_URL="postgresql://remondis_user:RemondisSecure2024!@162.19.67.3:5432/remondis_db"
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
SESSION_SECRET="VotreCleSecrete32CaracteresMinimum123"
JWT_SECRET="VotreCleJWT32CaracteresMinimumSecure456"
```

#### 3. Configurer PostgreSQL
```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE remondis_db;
CREATE USER remondis_user WITH ENCRYPTED PASSWORD 'RemondisSecure2024!';
GRANT ALL PRIVILEGES ON DATABASE remondis_db TO remondis_user;
\q
```

#### 4. Lancer l'application
```bash
npm run start
```

## Test de Connexion

Une fois configuré, testez:
```bash
# Tester la base de données
PGPASSWORD="RemondisSecure2024!" psql -h 162.19.67.3 -U remondis_user -d remondis_db -c "SELECT 1;"

# Lancer l'application
npm run start

# Dans un autre terminal, tester l'API
curl http://162.19.67.3:5000/api/health
```

## URLs d'Accès Final
- Application: http://162.19.67.3:5000
- API: http://162.19.67.3:5000/api