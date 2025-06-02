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

  const calculateTotalPrice = () => {
    if (!bookingData.service) {
      return {
        basePrice: 0,
        durationPrice: 0,
        deliveryFee: 0,
        totalHT: 0,
        vat: 0,
        totalTTC: 0,
      };
    }

    const basePrice = parseFloat(bookingData.service.basePrice);
    const durationPrice = bookingData.durationDays > 1 ? (bookingData.durationDays - 1) * 25 : 0;
    const deliveryFee = bookingData.address ? 24 : 0; // Mock calculation
    const totalHT = basePrice + durationPrice + deliveryFee;
    const vat = totalHT * 0.2;
    const totalTTC = totalHT + vat;

    return {
      basePrice,
      durationPrice,
      deliveryFee,
      totalHT,
      vat,
      totalTTC,
    };
  };

  const resetBooking = () => {
    setCurrentStep(1);
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
    updateService,
    updateDuration,
    updateWasteTypes,
    updateAddress,
    updateTimeSlots,
    updateCustomer,
    updatePaymentMethod,
    calculateTotalPrice,
    resetBooking,
  };
}
