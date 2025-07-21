import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Calendar,
  MapPin,
  Euro,
  ArrowRight,
  Package,
  X
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CartItem {
  id: number;
  serviceId: number;
  wasteTypeId: number;
  quantity: number;
  transportDistance?: number;
  transportPrice?: string;
  rentalPrice?: string;
  treatmentPrice?: string;
  totalPrice: string;
  deliveryAddress: string;
  deliveryPostalCode: string;
  deliveryCity: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  pickupDate?: string;
  pickupTimeSlot?: string;
  notes?: string;
  // Relations
  service?: {
    name: string;
    volume: number;
    imageUrl?: string;
  };
  wasteType?: {
    name: string;
    code: string;
  };
}

export default function Cart() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [sessionId] = useState(() => {
    // Generate or get session ID
    let sid = localStorage.getItem('session_id');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('session_id', sid);
    }
    return sid;
  });

  // Fetch cart items
  const { data: cartItems = [], isLoading } = useQuery<CartItem[]>({
    queryKey: ['/api/cart'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/cart', null, {
        'X-Session-ID': sessionId
      });
      return response.json();
    }
  });

  // Update cart item
  const updateMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const response = await apiRequest('PUT', `/api/cart/${id}`, { quantity });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    }
  });

  // Delete cart item
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Article supprimé",
        description: "L'article a été retiré de votre panier"
      });
    }
  });

  // Clear cart
  const clearMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/cart', null, {
        'X-Session-ID': sessionId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Panier vidé",
        description: "Tous les articles ont été supprimés"
      });
    }
  });

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.totalPrice || '0'), 0);
  const tax = subtotal * 0.20; // TVA 20%
  const total = subtotal + tax;

  const handleQuantityChange = (item: CartItem, delta: number) => {
    const newQuantity = Math.max(1, item.quantity + delta);
    updateMutation.mutate({ id: item.id, quantity: newQuantity });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des articles avant de continuer",
        variant: "destructive"
      });
      return;
    }
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Mon Panier</h1>
      </div>

      {cartItems.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Votre panier est vide</h2>
            <p className="text-gray-600 mb-6">Ajoutez des services pour commencer</p>
            <Button onClick={() => navigate('/booking')} className="gap-2">
              <ArrowRight className="h-4 w-4" />
              Découvrir nos services
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">{cartItems.length} article{cartItems.length > 1 ? 's' : ''}</p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => clearMutation.mutate()}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Vider le panier
              </Button>
            </div>

            {cartItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Image */}
                    <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.service?.imageUrl ? (
                        <img 
                          src={item.service.imageUrl} 
                          alt={item.service.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{item.service?.name}</h3>
                          <p className="text-sm text-gray-600">{item.service?.volume}m³ - {item.wasteType?.name}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{item.deliveryAddress}, {item.deliveryPostalCode} {item.deliveryCity}</span>
                        </div>
                        {item.deliveryDate && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Livraison: {format(new Date(item.deliveryDate), 'dd MMMM yyyy', { locale: fr })}
                              {item.deliveryTimeSlot && ` - ${item.deliveryTimeSlot}`}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(item, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(item, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-lg font-semibold">{parseFloat(item.totalPrice).toFixed(2)} €</div>
                          {item.quantity > 1 && (
                            <div className="text-sm text-gray-500">
                              {(parseFloat(item.totalPrice) / item.quantity).toFixed(2)} € / unité
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="mt-4 pt-4 border-t text-sm space-y-1">
                    <div className="flex justify-between text-gray-600">
                      <span>Location:</span>
                      <span>{item.rentalPrice} €</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Transport:</span>
                      <span>{item.transportPrice} €</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Traitement:</span>
                      <span>{item.treatmentPrice} €</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Résumé de la commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TVA (20%)</span>
                    <span>{tax.toFixed(2)} €</span>
                  </div>
                  <div className="pt-2 border-t font-semibold text-lg">
                    <div className="flex justify-between">
                      <span>Total TTC</span>
                      <span className="text-primary">{total.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleCheckout}
                  className="w-full gap-2"
                  size="lg"
                  disabled={cartItems.length === 0}
                >
                  <Euro className="h-5 w-5" />
                  Procéder au paiement
                </Button>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => navigate('/booking')}
                    className="text-sm"
                  >
                    Continuer vos achats
                  </Button>
                </div>

                {/* Security badges */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                    <img 
                      src="https://js.stripe.com/v3/fingerprinted/img/payment-methods/icon-mastercard-2dd8ee27872e1c80adf35bf1c9afd295.svg"
                      alt="Mastercard"
                      className="h-6"
                    />
                    <img 
                      src="https://js.stripe.com/v3/fingerprinted/img/payment-methods/icon-visa-365725c3f7b0dc7cf6ed09de818c8b3d.svg"
                      alt="Visa"
                      className="h-6"
                    />
                    <span className="ml-2">Paiement 100% sécurisé</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}