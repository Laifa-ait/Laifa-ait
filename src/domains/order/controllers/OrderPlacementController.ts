import { Response, Router } from "express";
import { firestore } from "firebase-admin";
import { admin, db } from "../../../config/firebase-admin";
import { optionalAuthenticateToken, AuthenticatedRequest } from "../../../middlewares/auth";
import { validateRequest } from "../../../middlewares/validation";
import { strictLimiter } from "../../../middlewares/rateLimiters";
import { ALGERIA_SHIPPING_DATA } from "../../../constants";
import { placeOrderSchema } from "../../../utils/validation";
import { checkSellerVelocityLimit } from "../../../utils/velocity";
import { orderBreaker } from "../../../utils/circuitBreaker";
import { resolveProductPrice } from "../../../utils/priceResolver";
import { CouponService, ProductItemForCoupon } from "../../marketing/coupon.service";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { safeLogger } from "../../../utils/logger";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendLowStockEmail = async (sellerEmail: string, message: string) => {
  try {
    if (!process.env.SMTP_USER) {
      safeLogger.info("Mock Email Sent (SMTP not configured)", { to: sellerEmail, message });
      return;
    }
    await transporter.sendMail({
      from: '"Olmart" <noreply@olmart.dz>',
      to: sellerEmail,
      subject: "⚠️ Alerte Stock Critique - Olmart",
      text: message,
    });
  } catch (err) {
    safeLogger.error("Failed to send stock alert email", { err: err instanceof Error ? err.message : String(err) });
  }
};

interface OrderEmailSubOrder {
  sellerId: string;
  subOrderId: string;
  items: Array<{ name?: string; quantity?: number; price?: number; [key: string]: unknown }>;
  total: number;
}

const sendOrderConfirmationEmails = async (
  buyerEmail: string,
  buyerName: string,
  orderId: string,
  grandTotal: number,
  subOrders: OrderEmailSubOrder[]
) => {
  try {
    if (!process.env.SMTP_USER) {
      safeLogger.info("Mock Email Sent (SMTP not configured)", { to: buyerEmail, orderId });
      return;
    }

    // Email to the buyer
    if (buyerEmail) {
      await transporter.sendMail({
        from: '"Olmart" <noreply@olmart.dz>',
        to: buyerEmail,
        subject: `Confirmation de votre commande #${orderId} - Olmart`,
        html: `<h2>Merci pour votre commande, ${buyerName} !</h2>
               <p>Votre commande porte la référence <strong>#${orderId}</strong> a bien été enregistrée.</p>
               <p>Montant total : <strong>${grandTotal} DZD</strong> (Paiement à la livraison).</p>
               <p>Nos vendeurs préparent vos articles.</p>
               <br/><p>L'équipe Olmart</p>`,
      });
    }

    // Email to the sellers
    for (const so of subOrders) {
      const userSnap = await admin.firestore().collection("users").doc(so.sellerId).get();
      const sellerEmail = userSnap.data()?.email;
      
      if (sellerEmail) {
        const itemsHtml = so.items.map(i => `<li>${i.quantity}x ${i.name}</li>`).join("");
        await transporter.sendMail({
          from: '"Olmart" <noreply@olmart.dz>',
          to: sellerEmail,
          subject: `Nouvelle commande reçue #${so.subOrderId} - Olmart`,
          html: `<h2>Bonjour, vous avez reçu une nouvelle commande !</h2>
                 <p>La référence de la sous-commande est <strong>#${so.subOrderId}</strong>.</p>
                 <p>Produits commandés :</p>
                 <ul>${itemsHtml}</ul>
                 <p>Total à préparer : <strong>${so.total} DZD</strong>.</p>
                 <br/><p>Connectez-vous à votre espace vendeur pour la traiter.</p>`,
        });
      }
    }
  } catch (err) {
    safeLogger.error("Failed to send order confirmation emails", { err: err instanceof Error ? err.message : String(err) });
  }
};

const router = Router();

// Update Order Status Securely
router.post("/place-order", strictLimiter, optionalAuthenticateToken, validateRequest(placeOrderSchema), async (req: AuthenticatedRequest, res: Response) => {
  const { cart, shippingAddress, couponCode, deliveryMethod, idempotencyKey } = req.body;
  const isGuest = !req.user;
  const userId = req.user ? req.user.uid : `guest_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
  const guestRecoveryToken = isGuest ? crypto.randomBytes(32).toString("hex") : null;
  const guestTokenHash = guestRecoveryToken ? crypto.createHash("sha256").update(guestRecoveryToken).digest("hex") : null;

  if (idempotencyKey) {
    try {
      const keyRef = db.collection("idempotency_keys").doc(idempotencyKey);
      const keySnap = await keyRef.get();
      if (keySnap.exists) {
        const keyData = keySnap.data();
        return res.json({
          orderId: keyData?.orderId,
          status: "already_processed",
          message: "Commande déjà traitée",
        });
      }
    } catch (e) {
      safeLogger.error("Error reading idempotency_keys collection, falling back", { err: e instanceof Error ? e.message : String(e) });
    }

    const existingOrder = await db
      .collection("orders")
      .where("idempotencyKey", "==", idempotencyKey)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (!existingOrder.empty) {
      const existingDoc = existingOrder.docs[0];
      return res.json({
        orderId: existingDoc.id,
        status: "already_processed",
        message: "Commande déjà traitée",
      });
    }
  }

  const sellerIdsSet = new Set<string>();
  try {
    let settingsDoc;
    let commDoc;
    let dynWilayaFees: Record<string, number> = {};
    let matrixFees: Record<string, Record<string, number>> = {};
    let globalBaseFee = 600;
    let globalCommissionRate = 0;
    try {
      settingsDoc = await db.collection("settings").doc("shipping").get();
      if (settingsDoc && settingsDoc.exists) {
        const d = settingsDoc.data() || {};
        dynWilayaFees = d.wilayaFees || {};
        matrixFees = d.matrixFees || {};
        globalBaseFee = d.globalBaseFee || 600;
      }

      commDoc = await db.collection("settings").doc("commission").get();
      if (commDoc && commDoc.exists) {
        globalCommissionRate = commDoc.data()?.globalRate ?? 0;
      }
    } catch (err) {
      safeLogger.warn("Failed to fetch global settings, using fallback", { err: err instanceof Error ? err.message : String(err) });
    }

    const uniqueProductIds: string[] = Array.from(new Set(cart.map((item: { id: string }) => item.id)));
    if (uniqueProductIds.length === 0) throw new Error("Panier vide.");

    let sellerIdsArray: string[] = [];
    const shopSnapshots = new Map<string, firestore.DocumentSnapshot>();
    const emailAlerts: { sellerId: string; message: string }[] = [];

    const result = await orderBreaker.execute(
      () =>
        db.runTransaction(async (t: firestore.Transaction) => {
          emailAlerts.length = 0; // Clear on retry

          // =========================================================================
          // PHASE 1 — TOUTES LES LECTURES TRANSACTIONNELLES (ZERO ÉCRITURE ICI)
          // =========================================================================
          let couponDoc: firestore.QueryDocumentSnapshot | null = null;

          // 1.1 Lecture des produits du panier
          const productSnaps = new Map<string, firestore.DocumentSnapshot>();
          const productRefs = new Map<string, firestore.DocumentReference>();

          const refs = uniqueProductIds.map((pId) => db.collection("products").doc(pId));
          const snaps = await t.getAll(...refs);

          snaps.forEach((productSnap, idx: number) => {
            const pId = uniqueProductIds[idx];
            if (!productSnap.exists) {
              throw new Error(`Produit ${pId} introuvable.`);
            }
            productSnaps.set(pId, productSnap);
            productRefs.set(pId, refs[idx]);

            const sellerId = productSnap.data()?.sellerId;
            if (sellerId) sellerIdsSet.add(sellerId);
          });

          // 1.2 Lecture des vendeurs et boutiques
          sellerIdsArray = Array.from(sellerIdsSet);
          if (sellerIdsArray.length > 0) {
            const sellerRefs = sellerIdsArray.map((sId) => db.collection("users").doc(sId));
            const sellerSnaps = await t.getAll(...sellerRefs);

            sellerSnaps.forEach((shopSnap, idx: number) => {
              const sellerId = sellerIdsArray[idx];
              if (shopSnap.exists) {
                const sd = shopSnap.data();
                if (sd && (sd.isActive === false || sd.is_active === false || sd.velocitySuspended)) {
                  throw new Error(
                    `La boutique "${sd.shopName || sd.displayName || sellerId}" est fermée temporairement (capacité de commande maximale atteinte).`
                  );
                }
                shopSnapshots.set(sellerId, sd as firestore.DocumentSnapshot);
              } else {
                shopSnapshots.set(sellerId, {} as firestore.DocumentSnapshot);
              }
            });
          }

          // 1.3 Reconstitution des snapshots d'articles pour le panier
          const productDocs: {
            cartItem: {
              id: string;
              quantity: number;
              selectedVariant?: string;
              priceSeen?: number;
            };
            productSnap: firestore.DocumentSnapshot;
            productRef: firestore.DocumentReference;
          }[] = [];
          for (const cartItem of cart) {
            if (
              !cartItem.id ||
              !cartItem.quantity ||
              typeof cartItem.quantity !== "number" ||
              !Number.isInteger(cartItem.quantity) ||
              cartItem.quantity < 1
            ) {
              throw new Error(`Article invalide fourni.`);
            }
            const snap = productSnaps.get(cartItem.id)!;
            const ref = productRefs.get(cartItem.id)!;
            productDocs.push({ cartItem, productSnap: snap, productRef: ref });
          }

          // 1.4 Lecture du coupon si fourni (avant TOUTE écriture ou validation)
          if (couponCode) {
            const couponQuery = await t.get(db.collection("coupons").where("code", "==", couponCode.toUpperCase()));
            const resolveResult = CouponService.resolveActiveCouponFromDocs(couponQuery.docs);
            if (resolveResult.couponDoc) {
              couponDoc = resolveResult.couponDoc;
            } else {
              throw new Error(resolveResult.error || "Code promo invalide.");
            }
          }

          // =========================================================================
          // PHASE 2 — TOUTES LES VALIDATIONS ET CALCULS (ZERO ÉCRITURE ICI)
          // =========================================================================

          let subtotal = 0;
          const orderItems: Record<string, unknown>[] = [];

          // Map to track running mutable state of products inside this transaction
          const productInMemoryStates = new Map<string, Record<string, unknown>>();
          for (const [pId, snap] of productSnaps.entries()) {
            productInMemoryStates.set(pId, JSON.parse(JSON.stringify(snap.data())));
          }

          for (const { cartItem, productSnap } of productDocs) {
            const productId = productSnap.id;
            const productData = productInMemoryStates.get(productId)!;

            const targetPrice = resolveProductPrice(productData, cartItem.selectedVariant);
            let availableStock = Number(productData.stock) || 0;

            let variantInfo: { name: string; stock: number; priceOverride?: number | string; priceDiff?: number | string } | null = null;
            if (cartItem.selectedVariant && productData.variants && Array.isArray(productData.variants)) {
              const variant = (productData.variants as Array<{ name: string; stock: number; priceOverride?: number | string; priceDiff?: number | string }>).find(
                (v) => v.name === cartItem.selectedVariant
              );
              if (!variant) {
                throw new Error(`Variante ${cartItem.selectedVariant} introuvable pour ${productData.name}.`);
              }
              availableStock = Number(variant.stock) || 0;
              variantInfo = variant;
            }

            // PRICE CONFLICT CHECK
            if (typeof cartItem.priceSeen === "number" && cartItem.priceSeen !== targetPrice) {
              const conflictErr = new Error(
                `Le prix de l'article "${productData.name}" a été mis à jour par le vendeur (de ${cartItem.priceSeen} DA à ${targetPrice} DA).`
              ) as Error & { code?: string };
              conflictErr.code = "PRICE_CONFLICT";
              throw conflictErr;
            }

            if (availableStock < cartItem.quantity) {
              throw new Error(`Stock insuffisant pour ${productData.name} (Reste: ${availableStock}).`);
            }

            subtotal += targetPrice * cartItem.quantity;
            const sellerId = productData.sellerId;

            orderItems.push({
              id: productId,
              name: productData.name,
              price: targetPrice,
              image: productData.image,
              quantity: cartItem.quantity,
              sellerId: sellerId,
              selectedVariant: cartItem.selectedVariant || null,
            });

            // Mutate the variant stock in memory
            if (variantInfo) {
              productData.variants = (productData.variants as Array<{ name: string; stock: number }>).map((v) => {
                if (v.name === variantInfo!.name) {
                  return { ...v, stock: Number(v.stock) - cartItem.quantity };
                }
                return v;
              });
              productData.hasOutOfStockVariants = (productData.variants as Array<{ stock: number }>).some(
                (v) => Math.max(0, Number(v.stock) || 0) <= 0
              );
              productData.stock = (productData.variants as Array<{ stock: number }>).reduce(
                (acc: number, curr) => acc + Math.max(0, Number(curr.stock) || 0),
                0
              );
            } else {
              productData.stock = (Number(productData.stock) || 0) - cartItem.quantity;
            }
          }

          const parsedMinOrder = process.env.MIN_ORDER_AMOUNT ? parseInt(process.env.MIN_ORDER_AMOUNT, 10) : 100;
          const minOrderAmount = Number.isInteger(parsedMinOrder) && parsedMinOrder >= 0 ? parsedMinOrder : 100;
          if (subtotal < minOrderAmount) {
            const minOrderErr = new Error(`Le montant minimum de commande (${minOrderAmount} DA) n'est pas atteint.`) as Error & { code?: string };
            minOrderErr.code = "MIN_ORDER_AMOUNT_NOT_MET";
            throw minOrderErr;
          }

          interface TransactionalStockUpdate {
            ref: firestore.DocumentReference;
            update: {
              variants?: unknown[];
              hasOutOfStockVariants?: boolean;
              stock: number;
              version: firestore.FieldValue;
            };
          }

          interface TransactionalNotification {
            ref: firestore.DocumentReference;
            data: Record<string, unknown>;
          }

          const stockUpdates: TransactionalStockUpdate[] = [];
          const internalNotificationsToCreate: TransactionalNotification[] = [];
          const pushQueueToCreate: TransactionalNotification[] = [];

          for (const pId of uniqueProductIds) {
            const finalData = productInMemoryStates.get(pId)!;
            const ref = productRefs.get(pId)!;
            const stockThreshold = Number(finalData.lowStockAlert) || 5;

            let needsAlert = false;
            let alertMessage = "";

            if (finalData.variants) {
              const lowVariants = (finalData.variants as Array<{ isActive?: boolean; stock: number; name: string }>).filter(
                (v) => v.isActive !== false && Number(v.stock) <= stockThreshold
              );
              if (lowVariants.length > 0) {
                needsAlert = true;
                alertMessage = `Alerte: La(es) variante(s) ${lowVariants.map((v) => v.name).join(", ")} du produit "${finalData.name}" a atteint le stock critique (<= ${stockThreshold}).`;
              }
              stockUpdates.push({
                ref,
                update: {
                  variants: finalData.variants as unknown[],
                  hasOutOfStockVariants: finalData.hasOutOfStockVariants as boolean,
                  stock: Number(finalData.stock),
                  version: admin.firestore.FieldValue.increment(1),
                },
              });
            } else {
              if (Number(finalData.stock) <= stockThreshold) {
                needsAlert = true;
                alertMessage = `Alerte: Le produit "${finalData.name}" a atteint le stock critique (${finalData.stock} restants, seuil: ${stockThreshold}).`;
              }
              stockUpdates.push({
                ref,
                update: {
                  stock: Number(finalData.stock),
                  version: admin.firestore.FieldValue.increment(1),
                },
              });
            }

            if (needsAlert) {
              emailAlerts.push({ sellerId: String(finalData.sellerId), message: alertMessage });

              const alertRef = db.collection("internal_notifications").doc();
              internalNotificationsToCreate.push({
                ref: alertRef,
                data: {
                  type: "LOW_STOCK_ALERT",
                  title: "⚠️ Stock Critique",
                  message: alertMessage,
                  sellerId: finalData.sellerId,
                  productId: pId,
                  createdAt: admin.firestore.FieldValue.serverTimestamp(),
                  read: false,
                  priority: "high",
                },
              });

              const pushRef = db.collection("push_queue").doc();
              pushQueueToCreate.push({
                ref: pushRef,
                data: {
                  userId: finalData.sellerId,
                  title: "⚠️ Stock Critique",
                  body: alertMessage,
                  type: "inventory",
                  status: "pending",
                  createdAt: admin.firestore.FieldValue.serverTimestamp(),
                },
              });
            }
          }

          // 2.2 Validation et calcul sécurisé du Coupon
          let discountAmount = 0;
          let appliedCouponData: Record<string, unknown> | null = null;
          let eligibleItemsForCoupon: ProductItemForCoupon[] = [];
          let eligibleCouponSubtotal = 0;

          if (couponDoc) {
            appliedCouponData = couponDoc.data() as Record<string, unknown>;

            // 1. Validation de l'intégrité numérique et structurelle
            const integrity = CouponService.validateCouponIntegrity(appliedCouponData);
            if (!integrity.valid) {
              throw new Error(integrity.error || "Code promo corrompu ou invalide.");
            }

            // 2. Vérifier si actif
            if (!CouponService.isCouponActive(appliedCouponData)) {
              throw new Error("Code promo inactif.");
            }

            // 3. Vérifier date de début & expiration
            const timeCheck = CouponService.isCouponTimeValid(appliedCouponData);
            if (!timeCheck.valid) {
              throw new Error(timeCheck.error || "Code promo expiré.");
            }

            // 4. Vérifier quotas d'utilisation (global & par utilisateur, rejetant les invités si coupon réservé)
            const usageCheck = CouponService.isCouponUsageAllowed(appliedCouponData, userId, isGuest);
            if (!usageCheck.valid) {
              throw new Error(usageCheck.error || "Limite d'utilisation du code promo atteinte.");
            }

            // 5. Construire la liste des articles avec données vérifiées côté serveur
            const itemsForCoupon: ProductItemForCoupon[] = productDocs.map(({ cartItem, productSnap }) => {
              const pData = productInMemoryStates.get(productSnap.id)!;
              const targetP = resolveProductPrice(pData, cartItem.selectedVariant);
              return {
                productId: productSnap.id,
                sellerId: String(pData.sellerId || ""),
                category: String(pData.category || ""),
                categoryId: String(pData.categoryId || pData.category || ""),
                price: targetP,
                quantity: cartItem.quantity,
              };
            });

            // 6. Filtrer les articles selon les restrictions du coupon (vendeurs & catégories)
            const { eligibleItems, eligibleSubtotal, hasRestrictions } = CouponService.filterEligibleItems(
              appliedCouponData,
              itemsForCoupon
            );

            if (hasRestrictions && eligibleItems.length === 0) {
              throw new Error("Aucun article de votre panier n'est éligible à ce code promo.");
            }

            // 7. Calculer le montant de remise strictement côté serveur
            const discountCalc = CouponService.calculateDiscountAmount(appliedCouponData, eligibleSubtotal);
            if (discountCalc.error) {
              throw new Error(discountCalc.error);
            }

            discountAmount = discountCalc.discountAmount;
            eligibleItemsForCoupon = eligibleItems;
            eligibleCouponSubtotal = eligibleSubtotal;
          }

          // Calculate applied loyalty points (cashback points disabled)
          const cashbackApplied = 0;

          // 2.3 Calcul des Frais de Livraison et division en sous-commandes
          const userWilaya = shippingAddress.wilaya;
          const sellerGroups = new Map<string, typeof productDocs>();
          for (const item of productDocs) {
            const sId = String(item.productSnap.data()?.sellerId);
            if (!sellerGroups.has(sId)) {
              sellerGroups.set(sId, []);
            }
            sellerGroups.get(sId)!.push(item);
          }

          const parentOrderId = db.collection("orders").doc().id;
          const subOrdersToCreate: { ref: firestore.DocumentReference; data: Record<string, unknown> }[] = [];
          let totalShipping = 0;

          // Pre-calculate pro-rata discount breakdown dictionary across all sellers for eligible items
          const eligibleSubtotalBySeller = new Map<string, number>();
          for (const item of eligibleItemsForCoupon) {
            const cur = eligibleSubtotalBySeller.get(item.sellerId) || 0;
            eligibleSubtotalBySeller.set(item.sellerId, cur + item.price * item.quantity);
          }

          const discountBreakdownMap: Record<string, number> = {};
          let remainingBreakdownDiscount = discountAmount;
          const eligibleSellersList = sellerIdsArray.filter((sId) => (eligibleSubtotalBySeller.get(sId) || 0) > 0);

          for (const sId of sellerIdsArray) {
            const sEligibleSub = eligibleSubtotalBySeller.get(sId) || 0;
            if (sEligibleSub <= 0 || eligibleCouponSubtotal <= 0 || discountAmount <= 0) {
              discountBreakdownMap[sId] = 0;
              continue;
            }

            let sDisc = 0;
            if (sId === eligibleSellersList[eligibleSellersList.length - 1]) {
              sDisc = remainingBreakdownDiscount;
            } else {
              sDisc = Math.round(discountAmount * (sEligibleSub / eligibleCouponSubtotal));
              remainingBreakdownDiscount -= sDisc;
            }
            discountBreakdownMap[sId] = Math.max(0, sDisc);
          }

          for (const sellerId of sellerIdsArray) {
            const groupItems = sellerGroups.get(sellerId) || [];
            const shop = shopSnapshots.get(sellerId) as unknown as Record<string, unknown> | undefined;

            let sellerSubtotal = 0;
            const sellerOrderItems: Record<string, unknown>[] = [];

            for (const { cartItem, productSnap } of groupItems) {
              const productData = productSnap.data() || {};
              const targetPrice = resolveProductPrice(productData, cartItem.selectedVariant);

              sellerSubtotal += targetPrice * cartItem.quantity;
              sellerOrderItems.push({
                id: productSnap.id,
                name: productData.name,
                price: targetPrice,
                image: productData.image,
                quantity: cartItem.quantity,
                sellerId: sellerId,
                sellerName: shop ? shop.name || shop.shopName || "Boutique" : "Boutique",
                selectedVariant: cartItem.selectedVariant || null,
              });
            }

            let sellerShippingCost: number;
            const tariffs = shop?.shippingTariffs as Record<string, number> | undefined;
            if (shop && tariffs && tariffs[userWilaya] != null) {
              sellerShippingCost = Number(tariffs[userWilaya]);
            } else {
              const shopAddress = shop?.address as { wilaya?: string } | undefined;
              const sellerWilaya = shopAddress?.wilaya || "DEFAULT_ORIGIN";
              const cleanWilaya = userWilaya.replace(/^\d+\s*-\s*/, "").trim();

              let wFee: number | undefined = undefined;
              // First check matrix for specific seller origin
              if (matrixFees[sellerWilaya] && matrixFees[sellerWilaya][userWilaya] !== undefined) {
                wFee = matrixFees[sellerWilaya][userWilaya];
              } else if (matrixFees[sellerWilaya] && matrixFees[sellerWilaya][cleanWilaya] !== undefined) {
                wFee = matrixFees[sellerWilaya][cleanWilaya];
              } else if (matrixFees["DEFAULT_ORIGIN"] && matrixFees["DEFAULT_ORIGIN"][userWilaya] !== undefined) {
                wFee = matrixFees["DEFAULT_ORIGIN"][userWilaya];
              } else if (matrixFees["DEFAULT_ORIGIN"] && matrixFees["DEFAULT_ORIGIN"][cleanWilaya] !== undefined) {
                wFee = matrixFees["DEFAULT_ORIGIN"][cleanWilaya];
              } else if (dynWilayaFees[userWilaya] !== undefined) {
                wFee = dynWilayaFees[userWilaya];
              } else if (dynWilayaFees[cleanWilaya] !== undefined) {
                wFee = dynWilayaFees[cleanWilaya];
              }

              let rawMethodPrice = wFee !== undefined ? wFee : globalBaseFee;
              if (wFee === undefined && ALGERIA_SHIPPING_DATA[cleanWilaya]) {
                rawMethodPrice = ALGERIA_SHIPPING_DATA[cleanWilaya].price;
              }
              const methodPrice =
                deliveryMethod === "domicile" ? rawMethodPrice : Math.max(400, rawMethodPrice - 200);
              sellerShippingCost = Math.round(methodPrice / 10) * 10;
            }
            totalShipping += sellerShippingCost;

            const sellerDiscount = discountBreakdownMap[sellerId] || 0;
            const sellerCashbackApp = 0;
            const sellerGrandTotal =
              Math.max(0, sellerSubtotal - sellerDiscount - sellerCashbackApp) + sellerShippingCost;

            // 100% Server-side Commission calculation
            const commissionRate = typeof shop?.commissionRate === 'number' ? shop.commissionRate : globalCommissionRate;
            const commissionAmount = (sellerSubtotal * commissionRate) / 100;
            const sellerEarned = sellerGrandTotal - commissionAmount;

            const subOrderRef = db.collection("orders").doc();
            const subOrderDeliveryPin = crypto.randomInt(100000, 999999).toString();
            const subOrderData = {
              parentOrderId,
              userId,
              items: sellerOrderItems,
              subtotal: sellerSubtotal,
              shippingTotal: sellerShippingCost,
              discountAmount: sellerDiscount,
              cashbackApplied: sellerCashbackApp,
              couponCode: appliedCouponData ? (appliedCouponData.code as string) : null,
              total: sellerGrandTotal,
              commissionRateApplied: commissionRate,
              commissionAmount: commissionAmount,
              sellerEarned: sellerEarned,
              status: "pending",
              paymentStatus: "unpaid",
              shippingAddress,
              billingAddress: req.body.billingAddress || shippingAddress,
              sellerIds: [sellerId],
              shippingBreakdown: { [sellerId]: sellerShippingCost },
              discountBreakdown: discountBreakdownMap,
              deliveryPin: subOrderDeliveryPin,
              idempotencyKey: idempotencyKey || null,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            subOrdersToCreate.push({ ref: subOrderRef, data: subOrderData });
          }

          const grandTotal = Math.max(0, subtotal - discountAmount - cashbackApplied) + totalShipping;
          const codAmount = grandTotal;

          // Split totals among sub-orders
          for (const item of subOrdersToCreate) {
            item.data.codAmount = item.data.total;
            item.data.paymentMethod = "cod";
            item.data.paymentStatus = "unpaid";
          }

          // Master Order (OrderMaster) calculation
          const masterOrderRef = db.collection("order_masters").doc(parentOrderId);
          const masterOrderData = {
            id: parentOrderId,
            userId,
            isGuest: !!isGuest,
            guestTokenHash: isGuest ? guestTokenHash : null,
            subtotal,
            shippingTotal: totalShipping,
            discountAmount,
            cashbackApplied,
            codAmount,
            paymentMethod: "cod",
            total: grandTotal,
            status: "pending",
            shippingAddress,
            billingAddress: req.body.billingAddress || shippingAddress,
            subOrderIds: subOrdersToCreate.map((so) => so.ref.id),
            couponCode: appliedCouponData ? (appliedCouponData.code as string) : null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          // =========================================================================
          // PHASE 3 — TOUTES LES ÉCRITURES TRANSACTIONNELLES (TOUTES LECTURES ACHEVÉES)
          // =========================================================================

          // 3.1 Mise à jour atomique des stocks
          for (const req of stockUpdates) {
            t.update(req.ref, req.update);
          }

          // 3.2 Incrémentation atomique de l'utilisation du coupon
          if (couponDoc) {
            t.update(couponDoc.ref, {
              usageCount: admin.firestore.FieldValue.increment(1),
              usedCount: admin.firestore.FieldValue.increment(1),
              usedBy: admin.firestore.FieldValue.arrayUnion(userId),
              [`userUsages.${userId}`]: admin.firestore.FieldValue.increment(1),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }

          // 3.3 Création du profil invité et jeton de récupération sécurisé si nécessaire
          if (isGuest) {
            const userRef = db.collection("users").doc(userId);
            t.set(userRef, {
              uid: userId,
              email: shippingAddress.email || "",
              displayName: shippingAddress.fullName || "",
              role: "buyer",
              isGuest: true,
              guestTokenHash: guestTokenHash || null,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              phone: shippingAddress.phone || "",
              wilaya: shippingAddress.wilaya || "",
              commune: shippingAddress.commune || "",
              address: shippingAddress.address || "",
            });

            if (guestTokenHash) {
              const tokenRef = db.collection("guest_recovery_tokens").doc(userId);
              t.set(tokenRef, {
                guestUserId: userId,
                tokenHash: guestTokenHash,
                email: shippingAddress.email ? String(shippingAddress.email).toLowerCase().trim() : "",
                parentOrderId,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
                used: false,
                convertedToUid: null,
              });
            }
          }

          // 3.4 Création des sous-commandes
          for (const subOrder of subOrdersToCreate) {
            t.set(subOrder.ref, subOrder.data);
          }

          // 3.5 Création de la commande maître
          t.set(masterOrderRef, masterOrderData);

          // 3.6 Création des notifications internes (ex: alertes stock critique)
          for (const notif of internalNotificationsToCreate) {
            t.set(notif.ref, notif.data);
          }

          // 3.7 Création des éléments dans push_queue
          for (const push of pushQueueToCreate) {
            t.set(push.ref, push.data);
          }

          return { 
            orderId: subOrdersToCreate[0].ref.id, 
            total: grandTotal, 
            codAmount, 
            userId,
            subOrdersForEmail: subOrdersToCreate.map(so => ({
              sellerId: (so.data.sellerIds as string[])[0],
              subOrderId: so.ref.id,
              items: (so.data.items as OrderEmailSubOrder['items']) || [],
              total: so.data.total as number
            }))
          };
        }),
      userId
    );

    // Enforce instant velocity limits right after placing the order
    for (const sellerId of sellerIdsSet) {
      await checkSellerVelocityLimit(sellerId);
    }

    if (idempotencyKey) {
      try {
        await db.collection("idempotency_keys").doc(idempotencyKey).set({
          userId,
          orderId: result.orderId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (e) {
        safeLogger.error("Failed to store idempotency key in idempotency_keys", { err: e instanceof Error ? e.message : String(e) });
      }
    }

    // Process order confirmation emails asynchronously
    sendOrderConfirmationEmails(
      shippingAddress.email || "",
      shippingAddress.fullName || "",
      result.orderId,
      result.total,
      result.subOrdersForEmail
    ).catch((e) => safeLogger.error("Failed to process order confirmation emails", { err: e instanceof Error ? e.message : String(e) }));

    // Process out-of-band email alerts asynchronously
    if (emailAlerts.length > 0) {
      Promise.all(
        emailAlerts.map(async (alert) => {
          try {
            const userSnap = await db.collection("users").doc(alert.sellerId).get();
            const email = userSnap.data()?.email;
            if (email) {
              await sendLowStockEmail(email, alert.message);
            }
          } catch (e) {
            safeLogger.error("Erreur lors de l'envoi de l'email de stock bas", { err: e instanceof Error ? e.message : String(e) });
          }
        })
      ).catch((e) => safeLogger.error("Failed to send low stock alert emails", { err: e instanceof Error ? e.message : String(e) }));
    }

    if (isGuest && guestRecoveryToken) {
      res.cookie("olmart_guest_claim_token", `${userId}:${guestRecoveryToken}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });
    }

    res.json({
      success: true,
      orderId: result.orderId,
      grandTotal: result.total,
      codAmount: result.codAmount,
      guestUserId: isGuest ? userId : undefined,
      guestRecoveryToken: isGuest && guestRecoveryToken ? guestRecoveryToken : undefined,
    });
  } catch (error: unknown) {
    safeLogger.error("Place order err", { err: error instanceof Error ? error.message : String(error) });
    const errObj = error as { code?: string; message?: string };
    if (errObj.code === "PRICE_CONFLICT") {
      return res.status(409).json({ error: errObj.message });
    }
    const message = error instanceof Error ? error.message : typeof errObj.message === "string" ? errObj.message : "Erreur de la commande.";
    res.status(400).json({ error: message });
  }
});


router.post("/validate-coupon", strictLimiter, optionalAuthenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { code, items } = req.body;
  const userId = req.user?.uid;
  const isGuest = !req.user;

  if (!code || typeof code !== "string" || !code.trim()) {
    return res.status(400).json({ error: "Code requis" });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Panier requis pour valider ce code promo." });
  }

  try {
    const upperCode = code.trim().toUpperCase();
    const q = await db.collection("coupons").where("code", "==", upperCode).get();

    const resolveResult = CouponService.resolveActiveCouponFromDocs(q.docs);
    if (!resolveResult.couponDoc) {
      return res.status(400).json({ error: resolveResult.error || "Code promo invalide ou expiré." });
    }

    const couponDoc = resolveResult.couponDoc;
    const couponData = couponDoc.data() as Record<string, unknown>;

    // Reconstruct cart & subtotal server-side, completely ignoring client-provided prices/subtotal
    const reconstructed = await CouponService.reconstructVerifiedCartFromFirestore(items, db);
    if (!reconstructed.valid) {
      return res.status(400).json({ error: reconstructed.error || "Panier requis pour valider ce code promo." });
    }

    const validation = CouponService.validateCoupon({
      couponDocId: couponDoc.id,
      couponData,
      subtotal: reconstructed.serverSubtotal,
      userId,
      isGuest,
      items: reconstructed.verifiedItems,
    });

    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    return res.json({
      success: true,
      coupon: validation.coupon,
      discountAmount: validation.discountAmount,
      eligibleSubtotal: validation.eligibleSubtotal,
    });
  } catch (error: unknown) {
    safeLogger.error("Coupon validation error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Erreur serveur lors de la validation." });
  }
});



export default router;
