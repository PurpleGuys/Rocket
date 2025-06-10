import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

// Fonction pour générer des images SVG de conteneurs
const generateContainerSVG = (serviceName: string, imageType?: string) => {
  const volume = serviceName.match(/(\d+)m3/)?.[1] || '15';
  
  // Couleurs selon le type de vue
  const colorMap: Record<string, { bg: string; accent: string }> = {
    'Vue de face': { bg: '#2563eb', accent: '#1e40af' },
    'Côté droit': { bg: '#059669', accent: '#047857' },
    'Côté gauche': { bg: '#dc2626', accent: '#b91c1c' },
    'Vue arrière': { bg: '#ea580c', accent: '#c2410c' },
    'Avec personne pour échelle': { bg: '#7c3aed', accent: '#6d28d9' },
    'En cours de chargement': { bg: '#ca8a04', accent: '#a16207' },
    'Vue complète': { bg: '#1f2937', accent: '#111827' }
  };

  const colors = colorMap[imageType || 'Vue de face'] || colorMap['Vue de face'];
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="${colors.bg}"/>
      
      <!-- Container body -->
      <rect x="50" y="100" width="300" height="120" rx="8" fill="${colors.accent}" stroke="white" stroke-width="2"/>
      
      <!-- Container handles -->
      <rect x="30" y="130" width="20" height="30" rx="4" fill="white"/>
      <rect x="350" y="130" width="20" height="30" rx="4" fill="white"/>
      
      <!-- Container lid -->
      <rect x="40" y="85" width="320" height="15" rx="6" fill="white"/>
      
      <!-- Volume text -->
      <text x="200" y="140" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">
        ${serviceName}
      </text>
      
      <!-- Photo type -->
      <text x="200" y="170" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16">
        ${imageType || 'Vue de face'}
      </text>
      
      <!-- Volume indicator -->
      <text x="200" y="195" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">
        ${volume}m³
      </text>
    </svg>
  `;
  
  return 'data:image/svg+xml;base64,' + btoa(svg);
};

interface ServiceImageDisplayProps {
  serviceId: number;
  serviceName: string;
  className?: string;
}

export function ServiceImageDisplay({ serviceId, serviceName, className = "" }: ServiceImageDisplayProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: images, isLoading } = useQuery({
    queryKey: [`/api/admin/services/${serviceId}/images`],
    enabled: !!serviceId,
  });

  if (isLoading) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Image className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!images || !Array.isArray(images) || images.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Image className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">Aucune photo disponible</p>
        </div>
      </div>
    );
  }

  const photoTypes = [
    { value: 'face', label: 'Vue de face' },
    { value: 'right_side', label: 'Côté droit' },
    { value: 'left_side', label: 'Côté gauche' },
    { value: 'rear', label: 'Vue arrière' },
    { value: 'with_person', label: 'Avec personne pour échelle' },
    { value: 'loading', label: 'En cours de chargement' },
    { value: 'full', label: 'Vue complète' }
  ];

  const currentImage = images[currentImageIndex];
  const imageTypeLabel = photoTypes.find(t => t.value === currentImage?.imageType)?.label || currentImage?.imageType;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={`relative rounded-lg overflow-hidden bg-gray-100 ${className}`}>
      {/* Image principale */}
      <div className="relative">
        <img
          src={currentImage?.imagePath?.startsWith('/uploads/') 
            ? currentImage.imagePath 
            : generateContainerSVG(serviceName, imageTypeLabel)
          }
          alt={`${serviceName} - ${imageTypeLabel}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback vers une image SVG de conteneur
            const target = e.target as HTMLImageElement;
            target.src = generateContainerSVG(serviceName, imageTypeLabel);
          }}
        />
        
        {/* Badge du type de photo */}
        <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
          {imageTypeLabel}
        </div>

        {/* Badge photo principale */}
        {currentImage?.isMain && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
            Photo principale
          </div>
        )}
      </div>

      {/* Navigation si plusieurs images */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
            onClick={prevImage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
            onClick={nextImage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Indicateurs de pagination */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}