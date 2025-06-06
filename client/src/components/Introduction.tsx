import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Footer from "@/components/Footer";
import { 
  Truck, 
  Recycle, 
  Shield, 
  Clock, 
  CheckCircle, 
  Star, 
  MapPin, 
  Calculator, 
  Phone, 
  Mail,
  Award,
  Zap,
  Users,
  TrendingUp,
  Leaf,
  Construction,
  Building2,
  Home,
  Factory,
  Calendar,
  ArrowRight,
  Play
} from "lucide-react";
import { Link } from "wouter";

export default function Introduction() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg border-b-2 border-red-600 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/3/32/Remondis_logo.svg" 
                alt="Remondis" 
                className="h-12 w-auto"
              />
              <div className="hidden md:flex items-center space-x-8 ml-8">
                <Link href="#services" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
                  Services
                </Link>
                <Link href="#process" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
                  Comment ça marche
                </Link>
                <Link href="/faq" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
                  FAQ
                </Link>
                <Link href="#contact" className="text-gray-700 hover:text-red-600 font-medium transition-colors">
                  Contact
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth">
                <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50">
                  Se connecter
                </Button>
              </Link>
              <Link href="/booking">
                <Button className="bg-red-600 hover:bg-red-700 text-white shadow-lg">
                  Réserver maintenant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Style Booking.com */}
      <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                  🏆 N°1 Européen de la gestion des déchets
                </Badge>
                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                  Location de
                  <span className="block text-white">Bennes</span>
                  <span className="block text-red-200">Professionnelle</span>
                </h1>
                <p className="text-xl md:text-2xl text-red-100 leading-relaxed">
                  Simplifiez la gestion de vos déchets avec notre plateforme digitale. 
                  Devis instantané, livraison express, traitement éco-responsable.
                </p>
              </div>
              
              <div className="flex justify-center">
                <Link href="/booking">
                  <Button size="lg" className="bg-white text-red-600 hover:bg-red-50 px-8 py-4 text-lg font-semibold shadow-xl">
                    <Calendar className="mr-2 h-5 w-5" />
                    Réserver ma benne
                  </Button>
                </Link>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">24h</div>
                  <div className="text-sm text-red-200">Livraison express</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">98%</div>
                  <div className="text-sm text-red-200">Satisfaction client</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">50k+</div>
                  <div className="text-sm text-red-200">Bennes livrées</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <Link href="/booking">
                <Button size="lg" className="w-full bg-white text-red-600 hover:bg-red-50 font-semibold py-6 text-xl shadow-2xl">
                  Calculer mon devis
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-red-100 text-red-600 border-red-200 px-4 py-2 mb-4">
              🚛 Nos Solutions
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Gamme Complète de
              <span className="block text-red-600">Bennes Professionnelles</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des solutions adaptées à chaque projet, du particulier aux grands chantiers industriels
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                volume: "8m³",
                icon: <Home className="h-8 w-8" />,
                title: "Particuliers",
                description: "Idéale pour rénovations, jardinage et déménagements",
                price: "À partir de 180€",
                color: "from-blue-500 to-blue-600",
                bgColor: "bg-blue-50",
                iconColor: "text-blue-600",
                features: ["Livraison 24h", "Jusqu'à 7 jours", "2 tonnes max"]
              },
              {
                volume: "15m³",
                icon: <Building2 className="h-8 w-8" />,
                title: "Artisans",
                description: "Parfaite pour travaux moyens et rénovations professionnelles",
                price: "À partir de 280€",
                color: "from-green-500 to-green-600",
                bgColor: "bg-green-50",
                iconColor: "text-green-600",
                features: ["Livraison express", "Flexibilité", "4 tonnes max"]
              },
              {
                volume: "22m³",
                icon: <Construction className="h-8 w-8" />,
                title: "Entreprises",
                description: "Pour chantiers de grande envergure et projets industriels",
                price: "À partir de 380€",
                color: "from-orange-500 to-orange-600",
                bgColor: "bg-orange-50",
                iconColor: "text-orange-600",
                features: ["Service dédié", "Planning adapté", "6 tonnes max"]
              },
              {
                volume: "30m³",
                icon: <Factory className="h-8 w-8" />,
                title: "Industries",
                description: "Volume maximal pour les plus gros projets industriels",
                price: "Sur devis",
                color: "from-red-500 to-red-600",
                bgColor: "bg-red-50",
                iconColor: "text-red-600",
                features: ["Solution sur-mesure", "Support 24/7", "10 tonnes max"]
              }
            ].map((service, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${service.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className={service.iconColor}>
                      {service.icon}
                    </div>
                  </div>
                  
                  <div className="text-center space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-black">{service.volume}</h3>
                      <h4 className="text-lg font-semibold text-gray-800">{service.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="text-2xl font-bold text-red-600">{service.price}</div>
                      <ul className="space-y-1">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="text-xs text-gray-500 flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Link href="/booking">
                      <Button className="w-full bg-black text-white hover:bg-gray-800 group-hover:bg-red-600 transition-colors duration-300">
                        Choisir cette benne
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-black text-white px-4 py-2 mb-4">
              🏆 Excellence Reconnue
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Pourquoi Choisir
              <span className="block text-red-600">REMONDIS ?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leader européen avec plus de 30 ans d'expertise dans la gestion des déchets et le recyclage
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Livraison Express",
                description: "Livraison et collecte dans les 24-48h selon votre planning",
                color: "bg-yellow-500",
                bgColor: "bg-yellow-50",
                stat: "24h",
                statLabel: "Délai moyen"
              },
              {
                icon: <Leaf className="h-8 w-8" />,
                title: "Recyclage Écologique",
                description: "Traitement responsable et recyclage maximal de vos déchets",
                color: "bg-green-500",
                bgColor: "bg-green-50",
                stat: "95%",
                statLabel: "Taux recyclage"
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Service Garanti",
                description: "Assurance responsabilité civile et service client dédié",
                color: "bg-blue-500",
                bgColor: "bg-blue-50",
                stat: "100%",
                statLabel: "Sécurisé"
              },
              {
                icon: <Calculator className="h-8 w-8" />,
                title: "Devis Instantané",
                description: "Calculez votre prix en temps réel avec notre configurateur",
                color: "bg-purple-500",
                bgColor: "bg-purple-50",
                stat: "2min",
                statLabel: "Devis rapide"
              },
              {
                icon: <CheckCircle className="h-8 w-8" />,
                title: "Conformité Légale",
                description: "Bordereaux de suivi et traçabilité complète des déchets",
                color: "bg-red-500",
                bgColor: "bg-red-50",
                stat: "ISO",
                statLabel: "Certifié"
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: "Expert Reconnu",
                description: "Plus de 30 ans d'expérience dans la gestion des déchets",
                color: "bg-orange-500",
                bgColor: "bg-orange-50",
                stat: "30+",
                statLabel: "Ans expertise"
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
                <CardContent className="p-8 text-center">
                  <div className={`w-20 h-20 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className={`${feature.color} text-white rounded-xl p-3`}>
                      {feature.icon}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-black">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    
                    <div className="pt-4 border-t border-gray-100">
                      <div className="text-2xl font-bold text-red-600">{feature.stat}</div>
                      <div className="text-sm text-gray-500">{feature.statLabel}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="bg-gray-50 rounded-3xl p-12">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-black mb-4">Certifications & Partenaires</h3>
              <p className="text-gray-600">Nos labels de qualité et certifications professionnelles</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
              {[
                { name: "ISO 14001", desc: "Management environnemental" },
                { name: "ICPE", desc: "Centres agréés" },
                { name: "BSD", desc: "Conformité légale" },
                { name: "Éco-organisme", desc: "Partenaire certifié" }
              ].map((cert, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-red-600" />
                  </div>
                  <h4 className="font-semibold text-black">{cert.name}</h4>
                  <p className="text-sm text-gray-500">{cert.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-red-600 text-white px-4 py-2 mb-4">
              ⚡ Processus Simplifié
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Comment Ça Marche ?
              <span className="block text-red-400">Simple comme bonjour</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Notre processus digital optimisé vous fait gagner du temps à chaque étape
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Configurez",
                desc: "Sélectionnez vos déchets et votre localisation",
                icon: <MapPin className="h-8 w-8" />,
                color: "from-red-500 to-red-600"
              },
              {
                step: "02", 
                title: "Choisissez",
                desc: "Sélectionnez la benne adaptée à vos besoins",
                icon: <Construction className="h-8 w-8" />,
                color: "from-orange-500 to-orange-600"
              },
              {
                step: "03",
                title: "Planifiez",
                desc: "Choisissez vos créneaux de livraison et collecte",
                icon: <Calendar className="h-8 w-8" />,
                color: "from-yellow-500 to-yellow-600"
              },
              {
                step: "04",
                title: "Renseignez",
                desc: "Complétez vos informations de contact et livraison",
                icon: <Users className="h-8 w-8" />,
                color: "from-green-500 to-green-600"
              },
              {
                step: "05",
                title: "Payez",
                desc: "Réglez en ligne de façon 100% sécurisée",
                icon: <Shield className="h-8 w-8" />,
                color: "from-blue-500 to-blue-600"
              },
              {
                step: "06",
                title: "Recevez",
                desc: "Votre benne arrive selon le planning convenu",
                icon: <Truck className="h-8 w-8" />,
                color: "from-purple-500 to-purple-600"
              }
            ].map((item, index) => (
              <Card key={index} className="bg-gray-900 border-gray-800 group hover:bg-gray-800 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <div className="text-white">
                        {item.icon}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-3xl font-bold text-red-400">{item.step}</span>
                        <h3 className="text-xl font-bold text-white">{item.title}</h3>
                      </div>
                      <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Timeline */}
          <div className="mt-16 text-center">
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-red-400" />
                <span className="text-gray-300">Durée totale:</span>
                <span className="text-white font-bold">Moins de 5 minutes</span>
              </div>
              <Separator className="w-12 bg-gray-700" />
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">Satisfaction:</span>
                <span className="text-white font-bold">98% des clients</span>
              </div>
            </div>
            
            <Link href="/booking">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg shadow-xl">
                <ArrowRight className="mr-2 h-5 w-5" />
                Commencer maintenant
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white py-20">
        <div className="max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <Badge className="bg-white/20 text-white border-white/30 px-6 py-3 text-lg">
              Démarrez votre projet dès maintenant
            </Badge>
            
            <h2 className="text-4xl md:text-6xl font-bold leading-tight">
              Prêt à Commander
              <span className="block text-red-200">Votre Benne ?</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-red-100 max-w-4xl mx-auto leading-relaxed">
              Obtenez votre devis personnalisé en moins de 2 minutes et bénéficiez 
              de notre expertise reconnue dans toute la France
            </p>

            <div className="flex justify-center">
              <Link href="/booking">
                <Button size="lg" className="bg-white text-red-600 hover:bg-red-50 px-10 py-5 text-xl font-bold shadow-2xl">
                  <Calendar className="mr-3 h-6 w-6" />
                  Commencer ma commande
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-white/20">
              <div className="text-center">
                <div className="text-3xl font-bold">24h</div>
                <div className="text-red-200">Livraison express</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">50k+</div>
                <div className="text-red-200">Clients satisfaits</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">98%</div>
                <div className="text-red-200">Taux de satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-red-100 text-red-600 border-red-200 px-4 py-2">
                  Support personnalisé
                </Badge>
                <h3 className="text-4xl font-bold text-black">
                  Besoin d'une Solution
                  <span className="block text-red-600">Personnalisée ?</span>
                </h3>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Notre équipe d'experts est à votre disposition pour étudier vos besoins 
                  spécifiques et vous proposer la solution la plus adaptée à votre projet.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Phone className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black">Assistance téléphonique</h4>
                    <p className="text-gray-600">Du lundi au vendredi, 8h-18h</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Mail className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black">Support par email</h4>
                    <p className="text-gray-600">Réponse sous 2h en moyenne</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black">Équipe dédiée</h4>
                    <p className="text-gray-600">Conseillers spécialisés par secteur</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-white border-0 shadow-2xl">
              <CardContent className="p-8">
                <h4 className="text-2xl font-bold text-black mb-6">Contactez-nous</h4>
                
                <div className="space-y-6">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white py-4 text-lg justify-start">
                    <Phone className="mr-3 h-5 w-5" />
                    +33 (0)800 54 438
                  </Button>
                  
                  <Button variant="outline" className="w-full border-red-600 text-red-600 hover:bg-red-50 py-4 text-lg justify-start">
                    <Mail className="mr-3 h-5 w-5" />
                    contact@remondis.fr
                  </Button>

                  <Separator className="my-6" />

                  <div className="text-center space-y-3">
                    <h5 className="font-semibold text-black">Disponibilité</h5>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Lundi - Vendredi: 8h00 - 18h00</p>
                      <p>Samedi: 9h00 - 12h00</p>
                      <p>Urgences 24h/7j disponibles</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}