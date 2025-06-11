import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { HeroHeader } from "@/components/ui/hero-header";
import { ArrowLeft, FileText, Shield, Scale } from "lucide-react";
import { useLocation } from "wouter";

export default function Legal() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroHeader
        variant="legal"
        subtitle="INFORMATIONS LÉGALES"
        title="Mentions légales & CGV"
        description="Conditions générales de vente, mentions légales et politique de confidentialité pour tous nos services de collecte et traitement de déchets."
      >
        <Button 
          variant="secondary" 
          size="lg"
          onClick={() => navigate("/")}
          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Retour à l'accueil
        </Button>
      </HeroHeader>

      <div className="container mx-auto px-4 py-12 max-w-4xl -mt-8 relative z-10">

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
              <p>RCS : Beauvais B 123 456 789</p>
              <p>Code APE : 3811Z - Collecte des déchets non dangereux</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Siège social :</h3>
              <p>Zone Industrielle des Alouettes</p>
              <p>72700 Allonnes, France</p>
              <p>Téléphone : 03 44 45 11 58</p>
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
            <CardTitle className="text-red-600">Conditions Générales de Vente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 max-h-96 overflow-y-auto">
            <div>
              <h3 className="font-semibold mb-2 text-red-600">1. VALIDITÉ DES CONDITIONS</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>a.</strong> Les présentes Conditions sont adressées ou remises à chaque CLIENT, préalablement à la mise en vigueur des relations commerciales avec REMONDIS.</p>
                <p><strong>b.</strong> En conséquence, toute prestation de traitement de déchets confiée à REMONDIS par le CLIENT implique pour lui l'acceptation sans réserve des présentes Conditions Générales et des Conditions Particulières.</p>
                <p><strong>c.</strong> Toute condition contraire posée par le CLIENT dans un quelconque document est donc, sauf acceptation expresse, inopposable à REMONDIS.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-red-600">2. RESPONSABILITÉS</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Le CLIENT reste responsable de ses déchets jusqu'à l'élimination finale au regard de la loi n° 75-633 du 15 juillet 1975. Le CLIENT ou son transporteur, ou toute personne travaillant pour son compte s'engage à respecter toute prescription tant française qu'européenne en matière de Transport.</p>
                <p>Le CLIENT est responsable de tout préjudice causé aux personnes, aux marchandises et aux installations de REMONDIS que ce soit de son fait, du fait de ses préposés ou de ses déchets. Le PRESTATAIRE s'engage à éliminer les déchets conformément aux lois en vigueur.</p>
                <p>Le PRESTATAIRE reste seul et unique propriétaire du matériel mis à disposition du CLIENT au lieu indiqué par le CLIENT sur le bon de commande. Le matériel ne pourra pas être loué, modifié, transporté par le CLIENT sans l'accord du PRESTATAIRE.</p>
                <p>Le CLIENT s'engage à utiliser le matériel mis à disposition pour son usage dédié, c'est-à-dire la collecte et le transport de déchets.</p>
                <p>Le CLIENT est responsable du matériel mis à disposition tant qu'il se trouve sur son site en lien avec l'accord commercial mis en place par les deux parties.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-red-600">3. CONFORMITÉ DES DÉCHETS</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Suite à l'accord commercial contracté entre le CLIENT et le PRESTATAIRE, le CLIENT s'engage à respecter la qualité de la matière énoncée ci-dessus.</p>
                <p>Les déchets collectés doivent être exempts de déchets dangereux, de cadavres d'animaux, matières explosives, produits radioactifs ainsi que des déchets d'activités de soins à risques infectieux.</p>
                <p>Si des matières non conformes au contrat commercial en vigueur sont trouvées au sein des déchets (bouteilles de gaz, aérosols…), une fiche de non-conformité sera émise au CLIENT impactant un coût de tri et de traitement lié à la nature des déchets.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-red-600">4. COLLECTE & CONDITIONNEMENT</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Le CLIENT s'engage à informer le PRESTATAIRE 48h à l'avance en cas de fermeture ou d'annulation d'une demande de collecte afin d'éviter un passage à vide. Dans le cas où la collecte serait réalisée sans pouvoir réaliser la prestation, le passage à vide se verrait facturé au CLIENT.</p>
                <p>Le matériel mis à disposition par le PRESTATAIRE devra être rempli de manière uniforme et au maximum de la contenance, dans la limite de la réglementation applicable en matière de poids transporté.</p>
                <p>Le conditionnement des déchets, assuré par le CLIENT doit être extérieurement propre et présenter toutes les garanties de sécurité voulues pour permettre la manutention, le transport et le déchargement sans le moindre risque pour l'homme et l'environnement.</p>
                <p>Lors de chaque prestation de collecte effectuée par le PRESTATAIRE auprès du CLIENT, un bon d'enlèvement sera présenté et devra être signé par le CLIENT.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-red-600">5. ACCÈS AUX INSTALLATIONS</h3>
              <p className="text-sm text-gray-600">
                REMONDIS conserve à tout moment, dans le cadre du contrat, le libre accès aux installations du CLIENT, mais conviendra à l'avance et en temps opportun de chacune de ses interventions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-red-600">6. EXCLUSIVITÉ</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Le CLIENT s'engage à confier à REMONDIS la totalité des déchets du présent contrat. En contrepartie de cette exclusivité, REMONDIS garantit au CLIENT sa prestation de service.</p>
                <p>Le matériel, propriété de REMONDIS décrit dans les Conditions Particulières, restera propriété de REMONDIS après rupture du contrat entre les deux parties.</p>
                <p>En cas d'arrêt des prestations par le CLIENT, REMONDIS disposera de 15 jours ouvrés pour reprendre le matériel. Les frais engagés par REMONDIS pour ce retrait seront refacturés au CLIENT.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-red-600">7. DURÉE DU CONTRAT</h3>
              <p className="text-sm text-gray-600">
                Le contrat entre en vigueur à sa date de signature. Il est conclu pour une durée de 3 ans à compter de cette date. Il est renouvelable à la date d'anniversaire par période de 12 mois, par tacite reconduction. Il peut être mis fin au contrat, par l'une ou l'autre des parties, à chaque échéance annuelle, moyennant un préavis écrit de trois (3) mois adressé en lettre recommandée avec accusé de réception.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-red-600">8. FACTURATION</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>En rémunération de sa prestation, REMONDIS établira des factures, qui feront apparaître le prix Hors Taxes par tonne de déchet traité, majoré de la TVA. Tout autre impôt ou taxe à payer, et susceptible d'être majoré de la TVA, en application des lois et règlements de droit français ou européen est à la charge du CLIENT.</p>
                <p>Toute modification, soit de taux soit de la nature des taxes auxquelles les prestations donnent lieu, est dès sa date légale d'application, répercutée sur les prix des prestations à venir.</p>
                <p>Les réclamations relatives aux factures devront être introduites par écrit dans les huit jours de leur réception sous peine d'être rejetées.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-red-600">9. CONDITIONS DE RÈGLEMENT</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Les factures de REMONDIS sont payables, sans escompte au siège de facturation, au plus tard à 30 jours net date de facture.</p>
                <p>Elles pourront être réglées par le CLIENT par tout moyen de paiement, notamment par virement, traite, billet à ordre, chèque.</p>
                <p>En cas de valorisation des déchets, le règlement par REMONDIS s'effectuera à 30 jours fin de mois après réception de la facture CLIENT.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-red-600">10. INCIDENT DE PAIEMENT</h3>
              <p className="text-sm text-gray-600">
                Toute facture non intégralement réglée à son échéance sera immédiatement productive de pénalités de retard à un taux de 10% par an, avec un minimum irréductible de 155,00 €, et obligera le CLIENT à verser à REMONDIS une somme d'un montant de 40,00 € à titre d'indemnité de recouvrement, sans préjudice de tout dommages-intérêts complémentaires que REMONDIS pourrait faire valoir.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-red-600">11. ASSURANCE</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>REMONDIS est assuré pour les conséquences pécuniaires de la responsabilité civile qu'elle peut encourir à raison des dommages causés par son personnel au cours des interventions de ce dernier chez le CLIENT.</p>
                <p>Le CLIENT souscrira auprès d'une compagnie notoirement solvable une assurance « responsabilité civile produits et exploitation ». Il s'engage à maintenir ces garanties pendant la durée des relations contractuelles et à fournir sur demande de REMONDIS son attestation d'assurance.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-red-600">12. PRIX</h3>
              <p className="text-sm text-gray-600">
                Les tarifs seront révisés chaque année au 1er janvier pour application au 1er février suivant l'évolution des coûts de transport, pré traitement, regroupement et salaires. Si les conditions économiques ou industrielles qui prévalent à la date de conclusion des accords avec le CLIENT venaient à être modifiées de façon substantielle, REMONDIS et le CLIENT redéfiniront ensemble les modalités de la continuation éventuelle de leurs relations contractuelles.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-red-600">13. CAS DE FORCE MAJEURE</h3>
              <p className="text-sm text-gray-600">
                Si par la suite d'un cas de force majeur ou d'un cas fortuit, REMONDIS ou le CLIENT sont obligés d'interrompre leurs prestations, l'exécution du contrat pourra être suspendue ou résiliée pour les prestations restant à effectuer. Est considéré comme un cas de force majeure, tout événement de quelque nature que ce soit, qui a pour effet de rendre l'exécution des relations contractuelles impossible de manière momentanée ou définitive.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-red-600">14. ATTRIBUTION DE JURIDICTION ET LOI APPLICABLE</h3>
              <p className="text-sm text-gray-600">
                Tout litige susceptible de s'élever entre REMONDIS et son CLIENT quant à la formation, l'exécution ou l'interprétation des présentes sera soumis à la compétence exclusive du tribunal de Beauvais et ce, même en cas de pluralité des demandeurs ou d'appels en garantie.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2 text-red-600">15. CLAUSE DE SAUVEGARDE</h3>
              <p className="text-sm text-gray-600">
                Dans le cas où les conditions techniques, économiques, administratives, sociales ou fiscales existant à la date de la signature de la présente offre évolueraient de telle sorte que son équilibre économique se trouverait profondément modifié et entraînerait pour l'une ou pour l'autre des parties des obligations qu'elle ne pourrait équitablement supporter, le PRESTATAIRE et le CLIENT se réuniraient pour chercher des solutions conformes aux intérêts légitimes de chacun d'eux.
              </p>
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