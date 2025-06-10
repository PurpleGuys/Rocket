import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

// Fonction pour générer des images de conteneurs réalistes
const getContainerImage = (serviceName: string, imageType?: string) => {
  const volume = serviceName.match(/(\d+)m3/)?.[1] || '15';
  const containerType = volume < '10' ? 'small' : volume < '20' ? 'medium' : 'large';
  
  // Images réalistes de conteneurs selon le type de vue
  const imageMap: Record<string, string> = {
    'Vue de face': `https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&crop=center`,
    'Côté droit': `https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop&crop=center`,
    'Côté gauche': `https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop&crop=center`,
    'Vue arrière': `https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&crop=center`,
    'Avec personne pour échelle': `https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop&crop=center`,
    'En cours de chargement': `https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5?w=400&h=300&fit=crop&crop=center`,
    'Vue complète': `https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop&crop=center`
  };

  return imageMap[imageType || 'Vue de face'] || imageMap['Vue de face'];
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
            : getContainerImage(serviceName, imageTypeLabel)
          }
          alt={`${serviceName} - ${imageTypeLabel}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback vers une image de conteneur générique
            const target = e.target as HTMLImageElement;
            target.src = getContainerImage(serviceName, imageTypeLabel);
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