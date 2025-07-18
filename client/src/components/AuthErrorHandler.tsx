import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, User, Settings } from 'lucide-react';

interface AuthErrorHandlerProps {
  children: React.ReactNode;
}

export const AuthErrorHandler: React.FC<AuthErrorHandlerProps> = ({ children }) => {
  const [hasAuthError, setHasAuthError] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Vérifier les tokens locaux
        const token = localStorage.getItem('auth_token');
        const sessionToken = localStorage.getItem('session_token');
        
        if (!token && !sessionToken) {
          setHasAuthError(false);
          setIsChecking(false);
          return;
        }

        // Tester la connexion à l'API auth
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'x-session-token': sessionToken || '',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.status === 401) {
          // Token expiré, on nettoie
          localStorage.removeItem('auth_token');
          localStorage.removeItem('session_token');
          setHasAuthError(false);
        } else if (!response.ok) {
          setHasAuthError(true);
        } else {
          setHasAuthError(false);
        }
        
        setIsChecking(false);
      } catch (error) {
        console.error('Erreur lors de la vérification auth:', error);
        setHasAuthError(true);
        setIsChecking(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[200px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (hasAuthError) {
    return (
      <div className="max-w-lg mx-auto p-4">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-xl text-yellow-800">
              Problème d'authentification
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Impossible de vérifier votre session utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <User className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Que s'est-il passé ?</strong><br />
                Votre session a expiré ou il y a un problème de connexion avec le serveur.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Solutions :</h4>
              
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">Actualiser la page</h5>
                    <p className="text-sm text-gray-600">
                      Souvent, cela résout les problèmes de session
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-green-600">2</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900">Se reconnecter</h5>
                    <p className="text-sm text-gray-600">
                      Vous devrez peut-être vous reconnecter
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => window.location.reload()} 
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
              <Button 
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/';
                }}
                variant="outline"
                className="flex-1"
              >
                <Settings className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthErrorHandler;