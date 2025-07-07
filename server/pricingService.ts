// Service de calcul de prix hors ligne pour VPS
// Évite les dépendances aux APIs externes qui peuvent échouer

interface PricingConfig {
  baseRentalPrice: number;
  transportCostPerKm: number;
  treatmentCostPerM3: number;
  vatRate: number;
  bsdCost: number;
}

interface ServicePricing {
  id: number;
  name: string;
  volumeM3: number;
  basePrice: number;
  pricePerDay: number;
}

export class OfflinePricingService {
  private static readonly config: PricingConfig = {
    baseRentalPrice: 50, // Prix de base location
    transportCostPerKm: 1.2, // Coût par km aller-retour
    treatmentCostPerM3: 85, // Coût traitement par m3
    vatRate: 0.20, // TVA 20%
    bsdCost: 15 // Coût BSD
  };

  private static readonly services: ServicePricing[] = [
    { id: 8, name: "Big Bag", volumeM3: 1, basePrice: 45, pricePerDay: 8 },
    { id: 9, name: "Benne 10m3", volumeM3: 10, basePrice: 180, pricePerDay: 25 },
    { id: 11, name: "Benne 18m3", volumeM3: 18, basePrice: 290, pricePerDay: 40 }
  ];

  private static readonly wasteTypePricing: { [key: string]: number } = {
    'gravats': 45,      // €/m3
    'bois': 65,         // €/m3
    'metal': 35,        // €/m3
    'dechets_verts': 55, // €/m3
    'tout_venant': 75,   // €/m3
    'dib': 85,          // €/m3 (Déchets Industriels Banals)
    'carton': 45,       // €/m3
    'plastique': 120,   // €/m3
    'encombrants': 70   // €/m3
  };

  /**
   * Calcule la distance basée sur l'adresse sans API externe
   */
  static calculateDistance(address: string): number {
    const addressLower = address.toLowerCase();
    
    // Extraction du code postal français
    const postalCodeMatch = address.match(/\b(\d{5})\b/);
    
    if (postalCodeMatch) {
      const postalCode = postalCodeMatch[1];
      const dept = postalCode.substring(0, 2);
      
      // Table de distances par département depuis Paris
      const distancesByDept: { [key: string]: number } = {
        '75': 12, '77': 32, '78': 22, '91': 28, '92': 15, '93': 18, '94': 17, '95': 25,
        '01': 420, '02': 140, '03': 320, '04': 680, '05': 620, '06': 730, '07': 520,
        '08': 220, '09': 650, '10': 160, '11': 720, '12': 580, '13': 660, '14': 220,
        '15': 480, '16': 380, '17': 420, '18': 210, '19': 460, '21': 290, '22': 420,
        '23': 320, '24': 480, '25': 380, '26': 520, '27': 130, '28': 90, '29': 520,
        '30': 620, '31': 580, '32': 650, '33': 480, '34': 650, '35': 320, '36': 280,
        '37': 220, '38': 480, '39': 420, '40': 620, '41': 180, '42': 420, '43': 480,
        '44': 380, '45': 120, '46': 520, '47': 580, '48': 520, '49': 280, '50': 280,
        '51': 140, '52': 220, '53': 280, '54': 320, '55': 280, '56': 420, '57': 320,
        '58': 220, '59': 220, '60': 70, '61': 180, '62': 220, '63': 380, '64': 680,
        '65': 680, '66': 780, '67': 420, '68': 420, '69': 420, '70': 380, '71': 350,
        '72': 220, '73': 520, '74': 480, '76': 140, '77': 32, '78': 22, '79': 380,
        '80': 140, '81': 580, '82': 620, '83': 720, '84': 620, '85': 380, '86': 320,
        '87': 380, '88': 380, '89': 140, '90': 420, '91': 28, '92': 15, '93': 18,
        '94': 17, '95': 25
      };
      
      return distancesByDept[dept] || 150;
    }
    
    // Analyse par nom de ville
    const cityDistances: { [key: string]: number } = {
      'paris': 12, 'marseille': 660, 'lyon': 420, 'toulouse': 580, 'nice': 730,
      'nantes': 380, 'montpellier': 650, 'strasbourg': 420, 'bordeaux': 480,
      'lille': 220, 'rennes': 320, 'reims': 140, 'saint-étienne': 450,
      'toulon': 720, 'grenoble': 480, 'angers': 280, 'dijon': 290, 'brest': 520,
      'le mans': 200, 'amiens': 120, 'tours': 220, 'limoges': 360, 'clermont-ferrand': 380,
      'villeurbanne': 420, 'besançon': 380, 'orléans': 120, 'metz': 320, 'rouen': 140,
      'mulhouse': 420, 'perpignan': 780, 'caen': 220, 'boulogne-billancourt': 8,
      'nancy': 320, 'argenteuil': 20, 'roubaix': 220, 'tourcoing': 220,
      'montreuil': 15, 'avignon': 620, 'nîmes': 620, 'créteil': 18, 'poitiers': 320,
      'versailles': 25, 'courbevoie': 12, 'colombes': 18, 'aulnay-sous-bois': 22,
      'asnières-sur-seine': 15, 'rueil-malmaison': 20, 'antibes': 730, 'la rochelle': 420,
      'saint-maur-des-fossés': 20, 'champigny-sur-marne': 22, 'cannes': 730,
      'calais': 280, 'drancy': 20, 'mérignac': 480, 'ajaccio': 850, 'bourges': 220,
      'la seyne-sur-mer': 720, 'sarcelles': 25, 'meudon': 15, 'bagneux': 12,
      'marcq-en-barœul': 220, 'blanc-mesnil': 22, 'châlons-en-champagne': 160,
      'épinay-sur-seine': 20, 'meaux': 45, 'évry': 32, 'cholet': 320, 'bayonne': 680,
      'la roche-sur-yon': 380, 'mont-de-marsan': 620, 'charleville-mézières': 220,
      'laval': 280, 'vénissieux': 420, 'troyes': 160, 'montauban': 580, 'niort': 380,
      'chambéry': 520, 'lorient': 450, 'saint-quentin': 140
    };
    
    for (const [city, distance] of Object.entries(cityDistances)) {
      if (addressLower.includes(city.replace('-', ' '))) {
        return distance;
      }
    }
    
    // Fallback par défaut - région parisienne
    return 35;
  }

  /**
   * Calcule le prix complet pour un service
   */
  static calculatePricing(params: {
    serviceId: number;
    wasteType: string;
    address: string;
    distance?: number;
    durationDays?: number;
    bsdOption?: boolean;
  }) {
    const { serviceId, wasteType, address, durationDays = 7, bsdOption = false } = params;
    
    // Trouver le service
    const service = this.services.find(s => s.id === serviceId);
    if (!service) {
      throw new Error(`Service non trouvé: ${serviceId}`);
    }
    
    // Calculer la distance
    const distance = params.distance || this.calculateDistance(address);
    
    // Prix de base du service
    const baseServicePrice = service.basePrice;
    
    // Prix de location selon la durée
    const extraDays = Math.max(0, durationDays - 3); // 3 jours inclus
    const extraDaysPrice = extraDays * service.pricePerDay;
    
    // Coût transport (aller-retour)
    const transportCost = distance * this.config.transportCostPerKm;
    
    // Coût traitement selon le type de déchet
    const wastePrice = this.wasteTypePricing[wasteType] || this.wasteTypePricing['tout_venant'];
    const treatmentCost = wastePrice * service.volumeM3;
    
    // Coût BSD optionnel
    const bsdCost = bsdOption ? this.config.bsdCost : 0;
    
    // Total HT
    const totalHT = baseServicePrice + extraDaysPrice + transportCost + treatmentCost + bsdCost;
    
    // TVA
    const tva = totalHT * this.config.vatRate;
    
    // Total TTC
    const totalTTC = totalHT + tva;
    
    return {
      service: {
        name: service.name,
        volume: service.volumeM3,
        basePrice: baseServicePrice
      },
      breakdown: {
        baseServicePrice: Number(baseServicePrice.toFixed(2)),
        extraDaysPrice: Number(extraDaysPrice.toFixed(2)),
        transportCost: Number(transportCost.toFixed(2)),
        treatmentCost: Number(treatmentCost.toFixed(2)),
        bsdCost: Number(bsdCost.toFixed(2))
      },
      totals: {
        totalHT: Number(totalHT.toFixed(2)),
        tva: Number(tva.toFixed(2)),
        totalTTC: Number(totalTTC.toFixed(2))
      },
      details: {
        distance: distance,
        durationDays: durationDays,
        wasteType: wasteType,
        wastePrice: wastePrice,
        extraDays: extraDays
      }
    };
  }

  /**
   * Obtient la liste des types de déchets avec prix
   */
  static getWasteTypes() {
    return Object.entries(this.wasteTypePricing).map(([key, price]) => ({
      id: key,
      name: this.getWasteTypeName(key),
      pricePerM3: price
    }));
  }

  /**
   * Convertit les clés en noms lisibles
   */
  private static getWasteTypeName(key: string): string {
    const names: { [key: string]: string } = {
      'gravats': 'Gravats et matériaux inertes',
      'bois': 'Bois et matériaux ligneux',
      'metal': 'Métaux et ferraille',
      'dechets_verts': 'Déchets verts',
      'tout_venant': 'Tout-venant',
      'dib': 'Déchets industriels banals',
      'carton': 'Carton et papier',
      'plastique': 'Plastique',
      'encombrants': 'Encombrants'
    };
    return names[key] || key;
  }
}