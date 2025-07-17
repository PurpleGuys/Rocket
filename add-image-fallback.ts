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
