import { Switch, Route } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import Dashboard from "@/pages/dashboard";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();

  // Rediriger vers l'authentification si pas connecté
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = "/auth";
    }
  }, [isAuthenticated]);

  // Vérifier si l'utilisateur est admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600 mb-6">
            Vous devez être administrateur pour accéder à cette page.
          </p>
          <button 
            onClick={() => window.location.href = "/"}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // Rediriger vers le dashboard avec le bon contexte admin
  return <Dashboard />;
}
