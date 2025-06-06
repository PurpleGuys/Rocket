import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Clock, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function FAQ() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              FAQ - Questions et Réponses
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Vous avez des questions sur la procédure de commande et d'élimination ?
              Vous cherchez des informations sur nos services de conteneurs et de location de toilettes ?
              Dans notre section FAQ, vous trouverez des réponses et des faits intéressants concernant votre commande dans la boutique REMONDIS.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Questions générales</h3>
              <p className="text-sm text-gray-600">sur l'ordonnance</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Service de conteneurs</h3>
              <p className="text-sm text-gray-600">Questions sur les bennes</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Livraison et collecte</h3>
              <p className="text-sm text-gray-600">Questions logistiques</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Service clients</h3>
              <p className="text-sm text-gray-600">Aide et contact</p>
            </CardContent>
          </Card>
        </div>

        {/* Questions générales */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions générales sur l'ordonnance</h2>
          <Card>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="q1">
                  <AccordionTrigger className="text-left">
                    Comment puis-je commander une solution d'élimination sur mesure auprès du magasin REMONDIS?
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="font-medium">C'est aussi simple que cela:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Sélection des déchets à éliminer</li>
                        <li>Indication du code postal de votre lieu de livraison</li>
                        <li>Choix de la solution d'élimination appropriée</li>
                        <li>Saisie de vos données personnelles</li>
                        <li>Paiement à l'avance</li>
                        <li>Vérifiez et envoyez votre commande - C'est fait !</li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q2">
                  <AccordionTrigger className="text-left">
                    Est-il possible de commander plusieurs conteneurs (différents) en même temps?
                  </AccordionTrigger>
                  <AccordionContent>
                    Si vous le souhaitez, vous pouvez commander jusqu'à cinq conteneurs différents. Veuillez noter qu'il peut ne pas être possible de fournir toutes les solutions d'élimination en une seule livraison en même temps. Votre interlocuteur personnel se fera un plaisir de vous informer à ce sujet et de fixer un rendez-vous avec vous.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q3">
                  <AccordionTrigger className="text-left">
                    Un enregistrement obligatoire est-il nécessaire pour passer une commande dans le magasin REMONDIS?
                  </AccordionTrigger>
                  <AccordionContent>
                    Non, vous n'avez pas besoin de vous inscrire pour passer une commande dans le REMONDIS Shop! Toutefois, au cours du processus de commande, il vous sera demandé de saisir vos données personnelles pour le traitement de la commande et, le cas échéant, pour la facturation.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q4">
                  <AccordionTrigger className="text-left">
                    Quel est le coût de la commande dans la boutique REMONDIS? Devrai-je payer des frais supplémentaires?
                  </AccordionTrigger>
                  <AccordionContent>
                    Le prix total indiqué dans le panier d'achat et également lorsque vous terminez votre commande est le prix complet. Cela vous garantit une période de stationnement de 14 jours pour le service de conteneurs. La période de location peut être prolongée à volonté moyennant une redevance appropriée. Il n'y a pas de coûts supplémentaires dans le cadre des conditions contractuelles.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q5">
                  <AccordionTrigger className="text-left">
                    Existe-t-il une solution d'élimination pour l'accumulation régulière des déchets?
                  </AccordionTrigger>
                  <AccordionContent>
                    Bien entendu, nos conteneurs et nos services d'élimination sont également à votre disposition à intervalles réguliers. Pour les clients commerciaux et les demandes individuelles d'élimination des déchets, nous vous proposons un service d'élimination des déchets sur mesure. Il suffit de nous contacter en utilisant notre formulaire de contact ou notre service d'assistance téléphonique gratuit +33 (0) 800 54 438!
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="q6">
                  <AccordionTrigger className="text-left">
                    Vous avez des questions concernant votre commande ou vous avez fait une erreur?
                  </AccordionTrigger>
                  <AccordionContent>
                    Vous pouvez alors contacter directement votre interlocuteur personnel sur place. Vous le trouverez dans votre e-mail de confirmation de commande. Vous y trouverez un aperçu de votre commande ainsi que l'adresse de la société REMONDIS qui fournit le service, votre adresse de livraison et les conditions de paiement choisies.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* Questions sur le service de conteneurs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions sur le service de conteneurs</h2>
          <Card>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="c1">
                  <AccordionTrigger className="text-left">
                    Quelle est la bonne taille de conteneur?
                  </AccordionTrigger>
                  <AccordionContent>
                    Dans la boutique REMONDIS, vous trouverez un grand nombre de conteneurs de différentes tailles, selon le type de service d'élimination des déchets que vous souhaitez. La taille du conteneur nécessaire dépend du volume de vos déchets. Vous trouverez un aperçu des différentes tailles de conteneurs dans les informations sur les articles correspondants et dans notre lexique détaillé des conteneurs.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="c2">
                  <AccordionTrigger className="text-left">
                    Quelles sont les dimensions des différents conteneurs?
                  </AccordionTrigger>
                  <AccordionContent>
                    Dans la boutique REMONDIS, vous trouverez un grand nombre de conteneurs de différentes dimensions selon le type de service d'élimination des déchets que vous souhaitez. Vous trouverez toutes les informations sur nos solutions de gestion des déchets dans la description détaillée.
                    <div className="mt-4 space-y-2">
                      <p className="font-medium">C'est aussi simple que cela:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Sélectionnez les déchets à éliminer et indiquez votre code postal</li>
                        <li>Sélection du conteneur approprié parmi notre vaste gamme de services</li>
                        <li>Appelez les informations sous les images des conteneurs</li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="c3">
                  <AccordionTrigger className="text-left">
                    Quel est le contenu autorisé dans mon conteneur? Qu'est-ce qui ne l'est pas?
                  </AccordionTrigger>
                  <AccordionContent>
                    Les déchets que vous êtes autorisé à remplir dans votre conteneur dépendent du type de déchets que vous avez choisi lors de votre commande. Vous trouverez les définitions correspondantes des différents types de déchets dans la description détaillée des différentes fractions : Que peut-on mettre dans le conteneur? Qu'est-ce qui n'est pas autorisé dans le conteneur?
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="c4">
                  <AccordionTrigger className="text-left">
                    Jusqu'à quelle hauteur le conteneur peut-il être rempli?
                  </AccordionTrigger>
                  <AccordionContent>
                    Tous les conteneurs peuvent être remplis uniformément sur toute la surface du conteneur, au maximum jusqu'au bord de chargement avant ou arrière, afin de garantir la sécurité du transport. La hauteur des parois avant et arrière ne doit pas être dépassée par le matériel chargé stocké de manière centralisée. Il n'est pas permis de soulever les murs sous votre propre responsabilité. En outre, aucun objet ne doit dépasser du conteneur.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="c5">
                  <AccordionTrigger className="text-left">
                    Que se passe-t-il si mon conteneur n'est pas correctement rempli?
                  </AccordionTrigger>
                  <AccordionContent>
                    Les déchets que vous êtes autorisé à remplir dans votre conteneur dépendent du type de déchets que vous avez choisi lors de votre commande. Si votre conteneur contient d'autres types de déchets, le conteneur entier sera à nouveau déclaré et facturé en fonction du contenu effectivement rempli. Vous devez donc vérifier attentivement les conditions et modalités de remplissage avant de passer votre commande.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="c6">
                  <AccordionTrigger className="text-left">
                    Comment puis-je protéger mon conteneur contre le remplissage extérieur?
                  </AccordionTrigger>
                  <AccordionContent>
                    Pour presque tous les conteneurs, nous proposons un couvercle à charnière ou une bâche enroulable. Elles offrent non seulement une protection contre le remplissage par des personnes extérieures, mais aussi contre le vol ou les influences climatiques. Il suffit de choisir l'équipement supplémentaire couvercle à charnière / bâche roulante lors du choix du conteneur approprié.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* Questions sur la livraison et la collecte */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions sur la livraison et la collecte</h2>
          <Card>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="d1">
                  <AccordionTrigger className="text-left">
                    Quand la livraison de mon conteneur aura-t-elle lieu?
                  </AccordionTrigger>
                  <AccordionContent>
                    La livraison est toujours effectuée à la date de votre choix : il vous suffit de sélectionner la date de livraison souhaitée dans votre commande et, après avoir vérifié la disponibilité, vous recevrez une confirmation de votre commande de la part de la société REMONDIS locale qui fournit le service dans les plus brefs délais. Plus vous commandez tôt, plus la position de votre conteneur à la date souhaitée est sûre.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="d2">
                  <AccordionTrigger className="text-left">
                    Où peut-on placer le conteneur?
                  </AccordionTrigger>
                  <AccordionContent>
                    Lors de la commande, vous avez le choix : vous pouvez placer votre conteneur sur un espace public (par exemple, rue, trottoir, etc.) ou sur votre propriété privée. Aucun permis spécial n'est nécessaire pour l'installation sur votre propre site. Si vous souhaitez installer le système sur un espace public, vous devrez obtenir une autorisation spéciale d'utilisation auprès de votre ville ou de votre municipalité.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="d3">
                  <AccordionTrigger className="text-left">
                    De combien d'espace le camion a-t-il besoin pour la livraison et l'enlèvement?
                  </AccordionTrigger>
                  <AccordionContent>
                    Pour garantir une installation/collecte sans problème, la route d'accès doit être accessible au camion et ne pas être bloquée par des arbres bas, des lanternes, des panneaux, etc. Les règles de circulation prévues par la loi sur la circulation routière doivent être respectées. En outre, les conteneurs ne peuvent être installés/collectés que dans un parking avec une aire de stationnement fixe ou une aire de roulement.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="d4">
                  <AccordionTrigger className="text-left">
                    Ma présence est-elle requise pour la livraison/collecte?
                  </AccordionTrigger>
                  <AccordionContent>
                    Nous vous recommandons d'être présent lors de la livraison et de la collecte afin de vous assurer que le conteneur est placé au bon endroit. En outre, la livraison ou la collecte doit être confirmée au conducteur du véhicule porte-conteneurs. Si la condition paiement comptant est choisie, la commande doit également être payée directement au chauffeur.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="d5">
                  <AccordionTrigger className="text-left">
                    Quelle est la durée de la période de positionnement? Peut-elle être prolongée?
                  </AccordionTrigger>
                  <AccordionContent>
                    Le prix d'un conteneur comprend une période de stockage maximale de 14 jours. Pendant cette période, vous pouvez quitter le conteneur et le remplir sans problème. Après cette période, nous vous facturerons un prix de location mensuel. Vous pouvez demander à votre interlocuteur personnel les conditions applicables et, si nécessaire, convenir immédiatement d'une période de location prolongée.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="d6">
                  <AccordionTrigger className="text-left">
                    Puis-je déplacer, relocaliser ou retourner le conteneur?
                  </AccordionTrigger>
                  <AccordionContent>
                    Afin de garantir une collecte sans problème, vous ne devez pas déplacer, déplacer ou tourner le conteneur, surtout si le site d'installation est limité. En fonction de la taille et du contenu de votre conteneur, il peut s'avérer impossible de le remettre dans sa position initiale après le remplissage. Les frais supplémentaires qui en découlent vous seront facturés dans une facture séparée.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* Contact Section */}
        <section className="mb-12">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  D'autres questions ? Contactez-nous !
                </h2>
                <p className="text-gray-600">
                  Notre équipe d'experts est à votre disposition pour répondre à toutes vos questions spécifiques
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold mb-1">Assistance téléphonique</h4>
                  <p className="text-sm text-gray-600 mb-2">Service gratuit</p>
                  <p className="font-medium text-red-600">+33 (0) 800 54 438</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold mb-1">Email</h4>
                  <p className="text-sm text-gray-600 mb-2">Réponse sous 24h</p>
                  <p className="font-medium text-blue-600">commercial@remondis.fr</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold mb-1">Horaires</h4>
                  <p className="text-sm text-gray-600">Lun-Ven: 8h-18h</p>
                  <p className="text-sm text-gray-600">Sam: 8h-12h</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold mb-1">Agences</h4>
                  <p className="text-sm text-gray-600 mb-2">Partout en France</p>
                  <p className="font-medium text-purple-600">Trouver une agence</p>
                </div>
              </div>

              <div className="text-center mt-8">
                <Link href="/booking">
                  <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3">
                    Commencer ma commande
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}