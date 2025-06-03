import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { HeroHeader } from "@/components/ui/hero-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { 
  Package, 
  Plus, 
  Calendar, 
  MapPin, 
  Truck, 
  Clock, 
  Repeat, 
  Edit3, 
  Trash2, 
  Eye,
  Download,
  Settings,
  Bell,
  CreditCard,
  User,
  ArrowLeft,
  Home
} from "lucide-react";

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  deliveryDate: string | null;
  confirmedDeliveryDate: string | null;
  address: string;
  postalCode: string;
  city: string;
  serviceName: string;
  serviceVolume: number;
  wasteTypes: string[];
  distance: number;
  transportCost: string;
  serviceCost: string;
}

interface RecurringOrder {
  id: number;
  name: string;
  serviceId: number;
  serviceName: string;
  frequency: string;
  nextExecution: string;
  isActive: boolean;
  address: string;
  city: string;
  wasteTypes: string[];
  totalAmount: string;
}

const statusColors = {
  'en_attente': 'bg-yellow-100 text-yellow-800',
  'confirme': 'bg-blue-100 text-blue-800',
  'en_cours': 'bg-orange-100 text-orange-800',
  'livre': 'bg-green-100 text-green-800',
  'termine': 'bg-gray-100 text-gray-800',
  'annule': 'bg-red-100 text-red-800'
};

const statusLabels = {
  'en_attente': 'En attente',
  'confirme': 'Confirmé',
  'en_cours': 'En cours',
  'livre': 'Livré',
  'termine': 'Terminé',
  'annule': 'Annulé'
};

export default function ClientDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [selectedTab, setSelectedTab] = useState("orders");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newRecurringOrder, setNewRecurringOrder] = useState({
    name: '',
    serviceId: '',
    frequency: '',
    address: '',
    postalCode: '',
    city: '',
    wasteTypes: [] as string[]
  });

  // Récupération des données
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders/my-orders'],
  });

  const { data: recurringOrders = [], isLoading: recurringLoading } = useQuery<RecurringOrder[]>({
    queryKey: ['/api/orders/recurring'],
  });

  const { data: services = [] } = useQuery<any[]>({
    queryKey: ['/api/services'],
  });

  const { data: wasteTypes = [] } = useQuery<any[]>({
    queryKey: ['/api/waste-types'],
  });

  // Mutations
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, updates }: { orderId: number; updates: any }) => {
      await apiRequest('PUT', `/api/orders/${orderId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders/my-orders'] });
      toast({
        title: "Commande mise à jour",
        description: "Votre commande a été modifiée avec succès.",
      });
      setEditingOrder(null);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la commande.",
        variant: "destructive",
      });
    }
  });

  const createRecurringOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', '/api/orders/recurring', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders/recurring'] });
      toast({
        title: "Commande récurrente créée",
        description: "Votre commande récurrente a été configurée avec succès.",
      });
      setNewRecurringOrder({
        name: '',
        serviceId: '',
        frequency: '',
        address: '',
        postalCode: '',
        city: '',
        wasteTypes: []
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer la commande récurrente.",
        variant: "destructive",
      });
    }
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      await apiRequest('PUT', `/api/orders/${orderId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders/my-orders'] });
      toast({
        title: "Commande annulée",
        description: "Votre commande a été annulée avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler la commande.",
        variant: "destructive",
      });
    }
  });

  const handleUpdateOrder = (updates: any) => {
    if (editingOrder) {
      updateOrderMutation.mutate({ orderId: editingOrder.id, updates });
    }
  };

  const handleCreateRecurringOrder = () => {
    if (!newRecurringOrder.name || !newRecurringOrder.serviceId || !newRecurringOrder.frequency) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }
    createRecurringOrderMutation.mutate(newRecurringOrder);
  };

  const canModifyOrder = (order: Order) => {
    return ['en_attente', 'confirme'].includes(order.status);
  };

  const canCancelOrder = (order: Order) => {
    return ['en_attente', 'confirme'].includes(order.status);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroHeader
        variant="dashboard"
        subtitle="ESPACE CLIENT"
        title={`Bonjour ${user?.firstName || 'Client'}`}
        description="Gérez vos commandes, suivez vos livraisons et configurez vos collectes récurrentes depuis votre espace personnel sécurisé."
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="secondary" 
            size="lg"
            onClick={() => navigate("/")}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Home className="h-5 w-5 mr-2" />
            Accueil
          </Button>
          <Button 
            variant="secondary" 
            size="lg"
            onClick={() => setSelectedTab("new-order")}
            className="bg-red-600 hover:bg-red-700 text-white border-0"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle commande
          </Button>
        </div>
      </HeroHeader>

      <div className="container mx-auto px-4 py-12 -mt-8 relative z-10">

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Commandes actives</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.filter((o: Order) => ['en_attente', 'confirme', 'en_cours'].includes(o.status)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Prochaine livraison</p>
                  <p className="text-lg font-bold text-gray-900">
                    {orders.find((o: Order) => o.confirmedDeliveryDate)?.confirmedDeliveryDate 
                      ? new Date(orders.find((o: Order) => o.confirmedDeliveryDate)!.confirmedDeliveryDate!).toLocaleDateString('fr-FR')
                      : 'Aucune'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Repeat className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Commandes récurrentes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {recurringOrders.filter((r: RecurringOrder) => r.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total dépensé</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.reduce((sum: number, order: Order) => sum + parseFloat(order.totalAmount), 0).toFixed(2)}€
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets principaux */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">Mes commandes</TabsTrigger>
            <TabsTrigger value="recurring">Commandes récurrentes</TabsTrigger>
            <TabsTrigger value="new-order">Nouvelle commande</TabsTrigger>
            <TabsTrigger value="profile">Mon profil</TabsTrigger>
          </TabsList>

          {/* Onglet Mes commandes */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Mes commandes</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande</h3>
                    <p className="text-gray-600 mb-4">Vous n'avez pas encore passé de commande.</p>
                    <Button onClick={() => setSelectedTab("new-order")} className="bg-red-600 hover:bg-red-700">
                      Passer ma première commande
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order: Order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">Commande {order.orderNumber}</h3>
                            <p className="text-gray-600">
                              {order.serviceName} ({order.serviceVolume}m³)
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                              {statusLabels[order.status as keyof typeof statusLabels]}
                            </Badge>
                            <span className="font-bold text-lg">{order.totalAmount}€</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            {order.address}, {order.postalCode} {order.city}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {order.confirmedDeliveryDate 
                              ? `Livraison: ${new Date(order.confirmedDeliveryDate).toLocaleDateString('fr-FR')}`
                              : order.deliveryDate 
                                ? `Demandé: ${new Date(order.deliveryDate).toLocaleDateString('fr-FR')}`
                                : 'Date à confirmer'
                            }
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Truck className="h-4 w-4 mr-2" />
                            Transport: {order.distance}km - {order.transportCost}€
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Types de déchets:</p>
                          <div className="flex flex-wrap gap-2">
                            {order.wasteTypes.map((waste, index) => (
                              <Badge key={index} variant="outline">{waste}</Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="text-sm text-gray-500">
                            Commandé le {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Détails
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Facture
                            </Button>
                            {canModifyOrder(order) && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={() => setEditingOrder(order)}>
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    Modifier
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Modifier la commande {order.orderNumber}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Date souhaitée</Label>
                                      <Input
                                        type="date"
                                        defaultValue={order.deliveryDate?.split('T')[0] || ''}
                                        onChange={(e) => {
                                          // Update logic here
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <Label>Adresse de livraison</Label>
                                      <Input
                                        defaultValue={order.address}
                                        onChange={(e) => {
                                          // Update logic here
                                        }}
                                      />
                                    </div>
                                    <div className="flex gap-4">
                                      <div className="flex-1">
                                        <Label>Code postal</Label>
                                        <Input
                                          defaultValue={order.postalCode}
                                          onChange={(e) => {
                                            // Update logic here
                                          }}
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <Label>Ville</Label>
                                        <Input
                                          defaultValue={order.city}
                                          onChange={(e) => {
                                            // Update logic here
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <div className="flex gap-2 pt-4">
                                      <Button 
                                        onClick={() => handleUpdateOrder({})} 
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Enregistrer les modifications
                                      </Button>
                                      <Button variant="outline" onClick={() => setEditingOrder(null)}>
                                        Annuler
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                            {canCancelOrder(order) && (
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => cancelOrderMutation.mutate(order.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Annuler
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Commandes récurrentes */}
          <TabsContent value="recurring">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Commandes récurrentes</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-red-600 hover:bg-red-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Nouvelle commande récurrente
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Créer une commande récurrente</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Nom de la commande</Label>
                            <Input
                              value={newRecurringOrder.name}
                              onChange={(e) => setNewRecurringOrder(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Ex: Collecte bureau mensuelle"
                            />
                          </div>
                          <div>
                            <Label>Service</Label>
                            <Select value={newRecurringOrder.serviceId} onValueChange={(value) => 
                              setNewRecurringOrder(prev => ({ ...prev, serviceId: value }))
                            }>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un service" />
                              </SelectTrigger>
                              <SelectContent>
                                {services.map((service: any) => (
                                  <SelectItem key={service.id} value={service.id.toString()}>
                                    {service.name} ({service.volume}m³)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Fréquence</Label>
                            <Select value={newRecurringOrder.frequency} onValueChange={(value) => 
                              setNewRecurringOrder(prev => ({ ...prev, frequency: value }))
                            }>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner la fréquence" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="weekly">Hebdomadaire</SelectItem>
                                <SelectItem value="biweekly">Bi-mensuelle</SelectItem>
                                <SelectItem value="monthly">Mensuelle</SelectItem>
                                <SelectItem value="quarterly">Trimestrielle</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Adresse de collecte</Label>
                            <Input
                              value={newRecurringOrder.address}
                              onChange={(e) => setNewRecurringOrder(prev => ({ ...prev, address: e.target.value }))}
                              placeholder="Adresse complète"
                            />
                          </div>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <Label>Code postal</Label>
                              <Input
                                value={newRecurringOrder.postalCode}
                                onChange={(e) => setNewRecurringOrder(prev => ({ ...prev, postalCode: e.target.value }))}
                                placeholder="75000"
                              />
                            </div>
                            <div className="flex-1">
                              <Label>Ville</Label>
                              <Input
                                value={newRecurringOrder.city}
                                onChange={(e) => setNewRecurringOrder(prev => ({ ...prev, city: e.target.value }))}
                                placeholder="Paris"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Types de déchets</Label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {wasteTypes.map((waste: any) => (
                                <div key={waste.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`waste-${waste.id}`}
                                    checked={newRecurringOrder.wasteTypes.includes(waste.name)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setNewRecurringOrder(prev => ({ 
                                          ...prev, 
                                          wasteTypes: [...prev.wasteTypes, waste.name] 
                                        }));
                                      } else {
                                        setNewRecurringOrder(prev => ({ 
                                          ...prev, 
                                          wasteTypes: prev.wasteTypes.filter(w => w !== waste.name) 
                                        }));
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`waste-${waste.id}`} className="text-sm">
                                    {waste.name}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button onClick={handleCreateRecurringOrder} className="bg-red-600 hover:bg-red-700">
                              Créer la commande récurrente
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {recurringLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto"></div>
                      <p className="mt-4 text-gray-600">Chargement...</p>
                    </div>
                  ) : recurringOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <Repeat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande récurrente</h3>
                      <p className="text-gray-600">Configurez vos collectes automatiques pour gagner du temps.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recurringOrders.map((recurring: RecurringOrder) => (
                        <div key={recurring.id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{recurring.name}</h3>
                              <p className="text-gray-600">
                                {recurring.serviceName} - {recurring.frequency}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={recurring.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {recurring.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              <span className="font-bold text-lg">{recurring.totalAmount}€</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              {recurring.address}, {recurring.city}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-2" />
                              Prochaine exécution: {new Date(recurring.nextExecution).toLocaleDateString('fr-FR')}
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Types de déchets:</p>
                            <div className="flex flex-wrap gap-2">
                              {recurring.wasteTypes.map((waste, index) => (
                                <Badge key={index} variant="outline">{waste}</Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-4 border-t">
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-2" />
                              Modifier
                            </Button>
                            <Button variant="outline" size="sm">
                              {recurring.isActive ? 'Suspendre' : 'Activer'}
                            </Button>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Nouvelle commande */}
          <TabsContent value="new-order">
            <Card>
              <CardHeader>
                <CardTitle>Passer une nouvelle commande</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Plus className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Créer une nouvelle commande</h3>
                  <p className="text-gray-600 mb-6">
                    Utilisez notre configurateur pour créer votre commande personnalisée
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/'}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Commencer ma commande
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Profil */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Mon profil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">John Doe</h3>
                      <p className="text-gray-600">john.doe@example.com</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-4">Informations personnelles</h4>
                      <div className="space-y-3">
                        <div>
                          <Label>Prénom</Label>
                          <Input defaultValue="John" />
                        </div>
                        <div>
                          <Label>Nom</Label>
                          <Input defaultValue="Doe" />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input defaultValue="john.doe@example.com" />
                        </div>
                        <div>
                          <Label>Téléphone</Label>
                          <Input defaultValue="+33 1 23 45 67 89" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-4">Préférences</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="email-notifications" defaultChecked />
                          <Label htmlFor="email-notifications">
                            Recevoir les notifications par email
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="sms-notifications" />
                          <Label htmlFor="sms-notifications">
                            Recevoir les notifications par SMS
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="marketing-emails" />
                          <Label htmlFor="marketing-emails">
                            Recevoir les offres promotionnelles
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button className="bg-red-600 hover:bg-red-700">
                      Enregistrer les modifications
                    </Button>
                    <Button variant="outline">
                      Changer le mot de passe
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}