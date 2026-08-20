import { db } from "../config/firebase-admin";
import { ai, DEFAULT_GEMINI_MODEL } from "../config/gemini";
import { validateExternalUrl } from "../utils/security";
import { normalizeTimestamp } from "../utils/date";
import { Order } from "../domains/order/order.types";

export class SellerService {
  static async extractOcr(type: string, documentUrl?: string, base64Data?: string, mimeType?: string) {
    let finalBase64 = base64Data;
    let finalMimeType = mimeType || 'image/jpeg';

    if (documentUrl && !finalBase64) {
       const validatedUrl = validateExternalUrl(documentUrl);
       const imageResp = await fetch(validatedUrl.toString(), { redirect: "error" });
       if (!imageResp.ok) throw new Error("Failed to fetch image");
       const arrayBuffer = await imageResp.arrayBuffer();
       const buffer = Buffer.from(arrayBuffer);
       finalBase64 = buffer.toString('base64');
       finalMimeType = imageResp.headers.get('content-type') || 'image/jpeg';
    }

    const prompt = type === "ID"
      ? `Extraire les informations suivantes de cette pièce d'identité algérienne (Carte Nationale, Permis ou Passeport). Retourne UNIQUEMENT un objet JSON valide avec la clé suivante :- documentNumber (Numéro d'Identification Nationale ou NIF)`
      : `Extraire les informations de ce Registre de Commerce algérien. Retourne UNIQUEMENT un objet JSON valide avec la clé suivante :- rcNumber (Numéro du registre de commerce complet)`;

    const result = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: [
        { role: "user", parts: [{ inlineData: { data: finalBase64!, mimeType: finalMimeType } }, { text: prompt }] }
      ]
    });

    const responseText = result.text || "{}";
    let extractedJson = responseText;
    const match = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) extractedJson = match[1];
    
    let parsed = {};
    try { 
      parsed = JSON.parse(extractedJson); 
    } catch(e: unknown) { 
      const msg = e instanceof Error ? e.message : String(e);
      console.warn("Failed to parse OCR response JSON:", msg); 
    }
    return parsed;
  }

  static async getOverviewStats(uid: string) {
    const now = new Date();
    
    const pQ = db.collection("products").where("sellerId", "==", uid);
    const productsSnap = await pQ.get();
    const productCount = productsSnap.docs.length;

    const oQ = db.collection("orders").where("sellerIds", "array-contains", uid).limit(250);
    const ordersSnap = await oQ.get();
    const allOrders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[];

    let outOfStockCount = 0;
    productsSnap.docs.forEach((doc) => {
      const p = doc.data();
      if ((p.stock !== undefined && p.stock <= 0) || p.hasOutOfStockVariants === true) {
        outOfStockCount++;
      }
    });

    let totalSales = 0;
    let orderCount: number;
    let pendingReturns = 0;

    try {
      const summaryDoc = await db.collection("financial_summary").doc(uid).get();
      if (summaryDoc.exists) {
        const data = summaryDoc.data();
        totalSales = data?.totalSales || 0;
        orderCount = data?.orderCount || 0;
        pendingReturns = data?.pendingReturns || 0;
      } else {
         orderCount = allOrders.length;
         allOrders.forEach((o) => {
           totalSales += (o.total || 0);
           if (o.status === "RETURN_REQUESTED") pendingReturns++;
         });
      }
    } catch {
       orderCount = allOrders.length;
       allOrders.forEach((o) => {
         totalSales += (o.total || 0);
         if (o.status === "RETURN_REQUESTED") pendingReturns++;
       });
    }

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    
    let currentWeekTotal = 0;
    let lastWeekTotal = 0;

    allOrders.forEach((o) => {
      if (o.createdAt) {
        const createdDate = normalizeTimestamp(o.createdAt).toDate();
        if (createdDate >= startOfWeek) {
          currentWeekTotal += (o.total || 0);
        } else if (createdDate >= startOfLastWeek && createdDate < startOfWeek) {
          lastWeekTotal += (o.total || 0);
        }
      }
    });

    let growth = 'N/A';
    if (lastWeekTotal > 0) {
        const growthFactor = ((currentWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
        growth = (growthFactor > 0 ? '+' : '') + growthFactor.toFixed(1) + '%';
    }

    const chartData: Array<{ name: string; sales: number; rawDate: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toLocaleDateString("fr-FR", { weekday: 'short' });
      chartData.push({ name: ds, sales: 0, rawDate: new Date(d).setHours(0,0,0,0) });
    }

    allOrders.forEach((o) => {
       if (o.createdAt) {
         const od = normalizeTimestamp(o.createdAt).toDate();
         const normalizedTime = new Date(od).setHours(0,0,0,0);
         const cMatch = chartData.find(c => c.rawDate === normalizedTime);
         if (cMatch) {
            cMatch.sales += (o.total || 0);
         }
       }
    });
    
    const sortedOrders = [...allOrders].sort((a, b) => {
      const tA = a.createdAt ? normalizeTimestamp(a.createdAt).toMillis() : 0;
      const tB = b.createdAt ? normalizeTimestamp(b.createdAt).toMillis() : 0;
      return tB - tA;
    });
    const recentOrders = sortedOrders.slice(0, 5);

    const wMap: Record<string, number> = {};
    allOrders.forEach((o) => {
      if (o.shippingAddress?.wilaya) {
        wMap[o.shippingAddress.wilaya] = (wMap[o.shippingAddress.wilaya] || 0) + 1;
      }
    });
    const wilayaStats = Object.entries(wMap).map(([name, count]) => ({name, count}))
      .sort((a,b) => b.count - a.count).slice(0,5);

    const prodCountMap: Record<string, { id: string; name: string; count: number; total: number; image?: string }> = {};
    allOrders.forEach((o) => {
      if (o.items && Array.isArray(o.items)) {
         o.items.forEach((item) => {
            if (item.sellerId === uid) {
               const itemId = item.productId || item.productName || "unknown";
               if (!prodCountMap[itemId]) {
                 prodCountMap[itemId] = {
                   id: itemId,
                   name: item.productName || (item as unknown as { name?: string }).name || '',
                   count: 0,
                   total: 0,
                   image: item.productImage
                 };
               }
               prodCountMap[itemId].count += (item.quantity || 1);
               prodCountMap[itemId].total += ((item.price || 0) * (item.quantity || 1));
            }
         });
      }
    });

    const topProducts = Object.values(prodCountMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const payoutStats = {
      available: totalSales * 0.85,
      nextPaymentDate: new Date(new Date().setDate(new Date().getDate() + (7 - new Date().getDay()))).toLocaleDateString("fr-FR")
    };

    return {
      stats: { totalSales, orderCount, productCount, growth, pendingReturns },
      recentOrders,
      topProducts,
      payoutStats,
      outOfStockCount,
      wilayaStats,
      chartData
    };
  }
}
