import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cookie } from "lucide-react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white p-4 shadow-2xl z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm">
            <Cookie className="inline h-4 w-4 mr-2 text-amber-400" />
            Nous utilisons des cookies pour améliorer votre expérience. En continuant, vous acceptez notre{' '}
            <a href="#" className="underline hover:no-underline">politique de confidentialité</a>.
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDecline}
            className="border-slate-600 text-white hover:bg-slate-800"
          >
            Refuser
          </Button>
          <Button 
            size="sm"
            onClick={handleAccept}
            className="bg-primary-600 hover:bg-primary-700"
          >
            Accepter
          </Button>
        </div>
      </div>
    </div>
  );
}
