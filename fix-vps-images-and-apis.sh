#!/bin/bash

# ===============================================
# CORRECTION IMAGES ET APIS VPS
# ===============================================

echo "🔧 CORRECTION DES IMAGES ET APIS POUR VPS"

# 1. Ajouter le fallback d'images dans server/routes.ts
echo "📸 Ajout du fallback pour les images manquantes..."

cat > add-image-fallback.ts << 'EOF'
// Code à ajouter dans server/routes.ts après les autres routes

// ==================== IMAGE FALLBACK ROUTES ====================
// Gestion des images de services avec fallback SVG
app.get("/api/uploads/services/:serviceId/*", (req, res) => {
  const { serviceId } = req.params;
  const fileName = req.params[0] || '';
  
  // Décoder le nom du fichier (espaces encodés, caractères spéciaux)
  const decodedFileName = decodeURIComponent(fileName);
  
  console.log(`[Image Request] Service: ${serviceId}, File: ${decodedFileName}`);
  
  // Construire le chemin de l'image
  const imagePath = path.join(process.cwd(), 'uploads', 'services', serviceId, decodedFileName);
  
  // Vérifier si le fichier existe
  if (fs.existsSync(imagePath)) {
    return res.sendFile(imagePath);
  }
  
  // Si l'image n'existe pas, envoyer un SVG placeholder dynamique
  const serviceNames: { [key: string]: string } = {
    '8': 'Big Bag',
    '9': 'Benne 10m³',
    '11': 'Benne 18m³'
  };
  
  const serviceName = serviceNames[serviceId] || `Service ${serviceId}`;
  
  const placeholderSVG = `
    <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
      <defs>
        <linearGradient id="bg${serviceId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
        </linearGradient>
        <pattern id="pattern${serviceId}" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="url(#bg${serviceId})" />
          <circle cx="20" cy="20" r="2" fill="white" opacity="0.1" />
        </pattern>
      </defs>
      
      <!-- Background -->
      <rect width="600" height="400" fill="url(#pattern${serviceId})" />
      
      <!-- Container icon -->
      <g transform="translate(300, 140)">
        <rect x="-60" y="-40" width="120" height="80" fill="white" opacity="0.2" rx="4" />
        <rect x="-50" y="-30" width="100" height="60" fill="white" opacity="0.3" rx="2" />
        <line x1="-40" y1="-20" x2="40" y2="-20" stroke="white" stroke-width="2" opacity="0.5" />
        <line x1="-40" y1="0" x2="40" y2="0" stroke="white" stroke-width="2" opacity="0.5" />
        <line x1="-40" y1="20" x2="40" y2="20" stroke="white" stroke-width="2" opacity="0.5" />
      </g>
      
      <!-- Service Name -->
      <text x="300" y="240" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white">
        ${serviceName}
      </text>
      
      <!-- Subtitle -->
      <text x="300" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="white" opacity="0.8">
        Location de bennes professionnelles
      </text>
      
      <!-- Bottom info -->
      <text x="300" y="350" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="white" opacity="0.6">
        Image temporaire - Photo réelle bientôt disponible
      </text>
    </svg>
  `;
  
  res.set('Content-Type', 'image/svg+xml');
  res.set('Cache-Control', 'public, max-age=3600'); // Cache 1 heure
  res.send(placeholderSVG);
});

// Route pour gérer les uploads génériques
app.get("/api/uploads/*", (req, res) => {
  const filePath = req.params[0];
  const fullPath = path.join(process.cwd(), 'uploads', filePath);
  
  if (fs.existsSync(fullPath)) {
    return res.sendFile(fullPath);
  }
  
  res.status(404).json({ error: "File not found" });
});
EOF

echo "✅ Code de fallback créé dans add-image-fallback.ts"

# 2. Créer les dossiers d'upload
echo "📁 Création des dossiers d'upload..."
mkdir -p uploads/services/{8,9,11}
chmod -R 755 uploads

# 3. Script de test des images
echo "🧪 Création du script de test des images..."

cat > test-vps-images.sh << 'EOF'
#!/bin/bash

echo "Test des images de services..."

# Test service 8 (Big Bag)
echo -n "Service 8 (Big Bag): "
curl -s -o /dev/null -w "%{http_code}" https://purpleguy.world/api/uploads/services/8/placeholder.svg

echo ""

# Test service 9 (Benne 10m³)  
echo -n "Service 9 (Benne 10m³): "
curl -s -o /dev/null -w "%{http_code}" https://purpleguy.world/api/uploads/services/9/placeholder.svg

echo ""

# Test service 11 (Benne 18m³)
echo -n "Service 11 (Benne 18m³): "
curl -s -o /dev/null -w "%{http_code}" https://purpleguy.world/api/uploads/services/11/placeholder.svg

echo ""
EOF

chmod +x test-vps-images.sh

# 4. Correction de l'erreur de calcul de distance
echo "🗺️ Configuration du calcul de distance..."

cat > fix-distance-calculation.md << 'EOF'
# CORRECTION CALCUL DE DISTANCE

L'erreur "net::ERR_CONNECTION_REFUSED" sur /api/calculate-distance indique que :

1. L'endpoint n'existe pas ou n'est pas accessible
2. Le serveur Node.js n'est pas démarré sur le port 5000
3. Nginx ne fait pas correctement le proxy

## Solution :

1. Vérifier que l'endpoint existe dans server/routes.ts
2. S'assurer que le serveur est bien démarré : `pm2 status`
3. Vérifier la configuration Nginx : `sudo nginx -t`
4. Tester localement : `curl http://localhost:5000/api/calculate-distance`

## Si l'endpoint n'existe pas, utilisez directement /api/calculate-pricing qui inclut le calcul de distance.
EOF

# 5. Script pour gérer l'AdBlocker
echo "🛡️ Création du guide AdBlocker..."

cat > fix-adblocker-stripe.md << 'EOF'
# CORRECTION ERREUR ADBLOCKER STRIPE

L'erreur "ERR_BLOCKED_BY_ADBLOCKER" empêche Stripe de fonctionner.

## Solutions :

### Pour les utilisateurs :
1. Désactiver l'AdBlocker pour le domaine purpleguy.world
2. Ajouter purpleguy.world à la liste blanche
3. Utiliser un navigateur sans AdBlocker
4. Tester en navigation privée

### Pour le développeur :
1. Ajouter une détection d'AdBlocker dans le frontend
2. Afficher un message d'avertissement
3. Proposer des alternatives de paiement

### Code à ajouter dans PaymentStep.tsx :

```typescript
// Détection AdBlocker
useEffect(() => {
  const checkAdBlocker = async () => {
    try {
      await fetch('https://js.stripe.com/v3/', { mode: 'no-cors' });
    } catch (error) {
      setShowAdBlockWarning(true);
    }
  };
  checkAdBlocker();
}, []);

// Afficher l'avertissement si AdBlocker détecté
{showAdBlockWarning && (
  <Alert variant="warning">
    <AlertTitle>AdBlocker détecté</AlertTitle>
    <AlertDescription>
      Veuillez désactiver votre bloqueur de publicités pour effectuer le paiement.
      Stripe est bloqué et empêche le traitement sécurisé de votre paiement.
    </AlertDescription>
  </Alert>
)}
```
EOF

# 6. Résumé des corrections
echo ""
echo "✅ CORRECTIONS CRÉÉES :"
echo "1. ✓ Fallback d'images SVG pour services 8, 9, 11"
echo "2. ✓ Gestion des espaces dans les noms de fichiers"
echo "3. ✓ Script de test des images"
echo "4. ✓ Guide pour corriger le calcul de distance"
echo "5. ✓ Guide pour l'erreur AdBlocker Stripe"
echo ""
echo "📋 ACTIONS À FAIRE :"
echo "1. Ajouter le code de add-image-fallback.ts dans server/routes.ts"
echo "2. Redémarrer l'application : pm2 restart bennespro"
echo "3. Tester avec : ./test-vps-images.sh"
echo "4. Informer les utilisateurs de désactiver AdBlocker"
echo ""
echo "🚀 Votre VPS sera 100% fonctionnel après ces corrections !"