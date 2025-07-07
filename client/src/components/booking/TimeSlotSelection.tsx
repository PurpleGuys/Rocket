import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBookingState } from "@/hooks/useBookingState";
import { TimeSlot } from "@shared/schema";
import { Calendar, Clock, CheckCircle, XCircle, Info } from "lucide-react";

export default function TimeSlotSelection() {
  const { bookingData, updateTimeSlots } = useBookingState();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Tomorrow
  );
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<number | null>(null);
  const [pickupOption, setPickupOption] = useState<"auto" | "manual">("auto");
  
  // Charger les données existantes du booking au montage
  useEffect(() => {
    if (bookingData.deliveryTimeSlot) {
      setSelectedDate(bookingData.deliveryTimeSlot.date);
      setSelectedTimeSlotId(bookingData.deliveryTimeSlot.id);
    }
  }, []);

  const { data: timeSlots, isLoading } = useQuery({
    queryKey: ['/api/timeslots', selectedDate],
    enabled: !!selectedDate,
  });

  useEffect(() => {
    if (selectedTimeSlotId && timeSlots) {
      const timeSlot = timeSlots.find((slot: TimeSlot) => slot.id === selectedTimeSlotId);
      if (timeSlot) {
        // Calculate pickup date based on duration
        const deliveryDate = new Date(selectedDate);
        const pickupDate = new Date(deliveryDate);
        pickupDate.setDate(pickupDate.getDate() + bookingData.durationDays);
        
        // Create a mock pickup time slot
        const pickupTimeSlot = pickupOption === "auto" ? {
          id: -1,
          date: pickupDate.toISOString().split('T')[0],
          startTime: "08:00",
          endTime: "12:00",
          isAvailable: true,
          maxBookings: 5,
          currentBookings: 0,
        } : null;

        updateTimeSlots(timeSlot, pickupTimeSlot || undefined);
      }
    }
  }, [selectedTimeSlotId, timeSlots, selectedDate, bookingData.durationDays, pickupOption, updateTimeSlots]);

  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      days.push(date);
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'short', 
      day: 'numeric',
      month: 'short'
    });
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Calendar className="h-8 w-8 mr-3 text-red-600" />
          <h2 className="text-3xl font-bold text-slate-900">Choisissez vos dates</h2>
        </div>
        <p className="text-lg text-slate-600">Sélectionnez quand vous souhaitez recevoir et récupérer votre benne</p>
      </div>

      {/* Date Selection */}
      <Card className="border-2 border-red-100 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center mb-6">
            <Clock className="h-6 w-6 mr-3 text-red-600" />
            <h3 className="text-2xl font-semibold text-slate-900">📅 Date de livraison</h3>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
            {calendarDays.map((date) => {
              const dateStr = date.toISOString().split('T')[0];
              const isSelected = selectedDate === dateStr;
              return (
                <Button
                  key={dateStr}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-auto flex flex-col py-4 px-3 transition-all duration-200 ${
                    isSelected
                      ? "bg-red-600 hover:bg-red-700 border-red-600 shadow-md scale-105"
                      : "hover:border-red-300 hover:bg-red-50"
                  }`}
                >
                  <div className="text-xs mb-1 font-medium">{formatDate(date).split(' ')[0]}</div>
                  <div className="text-lg font-bold">{date.getDate()}</div>
                  <div className="text-xs">{formatDate(date).split(' ').slice(1).join(' ')}</div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time Slots */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center mb-6">
            <Clock className="h-6 w-6 mr-3 text-blue-600" />
            <h3 className="text-2xl font-semibold text-slate-900">
              ⏰ Créneaux pour le {new Date(selectedDate).toLocaleDateString('fr-FR')}
            </h3>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
              <span className="ml-3 text-blue-600 font-medium">Chargement des créneaux...</span>
            </div>
          ) : timeSlots && timeSlots.length > 0 ? (
            <RadioGroup 
              value={selectedTimeSlotId?.toString() || ""}
              onValueChange={(value) => setSelectedTimeSlotId(parseInt(value))}
            >
              <div className="grid md:grid-cols-2 gap-6">
                {timeSlots.map((slot: TimeSlot) => {
                  const isSelected = selectedTimeSlotId === slot.id;
                  const isMorning = slot.startTime === "08:00";
                  return (
                    <div key={slot.id} className="relative">
                      <RadioGroupItem value={slot.id.toString()} id={slot.id.toString()} className="sr-only" />
                      <Label
                        htmlFor={slot.id.toString()}
                        className={`cursor-pointer block p-6 border-2 rounded-xl transition-all duration-200 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 shadow-lg scale-105"
                            : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-xl text-slate-900">
                            {isMorning ? "🌅 Matin" : "🌇 Après-midi"}
                          </h4>
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="text-lg font-semibold text-blue-700 mb-2">
                          {slot.startTime} - {slot.endTime}
                        </div>
                        <div className="text-sm text-slate-600 flex items-center">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            Places disponibles
                          </span>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          ) : (
            <Alert className="border-orange-200 bg-orange-50">
              <XCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Aucun créneau disponible pour cette date. Veuillez sélectionner une autre date.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Pickup Options */}
      <Card className="border-2 border-purple-100 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center mb-6">
            <Calendar className="h-6 w-6 mr-3 text-purple-600" />
            <h3 className="text-2xl font-semibold text-slate-900">🔄 Date de récupération</h3>
          </div>
          <RadioGroup value={pickupOption} onValueChange={(value) => setPickupOption(value as "auto" | "manual")}>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto" id="pickup-auto" />
                <Label htmlFor="pickup-auto" className="text-sm text-slate-700">
                  Récupération automatique (fin de période de location)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="pickup-manual" />
                <Label htmlFor="pickup-manual" className="text-sm text-slate-700">
                  Je choisis ma date de récupération
                </Label>
              </div>
            </div>
          </RadioGroup>
          
          {pickupOption === "auto" && selectedDate && (
            <Alert className="mt-4 border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Récupération prévue le{' '}
                <strong>
                  {new Date(
                    new Date(selectedDate).getTime() + bookingData.durationDays * 24 * 60 * 60 * 1000
                  ).toLocaleDateString('fr-FR')}
                </strong>{' '}
                entre 8h et 12h (fin de période de {bookingData.durationDays} jour{bookingData.durationDays > 1 ? 's' : ''})
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
