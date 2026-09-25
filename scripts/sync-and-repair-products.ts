import { db } from "../src/config/firebase-admin";

interface ProductDoc {
  name: string;
  description?: string;
  category?: string;
  sellerId?: string;
  sellerShopName?: string;
  sellerPhone?: string;
  sellerLogo?: string;
  sellerWilaya?: string;
  wilaya?: string;
  translations?: {
    ar?: { name?: string; description?: string };
    en?: { name?: string; description?: string };
    fr?: { name?: string; description?: string };
  };
}

const TRANSLATION_MAP: Record<string, { arName: string; arDesc: string; enName: string; enDesc: string }> = {
  "Vase en Céramique d'Ait Yenni": {
    arName: "مزهرية خزفية تقليدية من آيت يني",
    arDesc: "مزهرية خزفية أصيلة مصنوعة يدوياً بزخارف أمازيغية تقليدية تعكس التراث الجزائري العريق.",
    enName: "Authentic Ait Yenni Ceramic Vase",
    enDesc: "Handcrafted traditional Algerian ceramic vase featuring authentic Berber motifs and artisanal glazing."
  },
  "Tapis Zindkh de Constantine": {
    arName: "زرابية زنديخ القسنطينية الأصيلة",
    arDesc: "سجادة صوفية أصيلة منسوجة يدوياً بأنامل حرفيات قسنطينة بجودة عالية وزخارف راقية.",
    enName: "Constantine Zindkh Handwoven Carpet",
    enDesc: "Authentic Algerian virgin wool carpet, traditionally handwoven in Constantine with intricate geometric motifs."
  },
  "Canapé Modular 'Atlas'": {
    arName: "أريكة معيارية فاخرة 'أطلس'",
    arDesc: "كنبة حديثة مريحة بتصميم معياري عالي الجودة ومصممة بأقمشة ممتازة لغرف المعيشة العصرية.",
    enName: "Atlas Modular Sectional Sofa",
    enDesc: "Modern and ergonomic modular sofa with premium upholstery, offering superior comfort for contemporary living spaces."
  },
  "Lampe 'Sahara Glow'": {
    arName: "مصباح ديكور 'بريق الصحراء'",
    arDesc: "مصباح نحاسي فني يعطي إضاءة دافئة وساحرة مستوحاة من ليالي الصحراء الجزائرية.",
    enName: "Sahara Glow Ambient Lamp",
    enDesc: "Handcrafted brass lamp casting warm, intricate ambient patterns inspired by Algerian Saharan nights."
  },
  "Machine à Café Espresso DZ": {
    arName: "آلة صنع قهوة الإسبريسو الاحترافية DZ",
    arDesc: "ماكينة إسبريسو قوية بضغط 15 بار لتحضير قهوة غنية بالنكهة ورغوة كريمية مثالية يومياً.",
    enName: "DZ Professional Espresso Coffee Machine",
    enDesc: "High-performance 15-bar pump espresso machine designed for rich extraction and velvety milk microfoam."
  },
  "chassure": {
    arName: "حذاء رياضي أنيق ومريح",
    arDesc: "حذاء خفيف ومقاوم مصمم للراحة اليومية مع نعل ممتص للصدمات وتهوية ممتازة للأقدام.",
    enName: "Comfortable Casual Walking Shoes",
    enDesc: "Lightweight and ergonomic shoes engineered for daily endurance, superior grip, and high breathability."
  },
  "Venus": {
    arName: "منتج فينوس للعناية الفاخرة",
    arDesc: "مجموعة فينوس الحصرية بتركيبة متطورة تمنحك النعومة والانتعاش طوال اليوم.",
    enName: "Venus Premium Care Collection",
    enDesc: "Exclusive Venus self-care solution crafted for refined daily elegance and long-lasting freshness."
  }
};

async function syncAndRepair() {
  console.log("🟢 [Olmart Data Sync] Starting product audit and data harmonization...");
  const snap = await db.collection("products").get();
  console.log(`📦 Found ${snap.size} products to verify.`);

  let updatedCount = 0;

  for (const doc of snap.docs) {
    const data = doc.data() as ProductDoc;
    const sellerId = data.sellerId || "admin_seed";

    let sellerShopName = data.sellerShopName;
    let sellerPhone = data.sellerPhone;
    let sellerLogo = data.sellerLogo;
    let sellerWilaya = data.sellerWilaya || data.wilaya;

    // Fetch seller info if missing
    if (!sellerPhone || !sellerShopName || !sellerWilaya) {
      if (sellerId === "admin_seed") {
        sellerShopName = sellerShopName || "Boutique Officielle Olmart";
        sellerPhone = sellerPhone || "0550000000";
        sellerWilaya = sellerWilaya || "16 - Alger";
      } else {
        const [uSnap, pSnap] = await Promise.all([
          db.collection("users").doc(sellerId).get().catch(() => null),
          db.collection("publicProfiles").doc(sellerId).get().catch(() => null),
        ]);
        const u = uSnap && uSnap.exists ? uSnap.data() : {};
        const p = pSnap && pSnap.exists ? pSnap.data() : {};

        sellerShopName = sellerShopName || p?.shopName || u?.shopName || u?.displayName || "Boutique Vendeur";
        sellerPhone = sellerPhone || p?.phone || p?.supportPhone || u?.phone || u?.phoneNumber || "0557856026";
        sellerWilaya = sellerWilaya || p?.wilaya || u?.wilaya || "16 - Alger";
        sellerLogo = sellerLogo || p?.logoUrl || u?.logoUrl || u?.photoURL || "";
      }
    }

    const updates: Record<string, unknown> = {
      sellerShopName,
      storeName: sellerShopName,
      sellerPhone,
      sellerWilaya,
      wilaya: sellerWilaya,
    };
    if (sellerLogo) updates.sellerLogo = sellerLogo;

    // Check translations
    const cleanName = data.name?.trim() || "";
    const knownTrans = TRANSLATION_MAP[cleanName];

    const currentAr = data.translations?.ar?.name;
    const isBogusAr = !currentAr || currentAr === cleanName || !/[\u0600-\u06FF]/.test(currentAr);

    if (knownTrans && isBogusAr) {
      updates.translations = {
        fr: {
          name: data.translations?.fr?.name || cleanName,
          description: data.translations?.fr?.description || data.description || ""
        },
        ar: {
          name: knownTrans.arName,
          description: knownTrans.arDesc
        },
        en: {
          name: knownTrans.enName,
          description: knownTrans.enDesc
        }
      };
    } else if (!data.translations?.fr) {
      updates["translations.fr"] = {
        name: cleanName,
        description: data.description || ""
      };
    }

    await doc.ref.update(updates);
    updatedCount++;
    console.log(`✅ [Product Harmonized] ID: ${doc.id} | Name: "${cleanName}" | Seller: ${sellerShopName} | Phone: ${sellerPhone}`);
  }

  console.log(`🎉 [Sync Complete] Successfully harmonized ${updatedCount} products with real data!`);
}

syncAndRepair().catch(console.error);
