import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBookingState } from "@/hooks/useBookingState";
import { CheckCircle, Download, RotateCcw, Mail, Phone, Truck } from "lucide-react";

interface OrderConfirmationProps {
  onNewOrder: () => void;
}

export default function OrderConfirmation({ onNewOrder }: OrderConfirmationProps) {
  const { bookingData, calculateTotalPrice } = useBookingState();
  const pricing = calculateTotalPrice();
  
  // Generate a mock order number
  const orderNumber = `BNE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-red-600 h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Commande confirmée !</h1>
          <p className="text-xl text-slate-600">
            Votre benne sera livrée le{' '}
            <strong>
              {bookingData.deliveryTimeSlot 
                ? new Date(bookingData.deliveryTimeSlot.date).toLocaleDateString('fr-FR')
                : 'date à confirmer'
              }
            </strong>{' '}
            entre{' '}
            <strong>
              {bookingData.deliveryTimeSlot?.startTime} et {bookingData.deliveryTimeSlot?.endTime}
            </strong>
          </p>
        </div>

        <Card className="shadow-xl mb-8">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Détails de la commande</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Numéro de commande:</span>
                    <span className="font-mono font-medium">{orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Service:</span>
                    <span className="font-medium">
                      {bookingData.service?.name} - {bookingData.durationDays} jour{bookingData.durationDays > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Montant payé:</span>
                    <span className="font-bold text-red-600">{pricing.totalTTC.toFixed(2)}€ TTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Mode de paiement:</span>
                    <span className="font-medium">Carte bancaire</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Livraison</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-slate-600 block">Adresse:</span>
                    <span className="font-medium">
                      {bookingData.address?.street}<br />
                      {bookingData.address?.postalCode} {bookingData.address?.city}, {bookingData.address?.country}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Date et heure:</span>
                    <span className="font-medium">
                      {bookingData.deliveryTimeSlot 
                        ? `${new Date(bookingData.deliveryTimeSlot.date).toLocaleDateString('fr-FR')}, ${bookingData.deliveryTimeSlot.startTime}-${bookingData.deliveryTimeSlot.endTime}`
                        : 'À confirmer'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Récupération:</span>
                    <span className="font-medium">
                      {bookingData.pickupTimeSlot
                        ? `${new Date(bookingData.pickupTimeSlot.date).toLocaleDateString('fr-FR')}, ${bookingData.pickupTimeSlot.startTime}-${bookingData.pickupTimeSlot.endTime}`
                        : 'À confirmer'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-600" />
                Email de confirmation
              </h3>
              <p className="text-slate-600 mb-4">
                Un email de confirmation a été envoyé à{' '}
                <strong>{bookingData.customer?.email}</strong>
              </p>
              <p className="text-sm text-slate-500">
                Vous recevrez également des notifications pour le suivi de votre commande.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-red-600" />
                Besoin d'aide ?
              </h3>
              <p className="text-slate-600 mb-2">Notre équipe est disponible :</p>
              <p className="font-medium">📞 03 44 45 11 58</p>
              <p className="font-medium">✉️ contact@remondis.fr</p>
              <p className="text-sm text-slate-500 mt-2">Du lundi au vendredi, 8h-18h</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <Button className="bg-primary-600 hover:bg-primary-700 px-8">
            <Truck className="h-5 w-5 mr-2" />
            Suivre ma commande
          </Button>
          <Button 
            variant="outline" 
            onClick={onNewOrder}
            className="ml-4 px-8"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Nouvelle commande
          </Button>
        </div>
      </div>
    </div>
  );
}
