import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ServiceSelection from "@/components/booking/ServiceSelection";
import AddressInput from "@/components/booking/AddressInput";
import TimeSlotSelection from "@/components/booking/TimeSlotSelection";
import PaymentStep from "@/components/booking/PaymentStep";
import OrderConfirmation from "@/components/booking/OrderConfirmation";
import PricingSummary from "@/components/PricingSummary";
import { useBookingState } from "@/hooks/useBookingState";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Check } from "lucide-react";

export default function Booking() {
  const { currentStep, setCurrentStep, bookingData, resetBooking } = useBookingState();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Rediriger vers l'authentification si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const handleCloseBooking = () => {
    resetBooking();
    navigate('/');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ServiceSelection />;
      case 2:
        return <AddressInput />;
      case 3:
        return <TimeSlotSelection />;
      case 4:
        return <PaymentStep />;
      case 5:
        return <OrderConfirmation onNewOrder={handleCloseBooking} />;
      default:
        return <ServiceSelection />;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Sélectionnez votre service";
      case 2: return "Adresse de livraison";
      case 3: return "Choisissez votre créneau";
      case 4: return "Paiement sécurisé";
      case 5: return "Commande confirmée";
      default: return "Réservation";
    }
  };

  // Si la commande est confirmée, afficher seulement la confirmation
  if (currentStep === 5) {
    return <OrderConfirmation onNewOrder={handleCloseBooking} />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Connexion requise</h2>
            <p className="text-slate-600 mb-6">
              Vous devez être connecté pour réserver une benne.
            </p>
            <Button 
              onClick={() => navigate('/auth')} 
              className="bg-red-600 hover:bg-red-700"
            >
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/3/32/Remondis_logo.svg" 
                alt="Remondis" 
                className="h-8 w-auto mr-4"
              />
              <span className="text-xl font-bold text-slate-900">Réservation de benne</span>
            </div>
            <Button variant="ghost" onClick={handleCloseBooking}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </nav>

      {/* Progress Steps */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step 
                    ? 'bg-red-600 text-white' 
                    : 'bg-slate-200 text-slate-600'
                  }
                `}>
                  {currentStep > step ? <Check className="h-4 w-4" /> : step}
                </div>
                {step < 4 && (
                  <div className={`
                    w-16 h-0.5 mx-2
                    ${currentStep > step ? 'bg-red-600' : 'bg-slate-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  {getStepTitle()}
                </h2>
                {renderStepContent()}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Pricing Summary */}
          <div className="lg:col-span-1">
            <PricingSummary />
          </div>
        </div>
      </div>
    </div>
  );
}