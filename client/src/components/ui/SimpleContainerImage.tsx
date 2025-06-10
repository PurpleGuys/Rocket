import { useState } from 'react';
import { Package } from 'lucide-react';

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
    { type: 'face', label: 'Vue de face', color: '#3B82F6' },
    { type: 'right_side', label: 'Côté droit', color: '#10B981' },
    { type: 'left_side', label: 'Côté gauche', color: '#EF4444' },
    { type: 'rear', label: 'Vue arrière', color: '#F59E0B' },
    { type: 'with_person', label: 'Avec échelle', color: '#8B5CF6' }
  ];

  const currentViewData = views[currentView];

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ backgroundColor: currentViewData.color + '20' }}>
      <div className="aspect-[3/2] flex flex-col items-center justify-center p-4" style={{ backgroundColor: currentViewData.color }}>
        <Package 
          className="w-16 h-16 text-white mb-3" 
          strokeWidth={1.5}
        />
        <h3 className="text-white font-bold text-lg text-center mb-1">
          {serviceName}
        </h3>
        <p className="text-white text-sm mb-1">
          Volume: {volume}m³
        </p>
        <p className="text-white text-xs opacity-90">
          {currentViewData.label}
        </p>
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