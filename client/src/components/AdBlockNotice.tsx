import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Shield, Reload } from "lucide-react";

interface AdBlockNoticeProps {
  onRetry?: () => void;
  showAlternatives?: boolean;
}

export default function AdBlockNotice({ onRetry, showAlternatives = true }: AdBlockNoticeProps) {
  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="font-medium mb-2">Module de paiement bloqué</div>
          <div className="text-sm">
            Votre bloqueur de publicités empêche le chargement du système de paiement sécurisé.
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Comment activer les paiements sécurisés
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-3">
            <div>
              <div className="font-medium mb-1">🛡️ AdBlock Plus / uBlock Origin:</div>
              <div className="text-gray-600">
                1. Cliquez sur l'icône de votre bloqueur dans la barre d'outils<br/>
                2. Désactivez le bloqueur pour ce site<br/>
                3. Rechargez la page
              </div>
            </div>
            
            <div>
              <div className="font-medium mb-1">🔒 Pourquoi c'est sécurisé:</div>
              <div className="text-gray-600">
                Nous utilisons Stripe, le leader mondial des paiements en ligne, 
                utilisé par des millions d'entreprises pour sécuriser leurs transactions.
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="font-medium text-green-800 mb-1">✅ Données protégées</div>
              <div className="text-sm text-green-700">
                Vos informations bancaires sont cryptées et ne transitent jamais par nos serveurs.
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {onRetry && (
              <Button onClick={onRetry} variant="outline" className="flex-1">
                <Reload className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            )}
            
            {showAlternatives && (
              <Button 
                onClick={() => {
                  window.open('mailto:contact@bennespro.fr?subject=Commande%20manuelle', '_blank');
                }}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Paiement par email
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showAlternatives && (
        <Card>
          <CardHeader>
            <CardTitle>Autres moyens de paiement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <div>📧 <strong>Email:</strong> contact@bennespro.fr</div>
              <div>📞 <strong>Téléphone:</strong> Nous vous rappelons sous 24h</div>
              <div>🏦 <strong>Virement:</strong> Paiement après livraison (entreprises)</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}