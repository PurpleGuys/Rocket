import { useState } from 'react';
import face from '@assets/Face.png';
import coteDroit from '@assets/cotédroit.png';
import coteGauche from '@assets/cotégauche.png';
import benne22m3 from '@assets/22M3 petit man.png';
import benneGeneral from '@assets/667966dbb7a2c-bpfull_1749545669321.jpg';

interface SimpleContainerImageProps {
  serviceName: string;
  volume: number;
  className?: string;
}

export function SimpleContainerImage({ serviceName, volume, className = "" }: SimpleContainerImageProps) {
  const [currentView, setCurrentView] = useState(0);
  
  const views = [
    { image: face, label: 'Vue de face' },
    { image: coteDroit, label: 'Côté droit' },
    { image: coteGauche, label: 'Côté gauche' },
    { image: benne22m3, label: 'Avec échelle humaine' },
    { image: benneGeneral, label: 'Vue générale' }
  ];

  const currentViewData = views[currentView];

  return (
    <div className={`relative rounded-lg overflow-hidden bg-gray-100 ${className}`}>
      <div className="aspect-[3/2] relative">
        <img 
          src={currentViewData.image} 
          alt={`${serviceName} - ${currentViewData.label}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback en cas d'erreur de chargement
            e.currentTarget.src = 'data:image/svg+xml;base64,' + btoa(`
              <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f3f4f6"/>
                <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="16" fill="#6b7280">
                  ${serviceName} ${volume}m³
                </text>
              </svg>
            `);
          }}
        />
        
        {/* Overlay avec informations */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white font-bold text-lg mb-1">
            {serviceName}
          </h3>
          <p className="text-white text-sm">
            Volume: {volume}m³
          </p>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
        {views.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentView ? 'bg-white shadow-lg' : 'bg-white bg-opacity-60 hover:bg-opacity-80'
            }`}
            onClick={() => setCurrentView(index)}
          />
        ))}
      </div>
      
      {/* Label */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
        {currentViewData.label}
      </div>
    </div>
  );
}