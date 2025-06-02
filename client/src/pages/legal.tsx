import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Legal() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentions légales et CGV</h1>
          <p className="text-gray-600">Conditions générales de vente et informations légales</p>
        </div>

        {/* Informations légales */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-red-600">Informations légales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Raison sociale :</h3>
              <p>REMONDIS France SAS</p>
              <p>Société par Actions Simplifiée au capital de 1 000 000 €</p>
              <p>SIRET : 123 456 789 00012</p>
              <p>RCS : Lyon B 123 456 789</p>
              <p>Code APE : 3811Z - Collecte des déchets non dangereux</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Siège social :</h3>
              <p>Zone Industrielle des Alouettes</p>
              <p>72700 Allonnes, France</p>
              <p>Téléphone : 02.43.39.00.00</p>
              <p>Email : contact@remondis.fr</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">TVA Intracommunautaire :</h3>
              <p>FR 12 123 456 789</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Directeur de publication :</h3>
              <p>Directeur Général - REMONDIS France</p>
            </div>
          </CardContent>
        </Card>

        {/* Conditions générales de vente */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-red-600">Conditions générales de vente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Article 1 - Objet</h3>
              <p className="text-sm text-gray-700">
                Les présentes conditions générales de vente s'appliquent à toutes les prestations de collecte, 
                transport et traitement de déchets proposées par REMONDIS France. Elles définissent les 
                conditions dans lesquelles REMONDIS France fournit ses services.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Article 2 - Prix et facturation</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Les prix sont exprimés en euros, toutes taxes comprises (TTC)</li>
                <li>• TVA applicable : 20% sur les prestations de collecte</li>
                <li>• Les tarifs incluent : dépose, location, retrait de benne et 1 trajet</li>
                <li>• Transport facturé au km réel (minimum 150€)</li>
                <li>• Facturation après prestation avec bordereau de suivi</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Article 3 - Réglementation environnementale</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Prestations conformes au Code de l'environnement</li>
                <li>• Traitement en centres agréés ICPE</li>
                <li>• Bordereau de suivi de déchets (BSD) obligatoire</li>
                <li>• Respect des normes ISO 14001</li>
                <li>• Certificats de traitement fournis sur demande</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Article 4 - Responsabilités</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Le client garantit la nature et l'origine des déchets</li>
                <li>• Interdiction de déchets dangereux sans déclaration</li>
                <li>• Accès sécurisé au site de dépose requis</li>
                <li>• REMONDIS assure le service de collecte et traitement</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Article 5 - Annulation et modification</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Annulation gratuite jusqu'à 48h avant prestation</li>
                <li>• Modification possible sous réserve de disponibilité</li>
                <li>• Annulation tardive : facturation de 50% du montant</li>
                <li>• Report possible selon planning</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Droit de rétractation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-red-600">Droit de rétractation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">
              Conformément à l'article L221-18 du Code de la consommation, vous disposez d'un délai 
              de 14 jours pour exercer votre droit de rétractation sans avoir à justifier de motifs 
              ni à payer de pénalités.
            </p>
            <p className="text-sm text-gray-700">
              Ce délai court à compter de la confirmation de votre commande. Pour exercer ce droit, 
              contactez-nous à : service.client@remondis.fr
            </p>
          </CardContent>
        </Card>

        {/* Protection des données */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-red-600">Protection des données personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi 
              Informatique et Libertés, vos données personnelles sont collectées et traitées pour 
              les besoins de la prestation de service.
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Finalité : exécution du contrat de service</li>
              <li>• Durée de conservation : 10 ans (obligations comptables)</li>
              <li>• Droits : accès, rectification, effacement, portabilité</li>
              <li>• Contact DPO : dpo@remondis.fr</li>
            </ul>
          </CardContent>
        </Card>

        {/* Règlement des litiges */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Règlement des litiges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">
              En cas de litige, une solution amiable sera recherchée avant toute action judiciaire.
            </p>
            <div>
              <h3 className="font-semibold mb-2">Médiation :</h3>
              <p className="text-sm text-gray-700">
                Conformément à l'article L612-1 du Code de la consommation, le consommateur peut 
                recourir gratuitement au service de médiation de la consommation.
              </p>
              <p className="text-sm text-gray-700 mt-2">
                Médiateur : Médiateur de la consommation CNPM<br/>
                Site : www.cnpm-mediation-consommation.eu
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Juridiction compétente :</h3>
              <p className="text-sm text-gray-700">
                Tribunaux de Lyon, France
              </p>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <div className="text-center text-xs text-gray-500">
          <p>Dernière mise à jour : Juin 2025</p>
          <p>Document conforme à la réglementation française en vigueur</p>
        </div>
      </div>
    </div>
  );
}