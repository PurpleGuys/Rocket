// Quick type fixes for VPS deployment compilation
declare var google: any;

// Extend global types for compilation
declare global {
  namespace google {
    namespace maps {
      class Map {
        constructor(element: HTMLElement, options?: any);
        setCenter(latLng: any): void;
        setZoom(zoom: number): void;
        fitBounds(bounds: any): void;
      }
      class Marker {
        constructor(options?: any);
        setMap(map: any): void;
        addListener(event: string, handler: Function): void;
      }
      class InfoWindow {
        constructor(options?: any);
        setContent(content: string): void;
        open(map: any, marker?: any): void;
        close(): void;
      }
      class LatLng {
        constructor(lat: number, lng: number);
      }
      class LatLngBounds {
        constructor();
        extend(latLng: any): void;
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
        geocode(request: any, callback: Function): void;
      }
      enum MapTypeId {
        ROADMAP = 'roadmap'
      }
      enum GeocoderStatus {
        OK = 'OK'
      }
    }
  }
}

// Type augmentations for API responses
interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

type MapsConfig = {
  apiKey: string;
};

type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  [key: string]: any;
};

type Order = {
  id: number;
  orderNumber: string;
  status: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  totalPrice: string;
  [key: string]: any;
};

type Session = {
  id: string;
  userId: number;
  createdAt: string;
  [key: string]: any;
};

type TimeSlot = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  type: string;
  [key: string]: any;
};

type DashboardStats = {
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
};

export {};