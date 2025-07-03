#!/bin/bash

# CORRECTION BASE DE DONNÉES VPS - CRÉER LES TABLES MANQUANTES
echo "🗄️ CORRECTION BASE DE DONNÉES VPS"
echo "================================="

# 1. Vérifier la connexion PostgreSQL
echo "🔍 Test connexion PostgreSQL..."
if sudo docker exec bennespro_postgres psql -U postgres -d bennespro -c "SELECT version();" &>/dev/null; then
    echo "✅ PostgreSQL accessible"
else
    echo "❌ PostgreSQL inaccessible - arrêt du script"
    exit 1
fi

# 2. Lister les tables existantes
echo "📊 Tables actuelles dans la base:"
sudo docker exec bennespro_postgres psql -U postgres -d bennespro -c "\dt"

# 3. Copier drizzle.config.ts dans le container si nécessaire
echo "⚙️ Configuration Drizzle..."
if [ -f "drizzle.config.ts" ]; then
    sudo docker cp drizzle.config.ts bennespro_app:/app/
    echo "✅ drizzle.config.ts copié"
else
    echo "⚠️ drizzle.config.ts non trouvé - création..."
    cat > drizzle.config.ts << 'EOF'
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
EOF
    sudo docker cp drizzle.config.ts bennespro_app:/app/
fi

# 4. Exécuter la migration Drizzle dans le container
echo "🚀 Exécution migration Drizzle..."
sudo docker exec -e DATABASE_URL="postgresql://postgres:BennesProSecure2024!@postgres:5432/bennespro" bennespro_app sh -c "
    cd /app && 
    npx drizzle-kit push
"

# 5. Vérifier que les tables ont été créées
echo "✅ Vérification des tables créées:"
sudo docker exec bennespro_postgres psql -U postgres -d bennespro -c "
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
"

# 6. Insérer des données de test si les tables sont vides
echo "📝 Insertion de données de test..."
sudo docker exec bennespro_postgres psql -U postgres -d bennespro -c "
-- Vérifier si la table services existe et est vide
DO \$\$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'services') THEN
        IF NOT EXISTS (SELECT 1 FROM services LIMIT 1) THEN
            -- Insérer des services de test
            INSERT INTO services (name, volume, base_price, description, image_url, length, width, height, waste_types, max_weight, included_services, is_active) VALUES
            ('Benne 10m³', 10, 150.00, 'Benne standard pour déchets de construction', '/images/benne-10m3.jpg', 300, 200, 150, '{\"construction\", \"renovation\"}', 3000, '{\"livraison\", \"collecte\"}', true),
            ('Benne 20m³', 20, 250.00, 'Grande benne pour gros chantiers', '/images/benne-20m3.jpg', 500, 250, 200, '{\"construction\", \"demolition\"}', 5000, '{\"livraison\", \"collecte\", \"bâchage\"}', true);
            
            RAISE NOTICE 'Services de test insérés';
        END IF;
    END IF;
    
    -- Faire de même pour waste_types
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'waste_types') THEN
        IF NOT EXISTS (SELECT 1 FROM waste_types LIMIT 1) THEN
            INSERT INTO waste_types (name, category, price_per_ton, description, is_hazardous, is_active) VALUES
            ('Déchets de construction', 'Construction', 80.00, 'Béton, briques, carrelage', false, true),
            ('Déchets verts', 'Organique', 45.00, 'Branches, feuilles, gazon', false, true),
            ('Déchets mixtes', 'Mixte', 120.00, 'Déchets non triés', false, true);
            
            RAISE NOTICE 'Types de déchets de test insérés';
        END IF;
    END IF;
END \$\$;
"

# 7. Test des API après correction
echo "🧪 Test des API après correction..."
sleep 5

echo "Test API services:"
curl -s -w "Status: %{http_code}\n" http://localhost:8080/api/services | head -100

echo ""
echo "Test API waste-types:"
curl -s -w "Status: %{http_code}\n" http://localhost:8080/api/waste-types | head -100

echo ""
echo "Test API health:"
curl -s -w "Status: %{http_code}\n" http://localhost:8080/api/health

# 8. Redémarrer le container app pour s'assurer de la prise en compte
echo "🔄 Redémarrage container application..."
sudo docker restart bennespro_app

echo "⏳ Attente redémarrage (30s)..."
sleep 30

# 9. Test final
echo "🎯 TEST FINAL:"
echo "============="
curl -s http://localhost:8080/api/health && echo ""
curl -s http://localhost:8080/api/services | jq length 2>/dev/null && echo " services trouvés" || echo "Erreur API services"

echo ""
echo "✅ CORRECTION BASE DE DONNÉES TERMINÉE"
echo "====================================="
echo "🌐 Testez: https://purpleguy.world"
echo "📊 API: https://purpleguy.world/api/health"
echo "🔧 Services: https://purpleguy.world/api/services"