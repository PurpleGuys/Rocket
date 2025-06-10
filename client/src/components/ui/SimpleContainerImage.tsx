import { useState } from 'react';

interface SimpleContainerImageProps {
  serviceName: string;
  volume: number;
  className?: string;
}

// Fonction pour générer un SVG de conteneur simple et visible
function generateSimpleContainerSVG(serviceName: string, volume: number, viewType: string): string {
  const colors = {
    'face': '#3B82F6', // Bleu
    'right_side': '#10B981', // Vert
    'left_side': '#EF4444', // Rouge
    'rear': '#F59E0B', // Orange
    'with_person': '#8B5CF6' // Violet
  };
  
  const color = colors[viewType as keyof typeof colors] || '#6B7280';
  
  const svg = `
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="50" width="260" height="120" fill="${color}" stroke="#374151" stroke-width="3" rx="8"/>
      <rect x="30" y="40" width="240" height="20" fill="${color}" stroke="#374151" stroke-width="2" rx="4"/>
      <text x="150" y="115" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white">
        ${serviceName}
      </text>
      <text x="150" y="135" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="white">
        ${volume}m³
      </text>
      <text x="150" y="155" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="white">
        ${viewType.replace('_', ' ')}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export function SimpleContainerImage({ serviceName, volume, className = "" }: SimpleContainerImageProps) {
  const [currentView, setCurrentView] = useState(0);
  
  const views = [
    { type: 'face', label: 'Vue de face' },
    { type: 'right_side', label: 'Côté droit' },
    { type: 'left_side', label: 'Côté gauche' },
    { type: 'rear', label: 'Vue arrière' },
    { type: 'with_person', label: 'Avec échelle' }
  ];

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      <div className="aspect-[3/2]">
        <img
          src={generateSimpleContainerSVG(serviceName, volume, views[currentView].type)}
          alt={`${serviceName} - ${views[currentView].label}`}
          className="w-full h-full object-contain"
          style={{ display: 'block' }}
        />
      </div>
      
      {/* Navigation */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
        {views.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentView ? 'bg-blue-500' : 'bg-white bg-opacity-50'
            }`}
            onClick={() => setCurrentView(index)}
          />
        ))}
      </div>
      
      {/* Label */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
        {views[currentView].label}
      </div>
    </div>
  );
}