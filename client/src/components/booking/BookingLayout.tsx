import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useBookingState } from "@/hooks/useBookingState";

interface BookingLayoutProps {
  children: ReactNode;
  step: number;
  title: string;
  subtitle?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  canContinue?: boolean;
  showProgress?: boolean;
}

export default function BookingLayout({
  children,
  step,
  title,
  subtitle,
  onPrevious,
  onNext,
  nextLabel = "Continuer",
  canContinue = true,
  showProgress = true
}: BookingLayoutProps) {
  const { currentStep } = useBookingState();
  
  const steps = [
    { id: 1, name: "Service", description: "Choisir votre benne" },
    { id: 2, name: "Adresse", description: "Lieu de livraison" },
    { id: 3, name: "Dates", description: "Planning" },
    { id: 4, name: "Paiement", description: "Finaliser" },
    { id: 5, name: "Confirmation", description: "Terminé" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50">
      {/* Progress Bar */}
      {showProgress && (
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              {steps.map((stepItem, index) => {
                const isCompleted = stepItem.id < currentStep;
                const isCurrent = stepItem.id === currentStep;
                const isUpcoming = stepItem.id > currentStep;
                
                return (
                  <div key={stepItem.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                          isCompleted
                            ? "bg-green-600 text-white"
                            : isCurrent
                            ? "bg-red-600 text-white ring-4 ring-red-200"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          stepItem.id
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <div className={`text-sm font-medium ${isCurrent ? "text-red-600" : "text-slate-600"}`}>
                          {stepItem.name}
                        </div>
                        <div className="text-xs text-slate-500">{stepItem.description}</div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-16 h-px mx-4 ${
                          stepItem.id < currentStep ? "bg-green-400" : "bg-slate-300"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-3">{title}</h1>
              {subtitle && (
                <p className="text-xl text-slate-600">{subtitle}</p>
              )}
            </div>

            {/* Content */}
            <div className="mb-8">
              {children}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={onPrevious}
                disabled={!onPrevious}
                className="flex items-center px-6 py-3"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>

              <Button
                onClick={onNext}
                disabled={!canContinue || !onNext}
                className="flex items-center px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                {nextLabel}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}