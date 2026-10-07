import { Response, Router } from "express";
import { admin, db } from "../../../config/firebase-admin";
import { authenticateToken, authorizeAdmin, AuthenticatedRequest } from "../../../middlewares/auth";
import { safeLogger } from "../../../utils/logger";

const router = Router();

export const SEED_PRODUCTS = [
  {
    name: "Canapé Modular 'Atlas'",
    price: 145000,
    category: "Maison & Déco",
    description: "Un canapé moderne inspiré par les paysages de l'Atlas. Tissu premium et confort absolu.",
    image: "/images/placeholders/product.svg",
    wilaya: "Alger",
    stock: 5,
    rating: 4.8,
    tags: ["Premium", "Salon", "Moderne"],
  },
  {
    name: "Jus d'Orange Pressé",
    price: 350,
    category: "Supermarché",
    description: "Jus d'orange 100% naturel sans sucre ajouté.",
    image: "/images/placeholders/product.svg",
    wilaya: "Alger",
    stock: 120,
    rating: 4.9,
    tags: ["Supermarché", "Jus", "Boisson"],
  },
  {
    name: "Lampe 'Sahara Glow'",
    price: 32000,
    category: "Luminaires",
    description: "Une lumière d'ambiance qui rappelle les couchers de soleil du Sahara.",
    image: "/images/placeholders/product.svg",
    wilaya: "Ghardaïa",
    stock: 8,
    rating: 4.7,
    tags: ["Lumière", "Ambiance", "Design"],
  },
  {
    name: "Tapis Zindkh de Constantine",
    price: 85000,
    category: "Tapis",
    description: "Tapis tissé main selon la tradition séculaire de l'Est Algérien.",
    image: "/images/placeholders/product.svg",
    wilaya: "Constantine",
    stock: 2,
    rating: 5,
    tags: ["Tapis", "Handmade", "Constantine"],
  },
  {
    name: "Machine à Café Espresso DZ",
    price: 45000,
    category: "Électronique & Électroménager",
    description: "Performances professionnelles pour votre cuisine.",
    image: "/images/placeholders/product.svg",
    wilaya: "Oran",
    stock: 15,
    rating: 4.6,
    tags: ["Cuisine", "Tech", "Café"],
  },
  {
    name: "Vase Artisanal d'Aït Yenni",
    price: 18000,
    category: "Artisanat",
    description: "Vase céramique fait main sculpté par des artisans de Kabylie.",
    image: "/images/placeholders/product.svg",
    wilaya: "Tizi Ouzou",
    stock: 10,
    rating: 4.9,
    tags: ["Artisanat", "Kabylie", "Céramique"],
  },
];

// GET /api/v1/admin/seed/status - Compter les produits de démonstration
router.get("/admin/seed/status", authenticateToken, authorizeAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const seedSnapshot = await db.collection("products").where("sellerId", "==", "admin_seed").get();
    const demoFlagSnapshot = await db.collection("products").where("isSeed", "==", true).get();

    const uniqueDocIds = new Set<string>();
    seedSnapshot.docs.forEach((doc) => uniqueDocIds.add(doc.id));
    demoFlagSnapshot.docs.forEach((doc) => uniqueDocIds.add(doc.id));

    res.json({
      success: true,
      count: uniqueDocIds.size,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    safeLogger.error("[AdminSeed] ❌ Erreur comptage seed:", { error: message });
    res.status(500).json({ error: message });
  }
});

// POST /api/v1/admin/seed/generate - Générer les produits de démonstration
router.post("/admin/seed/generate", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const batch = db.batch();
    const insertedIds: string[] = [];

    for (const prod of SEED_PRODUCTS) {
      const docRef = db.collection("products").doc();
      insertedIds.push(docRef.id);

      batch.set(docRef, {
        name: prod.name,
        price: prod.price,
        originalPrice: Math.round(prod.price * 1.2),
        category: prod.category,
        description: prod.description,
        image: prod.image,
        images: [prod.image],
        wilaya: prod.wilaya,
        stock: prod.stock,
        rating: prod.rating,
        tags: prod.tags,
        sellerId: "admin_seed",
        sellerName: "Boutique Officielle Olmart",
        status: "active",
        isSeed: true,
        isDemo: true,
        currency: "DZD",
        media: [{ url: prod.image, type: "image" }],
        translations: {
          en: { name: prod.name, description: prod.description },
          ar: { name: prod.name, description: prod.description },
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();

    safeLogger.info(`[AdminSeed] 🟢 ${insertedIds.length} produits de démonstration générés par ${req.user?.uid}`);

    res.json({
      success: true,
      count: insertedIds.length,
      message: `${insertedIds.length} produits de démonstration insérés avec succès.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    safeLogger.error("[AdminSeed] ❌ Erreur génération seed:", { error: message });
    res.status(500).json({ error: message });
  }
});

// POST /api/v1/admin/seed/clear - Nettoyer TOUS les produits injectés / seed
router.post("/admin/seed/clear", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const docIdsToDelete = new Set<string>();

    // 1. Tous les produits avec sellerId == "admin_seed"
    const snapSeller = await db.collection("products").where("sellerId", "==", "admin_seed").get();
    snapSeller.docs.forEach((doc) => docIdsToDelete.add(doc.id));

    // 2. Tous les produits marqués isSeed == true
    const snapSeed = await db.collection("products").where("isSeed", "==", true).get();
    snapSeed.docs.forEach((doc) => docIdsToDelete.add(doc.id));

    // 3. Tous les produits marqués isDemo == true
    const snapDemo = await db.collection("products").where("isDemo", "==", true).get();
    snapDemo.docs.forEach((doc) => docIdsToDelete.add(doc.id));

    // 4. Par sécurité, vérifier aussi les produits nommés d'après les graines officielles s'ils appartiennent au faux vendeur
    const officialNames = SEED_PRODUCTS.map((p) => p.name);
    for (const name of officialNames) {
      const snapName = await db.collection("products").where("name", "==", name).where("sellerName", "in", ["Boutique Officielle", "Boutique Officielle Olmart"]).get();
      snapName.docs.forEach((doc) => docIdsToDelete.add(doc.id));
    }

    if (docIdsToDelete.size === 0) {
      return res.json({
        success: true,
        deletedCount: 0,
        message: "Aucun produit de démonstration à nettoyer.",
      });
    }

    // Suppression par lots (max 500 opérations par batch Firestore)
    const allIds = Array.from(docIdsToDelete);
    const BATCH_SIZE = 400;
    let deletedCount = 0;

    for (let i = 0; i < allIds.length; i += BATCH_SIZE) {
      const chunk = allIds.slice(i, i + BATCH_SIZE);
      const batch = db.batch();
      for (const id of chunk) {
        batch.delete(db.collection("products").doc(id));
      }
      await batch.commit();
      deletedCount += chunk.length;
    }

    // Trace d'audit administratif
    await db.collection("audit_logs").add({
      type: "ADMIN_ACTION",
      action: "SEED_PRODUCTS_CLEARED",
      deletedCount,
      adminId: req.user?.uid || "unknown",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    safeLogger.info(`[AdminSeed] 🟢 ${deletedCount} produits de démonstration supprimés par ${req.user?.uid}`);

    res.json({
      success: true,
      deletedCount,
      message: `${deletedCount} produit(s) de démonstration supprimé(s) avec succès.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    safeLogger.error("[AdminSeed] ❌ Erreur nettoyage seed:", { error: message });
    res.status(500).json({ error: message });
  }
});

export default router;
