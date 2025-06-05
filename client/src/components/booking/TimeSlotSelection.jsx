import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBookingState } from "@/hooks/useBookingState";
import { Calendar, CheckCircle, XCircle, Info } from "lucide-react";
export default function TimeSlotSelection() {
    var _a = useBookingState(), bookingData = _a.bookingData, updateTimeSlots = _a.updateTimeSlots;
    var _b = useState(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Tomorrow
    ), selectedDate = _b[0], setSelectedDate = _b[1];
    var _c = useState(null), selectedTimeSlotId = _c[0], setSelectedTimeSlotId = _c[1];
    var _d = useState("auto"), pickupOption = _d[0], setPickupOption = _d[1];
    var _e = useQuery({
        queryKey: ['/api/timeslots', selectedDate],
        enabled: !!selectedDate,
    }), timeSlots = _e.data, isLoading = _e.isLoading;
    useEffect(function () {
        if (selectedTimeSlotId && timeSlots) {
            var timeSlot = timeSlots.find(function (slot) { return slot.id === selectedTimeSlotId; });
            if (timeSlot) {
                // Calculate pickup date based on duration
                var deliveryDate = new Date(selectedDate);
                var pickupDate = new Date(deliveryDate);
                pickupDate.setDate(pickupDate.getDate() + bookingData.durationDays);
                // Create a mock pickup time slot
                var pickupTimeSlot = pickupOption === "auto" ? {
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
    var generateCalendarDays = function () {
        var days = [];
        var today = new Date();
        for (var i = 1; i <= 14; i++) {
            var date = new Date(today);
            date.setDate(today.getDate() + i);
            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6)
                continue;
            days.push(date);
        }
        return days;
    };
    var formatDate = function (date) {
        return date.toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };
    var calendarDays = generateCalendarDays();
    return (<div className="space-y-6">
      <div className="flex items-center mb-6">
        <Calendar className="h-6 w-6 mr-3 text-primary-600"/>
        <h2 className="text-xl font-semibold text-slate-900">Choisissez votre créneau</h2>
      </div>

      {/* Date Selection */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Date de livraison</h3>
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map(function (date) {
            var dateStr = date.toISOString().split('T')[0];
            return (<Button key={dateStr} variant={selectedDate === dateStr ? "default" : "outline"} onClick={function () { return setSelectedDate(dateStr); }} className={"h-auto flex flex-col py-3 ".concat(selectedDate === dateStr
                    ? "bg-primary-600 hover:bg-primary-700"
                    : "")}>
                  <div className="text-xs mb-1">{formatDate(date).split(' ')[0]}</div>
                  <div className="text-sm">{date.getDate()}</div>
                </Button>);
        })}
          </div>
        </CardContent>
      </Card>

      {/* Time Slots */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">
            Créneaux disponibles pour le {new Date(selectedDate).toLocaleDateString('fr-FR')}
          </h3>
          
          {isLoading ? (<div className="flex items-center justify-center h-32">
              <div className="animate-spin w-6 h-6 border-4 border-primary-600 border-t-transparent rounded-full"/>
            </div>) : timeSlots && timeSlots.length > 0 ? (<RadioGroup value={(selectedTimeSlotId === null || selectedTimeSlotId === void 0 ? void 0 : selectedTimeSlotId.toString()) || ""} onValueChange={function (value) { return setSelectedTimeSlotId(parseInt(value)); }}>
              <div className="grid md:grid-cols-2 gap-4">
                {timeSlots.map(function (slot) { return (<div key={slot.id} className="relative">
                    <RadioGroupItem value={slot.id.toString()} id={slot.id.toString()} className="sr-only"/>
                    <Label htmlFor={slot.id.toString()} className={"cursor-pointer block p-4 border-2 rounded-lg transition-colors ".concat(selectedTimeSlotId === slot.id
                    ? "border-primary-500 bg-primary-50"
                    : "border-slate-200 hover:border-primary-300")}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-900">
                          {slot.startTime === "08:00" ? "Matin" : "Après-midi"}
                        </h4>
                        <span className="text-red-600 text-sm flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1"/>
                          Disponible
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{slot.startTime} - {slot.endTime}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Livraison entre {slot.startTime} et {slot.endTime}
                      </p>
                    </Label>
                  </div>); })}
              </div>
            </RadioGroup>) : (<Alert>
              <XCircle className="h-4 w-4"/>
              <AlertDescription>
                Aucun créneau disponible pour cette date. Veuillez sélectionner une autre date.
              </AlertDescription>
            </Alert>)}
        </CardContent>
      </Card>

      {/* Pickup Options */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Date de récupération</h3>
          <RadioGroup value={pickupOption} onValueChange={function (value) { return setPickupOption(value); }}>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto" id="pickup-auto"/>
                <Label htmlFor="pickup-auto" className="text-sm text-slate-700">
                  Récupération automatique (fin de période de location)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="pickup-manual"/>
                <Label htmlFor="pickup-manual" className="text-sm text-slate-700">
                  Je choisis ma date de récupération
                </Label>
              </div>
            </div>
          </RadioGroup>
          
          {pickupOption === "auto" && selectedDate && (<Alert className="mt-4 border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600"/>
              <AlertDescription className="text-blue-800">
                Récupération prévue le{' '}
                <strong>
                  {new Date(new Date(selectedDate).getTime() + bookingData.durationDays * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}
                </strong>{' '}
                entre 8h et 12h (fin de période de {bookingData.durationDays} jour{bookingData.durationDays > 1 ? 's' : ''})
              </AlertDescription>
            </Alert>)}
        </CardContent>
      </Card>
    </div>);
}
