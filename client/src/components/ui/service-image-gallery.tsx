import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ServiceImage {
  id: number;
  imagePath: string;
  imageType: string;
  altText: string | null;
  isMain: boolean | null;
  sortOrder: number | null;
}

interface ServiceImageGalleryProps {
  images: ServiceImage[];
  serviceName: string;
  className?: string;
}

export function ServiceImageGallery({ images, serviceName, className }: ServiceImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Aucune image disponible</span>
      </div>
    );
  }

  const currentImage = images[currentImageIndex];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getImageTypeLabel = (imageType: string) => {
    const labels: Record<string, string> = {
      'face': 'Vue de face',
      'side_right': 'Côté droit',
      'side_left': 'Côté gauche',
      'with_person': 'Avec échelle',
      'back': 'Vue arrière'
    };
    return labels[imageType] || imageType;
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="relative">
          {/* Image principale */}
          <div className="relative aspect-video bg-gray-50 rounded-lg overflow-hidden">
            <img
              src={currentImage.imagePath}
              alt={currentImage.altText || `${serviceName} - ${getImageTypeLabel(currentImage.imageType)}`}
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-500">Image non disponible</span>
            </div>
            
            {/* Navigation arrows pour plusieurs images */}
            {hasMultipleImages && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Indicateurs de type d'image */}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {getImageTypeLabel(currentImage.imageType)}
            </span>
            {hasMultipleImages && (
              <span className="text-sm text-gray-500">
                {currentImageIndex + 1} / {images.length}
              </span>
            )}
          </div>

          {/* Thumbnails pour navigation rapide */}
          {hasMultipleImages && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-12 rounded border-2 overflow-hidden ${
                    index === currentImageIndex ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image.imagePath}
                    alt={`Thumbnail ${getImageTypeLabel(image.imageType)}`}
                    className="w-full h-full object-contain bg-gray-50"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}