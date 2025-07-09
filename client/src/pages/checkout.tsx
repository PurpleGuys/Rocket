// Stripe imports supprimés en mode test
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Calendar, AlertTriangle, Home, Phone, X } from "lucide-react";
import { Link } from "wouter";

// Stripe imports supprimés pour mode test

interface BookingDetails {
  serviceId: number;
  serviceName: string;
  serviceVolume: number;
  address: string;
  postalCode: string;
  city: string;
  wasteTypes: string[];
  distance: number;
  pricing: {
    service: number;
    transport: number;
    total: number;
  };
}

const CheckoutForm = ({ bookingDetails }: { bookingDetails: BookingDetails }) => {
  // Mode test sans Stripe - pas besoin des hooks useStripe et useElements
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Récupérer les dates du localStorage
  const savedDates = localStorage.getItem('bookingDates');
  const parsedDates = savedDates ? JSON.parse(savedDates) : null;
  const [selectedDate, setSelectedDate] = useState(parsedDates?.deliveryDate || "");
  const [pickupDate] = useState(parsedDates?.pickupDate || "");
  
  // États pour les cases à cocher obligatoires
  const [evacuationConditions, setEvacuationConditions] = useState({
    heightLimit: false,
    noDangerousWaste: false,
    spaceRequirements: false,
    groundProtection: false,
  });
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérifier que toutes les conditions sont acceptées
    const allEvacuationConditions = Object.values(evacuationConditions).every(Boolean);
    if (!allEvacuationConditions || !acceptTerms) {
      toast({
        title: "Conditions requises",
        description: "Veuillez accepter toutes les conditions d'évacuation et les conditions générales pour continuer.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDate) {
      toast({
        title: "Date requise",
        description: "Veuillez sélectionner une date souhaitée pour la livraison.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Mode test sans Stripe - créer directement la commande
      const orderData = {
        serviceId: bookingDetails.serviceId,
        address: bookingDetails.address,
        postalCode: bookingDetails.postalCode,
        city: bookingDetails.city,
        wasteTypes: bookingDetails.wasteTypes,
        deliveryDate: selectedDate,
        totalAmount: bookingDetails.pricing.total,
        paymentStatus: 'pending', // En attente de paiement en mode test
        conditions: {
          evacuationConditions,
          acceptTerms
        }
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        
        // Nettoyer le sessionStorage
        sessionStorage.removeItem('bookingDetails');
        
        toast({
          title: "Commande créée",
          description: `Votre commande #${order.id} a été créée avec succès. Statut: En attente de paiement.`,
        });
        
        // Rediriger vers la page de succès ou dashboard
        setLocation('/dashboard');
      } else {
        throw new Error('Erreur lors de la création de la commande');
      }
    } catch (err) {
      console.error('Erreur création commande:', err);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la commande",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Résumé de la commande */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Résumé de votre commande</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">{bookingDetails.serviceName}</h3>
            <p className="text-gray-600">Volume: {bookingDetails.serviceVolume}m³</p>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium">Adresse de livraison</h4>
            <p className="text-gray-600">
              {bookingDetails.address}<br />
              {bookingDetails.postalCode} {bookingDetails.city}
            </p>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium">Types de déchets</h4>
            <ul className="text-gray-600">
              {bookingDetails.wasteTypes.map((waste, index) => (
                <li key={index}>• {waste}</li>
              ))}
            </ul>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Service</span>
              <span>{bookingDetails.pricing.service.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between">
              <span>Transport ({bookingDetails.distance} km aller-retour)</span>
              <span>{bookingDetails.pricing.transport.toFixed(2)}€</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total TTC</span>
              <span className="text-red-600">{bookingDetails.pricing.total.toFixed(2)}€</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire de paiement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Paiement sécurisé</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Conditions d'évacuation obligatoires */}
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h4 className="font-semibold text-red-900">Conditions d'évacuation *</h4>
              </div>
              <p className="text-sm text-red-800">Toutes les conditions suivantes doivent être acceptées :</p>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="height-limit"
                    checked={evacuationConditions.heightLimit}
                    onCheckedChange={(checked) => 
                      setEvacuationConditions(prev => ({ ...prev, heightLimit: !!checked }))
                    }
                    className="mt-1"
                  />
                  <label htmlFor="height-limit" className="text-sm text-gray-700 cursor-pointer">
                    Je m'engage à ne pas dépasser la hauteur maximale autorisée de la benne (soit à la hauteur des ridelles)
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="no-dangerous-waste"
                    checked={evacuationConditions.noDangerousWaste}
                    onCheckedChange={(checked) => 
                      setEvacuationConditions(prev => ({ ...prev, noDangerousWaste: !!checked }))
                    }
                    className="mt-1"
                  />
                  <label htmlFor="no-dangerous-waste" className="text-sm text-gray-700 cursor-pointer">
                    Je confirme l'absence de déchets dangereux (Solvants, Amiante, Pneus, peinture, enrobé goudron sans analyse HAP, etc.)
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="space-requirements"
                    checked={evacuationConditions.spaceRequirements}
                    onCheckedChange={(checked) => 
                      setEvacuationConditions(prev => ({ ...prev, spaceRequirements: !!checked }))
                    }
                    className="mt-1"
                  />
                  <label htmlFor="space-requirements" className="text-sm text-gray-700 cursor-pointer">
                    Je dispose de 4m de haut, 3m de large, 10m de long sans obstacle pour assurer la dépose de la benne
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="ground-protection"
                    checked={evacuationConditions.groundProtection}
                    onCheckedChange={(checked) => 
                      setEvacuationConditions(prev => ({ ...prev, groundProtection: !!checked }))
                    }
                    className="mt-1"
                  />
                  <label htmlFor="ground-protection" className="text-sm text-gray-700 cursor-pointer">
                    Je suis responsable de protéger le sol sur lequel sera posée la benne (par exemple avec des bastaings en bois)
                  </label>
                </div>
              </div>
            </div>

            {/* Conditions générales */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-gray-900">Conditions générales *</h4>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="accept-terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(!!checked)}
                  className="mt-1"
                />
                <label htmlFor="accept-terms" className="text-sm text-gray-700 cursor-pointer">
                  Je reconnais avoir pris connaissance et j'accepte les{' '}
                  <a href="/legal" target="_blank" className="text-red-600 underline hover:text-red-700">
                    conditions générales d'utilisation (CGU)
                  </a>
                  {' '}et les{' '}
                  <a href="/legal" target="_blank" className="text-red-600 underline hover:text-red-700">
                    Conditions Générales de Ventes (CGV)
                  </a>
                </label>
              </div>
            </div>

            {/* Section paiement - mode test sans Stripe */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800">Mode Test - Stripe Désactivé</h4>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                Le paiement en ligne est temporairement désactivé. Votre commande sera créée avec le statut "En attente de paiement".
              </p>
              <div className="bg-white p-3 rounded border">
                <h5 className="font-medium text-gray-900 mb-2">Total à payer :</h5>
                <div className="text-2xl font-bold text-red-600">
                  {bookingDetails.pricing.total.toFixed(2)}€ TTC
                </div>
              </div>
            </div>
            
            {/* Mentions légales obligatoires */}
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 space-y-2">
              <h4 className="font-semibold text-gray-900">Informations légales :</h4>
              <ul className="space-y-1 text-xs">
                <li>• Prix TTC incluant TVA 20% applicable aux prestations de collecte</li>
                <li>• Prestation soumise au Code de l'environnement (déchets)</li>
                <li>• Traitement en centre agréé ICPE selon réglementation</li>
                <li>• Bordereau de suivi de déchets (BSD) fourni</li>
                <li>• Droit de rétractation : 14 jours (Art. L221-18 Code consommation)</li>
                <li>• Réclamations : service.client@remondis.fr</li>
              </ul>
            </div>
            
            <Button 
              type="submit" 
              disabled={isProcessing}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {isProcessing ? "Traitement..." : `Créer la commande - ${bookingDetails.pricing.total.toFixed(2)}€`}
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              En finalisant votre commande, vous acceptez nos conditions générales de vente et notre politique de confidentialité.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Checkout() {
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Récupérer les détails de réservation depuis sessionStorage
    const details = sessionStorage.getItem('bookingDetails');
    if (!details) {
      toast({
        title: "Erreur",
        description: "Aucune réservation en cours. Retour à l'accueil.",
        variant: "destructive",
      });
      setLocation('/');
      return;
    }

    const parsedDetails = JSON.parse(details);
    setBookingDetails(parsedDetails);

    // En mode test sans Stripe, pas besoin de créer une intention de paiement
    // createPaymentIntent(parsedDetails);
  }, []);

  const createPaymentIntent = async (details: BookingDetails) => {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: details.pricing.total,
          orderId: `booking-${Date.now()}`, // ID temporaire pour la réservation
          bookingDetails: details
        })
      });

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de préparer le paiement",
        variant: "destructive",
      });
      setLocation('/');
    }
  };

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
      </div>
    );
  }

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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Finaliser votre réservation</h1>
          <p className="text-gray-600">Complétez votre paiement pour confirmer votre commande</p>
        </div>

        {/* Mode test sans Stripe Elements */}
        <CheckoutForm bookingDetails={bookingDetails} />
      </div>
    </div>
  );
}