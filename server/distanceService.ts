import dotenv from 'dotenv';
dotenv.config();

interface GeocodeResult {
  lat: number;
  lng: number;
}

interface DistanceMatrixResult {
  distance: number; // en kilomètres
  duration: number; // en minutes
}

export class DistanceService {
  private static readonly GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  private static readonly GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
  private static readonly DISTANCE_MATRIX_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';

  /**
   * Géocode une adresse en coordonnées GPS
   */
  static async geocodeAddress(address: string): Promise<GeocodeResult> {
    if (!this.GOOGLE_MAPS_API_KEY) {
      throw new Error('Clé API Google Maps manquante');
    }

    const url = `${this.GEOCODING_URL}?address=${encodeURIComponent(address)}&key=${this.GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      throw new Error(`Erreur de géocodage: ${data.status} - ${data.error_message || 'Adresse non trouvée'}`);
    }

    const location = data.results[0].geometry.location;
    return {
      lat: location.lat,
      lng: location.lng
    };
  }

  /**
   * Calcule la distance et le temps de trajet entre deux adresses
   */
  static async calculateDistance(originAddress: string, destinationAddress: string): Promise<DistanceMatrixResult> {
    if (!this.GOOGLE_MAPS_API_KEY) {
      throw new Error('Clé API Google Maps manquante');
    }

    const url = `${this.DISTANCE_MATRIX_URL}?origins=${encodeURIComponent(originAddress)}&destinations=${encodeURIComponent(destinationAddress)}&key=${this.GOOGLE_MAPS_API_KEY}&units=metric`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Erreur de calcul de distance: ${data.status} - ${data.error_message || 'Impossible de calculer la distance'}`);
    }

    const element = data.rows[0]?.elements[0];
    if (!element || element.status !== 'OK') {
      throw new Error('Impossible de calculer la distance entre ces adresses');
    }

    return {
      distance: Math.round(element.distance.value / 1000), // Convertir mètres en kilomètres
      duration: Math.round(element.duration.value / 60) // Convertir secondes en minutes
    };
  }

  /**
   * Calcule le coût de transport basé sur la distance aller-retour
   */
  static calculateTransportCost(
    distanceKm: number, 
    pricePerKm: number, 
    minimumFlatRate: number
  ): number {
    // Distance aller-retour
    const roundTripDistance = distanceKm * 2;
    const transportCost = roundTripDistance * pricePerKm;
    
    // Appliquer le tarif minimum si nécessaire
    return Math.max(transportCost, minimumFlatRate);
  }

  /**
   * Obtient l'adresse complète du site industriel depuis la configuration
   */
  static formatIndustrialSiteAddress(activities: any): string {
    if (!activities?.industrialSiteAddress) {
      throw new Error('Adresse du site industriel non configurée');
    }

    let address = activities.industrialSiteAddress;
    if (activities.industrialSitePostalCode) {
      address += `, ${activities.industrialSitePostalCode}`;
    }
    if (activities.industrialSiteCity) {
      address += ` ${activities.industrialSiteCity}`;
    }
    
    return address;
  }
}