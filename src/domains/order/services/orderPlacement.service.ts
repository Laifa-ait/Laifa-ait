import { firestore } from "firebase-admin";
import { admin, db } from "../../../config/firebase-admin";
import { ALGERIA_SHIPPING_DATA } from "../../../constants";
import { orderBreaker } from "../../../utils/circuitBreaker";
import { resolveProductPrice } from "../../../utils/priceResolver";
import { CouponService, ProductItemForCoupon } from "../../marketing/coupon.service";
import { OrderEmailSubOrder } from "./orderEmailNotifier";

export interface PlaceOrderInput {
  cart: Array<{ id: string; quantity: number; selectedVariant?: string; priceSeen?: number }>;
  shippingAddress: {
    name?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    wilaya: string;
    commune?: string;
    address?: string;
  };
  billingAddress?: unknown;
  couponCode?: string;
  deliveryMethod?: string;
  idempotencyKey?: string;
  userId: string;
  isGuest: boolean;
  guestRecoveryToken: string | null;
  guestTokenHash: string | null;
}

export interface PlaceOrderResult {
  alreadyProcessed: boolean;
  orderId: string;
  total: number;
  codAmount: number;
  userId: string;
  subOrdersForEmail: OrderEmailSubOrder[];
  emailAlerts: { sellerId: string; message: string }[];
  sellerIdsSet: Set<string>;
  internalNotificationsToCreate: { ref: firestore.DocumentReference; data: Record<string, unknown> }[];
  pushQueueToCreate: { ref: firestore.DocumentReference; data: Record<string, unknown> }[];
}

export class OrderPlacementService {
  static async executeOrderPlacement(input: PlaceOrderInput): Promise<PlaceOrderResult> {
    const {
      cart,
      shippingAddress,
      billingAddress,
      couponCode,
      deliveryMethod,
      idempotencyKey,
      userId,
      isGuest,
      guestTokenHash,
    } = input;

    const sellerIdsSet = new Set<string>();
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
    } catch {
      // Fallback defaults
    }

    const uniqueProductIds: string[] = Array.from(new Set(cart.map((item) => item.id)));
    if (uniqueProductIds.length === 0) throw new Error("Panier vide.");

    let sellerIdsArray: string[] = [];
    const shopSnapshots = new Map<string, firestore.DocumentSnapshot>();
    const emailAlerts: { sellerId: string; message: string }[] = [];

    const preProductRefs = uniqueProductIds.map((pId) => db.collection("products").doc(pId));
    const preProductSnaps = await db.getAll(...preProductRefs);

    preProductSnaps.forEach((productSnap, idx) => {
      const pId = uniqueProductIds[idx];
      if (!productSnap.exists) {
        throw new Error(`Produit ${pId} introuvable.`);
      }
      const sId = productSnap.data()?.sellerId;
      if (sId) sellerIdsSet.add(sId);
    });

    sellerIdsArray = Array.from(sellerIdsSet);
    if (sellerIdsArray.length > 0) {
      const sellerRefs = sellerIdsArray.map((sId) => db.collection("users").doc(sId));
      const sellerSnaps = await db.getAll(...sellerRefs);

      sellerSnaps.forEach((shopSnap, idx) => {
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

    const internalNotificationsToCreate: { ref: firestore.DocumentReference; data: Record<string, unknown> }[] = [];
    const pushQueueToCreate: { ref: firestore.DocumentReference; data: Record<string, unknown> }[] = [];

    const result = await orderBreaker.execute(
      () =>
        db.runTransaction(async (t: firestore.Transaction) => {
          emailAlerts.length = 0;
          internalNotificationsToCreate.length = 0;
          pushQueueToCreate.length = 0;

          let couponDoc: firestore.QueryDocumentSnapshot | null = null;
          let idempotencyDocRef: firestore.DocumentReference | null = null;

          if (idempotencyKey) {
            idempotencyDocRef = db.collection("idempotency_keys").doc(idempotencyKey);
            const keySnap = await t.get(idempotencyDocRef);
            if (keySnap.exists) {
              const keyData = keySnap.data();
              return {
                alreadyProcessed: true,
                orderId: keyData?.orderId || "",
                total: keyData?.total || 0,
                codAmount: keyData?.codAmount || 0,
                userId: keyData?.userId || userId,
                subOrdersForEmail: [],
              };
            }
          }

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
          });

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

          if (couponCode) {
            const couponQuery = await t.get(db.collection("coupons").where("code", "==", couponCode.toUpperCase()));
            const resolveResult = CouponService.resolveActiveCouponFromDocs(couponQuery.docs);
            if (resolveResult.couponDoc) {
              couponDoc = resolveResult.couponDoc;
            } else {
              throw new Error(resolveResult.error || "Code promo invalide.");
            }
          }

          let subtotal = 0;
          const orderItems: Record<string, unknown>[] = [];
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

          const stockUpdates: TransactionalStockUpdate[] = [];

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

          let discountAmount = 0;
          let appliedCouponData: Record<string, unknown> | null = null;
          let eligibleItemsForCoupon: ProductItemForCoupon[] = [];
          let eligibleCouponSubtotal = 0;

          if (couponDoc) {
            appliedCouponData = couponDoc.data() as Record<string, unknown>;

            const integrity = CouponService.validateCouponIntegrity(appliedCouponData);
            if (!integrity.valid) {
              throw new Error(integrity.error || "Code promo corrompu ou invalide.");
            }

            if (!CouponService.isCouponActive(appliedCouponData)) {
              throw new Error("Code promo inactif.");
            }

            const timeCheck = CouponService.isCouponTimeValid(appliedCouponData);
            if (!timeCheck.valid) {
              throw new Error(timeCheck.error || "Code promo expiré.");
            }

            const usageCheck = CouponService.isCouponUsageAllowed(appliedCouponData, userId, isGuest);
            if (!usageCheck.valid) {
              throw new Error(usageCheck.error || "Limite d'utilisation du code promo atteinte.");
            }

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

            const { eligibleItems, eligibleSubtotal, hasRestrictions } = CouponService.filterEligibleItems(
              appliedCouponData,
              itemsForCoupon
            );

            if (hasRestrictions && eligibleItems.length === 0) {
              throw new Error("Aucun article de votre panier n'est éligible à ce code promo.");
            }

            const discountCalc = CouponService.calculateDiscountAmount(appliedCouponData, eligibleSubtotal);
            if (discountCalc.error) {
              throw new Error(discountCalc.error);
            }

            discountAmount = discountCalc.discountAmount;
            eligibleItemsForCoupon = eligibleItems;
            eligibleCouponSubtotal = eligibleSubtotal;
          }

          const cashbackApplied = 0;
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

            const commissionRate = typeof shop?.commissionRate === "number" ? shop.commissionRate : globalCommissionRate;
            const commissionAmount = (sellerSubtotal * commissionRate) / 100;
            const sellerEarned = sellerGrandTotal - commissionAmount;

            const subOrderRef = db.collection("orders").doc();
            const subOrderDeliveryPin = Math.floor(100000 + Math.random() * 900000).toString();
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
              billingAddress: billingAddress || shippingAddress,
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

          for (const item of subOrdersToCreate) {
            item.data.codAmount = item.data.total;
            item.data.paymentMethod = "cod";
            item.data.paymentStatus = "unpaid";
          }

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
            billingAddress: billingAddress || shippingAddress,
            subOrderIds: subOrdersToCreate.map((so) => so.ref.id),
            couponCode: appliedCouponData ? (appliedCouponData.code as string) : null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          for (const req of stockUpdates) {
            t.update(req.ref, req.update);
          }

          if (couponDoc) {
            t.update(couponDoc.ref, {
              usageCount: admin.firestore.FieldValue.increment(1),
              usedCount: admin.firestore.FieldValue.increment(1),
              usedBy: admin.firestore.FieldValue.arrayUnion(userId),
              [`userUsages.${userId}`]: admin.firestore.FieldValue.increment(1),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }

          if (isGuest) {
            const userRef = db.collection("users").doc(userId);
            t.set(userRef, {
              uid: userId,
              email: shippingAddress.email || "",
              displayName: shippingAddress.name || shippingAddress.fullName || "",
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

          for (const subOrder of subOrdersToCreate) {
            t.set(subOrder.ref, subOrder.data);
          }

          t.set(masterOrderRef, masterOrderData);

          if (idempotencyDocRef) {
            t.set(idempotencyDocRef, {
              orderId: subOrdersToCreate[0].ref.id,
              total: grandTotal,
              userId,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }

          return {
            alreadyProcessed: false,
            orderId: subOrdersToCreate[0].ref.id,
            total: grandTotal,
            codAmount,
            userId,
            subOrdersForEmail: subOrdersToCreate.map((so) => ({
              sellerId: (so.data.sellerIds as string[])[0],
              subOrderId: so.ref.id,
              items: (so.data.items as OrderEmailSubOrder["items"]) || [],
              total: so.data.total as number,
            })),
          };
        }),
      userId
    );

    return {
      ...result,
      emailAlerts,
      sellerIdsSet,
      internalNotificationsToCreate,
      pushQueueToCreate,
    };
  }
}
