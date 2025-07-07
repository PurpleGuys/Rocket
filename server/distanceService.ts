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
      console.log("⚠️ GOOGLE_MAPS_API_KEY manquante, utilisation du fallback");
      return this.fallbackGeocode(address);
    }

    try {
      const url = `${this.GEOCODING_URL}?address=${encodeURIComponent(address)}&key=${this.GOOGLE_MAPS_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        console.log(`Google Maps API erreur: ${data.status}, utilisation fallback`);
        return this.fallbackGeocode(address);
      }

      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng
      };
    } catch (error) {
      console.log('Erreur API Google Maps, utilisation fallback:', error);
      return this.fallbackGeocode(address);
    }
  }

  private static fallbackGeocode(address: string): GeocodeResult {
    // Coordonnées approximatives pour Paris (centre par défaut)
    let lat = 48.8566;
    let lng = 2.3522;

    // Ajustement basé sur le code postal
    const postalCodeMatch = address.match(/\b(\d{5})\b/);
    if (postalCodeMatch) {
      const dept = postalCodeMatch[1].substring(0, 2);
      const coordinates: { [key: string]: [number, number] } = {
        '75': [48.8566, 2.3522], // Paris
        '13': [43.2965, 5.3698], // Marseille
        '69': [45.7640, 4.8357], // Lyon
        '31': [43.6047, 1.4442], // Toulouse
        '33': [44.8378, -0.5792], // Bordeaux
        '59': [50.6292, 3.0573], // Lille
        '92': [48.8566, 2.2137], // Hauts-de-Seine
        '93': [48.9058, 2.4426], // Seine-Saint-Denis
        '94': [48.7905, 2.4549], // Val-de-Marne
        '95': [49.0352, 2.0818]  // Val-d'Oise
      };
      
      if (coordinates[dept]) {
        [lat, lng] = coordinates[dept];
      }
    }

    return { lat, lng };
  }

  /**
   * Calcule la distance et le temps de trajet entre deux adresses
   */
  static async calculateDistance(originAddress: string, destinationAddress: string): Promise<DistanceMatrixResult> {
    if (!this.GOOGLE_MAPS_API_KEY) {
      console.log("⚠️ GOOGLE_MAPS_API_KEY manquante, utilisation du fallback distance");
      return this.fallbackDistanceCalculation(destinationAddress);
    }

    try {

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
    } catch (error) {
      console.log('Erreur Google Distance Matrix, utilisation fallback:', error);
      return this.fallbackDistanceCalculation(destinationAddress);
    }
  }

  private static fallbackDistanceCalculation(destinationAddress: string): DistanceMatrixResult {
    const distance = this.calculateDistanceFromAddress(destinationAddress);
    return {
      distance: distance,
      duration: Math.round(distance * 1.5)
    };
  }

  private static calculateDistanceFromAddress(address: string): number {
    const addressLower = address.toLowerCase();
    const postalCodeMatch = address.match(/\b(\d{5})\b/);
    
    if (postalCodeMatch) {
      const dept = postalCodeMatch[1].substring(0, 2);
      const distancesByDept: { [key: string]: number } = {
        '75': 15, '77': 35, '78': 25, '91': 30, '92': 18, '93': 22, '94': 20, '95': 28,
        '01': 350, '02': 120, '03': 280, '13': 650, '31': 550, '33': 450, '34': 600,
        '35': 300, '44': 350, '59': 200, '67': 350, '69': 350
      };
      return distancesByDept[dept] || 150;
    }
    
    const cityDistances: { [key: string]: number } = {
      'paris': 15, 'marseille': 650, 'lyon': 350, 'toulouse': 550, 'nice': 700,
      'nantes': 350, 'montpellier': 600, 'strasbourg': 350, 'bordeaux': 450,
      'lille': 200, 'rennes': 300, 'reims': 120
    };
    
    for (const [city, distance] of Object.entries(cityDistances)) {
      if (addressLower.includes(city)) {
        return distance;
      }
    }
    
    return 50;
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