import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Dashboard from "@/components/admin/Dashboard";
import OrdersTable from "@/components/admin/OrdersTable";
import { ArrowUp, ShoppingCart, Euro, Truck, Users } from "lucide-react";

export default function Admin() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/dashboard'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Admin Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-slate-800">
                <i className="fas fa-cog mr-2 text-slate-600"></i>Administration BennesPro
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">Connecté en tant qu'admin</span>
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                <i className="fas fa-sign-out-alt"></i>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900">Tableau de bord</h2>
            
            {/* KPI Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Commandes aujourd'hui</p>
                      <p className="text-3xl font-bold text-slate-900">{stats?.todayOrders || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="text-blue-600 h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-green-600">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span>+8% vs hier</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">CA du mois</p>
                      <p className="text-3xl font-bold text-slate-900">{stats?.monthlyRevenue || 0}€</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Euro className="text-green-600 h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-green-600">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span>+15% vs mois dernier</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Bennes louées</p>
                      <p className="text-3xl font-bold text-slate-900">{stats?.rentedDumpsters || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Truck className="text-amber-600 h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-slate-600">
                    <span>Ce mois-ci</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Clients actifs</p>
                      <p className="text-3xl font-bold text-slate-900">{stats?.activeCustomers || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="text-purple-600 h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-green-600">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span>+12 ce mois</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Dashboard />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersTable />
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des utilisateurs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Fonctionnalité en cours de développement...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des services</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Fonctionnalité en cours de développement...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
