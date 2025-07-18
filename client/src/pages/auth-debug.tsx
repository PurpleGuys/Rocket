import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

export default function AuthDebugPage() {
  const { user, isLoading, isAuthenticated, error } = useAuth();
  const queryClient = useQueryClient();
  const [tokens, setTokens] = useState<any>({});
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    checkTokens();
  }, []);

  const checkTokens = () => {
    const authToken = localStorage.getItem("auth_token");
    const sessionToken = localStorage.getItem("session_token");
    setTokens({
      authToken: authToken ? authToken.substring(0, 30) + "..." : "Non trouvé",
      sessionToken: sessionToken ? sessionToken.substring(0, 30) + "..." : "Non trouvé"
    });
  };

  const testManualAuthMe = async () => {
    try {
      const authToken = localStorage.getItem("auth_token");
      const sessionToken = localStorage.getItem("session_token");
      
      const headers: Record<string, string> = {};
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      if (sessionToken) {
        headers["x-session-token"] = sessionToken;
      }

      console.log("Testing /api/auth/me with headers:", headers);

      const response = await fetch("/api/auth/me", {
        method: "GET",
        headers,
        credentials: "include"
      });

      const data = response.ok ? await response.json() : await response.text();
      
      setTestResult({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data
      });
    } catch (error: any) {
      setTestResult({
        error: error.message || error.toString()
      });
    }
  };

  const refreshAuth = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    checkTokens();
  };

  const clearAll = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("session_token");
    queryClient.clear();
    checkTokens();
    setTestResult(null);
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Débogage Authentification</h1>
      
      <div className="grid gap-4">
        {/* État actuel */}
        <Card>
          <CardHeader>
            <CardTitle>État Authentification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Chargement:</strong> {isLoading ? "Oui" : "Non"}</p>
              <p><strong>Authentifié:</strong> {isAuthenticated ? "✅ Oui" : "❌ Non"}</p>
              <p><strong>Utilisateur:</strong> {user ? `${user.email} (${user.role})` : "Aucun"}</p>
              {error && <p className="text-red-600"><strong>Erreur:</strong> {error.toString()}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Tokens stockés */}
        <Card>
          <CardHeader>
            <CardTitle>Tokens LocalStorage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-sm">
              <p><strong>auth_token:</strong> {tokens.authToken}</p>
              <p><strong>session_token:</strong> {tokens.sessionToken}</p>
            </div>
            <Button onClick={checkTokens} className="mt-4" size="sm">
              Rafraîchir
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions de test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button onClick={testManualAuthMe} className="bg-green-600 hover:bg-green-700">
                Tester /api/auth/me manuellement
              </Button>
              <Button onClick={refreshAuth} variant="outline">
                Rafraîchir useAuth
              </Button>
              <Button onClick={clearAll} variant="destructive">
                Tout effacer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Résultats du test */}
        {testResult && (
          <Card>
            <CardHeader>
              <CardTitle>Résultat du test</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-x-auto bg-gray-100 p-4 rounded">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions de débogage</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>1. Connectez-vous d'abord via <a href="/test-login" className="text-blue-600 underline">/test-login</a></p>
            <p>2. Vérifiez que les tokens sont bien stockés dans LocalStorage</p>
            <p>3. Testez l'appel à /api/auth/me pour voir si l'authentification fonctionne</p>
            <p>4. Si ça ne fonctionne pas, vérifiez la console du navigateur (F12) pour plus de détails</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}