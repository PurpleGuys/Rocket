import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Recycle, Shield, Clock, CheckCircle, Star } from "lucide-react";
import { Link } from "wouter";

export default function Introduction() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Location de <span className="text-red-600">Bennes</span>
              <br />
              <span className="text-green-600">Professionnelle</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Simplifiez la gestion de vos déchets avec notre service de location de bennes 
              professionnel. Devis instantané, livraison rapide, traitement écologique.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg">
                  Commander maintenant
                </Button>
              </Link>
              <Link href="/faq">
                <Button variant="outline" size="lg" className="border-gray-300 px-8 py-4 text-lg">
                  Questions fréquentes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Nos Services de Location
          </h2>
          <p className="text-lg text-gray-600">
            Une gamme complète de bennes pour tous vos besoins
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-12 h-8 bg-red-600 rounded"></div>
              </div>
              <h3 className="font-semibold text-lg mb-2">Benne 8m³</h3>
              <p className="text-gray-600 text-sm">Idéale pour les petits travaux de rénovation</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-12 h-8 bg-blue-600 rounded"></div>
              </div>
              <h3 className="font-semibold text-lg mb-2">Benne 15m³</h3>
              <p className="text-gray-600 text-sm">Parfaite pour les travaux moyens</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-12 h-8 bg-green-600 rounded"></div>
              </div>
              <h3 className="font-semibold text-lg mb-2">Benne 22m³</h3>
              <p className="text-gray-600 text-sm">Pour les chantiers de grande envergure</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-12 h-8 bg-orange-600 rounded"></div>
              </div>
              <h3 className="font-semibold text-lg mb-2">Benne 30m³</h3>
              <p className="text-gray-600 text-sm">Volume maximal pour les gros projets</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi Choisir REMONDIS ?
            </h2>
            <p className="text-lg text-gray-600">
              Leader européen de la gestion des déchets et du recyclage
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Livraison Rapide</h3>
              <p className="text-gray-600">
                Livraison et collecte dans les 24-48h selon votre planning
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Recycle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Recyclage Écologique</h3>
              <p className="text-gray-600">
                Traitement responsable et recyclage maximal de vos déchets
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Service Garanti</h3>
              <p className="text-gray-600">
                Assurance responsabilité civile et service client dédié
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Devis Instantané</h3>
              <p className="text-gray-600">
                Calculez votre prix en temps réel avec notre configurateur
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Conformité Légale</h3>
              <p className="text-gray-600">
                Bordereaux de suivi et traçabilité complète des déchets
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Expert Reconnu</h3>
              <p className="text-gray-600">
                Plus de 30 ans d'expérience dans la gestion des déchets
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Comment Ça Marche ?
          </h2>
          <p className="text-lg text-gray-600">
            Un processus simple en 6 étapes
          </p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-8">
          {[
            { step: "1", title: "Sélection", desc: "Choisissez votre type de déchets" },
            { step: "2", title: "Localisation", desc: "Indiquez votre code postal" },
            { step: "3", title: "Benne", desc: "Sélectionnez la taille appropriée" },
            { step: "4", title: "Données", desc: "Renseignez vos informations" },
            { step: "5", title: "Paiement", desc: "Réglez en ligne en toute sécurité" },
            { step: "6", title: "Livraison", desc: "Recevez votre benne rapidement" }
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                {item.step}
              </div>
              <h4 className="font-semibold mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-red-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à Commander Votre Benne ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Obtenez votre devis personnalisé en moins de 2 minutes
          </p>
          <Link href="/booking">
            <Button size="lg" variant="secondary" className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
              Commencer ma commande
            </Button>
          </Link>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Besoin d'une Solution Personnalisée ?
          </h3>
          <p className="text-gray-600 mb-6">
            Notre équipe commerciale est à votre disposition pour étudier vos besoins spécifiques
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
              📧 Nous contacter
            </Button>
            <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
              📞 +33 (0)800 54 438
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}