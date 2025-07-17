import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { setupGlobalErrorHandling } from "./lib/errorHandler";
import React from "react";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import AdminFids from "@/pages/admin-fids";
import AdminUsers from "@/pages/admin-users";
import Auth from "@/pages/auth";
import Profile from "@/pages/profile";
import Dashboard from "@/pages/dashboard";
import ClientDashboard from "@/pages/client-dashboard";
import NotFound from "@/pages/not-found";
import Checkout from "@/pages/checkout";
import BookingRedesign from "@/pages/booking-redesign";
import CheckoutRedesign from "@/pages/checkout-redesign";
import PaymentSuccess from "@/pages/payment-success";
import Legal from "@/pages/legal";
import PrivacyPolicy from "@/pages/privacy-policy";
import RetractionRights from "@/pages/retraction-rights";
import PriceSimulation from "@/pages/price-simulation";
import ValidateDelivery from "@/pages/validate-delivery";
import FAQ from "@/pages/FAQ";
import Introduction from "@/components/Introduction";
import CookieConsent from "@/components/CookieConsent";
import AuthTest from "@/pages/auth-test";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen-safe bg-white flex flex-col items-center justify-center container-responsive">
        <div className="spacing-md">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/3/32/Remondis_logo.svg" 
            alt="Remondis" 
            className="h-12 w-auto img-responsive"
          />
        </div>
        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
        <p className="spacing-sm text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/auth" component={Auth} />
      <Route path="/booking" component={BookingRedesign} />
      <Route path="/profile" component={Profile} />
      <Route path="/client-dashboard" component={ClientDashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/*" component={Dashboard} />
      <Route path="/admin/fids" component={AdminFids} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/*" component={Admin} />
      <Route path="/admin" component={Admin} />
      <Route path="/checkout" component={CheckoutRedesign} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/legal" component={Legal} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/retraction-rights" component={RetractionRights} />
      <Route path="/price-simulation" component={PriceSimulation} />
      <Route path="/validate-delivery" component={ValidateDelivery} />
      <Route path="/faq" component={FAQ} />
      <Route path="/introduction" component={Introduction} />
      <Route path="/auth-test" component={AuthTest} />
      <Route path="/" component={Introduction} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Setup global error handling for VPS deployment
  React.useEffect(() => {
    setupGlobalErrorHandling();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <CookieConsent />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
