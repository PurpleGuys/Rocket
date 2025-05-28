import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ServiceSelection from "@/components/booking/ServiceSelection";
import AddressInput from "@/components/booking/AddressInput";
import TimeSlotSelection from "@/components/booking/TimeSlotSelection";
import PaymentStep from "@/components/booking/PaymentStep";
import OrderConfirmation from "@/components/booking/OrderConfirmation";
import PricingSummary from "@/components/PricingSummary";
import { useBookingState } from "@/hooks/useBookingState";
import { Clock, Shield, Truck, CheckCircle, Calculator, Play, User } from "lucide-react";

export default function Home() {
  const [showBooking, setShowBooking] = useState(false);
  const { currentStep, setCurrentStep, bookingData, resetBooking } = useBookingState();

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
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">
                <i className="fas fa-dumpster mr-2"></i>BennesPro
              </span>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <a href="#services" className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium">Services</a>
                  <a href="#pricing" className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium">Tarifs</a>
                  <a href="#contact" className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium">Contact</a>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                <User className="h-4 w-4 mr-1" />
                Connexion
              </Button>
              <Button onClick={handleStartBooking} className="bg-primary-600 hover:bg-primary-700">
                Réserver une benne
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                Location de bennes professionnelle en quelques clics
              </h1>
              <p className="text-xl text-slate-600 mb-8">
                Réservez votre benne en ligne, choisissez votre créneau de livraison et payez en toute sécurité. 
                Service rapide pour professionnels et particuliers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleStartBooking}
                  size="lg"
                  className="bg-primary-600 hover:bg-primary-700 text-lg px-8 py-4 h-auto"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Commencer ma réservation
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-8 py-4 h-auto"
                >
                  <Calculator className="mr-2 h-5 w-5" />
                  Calculer le prix
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Chantier professionnel avec benne de location" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Pourquoi choisir BennesPro ?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="text-primary-600 h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Réservation instantanée</h3>
                <p className="text-slate-600">Réservez votre benne en ligne 24h/24, 7j/7. Confirmation immédiate par email.</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="text-emerald-600 h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Paiement sécurisé</h3>
                <p className="text-slate-600">Transactions protégées par Stripe et PayPal. Vos données sont en sécurité.</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                  <Truck className="text-amber-600 h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Livraison rapide</h3>
                <p className="text-slate-600">Livraison et récupération dans les créneaux que vous choisissez.</p>
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
              <div className="flex items-center mb-4">
                <span className="text-lg font-bold text-primary-400">
                  <i className="fas fa-dumpster mr-2"></i>BennesPro
                </span>
              </div>
              <p className="text-gray-400 text-sm">Location de bennes professionnelle pour particuliers et entreprises. Service rapide et fiable partout en France.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-primary-400">Location de bennes</a></li>
                <li><a href="#" className="hover:text-primary-400">Évacuation déchets</a></li>
                <li><a href="#" className="hover:text-primary-400">Transport</a></li>
                <li><a href="#" className="hover:text-primary-400">Conseils</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-primary-400">Contact</a></li>
                <li><a href="#" className="hover:text-primary-400">FAQ</a></li>
                <li><a href="#" className="hover:text-primary-400">Suivi commande</a></li>
                <li><a href="#" className="hover:text-primary-400">Réclamations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-primary-400">Mentions légales</a></li>
                <li><a href="#" className="hover:text-primary-400">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-primary-400">CGV</a></li>
                <li><a href="#" className="hover:text-primary-400">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-gray-400 text-center">
            <p>&copy; 2024 BennesPro. Tous droits réservés. Conforme RGPD.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
