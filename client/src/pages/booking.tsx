import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, MapPin, Package, Clock, Euro } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { Service, TimeSlot } from "@/shared/schema";

interface BookingData {
  serviceId: number;
  wasteTypeId: number;
  deliveryDate: Date | null;
  pickupDate: Date | null;
  deliveryTimeSlotId: number | null;
  pickupTimeSlotId: number | null;
  address: string;
  city: string;
  postalCode: string;
  additionalInfo: string;
  rentalDays: number;
  transportPrice: number;
  treatmentPrice: number;
  rentalPrice: number;
  totalPrice: number;
}

export default function BookingPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [bookingData, setBookingData] = useState<BookingData>({
    serviceId: 0,
    wasteTypeId: 0,
    deliveryDate: null,
    pickupDate: null,
    deliveryTimeSlotId: null,
    pickupTimeSlotId: null,
    address: "",
    city: "",
    postalCode: "",
    additionalInfo: "",
    rentalDays: 1,
    transportPrice: 0,
    treatmentPrice: 0,
    rentalPrice: 0,
    totalPrice: 0
  });

  // Fetch services
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['/api/services']
  });

  // Fetch waste types
  const { data: wasteTypes = [] } = useQuery({
    queryKey: ['/api/waste-types']
  });

  // Fetch time slots
  const { data: timeSlots = [] } = useQuery<TimeSlot[]>({
    queryKey: ['/api/time-slots']
  });

  // Calculate rental days when dates change
  useEffect(() => {
    if (bookingData.deliveryDate && bookingData.pickupDate) {
      const days = Math.ceil((bookingData.pickupDate.getTime() - bookingData.deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
      setBookingData(prev => ({ ...prev, rentalDays: Math.max(1, days) }));
    }
  }, [bookingData.deliveryDate, bookingData.pickupDate]);

  // Calculate pricing when parameters change
  useEffect(() => {
    if (bookingData.serviceId && bookingData.wasteTypeId && bookingData.postalCode && bookingData.rentalDays > 0) {
      calculatePricing();
    }
  }, [bookingData.serviceId, bookingData.wasteTypeId, bookingData.postalCode, bookingData.rentalDays]);

  const calculatePricing = async () => {
    try {
      const response = await fetch('/api/calculate-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: bookingData.serviceId,
          wasteTypeId: bookingData.wasteTypeId,
          postalCode: bookingData.postalCode,
          days: bookingData.rentalDays
        })
      });

      if (response.ok) {
        const pricing = await response.json();
        setBookingData(prev => ({
          ...prev,
          transportPrice: pricing.transportPrice || 0,
          treatmentPrice: pricing.treatmentPrice || 0,
          rentalPrice: pricing.rentalPrice || 0,
          totalPrice: pricing.totalPrice || 0
        }));
      }
    } catch (error) {
      console.error('Error calculating pricing:', error);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!bookingData.serviceId || !bookingData.wasteTypeId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un service et un type de déchet",
        variant: "destructive"
      });
      return;
    }

    if (!bookingData.deliveryDate || !bookingData.pickupDate) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner les dates de livraison et de récupération",
        variant: "destructive"
      });
      return;
    }

    if (!bookingData.address || !bookingData.city || !bookingData.postalCode) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir l'adresse complète",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Store booking data in localStorage for checkout page
      const dataToStore = {
        ...bookingData,
        deliveryDate: bookingData.deliveryDate?.toISOString(),
        pickupDate: bookingData.pickupDate?.toISOString()
      };
      
      console.log('Storing booking data:', dataToStore);
      localStorage.setItem('bookingData', JSON.stringify(dataToStore));
      
      // Verify data was stored
      const stored = localStorage.getItem('bookingData');
      console.log('Verified stored data:', stored);
      
      // Small delay to ensure localStorage is written
      setTimeout(() => {
        navigate('/checkout-new');
      }, 100);
    } catch (error) {
      console.error('Error saving booking:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const selectedService = services.find(s => s.id === bookingData.serviceId);
  const selectedWasteType = wasteTypes.find(w => w.id === bookingData.wasteTypeId);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Réserver une benne</h1>

      <div className="grid gap-6">
        {/* Service Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Sélection du service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="service">Type de benne</Label>
              <Select
                value={bookingData.serviceId.toString()}
                onValueChange={(value) => setBookingData(prev => ({ ...prev, serviceId: parseInt(value) }))}
              >
                <SelectTrigger id="service">
                  <SelectValue placeholder="Sélectionnez une benne" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name} - {service.capacity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="waste">Type de déchet</Label>
              <Select
                value={bookingData.wasteTypeId.toString()}
                onValueChange={(value) => setBookingData(prev => ({ ...prev, wasteTypeId: parseInt(value) }))}
              >
                <SelectTrigger id="waste">
                  <SelectValue placeholder="Sélectionnez le type de déchet" />
                </SelectTrigger>
                <SelectContent>
                  {wasteTypes.map((waste) => (
                    <SelectItem key={waste.id} value={waste.id.toString()}>
                      {waste.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Dates Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Dates de location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Date de livraison</Label>
                <Calendar
                  mode="single"
                  selected={bookingData.deliveryDate || undefined}
                  onSelect={(date) => setBookingData(prev => ({ ...prev, deliveryDate: date || null }))}
                  disabled={(date) => date < new Date()}
                  locale={fr}
                  className="rounded-md border"
                />
              </div>

              <div>
                <Label>Date de récupération</Label>
                <Calendar
                  mode="single"
                  selected={bookingData.pickupDate || undefined}
                  onSelect={(date) => setBookingData(prev => ({ ...prev, pickupDate: date || null }))}
                  disabled={(date) => date < (bookingData.deliveryDate || new Date())}
                  locale={fr}
                  className="rounded-md border"
                />
              </div>
            </div>

            {bookingData.rentalDays > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  Durée de location : <strong>{bookingData.rentalDays} jour{bookingData.rentalDays > 1 ? 's' : ''}</strong>
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deliverySlot">Créneau de livraison</Label>
                <Select
                  value={bookingData.deliveryTimeSlotId?.toString() || ""}
                  onValueChange={(value) => setBookingData(prev => ({ ...prev, deliveryTimeSlotId: parseInt(value) }))}
                >
                  <SelectTrigger id="deliverySlot">
                    <SelectValue placeholder="Sélectionnez un créneau" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.id} value={slot.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="pickupSlot">Créneau de récupération</Label>
                <Select
                  value={bookingData.pickupTimeSlotId?.toString() || ""}
                  onValueChange={(value) => setBookingData(prev => ({ ...prev, pickupTimeSlotId: parseInt(value) }))}
                >
                  <SelectTrigger id="pickupSlot">
                    <SelectValue placeholder="Sélectionnez un créneau" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.id} value={slot.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Adresse de livraison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={bookingData.address}
                onChange={(e) => setBookingData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 rue de la Paix"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={bookingData.city}
                  onChange={(e) => setBookingData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Paris"
                />
              </div>
              <div>
                <Label htmlFor="postalCode">Code postal</Label>
                <Input
                  id="postalCode"
                  value={bookingData.postalCode}
                  onChange={(e) => setBookingData(prev => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="75001"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="additionalInfo">Informations complémentaires (optionnel)</Label>
              <Input
                id="additionalInfo"
                value={bookingData.additionalInfo}
                onChange={(e) => setBookingData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                placeholder="Code d'accès, étage, instructions particulières..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Price Summary */}
        {bookingData.totalPrice > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Récapitulatif des prix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Location ({bookingData.rentalDays} jour{bookingData.rentalDays > 1 ? 's' : ''})</span>
                  <span>{bookingData.rentalPrice.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Transport (aller-retour)</span>
                  <span>{bookingData.transportPrice.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Traitement des déchets</span>
                  <span>{bookingData.treatmentPrice.toFixed(2)} €</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total TTC</span>
                    <span className="text-green-600">{bookingData.totalPrice.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading || bookingData.totalPrice === 0}
          size="lg"
          className="w-full"
        >
          {loading ? "Chargement..." : "Finaliser la commande"}
        </Button>
      </div>
    </div>
  );
}