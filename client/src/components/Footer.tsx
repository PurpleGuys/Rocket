import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Informations entreprise */}
          <div>
            <h3 className="font-bold text-red-500 text-lg mb-4">REMONDIS DD</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>Zone d'Activité</p>
              <p>60430 Alonne, France</p>
              <p>Tél: 03.44.00.00.00</p>
              <p>Email: contact@remondis-dd.fr</p>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-white text-lg mb-4">Nos services</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>Collecte de déchets</p>
              <p>Location de bennes</p>
              <p>Traitement agréé</p>
              <p>Transport sécurisé</p>
            </div>
          </div>

          {/* Liens légaux */}
          <div>
            <h3 className="font-bold text-white text-lg mb-4">Informations</h3>
            <div className="space-y-2 text-sm">
              <Link href="/legal" className="text-gray-300 hover:text-red-400 block">
                Mentions légales & CGV
              </Link>
              <Link href="/legal" className="text-gray-300 hover:text-red-400 block">
                Politique de confidentialité
              </Link>
              <Link href="/legal" className="text-gray-300 hover:text-red-400 block">
                Droit de rétractation
              </Link>
            </div>
          </div>

          {/* Certifications */}
          <div>
            <h3 className="font-bold text-white text-lg mb-4">Certifications</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>ISO 14001</p>
              <p>Centres agréés ICPE</p>
              <p>Conformité BSD</p>
              <p>Code environnement</p>
            </div>
          </div>
        </div>

        <Separator className="my-6 bg-gray-700" />

        {/* Mentions légales obligatoires */}
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4 text-xs text-gray-400">
            <div>
              <p><strong>REMONDIS DD SAS</strong> - SAS au capital de 500 000 €</p>
              <p>SIRET: 890 123 456 00015 - RCS Compiègne B 890 123 456</p>
              <p>Code APE: 3811Z - TVA: FR 89 890 123 456</p>
            </div>
            <div>
              <p>Activité soumise au Code de l'environnement</p>
              <p>Prestation de collecte et traitement de déchets</p>
              <p>Prix TTC - TVA 20% - Facturation après prestation</p>
            </div>
          </div>

          <Separator className="bg-gray-700" />

          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
            <div className="mb-2 md:mb-0">
              <p>&copy; 2025 REMONDIS DD. Tous droits réservés.</p>
            </div>
            <div className="flex space-x-4">
              <span>Médiation: CNPM</span>
              <span>Juridiction: Compiègne</span>
              <span>Droit applicable: France</span>
            </div>
          </div>

          {/* Avertissement réglementaire */}
          <div className="bg-gray-800 p-3 rounded text-xs text-gray-300">
            <p className="font-semibold mb-1">Information réglementaire :</p>
            <p>
              Service de collecte et traitement de déchets conforme au Code de l'environnement. 
              Traitement exclusivement en centres agréés ICPE. Bordereau de suivi fourni. 
              Droit de rétractation 14 jours (Art. L221-18). 
              Réclamations: service.client@remondis-dd.fr
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}