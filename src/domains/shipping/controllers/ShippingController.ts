import { Request, Response } from "express";
import { ALGERIA_WILAYAS, ALGERIA_SHIPPING_DATA } from "../../../constants";
import { safeLogger } from "../../../utils/logger";

// Standard Wilayas mapped to standard format
const FALLBACK_WILAYAS = ALGERIA_WILAYAS.map((w, index) => {
  const parts = w.split(" ");
  const id = parseInt(parts[0], 10) || (index + 1);
  const name = parts.slice(1).join(" ");
  return { id, name, zone: 1 };
});

export const getShippingLocations = async (req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      data: {
        wilayas: FALLBACK_WILAYAS,
        communes: [],
        centers: []
      }
    });
  } catch (error: unknown) {
    safeLogger.error("[Olmart Gateway] ❌ Error fetching shipping locations", { err: error instanceof Error ? error.message : String(error) });
    res.json({
      success: true,
      data: {
        wilayas: FALLBACK_WILAYAS,
        communes: [],
        centers: []
      }
    });
  }
};

export const calculateShippingRates = async (req: Request, res: Response) => {
  try {
    const { wilaya_name } = req.body;

    let wilayaKey = "Default";
    if (wilaya_name) {
      const match = ALGERIA_WILAYAS.find(w => w.toLowerCase().includes(String(wilaya_name).toLowerCase()));
      if (match) {
        wilayaKey = match.replace(/^[0-9]+\s*/, '');
      }
    }

    const shippingInfo = ALGERIA_SHIPPING_DATA[wilayaKey] || ALGERIA_SHIPPING_DATA.Default;
    const directFee = shippingInfo.price || 600;

    return res.json({
      success: true,
      data: {
        home_fee: directFee,
        desk_fee: Math.max(300, directFee - 200),
        delay: shippingInfo.delay || "24-48h (Livraison Directe Vendeur)"
      }
    });

  } catch (error: unknown) {
    safeLogger.error("[Olmart Gateway] ❌ Error calculating shipping rates", { err: error instanceof Error ? error.message : String(error) });
    res.json({
      success: true,
      data: {
        home_fee: 600,
        desk_fee: 400,
        delay: "24-48h (Livraison Directe Vendeur)"
      }
    });
  }
};

