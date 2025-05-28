import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBookingState } from "@/hooks/useBookingState";
import { Receipt, Shield, Truck, Phone, Save, ArrowRight, ArrowLeft } from "lucide-react";

export default function PricingSummary() {
  const { currentStep, setCurrentStep, bookingData, calculateTotalPrice } = useBookingState();
  
  const pricing = calculateTotalPrice();
  const canProceed = currentStep === 1 ? bookingData.service : true;

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Card className="sticky top-8 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Receipt className="h-5 w-5 mr-2 text-primary-600" />
          Récapitulatif
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Service Summary */}
        {bookingData.service && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Service sélectionné:</span>
              <span className="font-medium">{bookingData.service.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Durée:</span>
              <span className="font-medium">{bookingData.durationDays} jour{bookingData.durationDays > 1 ? 's' : ''}</span>
            </div>
            {bookingData.wasteTypes && bookingData.wasteTypes.length > 0 && (
              <div className="space-y-1">
                <span className="text-sm text-slate-600">Types de déchets:</span>
                <div className="flex flex-wrap gap-1">
                  {bookingData.wasteTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Address Summary */}
        {bookingData.address && (
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="text-sm">
              <div className="text-slate-600 mb-1">Adresse:</div>
              <div className="font-medium">
                {bookingData.address.street}<br />
                {bookingData.address.postalCode} {bookingData.address.city}
              </div>
            </div>
          </div>
        )}

        {/* Time Slot Summary */}
        {bookingData.deliveryTimeSlot && (
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="text-sm">
              <div className="text-slate-600 mb-1">Livraison:</div>
              <div className="font-medium">
                {new Date(bookingData.deliveryTimeSlot.date).toLocaleDateString('fr-FR')} de{' '}
                {bookingData.deliveryTimeSlot.startTime} à {bookingData.deliveryTimeSlot.endTime}
              </div>
            </div>
          </div>
        )}

        {/* Pricing Breakdown */}
        <div className="space-y-3 pt-3 border-t border-slate-200">
          {bookingData.service && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Prix de base:</span>
                <span className="font-medium">{parseFloat(bookingData.service.basePrice).toFixed(2)}€</span>
              </div>
              {bookingData.durationDays > 1 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Supplément durée:</span>
                  <span className="font-medium">+{pricing.durationPrice.toFixed(2)}€</span>
                </div>
              )}
              {pricing.deliveryFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Livraison:</span>
                  <span className="font-medium">+{pricing.deliveryFee.toFixed(2)}€</span>
                </div>
              )}
              <hr className="border-slate-200" />
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-slate-900">Total HT:</span>
                <span className="text-primary-600">{pricing.totalHT.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>TVA (20%):</span>
                <span>{pricing.vat.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-slate-900">
                <span>Total TTC:</span>
                <span>{pricing.totalTTC.toFixed(2)}€</span>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        {currentStep < 5 && (
          <div className="space-y-3 pt-3 border-t border-slate-200">
            {currentStep > 1 && (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handlePrevious}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            )}
            <Button 
              className="w-full bg-primary-600 hover:bg-primary-700" 
              onClick={handleNext}
              disabled={!canProceed}
            >
              {currentStep === 4 ? 'Payer' : 'Continuer'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button variant="outline" className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder le devis
            </Button>
          </div>
        )}

        {/* Trust Indicators */}
        <div className="pt-6 border-t border-slate-200">
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2 text-green-500" />
              <span>Paiement 100% sécurisé</span>
            </div>
            <div className="flex items-center">
              <Truck className="h-4 w-4 mr-2 text-green-500" />
              <span>Livraison garantie sous 48h</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-green-500" />
              <span>Support client 7j/7</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
