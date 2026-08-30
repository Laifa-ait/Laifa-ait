import { db, admin } from "../../../config/firebase-admin";
import { ai } from "../../../config/gemini";
import { safeLogger } from "../../../utils/logger";
import type { WorkspaceSellerRecord, WorkspaceOrderRecord } from "../types/adminWorkspace.types";

export class AdminWorkspaceService {
  static async resolveDispute(
    orderId: string,
    resolution: string,
    refundAmount = 0
  ): Promise<void> {
    const orderRef = db.collection("orders").doc(orderId);

    await db.runTransaction(async (transaction) => {
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists) throw new Error("Order not found");
      const orderData = orderDoc.data() as {
        userId: string;
        sellerId?: string;
        sellerIds?: string[];
        total?: number;
        disputeRequest?: { frozenAmount?: number };
      };

      const frozenAmount = orderData.disputeRequest?.frozenAmount || 0;
      const maxRefundAllowed = frozenAmount > 0 ? frozenAmount : (orderData.total || 0);

      if (resolution === "refund" && refundAmount > 0) {
        if (refundAmount > maxRefundAllowed) {
          throw new Error(`Le montant du remboursement (${refundAmount} DA) dépasse le montant maximum autorisé (${maxRefundAllowed} DA) pour ce litige.`);
        }
        const targetSellerUid = orderData?.sellerIds?.[0] || orderData?.sellerId;
        if (targetSellerUid) {
          const sellerRef = db.collection("users").doc(targetSellerUid);
          const sellerDoc = await transaction.get(sellerRef);
          if (sellerDoc.exists) {
            const sellerData = sellerDoc.data();
            const currentTrustScore = sellerData?.trustScore ?? 50;
            const newTrustScore = Math.max(0, currentTrustScore - 10);

            transaction.update(sellerRef, { trustScore: newTrustScore });

            const notificationRef = db.collection("notifications").doc();
            transaction.set(notificationRef, {
              userId: targetSellerUid,
              title: "Litige résolu en faveur du client",
              message: `La commande #${orderId.substring(0, 8)} a été remboursée. Votre Trust Score a baissé de 10 points. Si c'est une erreur, ouvrez une contestation via le Support.`,
              type: "ALERT",
              read: false,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
        }

        transaction.update(orderRef, {
          status: "REFUNDED",
          "returnRequest.status": "completed",
          disputeStatus: "resolved_refunded",
          refundedAmount: refundAmount,
          refundMethod: "Off-platform Manual Refund",
          updatedAt: new Date().toISOString(),
        });
      } else {
        transaction.update(orderRef, {
          status: "DISPUTE_RESOLVED",
          "returnRequest.status": "rejected",
          "disputeRequest.status": "resolved_rejected",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    });
  }

  static async performOcr(documentUrl: string): Promise<Record<string, unknown>> {
    const imageResp = await fetch(documentUrl);
    if (!imageResp.ok) throw new Error("Failed to fetch image");
    const arrayBuffer = await imageResp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");
    const mimeType = imageResp.headers.get("content-type") || "image/jpeg";

    const prompt = `Extraire les informations suivantes de cette pièce d'identité algérienne (Carte Nationale, Permis ou Passeport). 
Retourne UNIQUEMENT un objet JSON valide avec les clés suivantes :
- fullName (Nom complet)
- documentNumber (Numéro de la pièce)
- dateOfBirth (Date de naissance)
- issueDate (Date de délivrance)
- expiryDate (Date d'expiration si présente, sinon null)
- isAuthentic (booléen, met true si le document semble être une pièce d'identité officielle et authentique, false si c'est flou, faux, ou illisible)
- OCRConfidence (un score de 0 à 100 de ta confiance sur la lecture).`;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        { role: "user", parts: [{ inlineData: { data: base64Data, mimeType } }, { text: prompt }] },
      ],
    });

    const responseText = result.text || "{}";
    let extractedJson = responseText;
    const match = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      extractedJson = match[1];
    }

    try {
      return JSON.parse(extractedJson);
    } catch {
      safeLogger.error("Failed to parse Gemini OCR response", { responseTextLength: responseText.length });
      return { error: "Failed to parse JSON" };
    }
  }

  static async getWorkspaceSellers(): Promise<WorkspaceSellerRecord[]> {
    const [publicSnap, usersSnap, pendingSnap] = await Promise.all([
      db.collection("publicProfiles").limit(300).get(),
      db.collection("users").where("role", "==", "seller").limit(300).get(),
      db.collection("users").where("status", "==", "pending").limit(100).get(),
    ]);

    const publicMap = new Map<string, Record<string, unknown>>();
    publicSnap.docs.forEach((doc) => publicMap.set(doc.id, doc.data()));

    const usersMap = new Map<string, Record<string, unknown>>();
    usersSnap.docs.forEach((doc) => usersMap.set(doc.id, doc.data()));
    pendingSnap.docs.forEach((doc) => usersMap.set(doc.id, doc.data()));

    const allIds = new Set([...publicMap.keys(), ...usersMap.keys()]);
    return Array.from(allIds).map((uid) => {
      const pub = publicMap.get(uid) || {};
      const usr = usersMap.get(uid) || {};
      return {
        id: uid,
        name: (pub.name as string) || (usr.displayName as string) || (usr.name as string) || uid,
        shopName: (pub.shopName as string) || (usr.shopName as string) || (pub.name as string) || (usr.displayName as string) || "Boutique Olmart",
        email: (usr.email as string) || (pub.email as string) || "",
      };
    });
  }

  static async getWorkspaceOrders(targetSeller?: string): Promise<WorkspaceOrderRecord[]> {
    let ordersQuery = db.collection("orders").orderBy("createdAt", "desc").limit(150);
    if (targetSeller) {
      ordersQuery = db.collection("orders").where("sellerIds", "array-contains", targetSeller).orderBy("createdAt", "desc").limit(150);
    }

    const ordersSnap = await ordersQuery.get();
    const rawOrders: WorkspaceOrderRecord[] = ordersSnap.docs.map((doc) => ({
      ...(doc.data() as Omit<WorkspaceOrderRecord, "id">),
      id: doc.id,
    }));

    for (const order of rawOrders) {
      const sid = order.sellerId || (order.sellerIds && order.sellerIds[0]);
      if (sid) {
        let name = "Olmart";
        let email = "";
        const usrSnap = await db.collection("users").doc(sid).get();
        if (usrSnap.exists) {
          const usr = usrSnap.data();
          name = usr?.shopName || usr?.displayName || name;
          email = usr?.email || email;
        } else {
          const pubSnap = await db.collection("publicProfiles").doc(sid).get();
          if (pubSnap.exists) {
            const pub = pubSnap.data();
            name = pub?.shopName || pub?.name || name;
            email = pub?.email || email;
          }
        }
        order.sellerName = name;
        order.sellerEmail = email;
      }
    }
    return rawOrders;
  }

  static async getWorkspaceSeller(sellerId: string): Promise<{ name: string; email: string }> {
    let name = "Olmart";
    let email = "";
    const usrSnap = await db.collection("users").doc(sellerId).get();
    if (usrSnap.exists) {
      const usr = usrSnap.data();
      name = usr?.shopName || usr?.displayName || name;
      email = usr?.email || email;
    } else {
      const pubSnap = await db.collection("publicProfiles").doc(sellerId).get();
      if (pubSnap.exists) {
        const pub = pubSnap.data();
        name = pub?.shopName || pub?.name || name;
        email = pub?.email || email;
      }
    }
    return { name, email };
  }
}
