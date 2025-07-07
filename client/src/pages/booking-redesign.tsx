import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBookingState } from "@/hooks/useBookingState";
import ServiceSelection from "@/components/booking/ServiceSelection";
import AddressInput from "@/components/booking/AddressInput";
import TimeSlotSelection from "@/components/booking/TimeSlotSelection";
import PaymentStep from "@/components/booking/PaymentStep";
import GradientBackground from "@/components/ui/gradient-background";
import { CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

export default function BookingRedesign() {
  const { currentStep, setCurrentStep, bookingData } = useBookingState();

  const steps = [
    { id: 1, name: "Service", icon: "🚛", description: "Choisir votre benne" },
    { id: 2, name: "Adresse", icon: "📍", description: "Lieu de livraison" },
    { id: 3, name: "Dates", icon: "📅", description: "Planning" },
    { id: 4, name: "Paiement", icon: "💳", description: "Finaliser" },
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
    <GradientBackground>
      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isCurrent
                            ? "bg-red-600 text-white ring-4 ring-red-200 scale-110"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isCompleted ? <CheckCircle className="h-8 w-8" /> : step.icon}
                      </div>
                      <div className="mt-3 text-center">
                        <div className={`text-sm font-semibold ${isCurrent ? "text-red-600" : "text-slate-600"}`}>
                          {step.name}
                        </div>
                        <div className="text-xs text-slate-500">{step.description}</div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-24 h-1 mx-4 ${
                          step.id < currentStep ? "bg-green-400" : "bg-slate-300"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto">
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardContent className="p-8 md:p-12">
              {getStepComponent()}
              
              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-8 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={currentStep === 1}
                  className="flex items-center px-6 py-3 text-lg"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Retour
                </Button>

                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canContinue() || currentStep === 4}
                  className="flex items-center px-8 py-3 bg-red-600 hover:bg-red-700 text-white text-lg font-semibold"
                >
                  {currentStep === 4 ? "Payer" : "Continuer"}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </GradientBackground>
  );
}