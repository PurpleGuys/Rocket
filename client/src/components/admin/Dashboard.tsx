import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['/api/admin/orders'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin w-6 h-6 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commandes récentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3 font-medium text-slate-600">Commande</th>
                <th className="text-left p-3 font-medium text-slate-600">Client</th>
                <th className="text-left p-3 font-medium text-slate-600">Service</th>
                <th className="text-left p-3 font-medium text-slate-600">Montant</th>
                <th className="text-left p-3 font-medium text-slate-600">Statut</th>
                <th className="text-left p-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {orders?.slice(0, 10).map((order: any) => (
                <tr key={order.id}>
                  <td className="p-3">
                    <span className="font-mono text-primary-600">{order.orderNumber}</span>
                    <div className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{order.customerFirstName} {order.customerLastName}</div>
                    <div className="text-xs text-slate-500">{order.customerEmail}</div>
                  </td>
                  <td className="p-3">
                    <div>Service ID: {order.serviceId}</div>
                    <div className="text-xs text-slate-500">{order.deliveryCity} {order.deliveryPostalCode}</div>
                  </td>
                  <td className="p-3 font-medium">{parseFloat(order.totalTTC).toFixed(2)}€</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'confirmed' 
                        ? 'bg-red-100 text-red-800'
                        : order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status === 'confirmed' ? 'Confirmée' : 
                       order.status === 'pending' ? 'En attente' : 
                       order.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button className="text-primary-600 hover:text-primary-800 mr-2">
                      👁️
                    </button>
                    <button className="text-slate-600 hover:text-slate-800">
                      ✏️
                    </button>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Aucune commande trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
