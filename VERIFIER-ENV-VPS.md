# VÉRIFICATION ET CORRECTION DU FICHIER .ENV SUR VPS

## 1. LOCALISER LE BON FICHIER .ENV

Le fichier .env doit être à la racine du projet :
```bash
cd /home/ubuntu/JobDone
ls -la .env
```

## 2. VÉRIFIER LE CONTENU DU .ENV

```bash
grep "STRIPE" .env
```

Vous devez voir :
- `STRIPE_SECRET_KEY="sk_live_..."`  (PAS sk_test)
- `VITE_STRIPE_PUBLIC_KEY="pk_live_..."` (PAS pk_test)

## 3. SI LES CLÉS SONT INCORRECTES

Éditez le fichier .env :
```bash
nano .env
```

Remplacez les lignes Stripe par :
```
STRIPE_SECRET_KEY="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"
VITE_STRIPE_PUBLIC_KEY="pk_live_51RTkOEH7j6Qmye8ANaVnmmha9hqIUhENTbJo94UZ9D7Ia3hRu7jFbVcBtfO4lJvLiluHxqdproixaCIglmZORP0h00IWlpRCiS"
```

## 4. NETTOYER ET RECONSTRUIRE

```bash
# Nettoyer le cache
rm -rf dist
rm -rf node_modules/.vite

# Rebuild avec les bonnes clés
npm run build

# Vérifier qu'il n'y a pas de pk_test dans le build
grep -r "pk_test" dist/ || echo "✅ Aucune clé de test trouvée"

# Vérifier que pk_live est présente
grep -r "pk_live" dist/ | head -1 && echo "✅ Clé de production trouvée"
```

## 5. REDÉMARRER L'APPLICATION

```bash
pm2 restart bennespro --update-env
pm2 logs bennespro --lines 20
```

## 6. TESTER

1. Ouvrez un navigateur en mode incognito
2. Allez sur votre site
3. Ouvrez la console (F12)
4. Vous devez voir : "✅ Stripe configuré avec clé publique: pk_live..."

## PROBLÈME PERSISTANT ?

Si vous voyez encore pk_test, c'est le cache du navigateur :
- Chrome : Ctrl+Shift+R
- Ou utilisez un autre navigateur
- Ou videz complètement le cache du navigateur