import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, Eye, Edit } from "lucide-react";

export default function OrdersTable() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: orders, isLoading } = useQuery({
    queryKey: ['/api/admin/orders'],
  });

  const filteredOrders = orders?.filter((order: any) => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${order.customerFirstName} ${order.customerLastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-red-100 text-red-800">Confirmée</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'delivered':
        return <Badge className="bg-blue-100 text-blue-800">Livrée</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Terminée</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Annulée</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Gestion des commandes</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Rechercher une commande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3 font-medium text-slate-600">Commande</th>
                <th className="text-left p-3 font-medium text-slate-600">Client</th>
                <th className="text-left p-3 font-medium text-slate-600">Service</th>
                <th className="text-left p-3 font-medium text-slate-600">Livraison</th>
                <th className="text-left p-3 font-medium text-slate-600">Montant</th>
                <th className="text-left p-3 font-medium text-slate-600">Statut</th>
                <th className="text-left p-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOrders.length > 0 ? filteredOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="p-3">
                    <div className="font-mono text-primary-600 font-medium">{order.orderNumber}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{order.customerFirstName} {order.customerLastName}</div>
                    <div className="text-xs text-slate-500">{order.customerEmail}</div>
                    <div className="text-xs text-slate-500">{order.customerPhone}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">Service #{order.serviceId}</div>
                    <div className="text-xs text-slate-500">{order.durationDays} jour{order.durationDays > 1 ? 's' : ''}</div>
                    {order.wasteTypes && order.wasteTypes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {order.wasteTypes.slice(0, 2).map((type: string) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                        {order.wasteTypes.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{order.wasteTypes.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="text-sm">{order.deliveryStreet}</div>
                    <div className="text-xs text-slate-500">
                      {order.deliveryPostalCode} {order.deliveryCity}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{parseFloat(order.totalTTC).toFixed(2)}€</div>
                    <div className="text-xs text-slate-500">
                      {order.paymentStatus === 'paid' ? '✅ Payé' : '⏳ En attente'}
                    </div>
                  </td>
                  <td className="p-3">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    {searchTerm ? 'Aucune commande trouvée pour cette recherche' : 'Aucune commande trouvée'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <div>
              {filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''} trouvée{filteredOrders.length > 1 ? 's' : ''}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Précédent
              </Button>
              <Button variant="outline" size="sm" disabled>
                Suivant
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
