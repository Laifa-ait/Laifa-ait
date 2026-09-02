import { Response, Router } from "express";
import { authenticateToken, optionalAuthenticateToken, authorizeSeller, AuthenticatedRequest } from "../../../middlewares/auth";
import { strictLimiter } from "../../../middlewares/rateLimiters";
import { enqueueSellerVelocityCheck } from "../../../utils/velocity";
import { safeLogger } from "../../../utils/logger";
import { OrderStatusService, BusinessError } from "../services/orderStatus.service";

export { BusinessError };

const router = Router();

// Update Order Status Securely
router.post(
  "/seller/orders/status",
  authenticateToken,
  authorizeSeller,
  async (req: AuthenticatedRequest, res: Response) => {
    const { orderIds, status } = req.body as { orderIds?: string[]; status?: string };
    const sellerId = req.user?.uid || "";
    const isUserAdmin = req.user?.role === "admin";
    const authUid = req.user?.uid || "";
    const { deliveryPin, deliveryPhoto, latitude, longitude } = req.body as {
      deliveryPin?: string | number;
      deliveryPhoto?: string;
      latitude?: number;
      longitude?: number;
    };

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0 || !status) {
      return res.status(400).json({ error: "orderIds list and status are required" });
    }

    try {
      await OrderStatusService.updateOrderStatus({
        orderIds,
        status,
        sellerId,
        isUserAdmin,
        authUid,
        deliveryPin,
        deliveryPhoto,
        latitude,
        longitude,
      });

      if (req.user?.role !== "admin") {
        enqueueSellerVelocityCheck(sellerId);
      }

      res.json({ success: true });
    } catch (err: unknown) {
      safeLogger.error("Order update error", { err: err instanceof Error ? err.message : String(err) });
      if (err instanceof BusinessError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      return res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne" });
    }
  }
);

// Cancel Order Securely for Buyer
router.post(
  "/buyer/orders/cancel",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const { orderId } = req.body as { orderId?: string };
    const userId = req.user?.uid || "";

    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    try {
      await OrderStatusService.cancelBuyerOrder({ orderId, userId });
      res.json({ success: true });
    } catch (err: unknown) {
      safeLogger.error("Order cancel error", { err: err instanceof Error ? err.message : String(err) });
      if (err instanceof BusinessError) {
        return res.status(err.statusCode).json({ error: err.message });
      }
      return res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne" });
    }
  }
);

// Confirm Delivery
router.post(
  "/checkout/confirm-delivery",
  strictLimiter,
  optionalAuthenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id, fullName, email, phone, wilaya, commune, address, deliveryMethod, items, total, userId } = req.body as {
        id?: string;
        fullName?: string;
        email?: string;
        phone?: string;
        wilaya?: string;
        commune?: string;
        address?: string;
        deliveryMethod?: string;
        items?: unknown;
        total?: number;
        userId?: string;
      };

      if (!id || !fullName || !phone || !wilaya || !commune || !address || !deliveryMethod || !items || total === undefined) {
        return res.status(400).json({ error: "Certains champs obligatoires sont manquants pour la livraison." });
      }

      if (
        id.length > 30 ||
        fullName.length > 150 ||
        phone.length > 50 ||
        wilaya.length > 100 ||
        commune.length > 100 ||
        address.length > 500 ||
        deliveryMethod.length > 50 ||
        total < 0
      ) {
        return res.status(400).json({ error: "Certains champs de livraison dépassent les limites de taille ou de valeur autorisées." });
      }

      const registrationId = await OrderStatusService.confirmDelivery({
        id,
        fullName,
        email,
        phone,
        wilaya,
        commune,
        address,
        deliveryMethod,
        items,
        total,
        authUid: req.user?.uid,
        userId,
      });

      return res.status(200).json({ success: true, registrationId });
    } catch (err: unknown) {
      safeLogger.error("Server-side delivery confirmation failed", { err: err instanceof Error ? err.message : String(err) });
      return res.status(500).json({ error: err instanceof Error ? err.message : "Erreur interne lors de la validation." });
    }
  }
);

export default router;
