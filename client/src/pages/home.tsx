import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ServiceSelection from "@/components/booking/ServiceSelection";
import AddressInput from "@/components/booking/AddressInput";
import TimeSlotSelection from "@/components/booking/TimeSlotSelection";
import PaymentStep from "@/components/booking/PaymentStep";
import OrderConfirmation from "@/components/booking/OrderConfirmation";
import PricingSummary from "@/components/PricingSummary";
import { useBookingState } from "@/hooks/useBookingState";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { Clock, Shield, Truck, CheckCircle, Calculator, Play, User, LogOut, Settings, LayoutDashboard, ShieldCheck } from "lucide-react";

export default function Home() {
  const [showBooking, setShowBooking] = useState(false);
  const { currentStep, setCurrentStep, bookingData, resetBooking } = useBookingState();
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = useLogout();
  const [, navigate] = useLocation();

  const handleStartBooking = () => {
    setShowBooking(true);
    setCurrentStep(1);
  };

  const handleCloseBooking = () => {
    setShowBooking(false);
    resetBooking();
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

  if (currentStep === 5) {
    return <OrderConfirmation onNewOrder={handleCloseBooking} />;
  }

  if (showBooking) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-primary-600">
                  <i className="fas fa-dumpster mr-2"></i>BennesPro
                </span>
              </div>
              <Button variant="ghost" onClick={handleCloseBooking}>
                ✕
              </Button>
            </div>
          </div>
        </nav>

        {/* Progress Steps */}
        <div className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-slate-900">{getStepTitle()}</h1>
            </div>
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step <= currentStep 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {step}
                  </div>
                  <span className={`ml-2 text-sm font-medium hidden sm:inline ${
                    step <= currentStep ? 'text-primary-600' : 'text-slate-400'
                  }`}>
                    {step === 1 && 'Service'}
                    {step === 2 && 'Adresse'}
                    {step === 3 && 'Créneau'}
                    {step === 4 && 'Paiement'}
                  </span>
                  {step < 4 && <div className="flex-1 h-px bg-slate-200 mx-4"></div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {renderStepContent()}
            </div>
            <div className="lg:col-span-1">
              <PricingSummary />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/3/32/Remondis_logo.svg" 
                alt="Remondis" 
                className="h-8 w-auto"
              />
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {/* Admin Panel Button */}
                  {user?.role === 'admin' && (
                    <Button 
                      variant="outline" 
                      className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                      onClick={() => navigate("/admin")}
                    >
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Panneau Admin
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                        <User className="h-4 w-4 mr-2" />
                        {user?.firstName} {user?.lastName}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Tableau de bord
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/profile")}>
                        <Settings className="h-4 w-4 mr-2" />
                        Mon profil
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => logoutMutation.mutate()}
                        className="text-red-600"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Déconnexion
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button 
                  variant="ghost" 
                  className="text-gray-600 hover:text-gray-900"
                  onClick={() => navigate("/auth")}
                >
                  <User className="h-4 w-4 mr-1" />
                  Connexion / Inscription
                </Button>
              )}
              <Button onClick={handleStartBooking} className="bg-green-600 hover:bg-green-700 text-white">
                Réserver une benne
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Direct booking interface */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Calculez le prix de votre benne en temps réel
          </h1>
          <p className="text-xl text-gray-600">
            Choisissez votre benne, indiquez vos déchets et obtenez instantanément votre devis
          </p>
        </div>

        {/* Quick Booking Form */}
        <Card className="max-w-4xl mx-auto shadow-xl">
          <CardContent className="p-8">
            <ServiceSelection />
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Pourquoi choisir Remondis ?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-lg border-green-100">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="text-green-600 h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Service 24h/24</h3>
                <p className="text-gray-600">Réservation en ligne disponible à tout moment avec confirmation immédiate.</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg border-green-100">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="text-green-600 h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Expertise environnementale</h3>
                <p className="text-gray-600">Leader européen de la gestion des déchets avec 40 ans d'expérience.</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg border-green-100">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Truck className="text-green-600 h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Livraison garantie</h3>
                <p className="text-gray-600">Livraison et récupération ponctuelles dans toute la France.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/3/32/Remondis_logo.svg" 
                alt="Remondis" 
                className="h-6 w-auto mb-4 brightness-0 invert"
              />
              <p className="text-gray-400 text-sm">Spécialiste européen de la gestion des déchets et du recyclage pour professionnels et particuliers.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-green-400">Location de bennes</a></li>
                <li><a href="#" className="hover:text-green-400">Collecte des déchets</a></li>
                <li><a href="#" className="hover:text-green-400">Recyclage</a></li>
                <li><a href="#" className="hover:text-green-400">Valorisation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-green-400">Contact</a></li>
                <li><a href="#" className="hover:text-green-400">FAQ</a></li>
                <li><a href="#" className="hover:text-green-400">Suivi commande</a></li>
                <li><a href="#" className="hover:text-green-400">Service client</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-green-400">Mentions légales</a></li>
                <li><a href="#" className="hover:text-green-400">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-green-400">CGV</a></li>
                <li><a href="#" className="hover:text-green-400">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-gray-400 text-center">
            <p>&copy; 2024 Remondis. Tous droits réservés. Conforme RGPD.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
