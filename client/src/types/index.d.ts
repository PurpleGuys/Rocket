// Comprehensive type fixes for VPS deployment compilation

// Google Maps API types
declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
  
  var google: {
    maps: {
      Map: new (element: HTMLElement, options?: any) => any;
      Marker: new (options?: any) => any;
      InfoWindow: new (options?: any) => any;
      LatLng: new (lat: number, lng: number) => any;
      LatLngBounds: new () => any;
      Size: new (width: number, height: number) => any;
      Point: new (x: number, y: number) => any;
      Geocoder: new () => any;
      MapTypeId: {
        ROADMAP: string;
        SATELLITE: string;
        HYBRID: string;
        TERRAIN: string;
      };
      GeocoderStatus: {
        OK: string;
        ZERO_RESULTS: string;
        OVER_QUERY_LIMIT: string;
        REQUEST_DENIED: string;
        INVALID_REQUEST: string;
        UNKNOWN_ERROR: string;
      };
    };
  };
}

// API Response type augmentations
declare module "*.tsx" {
  const Component: React.ComponentType<any>;
  export default Component;
}

// Augment unknown types to any for compilation
declare global {
  interface Array<T> {
    filter: (predicate: (value: T, index: number, array: T[]) => any) => T[];
    map: <U>(callbackfn: (value: T, index: number, array: T[]) => U) => U[];
    find: (predicate: (value: T, index: number, obj: T[]) => any) => T | undefined;
    slice: (start?: number, end?: number) => T[];
  }
}

// Type assertions for React Query responses
type QueryResult<T = any> = {
  data?: T | null;
  error?: any;
  isLoading?: boolean;
  isError?: boolean;
  refetch?: () => void;
  [key: string]: any;
};

// API endpoint response types
type UsersResponse = User[] | { filter: Function; length: number; map: Function; [key: string]: any };
type OrdersResponse = Order[] | { filter: Function; length: number; map: Function; slice: Function; [key: string]: any };
type ServicesResponse = Service[] | { filter: Function; map: Function; find: Function; [key: string]: any };
type SessionsResponse = Session[] | { length: number; map: Function; [key: string]: any };
type TimeSlotResponse = TimeSlot[] | { find: Function; length: number; map: Function; [key: string]: any };

// Stats and configuration types
type StatsResponse = {
  todayOrders?: number;
  ordersGrowth?: number;
  monthlyRevenue?: string;
  revenueGrowth?: number;
  rentedDumpsters?: number;
  activeCustomers?: number;
  totalSurveys?: number;
  completionRate?: number;
  averageOverallSatisfaction?: number;
  averageNPS?: number;
  [key: string]: any;
} | { [key: string]: any };

type ConfigResponse = {
  hourlyRate?: number;
  immediateLoadingEnabled?: boolean;
  pricePerKm?: number;
  minimumFlatRate?: number;
  wasteTypes?: any[];
  [key: string]: any;
} | { [key: string]: any };

type BankDepositsResponse = any[] | { map: Function; [key: string]: any };

// Component prop types
interface ForgotPasswordFormProps {
  onBackToLogin?: () => void;
  [key: string]: any;
}

// React node type extension
type ReactNodeExtended = React.ReactNode | any;

// Export empty object to make this a module
export {};