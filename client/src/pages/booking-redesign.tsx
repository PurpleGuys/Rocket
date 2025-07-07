import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBookingState } from "@/hooks/useBookingState";
import ServiceSelection from "@/components/booking/ServiceSelection";
import AddressInput from "@/components/booking/AddressInput";
import TimeSlotSelection from "@/components/booking/TimeSlotSelection";
import PaymentStep from "@/components/booking/PaymentStep";
import { CheckCircle, ArrowRight, ArrowLeft, ShoppingCart, MapPin, Calendar, CreditCard } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function BookingRedesign() {
  const { currentStep, setCurrentStep, bookingData } = useBookingState();

  const steps = [
    { id: 1, name: "Service", icon: ShoppingCart, description: "Choisir votre benne" },
    { id: 2, name: "Adresse", icon: MapPin, description: "Lieu de livraison" },
    { id: 3, name: "Dates", icon: Calendar, description: "Planning" },
    { id: 4, name: "Paiement", icon: CreditCard, description: "Finaliser" },
  ];

  const getStepComponent = () => {
    switch (currentStep) {
      case 1:
        return <ServiceSelection />;
      case 2:
        return <AddressInput />;
      case 3:
        return <TimeSlotSelection />;
      case 4:
        return <PaymentStep />;
      default:
        return <ServiceSelection />;
    }
  };

  const canContinue = () => {
    switch (currentStep) {
      case 1:
        return bookingData.service !== null;
      case 2:
        return bookingData.address !== null;
      case 3:
        return bookingData.deliveryTimeSlot !== null;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Réservation de benne</h1>
        
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <Progress value={(currentStep / 4) * 100} className="h-2 mb-6" />
          <div className="flex justify-between">
            {steps.map((step) => {
              const Icon = step.icon;
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? "bg-green-600 text-white"
                        : isCurrent
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${isCurrent ? "text-red-600" : "text-gray-600"}`}>
                      {step.name}
                    </div>
                    <div className="text-xs text-gray-500 hidden sm:block">{step.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].name}</CardTitle>
              <CardDescription>{steps[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {getStepComponent()}
              
              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={currentStep === 1}
                  className="flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>

                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canContinue() || currentStep === 4}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {currentStep === 4 ? "Payer" : "Continuer"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}