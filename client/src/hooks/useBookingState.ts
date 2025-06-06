import { useState, useEffect } from "react";
import { Service, TimeSlot } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createAccount: boolean;
}

interface AddressInfo {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  deliveryNotes?: string;
  deliveryLocationType?: "company" | "construction_site";
  constructionSiteContactPhone?: string;
}

interface BookingData {
  service: Service | null;
  durationDays: number;
  wasteTypes: string[];
  address: AddressInfo | null;
  deliveryTimeSlot: TimeSlot | null;
  pickupTimeSlot: TimeSlot | null;
  customer: CustomerInfo | null;
  paymentMethod: string;
}

interface PriceCalculation {
  basePrice: number;
  durationPrice: number;
  deliveryFee: number;
  transportCost: number;
  treatmentCosts: Record<string, any>;
  totalTreatmentCost: number;
  maxTonnage: number;
  totalHT: number;
  vat: number;
  totalTTC: number;
}

export function useBookingState() {
  const [currentStep, setCurrentStep] = useState(1);
  const [priceData, setPriceData] = useState<any>(null);
  const [bookingData, setBookingData] = useState<BookingData>({
    service: null,
    durationDays: 1,
    wasteTypes: [],
    address: null,
    deliveryTimeSlot: null,
    pickupTimeSlot: null,
    customer: null,
    paymentMethod: "stripe",
  });

  const updateService = (service: Service) => {
    setBookingData(prev => ({ ...prev, service }));
  };

  const updateDuration = (days: number) => {
    setBookingData(prev => ({ ...prev, durationDays: days }));
  };

  const updateWasteTypes = (wasteTypes: string[]) => {
    setBookingData(prev => ({ ...prev, wasteTypes }));
  };

  const updateAddress = (address: AddressInfo) => {
    setBookingData(prev => ({ ...prev, address }));
  };

  const updateTimeSlots = (deliveryTimeSlot: TimeSlot, pickupTimeSlot?: TimeSlot) => {
    setBookingData(prev => ({ 
      ...prev, 
      deliveryTimeSlot,
      pickupTimeSlot: pickupTimeSlot || null
    }));
  };

  const updateCustomer = (customer: CustomerInfo) => {
    setBookingData(prev => ({ ...prev, customer }));
  };

  const updatePaymentMethod = (method: string) => {
    setBookingData(prev => ({ ...prev, paymentMethod: method }));
  };

  // Fonction pour déclencher le calcul de prix via l'API
  const calculatePrice = async () => {
    if (!bookingData.service || !bookingData.address) {
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/calculate-pricing", {
        serviceId: bookingData.service.id,
        customerAddress: `${bookingData.address.street}, ${bookingData.address.postalCode} ${bookingData.address.city}`,
        wasteTypes: bookingData.wasteTypes,
        durationDays: bookingData.durationDays
      });

      setPriceData(response);
    } catch (error) {
      console.error("Erreur calcul prix:", error);
    }
  };

  // Fonction pour obtenir les prix calculés
  const calculateTotalPrice = () => {
    if (!priceData) {
      return {
        basePrice: 0,
        durationPrice: 0,
        deliveryFee: 0,
        transportCost: 0,
        treatmentCosts: {},
        totalTreatmentCost: 0,
        maxTonnage: 0,
        totalHT: 0,
        vat: 0,
        totalTTC: 0,
      };
    }

    const basePrice = parseFloat(bookingData.service?.basePrice || '0');
    const transportCost = priceData.transportCost || 0;
    const totalTreatmentCost = priceData.totalTreatmentCost || 0;
    const totalHT = basePrice + transportCost + totalTreatmentCost;
    const vat = totalHT * 0.2;
    const totalTTC = totalHT + vat;

    return {
      basePrice,
      durationPrice: 0,
      deliveryFee: 0,
      transportCost,
      treatmentCosts: priceData.treatmentCosts || {},
      totalTreatmentCost,
      maxTonnage: priceData.maxTonnage || 0,
      totalHT,
      vat,
      totalTTC,
    };
  };

  const resetBooking = () => {
    setCurrentStep(1);
    setPriceData(null);
    setBookingData({
      service: null,
      durationDays: 1,
      wasteTypes: [],
      address: null,
      deliveryTimeSlot: null,
      pickupTimeSlot: null,
      customer: null,
      paymentMethod: "stripe",
    });
  };

  return {
    currentStep,
    setCurrentStep,
    bookingData,
    priceData,
    updateService,
    updateDuration,
    updateWasteTypes,
    updateAddress,
    updateTimeSlots,
    updateCustomer,
    updatePaymentMethod,
    calculatePrice,
    calculateTotalPrice,
    resetBooking,
  };
}
