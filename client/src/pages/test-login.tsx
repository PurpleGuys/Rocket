import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

export default function TestLoginPage() {
  const [email, setEmail] = useState("ethan.petrovic@remondis.fr");
  const [password, setPassword] = useState("LoulouEP150804@");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const testLogin = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('Testing login with:', { email, password });
      
      const response = await apiRequest("/api/auth/login", "POST", {
        email,
        password,
        rememberMe: true
      });
      
      console.log('Login response:', response);
      setResult({ success: true, data: response });
      
      // Store tokens if successful
      if (response.token) {
        localStorage.setItem("auth_token", response.token);
      }
      if (response.sessionToken) {
        localStorage.setItem("session_token", response.sessionToken);
      }
      
      // Invalidate auth queries to refresh user state
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    } catch (error: any) {
      console.error('Login error:', error);
      setResult({ success: false, error: error.message || error.toString() });
    } finally {
      setLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('Testing direct fetch...');
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe: true
        }),
        credentials: "include"
      });
      
      const data = await response.json();
      console.log('Direct fetch response:', data);
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${JSON.stringify(data)}`);
      }
      
      // Store tokens from response
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }
      if (data.sessionToken) {
        localStorage.setItem("session_token", data.sessionToken);
      }
      
      setResult({ success: true, data, method: "direct fetch" });
      
      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    } catch (error: any) {
      console.error('Direct fetch error:', error);
      setResult({ success: false, error: error.message || error.toString(), method: "direct fetch" });
    } finally {
      setLoading(false);
    }
  };
  
  const testAuthMe = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const token = localStorage.getItem("auth_token");
      const sessionToken = localStorage.getItem("session_token");
      
      console.log('Testing /api/auth/me with tokens:', {
        authToken: token ? token.substring(0, 20) + '...' : 'none',
        sessionToken: sessionToken ? sessionToken.substring(0, 20) + '...' : 'none'
      });
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      if (sessionToken) {
        headers["x-session-token"] = sessionToken;
      }
      
      const response = await fetch("/api/auth/me", {
        method: "GET",
        headers,
        credentials: "include"
      });
      
      const data = response.ok ? await response.json() : null;
      
      console.log('/api/auth/me response:', {
        status: response.status,
        data
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      setResult({ success: true, data, method: "/api/auth/me test" });
    } catch (error: any) {
      console.error('/api/auth/me error:', error);
      setResult({ success: false, error: error.message || error.toString(), method: "/api/auth/me test" });
    } finally {
      setLoading(false);
    }
  };
  
  const clearTokens = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("session_token");
    queryClient.clear();
    setResult({ message: "Tokens supprimés et cache vidé" });
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Test de connexion - Débogage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input 
              id="password"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={testLogin} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Test avec apiRequest
            </Button>
            
            <Button 
              onClick={testDirectFetch} 
              disabled={loading}
              variant="outline"
            >
              Test avec fetch direct
            </Button>
            
            <Button 
              onClick={testAuthMe} 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              Test /api/auth/me
            </Button>
            
            <Button 
              onClick={clearTokens} 
              disabled={loading}
              variant="destructive"
            >
              Effacer tokens
            </Button>
          </div>
          
          {loading && (
            <div className="text-center text-gray-600">
              Chargement...
            </div>
          )}
          
          {result && (
            <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h3 className={`font-semibold mb-2 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? '✅ Succès' : '❌ Erreur'} {result.method ? `(${result.method})` : ''}
              </h3>
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="text-sm text-gray-600 mt-4">
            <p>Ouvrez la console du navigateur (F12) pour voir les logs détaillés.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}