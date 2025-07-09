import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth, useLogin } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

export default function AuthTest() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const loginMutation = useLogin();
  const [testResult, setTestResult] = useState<any>(null);

  const handleLogin = () => {
    loginMutation.mutate({
      email: "admin@bennespro.com",
      password: "admin123",
      rememberMe: true
    });
  };

  const testAuthEndpoint = async () => {
    try {
      const result = await apiRequest("/api/auth/me", "GET");
      setTestResult({ success: true, data: result });
    } catch (error: any) {
      setTestResult({ success: false, error: error.message });
    }
  };

  const checkLocalStorage = () => {
    const authToken = localStorage.getItem("auth_token");
    const sessionToken = localStorage.getItem("session_token");
    setTestResult({
      authToken: authToken ? `${authToken.substring(0, 20)}...` : "Non défini",
      sessionToken: sessionToken ? `${sessionToken.substring(0, 20)}...` : "Non défini"
    });
  };

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Test d'authentification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">État actuel :</h3>
            <p>Chargement : {isLoading ? "Oui" : "Non"}</p>
            <p>Authentifié : {isAuthenticated ? "Oui" : "Non"}</p>
            <p>Utilisateur : {user ? `${user.email} (${user.role})` : "Aucun"}</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleLogin} disabled={loginMutation.isPending}>
              Se connecter (admin)
            </Button>
            <Button onClick={testAuthEndpoint} variant="outline">
              Tester /api/auth/me
            </Button>
            <Button onClick={checkLocalStorage} variant="outline">
              Vérifier localStorage
            </Button>
          </div>

          {testResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <pre>{JSON.stringify(testResult, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}