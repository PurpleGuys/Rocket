import { db } from "./server/db.ts";
import { services, wasteTypes } from "./shared/schema.ts";

async function addTestServices() {
  try {
    console.log("Adding waste types...");
    
    // Add waste types
    const wasteTypesData = [
      { name: "Gravats", code: "170904", description: "Déchets de construction et démolition" },
      { name: "Déchets Industriels Banals", code: "200301", description: "DIB - Déchets non dangereux" },
      { name: "Déchets Verts", code: "200201", description: "Déchets de jardin et espaces verts" },
      { name: "Bois", code: "170201", description: "Déchets de bois non traité" },
      { name: "Plâtre", code: "170802", description: "Matériaux à base de plâtre" }
    ];
    
    for (const wt of wasteTypesData) {
      await db.insert(wasteTypes).values(wt).onConflictDoNothing();
    }
    
    console.log("Adding services...");
    
    // Add services
    const servicesData = [
      {
        name: "Benne 8m³",
        volume: 8,
        wasteTypeId: 1,
        basePrice: "350.00",
        pricePerDay: "15.00",
        description: "Idéale pour les petits chantiers",
        imageUrl: "/images/benne-8m3.jpg"
      },
      {
        name: "Benne 10m³",
        volume: 10,
        wasteTypeId: 1,
        basePrice: "450.00",
        pricePerDay: "20.00",
        description: "Pour les chantiers moyens",
        imageUrl: "/images/benne-10m3.jpg"
      },
      {
        name: "Benne 15m³",
        volume: 15,
        wasteTypeId: 2,
        basePrice: "550.00",
        pricePerDay: "25.00",
        description: "Pour les gros chantiers",
        imageUrl: "/images/benne-15m3.jpg"
      },
      {
        name: "Benne 20m³",
        volume: 20,
        wasteTypeId: 2,
        basePrice: "650.00",
        pricePerDay: "30.00",
        description: "Pour les très gros volumes",
        imageUrl: "/images/benne-20m3.jpg"
      },
      {
        name: "Big Bag",
        volume: 1,
        wasteTypeId: 1,
        basePrice: "120.00",
        pricePerDay: "5.00",
        description: "Solution économique pour petits volumes",
        imageUrl: "/images/big-bag.jpg"
      }
    ];
    
    for (const service of servicesData) {
      await db.insert(services).values(service);
    }
    
    console.log("✅ Services and waste types added successfully!");
    
    // Verify
    const allServices = await db.select().from(services);
    console.log(`Total services: ${allServices.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error adding services:", error);
    process.exit(1);
  }
}

addTestServices();