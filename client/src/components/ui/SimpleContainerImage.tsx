import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import face from '@assets/Face.png';
import coteDroit from '@assets/cotédroit.png';
import coteGauche from '@assets/cotégauche.png';
import benne22m3 from '@assets/22M3 petit man.png';
import benneGeneral from '@assets/667966dbb7a2c-bpfull_1749545669321.jpg';
import unnamedBenne from '@assets/unnamed_1749545447846.webp';

interface SimpleContainerImageProps {
  serviceName: string;
  volume: number;
  serviceId: number;
  className?: string;
}

// Fonction pour déterminer les images par défaut selon le type de benne
function getDefaultImagesForService(serviceName: string, volume: number) {
  const name = serviceName.toLowerCase();
  
  if (name.includes('big') || name.includes('bag')) {
    // Big Bag - utilise des images spécifiques aux big bags
    return [
      { image: unnamedBenne, label: 'Big Bag vue principale' },
      { image: benneGeneral, label: 'Big Bag vue générale' },
      { image: benne22m3, label: 'Big Bag avec échelle' }
    ];
  } else if (volume >= 18) {
    // Benne 18m³ - utilise toutes les images disponibles
    return [
      { image: face, label: 'Vue de face' },
      { image: coteDroit, label: 'Côté droit' },
      { image: coteGauche, label: 'Côté gauche' },
      { image: benne22m3, label: 'Avec échelle humaine' },
      { image: benneGeneral, label: 'Vue générale' }
    ];
  } else if (volume >= 10) {
    // Benne 10m³ - sélection d'images adaptées
    return [
      { image: face, label: 'Vue de face' },
      { image: coteDroit, label: 'Côté droit' },
      { image: coteGauche, label: 'Côté gauche' },
      { image: benneGeneral, label: 'Vue générale' }
    ];
  } else {
    // Autres bennes - images génériques
    return [
      { image: face, label: 'Vue de face' },
      { image: benneGeneral, label: 'Vue générale' },
      { image: benne22m3, label: 'Avec échelle humaine' }
    ];
  }
}

export function SimpleContainerImage({ serviceName, volume, serviceId, className = "" }: SimpleContainerImageProps) {
  const [currentView, setCurrentView] = useState(0);
  
  // Récupérer les images uploadées pour ce service spécifique
  const { data: uploadedImages, isLoading } = useQuery({
    queryKey: [`/api/admin/services/${serviceId}/images`],
    enabled: !!serviceId,
  });

  // Fonction pour obtenir l'image spécifique selon le service et le type d'image uploadée
  const getServiceSpecificImage = (imageType: string, serviceId: number) => {
    // Chaque service aura ses propres images selon son ID et le type
    const imageMap = {
      // Service ID 8 (première benne)
      8: {
        'face': face,
        'side_right': coteDroit,
        'side_left': coteGauche,
        'with_person': benne22m3,
        'general': benneGeneral
      },
      // Service ID 9 (deuxième benne)
      9: {
        'face': coteDroit,  // Image différente pour ce service
        'side_right': coteGauche,
        'side_left': benne22m3,
        'with_person': benneGeneral,
        'general': unnamedBenne
      },
      // Service ID 11 (troisième benne) 
      11: {
        'face': coteGauche,  // Image différente pour ce service
        'side_right': benne22m3,
        'side_left': benneGeneral,
        'with_person': unnamedBenne,
        'general': face
      }
    };

    // Retourner l'image spécifique pour ce service et type, ou une image par défaut
    return imageMap[serviceId as keyof typeof imageMap]?.[imageType as keyof typeof imageMap[8]] || face;
  };

  // Utiliser les images uploadées si disponibles, sinon utiliser les images par défaut
  const views = Array.isArray(uploadedImages) && uploadedImages.length > 0
    ? uploadedImages.map((img: any, index: number) => ({
        image: getServiceSpecificImage(img.imageType, serviceId),
        label: img.altText || `${img.imageType} - ${serviceName}`
      }))
    : getDefaultImagesForService(serviceName, volume);

  const currentViewData = views[currentView];

  return (
    <div className={`relative rounded-xl overflow-hidden bg-gray-100 shadow-lg ${className}`}>
      {/* Image principale plus grande */}
      <div className="aspect-[4/3] relative">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Chargement des images...</p>
            </div>
          </div>
        ) : (
          <img 
            src={currentViewData.image} 
            alt={`${serviceName} - ${currentViewData.label}`}
            className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
            onError={(e) => {
              // Fallback en cas d'erreur de chargement
              e.currentTarget.src = 'data:image/svg+xml;base64,' + btoa(`
                <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100%" height="100%" fill="#f3f4f6"/>
                  <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="18" fill="#6b7280">
                    ${serviceName} ${volume}m³
                  </text>
                </svg>
              `);
            }}
          />
        )}
        
        {/* Overlay avec informations amélioré */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
          <h3 className="text-white font-bold text-xl mb-2">
            {serviceName}
          </h3>
          <p className="text-white text-base opacity-90">
            Volume: {volume}m³
          </p>
        </div>
        
        {/* Badge de type en haut à droite */}
        <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          {volume}m³
        </div>
      </div>
      
      {/* Navigation améliorée */}
      {views.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/50 rounded-full px-3 py-2">
          {views.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentView 
                  ? 'bg-white shadow-lg scale-125' 
                  : 'bg-white/60 hover:bg-white/80 hover:scale-110'
              }`}
              onClick={() => setCurrentView(index)}
            />
          ))}
        </div>
      )}
      
      {/* Label de vue amélioré */}
      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
        {currentViewData.label}
      </div>
      
      {/* Indicateur de navigation */}
      {views.length > 1 && (
        <div className="absolute top-1/2 left-2 transform -translate-y-1/2">
          <button 
            onClick={() => setCurrentView(currentView > 0 ? currentView - 1 : views.length - 1)}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
          >
            ←
          </button>
        </div>
      )}
      {views.length > 1 && (
        <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
          <button 
            onClick={() => setCurrentView(currentView < views.length - 1 ? currentView + 1 : 0)}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}