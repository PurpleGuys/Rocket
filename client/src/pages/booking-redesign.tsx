import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBookingState } from "@/hooks/useBookingState";
import ServiceSelection from "@/components/booking/ServiceSelection";
import AddressInput from "@/components/booking/AddressInput";
import TimeSlotSelection from "@/components/booking/TimeSlotSelection";
import PaymentStep from "@/components/booking/PaymentStep";
import { CheckCircle, ArrowRight, ArrowLeft, ShoppingCart, MapPin, Calendar, CreditCard, Home, Phone, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export default function BookingRedesign() {
  const { currentStep, setCurrentStep, bookingData } = useBookingState();
  const [, navigate] = useLocation();

  // Get current user
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false
  });

  // Logout mutation  
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
    },
    onSuccess: () => {
      localStorage.removeItem('auth_token');
      queryClient.clear();
      navigate('/');
    },
  });

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
      {/* Navigation Header - Matching home page style */}
      <nav className="bg-white shadow-lg border-b-2 border-red-600 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/32/Remondis_logo.svg" 
                  alt="Remondis" 
                  className="h-10 sm:h-12 w-auto cursor-pointer"
                />
              </Link>
              <div className="hidden md:flex items-center space-x-2 ml-8">
                <Link href="/" className="text-gray-700 hover:text-red-600 font-medium transition-colors px-3 py-2">
                  <Home className="h-4 w-4 inline mr-1" />
                  Accueil
                </Link>
                <Link href="/faq" className="text-gray-700 hover:text-red-600 font-medium transition-colors px-3 py-2">
                  FAQ
                </Link>
                <a href="tel:0344451158" className="text-gray-700 hover:text-red-600 font-medium transition-colors px-3 py-2">
                  <Phone className="h-4 w-4 inline mr-1" />
                  03 44 45 11 58
                </a>
              </div>
            </div>
            {/* Boutons desktop */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              {user ? (
                <>
                  <Link href={user.role === 'admin' ? '/dashboard' : '/client-dashboard'}>
                    <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50 text-sm lg:text-base px-3 lg:px-4">
                      {user.role === 'admin' ? 'Admin Panel' : 'Mon Dashboard'}
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="text-gray-600 hover:text-red-600"
                    onClick={() => logoutMutation.mutate()}
                  >
                    Déconnexion
                  </Button>
                </>
              ) : (
                <Link href="/auth">
                  <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50 text-sm lg:text-base px-3 lg:px-4">
                    Se connecter
                  </Button>
                </Link>
              )}
              <Link href="/">
                <Button 
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-red-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            {/* Mobile close button */}
            <div className="md:hidden">
              <Link href="/">
                <Button 
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-red-600"
                >
                  <X className="h-6 w-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Réservation de benne</h1>
          <p className="text-gray-600">Simplifiez la gestion de vos déchets en quelques clics</p>
        </div>
        
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