// Global type definitions for Google Maps
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions);
      setCenter(latlng: LatLng): void;
      setZoom(zoom: number): void;
      fitBounds(bounds: LatLngBounds): void;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      getPosition(): LatLng;
      addListener(eventName: string, handler: Function): void;
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      setContent(content: string): void;
      open(map: Map, anchor?: Marker): void;
      close(): void;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    class LatLngBounds {
      constructor();
      extend(point: LatLng): void;
      isEmpty(): boolean;
    }

    class Size {
      constructor(width: number, height: number);
    }

    class Point {
      constructor(x: number, y: number);
    }

    class Geocoder {
      constructor();
      geocode(request: GeocoderRequest, callback: (results: GeocoderResult[], status: GeocoderStatus) => void): void;
    }

    interface MapOptions {
      center: LatLng;
      zoom: number;
      mapTypeId: MapTypeId;
    }

    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      title?: string;
      icon?: string | Icon;
    }

    interface InfoWindowOptions {
      content: string;
    }

    interface Icon {
      url: string;
      scaledSize: Size;
      anchor: Point;
    }

    interface GeocoderRequest {
      address: string;
    }

    interface GeocoderResult {
      geometry: {
        location: LatLng;
      };
    }

    enum MapTypeId {
      ROADMAP = 'roadmap',
      SATELLITE = 'satellite',
      HYBRID = 'hybrid',
      TERRAIN = 'terrain'
    }

    enum GeocoderStatus {
      OK = 'OK',
      ZERO_RESULTS = 'ZERO_RESULTS',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      INVALID_REQUEST = 'INVALID_REQUEST',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR'
    }
  }
}

// API Response types
interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

interface PlacesResponse {
  suggestions: Array<{
    description: string;
    main_text: string;
    secondary_text: string;
  }>;
}

interface MapsConfig {
  apiKey: string;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress: string;
  totalPrice: string;
  serviceId: number;
  deliveryDate?: string;
  pickupDate?: string;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'client' | 'admin';
  accountType: 'individual' | 'business';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Session {
  id: string;
  userId: number;
  createdAt: string;
  lastAccessedAt: string;
  userAgent?: string;
  ipAddress?: string;
}

interface TimeSlot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  type: 'delivery' | 'pickup';
}

interface Service {
  id: number;
  name: string;
  description: string;
  basePrice: string;
  volume: number;
  maxWeight: number;
  isActive: boolean;
  images: Array<{
    id: number;
    imagePath: string;
    imageType: string;
    altText: string;
    isMain: boolean;
  }>;
}

interface DashboardStats {
  todayOrders: number;
  ordersGrowth: number;
  monthlyRevenue: string;
  revenueGrowth: number;
  totalUsers: number;
  activeUsers: number;
  pendingOrders: number;
}

// Window global types
declare global {
  interface Window {
    google: typeof google;
    initMap?: () => void;
  }
}

export {};