import { Router, Request, Response } from "express";
import { admin, db } from "../../../config/firebase-admin";
import { authenticateToken } from "../../../middlewares/auth";
import { Order } from "../order.types";
import { calculateOrderCommission } from "../../../utils/orderCalculations";
import { safeLogger } from "../../../utils/logger";

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  role?: string;
  name?: string;
  [key: string]: unknown;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  file?: unknown;
  files?: unknown;
}

interface OrderItemDoc {
  id?: string;
  sellerId?: string;
  sellerIds?: string[];
  items?: Array<{ sellerId?: string; [key: string]: unknown }>;
  total?: number;
  [key: string]: unknown;
}

const router = Router();

// Update Order Status Securely
router.post("/calculate-commissions", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orders } = req.body;
    if (!orders || !Array.isArray(orders)) return res.status(400).json({ error: "Valid orders array required" });

    // 1. Role-Based Access Validation Middleware / Integrity Check
    const userRole = req.user?.role;
    const userId = req.user?.uid;
    if (userRole !== "admin" && userRole !== "seller") {
      return res.status(403).json({ error: "Accès refusé. Autorisation insuffisante pour calculer les commissions." });
    }

    // 2. Fetch authentic order data from Firestore DB to override incoming client data
    const incomingOrderIds = orders.map((o: { id?: string; orderId?: string }) => o.id || o.orderId).filter(Boolean) as string[];
    const dbOrdersMap = new Map<string, OrderItemDoc>();

    if (incomingOrderIds.length > 0) {
      // Chunk size of 30 due to Firestore "in" operator limits
      const chunks: string[][] = [];
      for (let i = 0; i < incomingOrderIds.length; i += 30) {
        chunks.push(incomingOrderIds.slice(i, i + 30));
      }
      for (const chunk of chunks) {
        const snap = await db.collection("orders").where(admin.firestore.FieldPath.documentId(), "in", chunk).get();
        snap.docs.forEach((doc) => {
          dbOrdersMap.set(doc.id, { id: doc.id, ...doc.data() });
        });
      }
    }

    // 3. Absolute Integrity Sanitization: Overwrite parameters with values from DB, and filter out unauthorized data
    const validatedOrders: OrderItemDoc[] = [];
    for (const o of orders) {
      const oid = (o as { id?: string; orderId?: string }).id || (o as { id?: string; orderId?: string }).orderId;
      if (oid && dbOrdersMap.has(oid)) {
        const dbOrder = dbOrdersMap.get(oid)!;

        // If caller is a seller, they can ONLY calculate commission on their own products/orders
        if (userRole === "seller") {
          const isMyOrder =
            dbOrder.sellerId === userId ||
            (dbOrder.sellerIds && dbOrder.sellerIds.includes(userId || "")) ||
            (dbOrder.items && dbOrder.items.some((item) => item.sellerId === userId));
          if (!isMyOrder) {
            continue; // Silently filter out other seller data to protect client VIP database
          }
        }
        validatedOrders.push(dbOrder);
      }
    }

    let totalVolume = 0;
    let totalCommission = 0;

    // Fetch all sellers in one go to minimize DB calls
    const sellerIds = new Set<string>();
    validatedOrders.forEach((o) => {
      if (o.sellerIds) o.sellerIds.forEach((id: string) => sellerIds.add(id));
      else if (o.sellerId) sellerIds.add(o.sellerId);
      o.items?.forEach((i) => {
        if (i.sellerId) sellerIds.add(i.sellerId);
      });
    });

    const sellerRates: Record<string, number> = {};
    let globalRate = 10;
    const commDoc = await db.collection("settings").doc("commission").get();
    if (commDoc.exists) globalRate = commDoc.data()?.globalRate ?? 10;

    // Only fetch if there are sellers
    if (sellerIds.size > 0) {
      const sellersSnap = await db
        .collection("users")
        .where(admin.firestore.FieldPath.documentId(), "in", Array.from(sellerIds))
        .get();
      sellersSnap.forEach((snap) => {
        sellerRates[snap.id] = snap.data().commissionRate ?? globalRate;
      });
    }

    const calculatedOrders = validatedOrders.map((order) => {
      const { orderCommission, netPayout } = calculateOrderCommission(order as unknown as Order, sellerRates, globalRate);

      totalVolume += order.total || 0;
      totalCommission += orderCommission;

      return {
        ...order,
        commissionCalc: orderCommission,
        netPayout,
      };
    });

    return res.json({
      calculatedOrders,
      totalVolume,
      totalCommission,
      sellersNetPayout: totalVolume - totalCommission,
    });
  } catch (error: unknown) {
    safeLogger.error("Calculate commissions error", { err: error instanceof Error ? error.message : String(error) });
    res.status(500).json({ error: "Failed to calculate commissions" });
  }
});

// Server-side bypass for writing delivery information (bypasses Firestore Security Rules limitations)

router.get("/orders", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limitVal = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
    const snap = await db.collection("orders")
      .where("userId", "==", req.user?.uid || "")
      .orderBy("createdAt", "desc")
      .limit(limitVal)
      .get();
    const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.json({ orders });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

// GET single order details

router.get("/orders/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const snap = await db.collection("orders").doc(id).get();
    if (!snap.exists) {
      return res.status(404).json({ error: "Order not found" });
    }
    const orderData = snap.data();
    if (orderData?.userId !== req.user?.uid && orderData?.sellerId !== req.user?.uid) {
      return res.status(403).json({ error: "Access denied" });
    }
    return res.json({ id: snap.id, ...orderData });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});



export default router;
