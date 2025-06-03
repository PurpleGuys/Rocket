import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { HeroHeader } from "@/components/ui/hero-header";
import { ArrowLeft, RotateCcw, Calendar, FileText, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";

export default function RetractionRights() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroHeader
        variant="retraction"
        subtitle="DROIT DE RÉTRACTATION"
        title="Exercer votre droit de rétractation"
        description="Vous disposez d'un délai de 14 jours pour annuler votre commande sans justification. Consultez les modalités et conditions d'exercice de ce droit."
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="secondary" 
            size="lg"
            onClick={() => navigate("/")}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour à l'accueil
          </Button>
          <Button 
            variant="secondary" 
            size="lg"
            onClick={() => navigate("/legal")}
            className="bg-orange-600 hover:bg-orange-700 text-white border-0"
          >
            <FileText className="h-5 w-5 mr-2" />
            Mentions légales
          </Button>
        </div>
      </HeroHeader>

      <div className="container mx-auto px-4 py-12 max-w-4xl -mt-8 relative z-10">
        {/* Introduction */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-orange-600 flex items-center">
              <RotateCcw className="h-5 w-5 mr-2" />
              Votre droit de rétractation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Conformément aux articles L. 221-18 et suivants du Code de la consommation, vous disposez d'un droit 
              de rétractation que vous pouvez exercer dans un délai de quatorze jours sans avoir à justifier de motifs 
              ni à payer de pénalité.
            </p>
            <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
              <p className="text-orange-800 font-medium">
                <Calendar className="h-4 w-4 inline mr-2" />
                Délai : 14 jours calendaires à compter de la conclusion du contrat de service
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Délai de rétractation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Délai de rétractation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Point de départ du délai :</h3>
              <p className="text-gray-700 mb-3">
                Le délai de rétractation de 14 jours expire 14 jours après le jour de la conclusion du contrat de service.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Services de collecte</h4>
                  <p className="text-blue-800 text-sm">
                    14 jours à compter de la confirmation de commande
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Location de bennes</h4>
                  <p className="text-green-800 text-sm">
                    14 jours à compter de la signature du contrat
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <h3 className="font-semibold text-amber-900 mb-2">
                <AlertTriangle className="h-4 w-4 inline mr-2" />
                Attention
              </h3>
              <p className="text-amber-800 text-sm">
                Si le délai expire un samedi, un dimanche ou un jour férié, il est prorogé jusqu'au premier jour ouvrable suivant.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Modalités d'exercice */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Comment exercer votre droit de rétractation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Notification de votre décision :</h3>
              <p className="text-gray-700 mb-3">
                Pour exercer votre droit de rétractation, vous devez nous notifier votre décision de rétractation 
                au moyen d'une déclaration dénuée d'ambiguïté.
              </p>
              
              <div className="space-y-3">
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Par email :</h4>
                  <p className="text-gray-700">retractation@remondis.fr</p>
                </div>
                
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Par courrier :</h4>
                  <p className="text-gray-700">
                    REMONDIS France SAS<br />
                    Service Rétractation<br />
                    Zone Industrielle Nord<br />
                    60000 Beauvais
                  </p>
                </div>
                
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Via votre espace client :</h4>
                  <p className="text-gray-700">
                    Connectez-vous à votre compte et utilisez le formulaire de rétractation 
                    dans la section "Mes commandes"
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Informations à fournir :</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Vos nom, prénom et adresse</li>
                <li>Numéro de commande concerné</li>
                <li>Date de conclusion du contrat</li>
                <li>Description du service commandé</li>
                <li>Date de la notification de rétractation</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Formulaire type */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Formulaire type de rétractation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Vous pouvez utiliser le modèle de formulaire de rétractation ci-dessous :
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
              <div className="space-y-4 text-sm">
                <p className="font-semibold">À l'attention de REMONDIS France SAS :</p>
                
                <p>
                  Je/Nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat 
                  portant sur la prestation de services ci-dessous :
                </p>
                
                <div className="space-y-2">
                  <p>Numéro de commande : ________________________</p>
                  <p>Commandé le (*) : ________________________</p>
                  <p>Service concerné : ________________________</p>
                  <p>Nom du/des consommateur(s) : ________________________</p>
                  <p>Adresse du/des consommateur(s) : ________________________</p>
                  <p>________________________</p>
                  <p>________________________</p>
                </div>
                
                <div className="space-y-2">
                  <p>Date : ________________________</p>
                  <p>Signature (uniquement en cas de notification du présent formulaire sur papier) :</p>
                  <p>________________________</p>
                </div>
                
                <p className="text-xs text-gray-500">(*) Rayez la mention inutile.</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 text-sm">
                <FileText className="h-4 w-4 inline mr-2" />
                Ce formulaire n'est fourni qu'à titre indicatif. Vous pouvez formuler votre demande 
                de rétractation dans vos propres termes, à condition qu'elle soit claire et non ambiguë.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Effets de la rétractation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Effets de la rétractation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Remboursement :</h3>
              <p className="text-gray-700 mb-3">
                En cas de rétractation, nous vous rembourserons tous les paiements reçus de votre part, 
                sans retard injustifié et, en tout état de cause, au plus tard quatorze jours à compter 
                du jour où nous sommes informés de votre décision de rétractation.
              </p>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Modalités de remboursement :</h4>
                <ul className="list-disc pl-6 space-y-1 text-green-800 text-sm">
                  <li>Même moyen de paiement que celui utilisé pour la transaction initiale</li>
                  <li>Aucun frais supplémentaire pour ce remboursement</li>
                  <li>Délai maximum : 14 jours après notification</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Arrêt immédiat du service :</h3>
              <p className="text-gray-700">
                L'exercice du droit de rétractation entraîne l'arrêt immédiat de la prestation de service. 
                Si le service a déjà commencé, vous ne paierez que la partie du service effectivement fournie.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Exceptions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Exceptions au droit de rétractation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Conformément à l'article L. 221-28 du Code de la consommation, le droit de rétractation 
              ne peut être exercé dans les cas suivants :
            </p>
            
            <div className="space-y-3">
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                <h4 className="font-semibold text-red-900 mb-2">Services d'urgence :</h4>
                <p className="text-red-800 text-sm">
                  Prestations de services d'urgence pour dépollution ou collecte d'urgence 
                  de déchets dangereux, exécutées immédiatement.
                </p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                <h4 className="font-semibold text-red-900 mb-2">Services entièrement exécutés :</h4>
                <p className="text-red-800 text-sm">
                  Prestations de services entièrement exécutées avant la fin du délai de rétractation 
                  et dont l'exécution a commencé après accord préalable exprès du consommateur 
                  et renoncement exprès à son droit de rétractation.
                </p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                <h4 className="font-semibold text-red-900 mb-2">Services personnalisés :</h4>
                <p className="text-red-800 text-sm">
                  Prestations de services de collecte spécialisée confectionnées selon 
                  les spécifications du consommateur ou nettement personnalisées.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service client */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Besoin d'aide ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Service client :</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Email :</h4>
                  <p className="text-gray-700">contact@remondis.fr</p>
                  <p className="text-gray-500 text-sm">Réponse sous 24h</p>
                </div>
                
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Téléphone :</h4>
                  <p className="text-gray-700">03 44 XX XX XX</p>
                  <p className="text-gray-500 text-sm">Lun-Ven 8h-18h</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Questions spécifiques à la rétractation :</h3>
              <p className="text-gray-700">retractation@remondis.fr</p>
              <p className="text-gray-500 text-sm">Service dédié au traitement des demandes de rétractation</p>
            </div>
          </CardContent>
        </Card>

        {/* Médiation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Médiation de la consommation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              En cas de litige persistant, vous pouvez recourir gratuitement à un médiateur de la consommation 
              dans les conditions prévues à l'article L. 616-1 du Code de la consommation.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Médiateur compétent :</h3>
              <p className="text-blue-800 text-sm mb-2">
                <strong>Médiation Inter-Entreprises</strong><br />
                11 Place Dauphine - 75001 Paris<br />
                contact@mediation-inter-entreprises.org<br />
                www.mediation-inter-entreprises.org
              </p>
              <p className="text-blue-700 text-xs">
                La médiation n'est recevable qu'après avoir tenté de résoudre le litige directement 
                auprès de notre service client.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}