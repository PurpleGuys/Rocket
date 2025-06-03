import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { HeroHeader } from "@/components/ui/hero-header";
import { ArrowLeft, Shield, Eye, Lock, Database } from "lucide-react";
import { useLocation } from "wouter";

export default function PrivacyPolicy() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroHeader
        variant="privacy"
        subtitle="PROTECTION DES DONNÉES"
        title="Politique de confidentialité"
        description="Nous nous engageons à protéger vos données personnelles et à respecter votre vie privée conformément au RGPD et aux réglementations en vigueur."
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white border-0"
          >
            <Shield className="h-5 w-5 mr-2" />
            Mentions légales
          </Button>
        </div>
      </HeroHeader>

      <div className="container mx-auto px-4 py-12 max-w-4xl -mt-8 relative z-10">
        {/* Introduction */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-emerald-600 flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Protection de vos données personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              REMONDIS France SAS s'engage à respecter la confidentialité et la sécurité de vos données personnelles. 
              Cette politique explique comment nous collectons, utilisons et protégeons vos informations conformément 
              au Règlement Général sur la Protection des Données (RGPD).
            </p>
            <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-500">
              <p className="text-emerald-800 font-medium">
                Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Responsable du traitement */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Responsable du traitement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Identité du responsable :</h3>
              <p>REMONDIS France SAS</p>
              <p>Adresse : Zone Industrielle Nord, 60000 Beauvais</p>
              <p>Email : dpo@remondis.fr</p>
              <p>Téléphone : 03 44 XX XX XX</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Délégué à la Protection des Données (DPO) :</h3>
              <p>Email : dpo@remondis.fr</p>
              <p>Pour toute question relative à vos données personnelles</p>
            </div>
          </CardContent>
        </Card>

        {/* Données collectées */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Données collectées
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Données d'identification :</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Nom, prénom</li>
                <li>Adresse email</li>
                <li>Numéro de téléphone</li>
                <li>Adresse postale</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Données de commande :</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Informations sur les services commandés</li>
                <li>Adresses de livraison et collecte</li>
                <li>Types de déchets à traiter</li>
                <li>Historique des commandes</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Données de navigation :</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Adresse IP</li>
                <li>Cookies et traceurs</li>
                <li>Données de géolocalisation (avec consentement)</li>
                <li>Préférences utilisateur</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Finalités du traitement */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Finalités du traitement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Exécution du contrat :</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Traitement et suivi des commandes</li>
                <li>Facturation et paiement</li>
                <li>Livraison et collecte des bennes</li>
                <li>Service client et support</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Obligations légales :</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Respect des réglementations environnementales</li>
                <li>Traçabilité des déchets (bordereau de suivi)</li>
                <li>Conservation des documents comptables</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Intérêts légitimes :</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Amélioration de nos services</li>
                <li>Sécurité des systèmes informatiques</li>
                <li>Prévention de la fraude</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Base légale */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Base légale du traitement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Exécution du contrat</h3>
                <p className="text-blue-800 text-sm">
                  Traitement des commandes, livraison des services, facturation
                </p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <h3 className="font-semibold text-amber-900 mb-2">Obligation légale</h3>
                <p className="text-amber-800 text-sm">
                  Respect du Code de l'environnement, traçabilité des déchets
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Consentement</h3>
                <p className="text-green-800 text-sm">
                  Marketing, géolocalisation, cookies non essentiels
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Intérêt légitime</h3>
                <p className="text-purple-800 text-sm">
                  Sécurité, amélioration des services, prévention fraude
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Durée de conservation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Durée de conservation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Données de compte client</span>
                <span className="text-gray-600">3 ans après dernière activité</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Données de commande</span>
                <span className="text-gray-600">10 ans (obligation légale)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Bordereau de suivi déchets</span>
                <span className="text-gray-600">5 ans minimum</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium">Documents comptables</span>
                <span className="text-gray-600">10 ans</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium">Cookies et traceurs</span>
                <span className="text-gray-600">13 mois maximum</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vos droits */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-emerald-600 flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Vos droits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 mb-4">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-emerald-200 p-4 rounded-lg">
                <h3 className="font-semibold text-emerald-900 mb-2">Droit d'accès</h3>
                <p className="text-gray-600 text-sm">
                  Obtenir une copie de vos données personnelles
                </p>
              </div>
              <div className="border border-emerald-200 p-4 rounded-lg">
                <h3 className="font-semibold text-emerald-900 mb-2">Droit de rectification</h3>
                <p className="text-gray-600 text-sm">
                  Corriger ou modifier vos données
                </p>
              </div>
              <div className="border border-emerald-200 p-4 rounded-lg">
                <h3 className="font-semibold text-emerald-900 mb-2">Droit à l'effacement</h3>
                <p className="text-gray-600 text-sm">
                  Demander la suppression de vos données
                </p>
              </div>
              <div className="border border-emerald-200 p-4 rounded-lg">
                <h3 className="font-semibold text-emerald-900 mb-2">Droit d'opposition</h3>
                <p className="text-gray-600 text-sm">
                  Vous opposer au traitement de vos données
                </p>
              </div>
              <div className="border border-emerald-200 p-4 rounded-lg">
                <h3 className="font-semibold text-emerald-900 mb-2">Droit à la portabilité</h3>
                <p className="text-gray-600 text-sm">
                  Récupérer vos données dans un format structuré
                </p>
              </div>
              <div className="border border-emerald-200 p-4 rounded-lg">
                <h3 className="font-semibold text-emerald-900 mb-2">Droit à la limitation</h3>
                <p className="text-gray-600 text-sm">
                  Limiter le traitement de vos données
                </p>
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-lg mt-6">
              <h3 className="font-semibold text-emerald-900 mb-2">Comment exercer vos droits ?</h3>
              <p className="text-emerald-800 text-sm mb-2">
                Contactez notre DPO à l'adresse : dpo@remondis.fr
              </p>
              <p className="text-emerald-700 text-xs">
                Nous vous répondrons dans un délai d'un mois. Une pièce d'identité pourra être demandée.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Sécurité des données</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-600">
              <li>Chiffrement des données sensibles (SSL/TLS)</li>
              <li>Contrôle d'accès strict aux données</li>
              <li>Sauvegarde régulière et sécurisée</li>
              <li>Formation du personnel à la protection des données</li>
              <li>Audit de sécurité régulier</li>
              <li>Notification des violations de données à la CNIL</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact et réclamation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Contact et réclamation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Contact DPO :</h3>
              <p>Email : dpo@remondis.fr</p>
              <p>Courrier : REMONDIS France SAS - DPO, Zone Industrielle Nord, 60000 Beauvais</p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold mb-2">Réclamation auprès de la CNIL :</h3>
              <p className="text-gray-600">
                Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation 
                auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL).
              </p>
              <p className="mt-2">
                <strong>Site web :</strong> www.cnil.fr<br />
                <strong>Adresse :</strong> 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900">Politique des cookies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Notre site utilise des cookies pour améliorer votre expérience de navigation :
            </p>
            
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold">Cookies essentiels :</h3>
                <p className="text-gray-600 text-sm">Nécessaires au fonctionnement du site (authentification, panier)</p>
              </div>
              <div>
                <h3 className="font-semibold">Cookies de performance :</h3>
                <p className="text-gray-600 text-sm">Analyse de l'utilisation du site pour l'améliorer (Google Analytics)</p>
              </div>
              <div>
                <h3 className="font-semibold">Cookies de préférence :</h3>
                <p className="text-gray-600 text-sm">Mémorisation de vos choix et préférences</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 text-sm">
                Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur 
                ou via notre bandeau de consentement.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Modifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Modifications de cette politique</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Cette politique de confidentialité peut être modifiée pour refléter les changements 
              dans nos pratiques ou la réglementation. Nous vous informerons de toute modification 
              importante par email ou via un avis sur notre site.
            </p>
            <div className="mt-4 text-sm text-gray-500">
              <p>Version : 2.0</p>
              <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}