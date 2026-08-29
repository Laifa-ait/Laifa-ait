import { auth } from '../lib/firebase';
import { CartItem } from '../domains/product/product.types';
import { safeLogger } from '../utils/logger';

const parsedMinOrder = import.meta.env.VITE_MIN_ORDER_AMOUNT ? parseInt(import.meta.env.VITE_MIN_ORDER_AMOUNT, 10) : 100;
const MIN_ORDER_AMOUNT = Number.isInteger(parsedMinOrder) && parsedMinOrder >= 0 ? parsedMinOrder : 100;

export interface CheckoutPayload {
  total?: number;
  items?: CartItem[];
  cartItems?: CartItem[];
  shippingAddress?: Record<string, unknown>;
  paymentMethod?: string;
  [key: string]: unknown;
}

export interface CheckoutResponse {
  orderId: string;
  total: number;
  codAmount: number;
  guestUserId?: string;
  guestRecoveryToken?: string;
}

export const processCheckout = async (payload: CheckoutPayload, timeoutMs = 25000): Promise<CheckoutResponse> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const user = auth.currentUser;
    
    // Client-side minimum order validation
    if (typeof payload.total === 'number' && payload.total < MIN_ORDER_AMOUNT) {
      throw new Error(`Montant minimum de commande : ${MIN_ORDER_AMOUNT} DA`);
    }

    let token: string | null = null;
    if (user) {
       token = await user.getIdToken();
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
       headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch('/api/v1/place-order', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });
    } catch (fetchErr: unknown) {
      if (fetchErr instanceof Error && fetchErr.name === 'AbortError') {
        throw new Error("Le délai de traitement de la commande a été dépassé (25s). Cliquez à nouveau sur 'Valider la commande' pour vérifier si elle a été confirmée.");
      }
      throw fetchErr;
    }

    if ((response.status === 401 || response.status === 403) && user) {
      token = await user.getIdToken(true); // force refresh
      headers['Authorization'] = `Bearer ${token}`;
      try {
        response = await fetch('/api/v1/place-order', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal
        });
      } catch (fetchErr: unknown) {
        if (fetchErr instanceof Error && fetchErr.name === 'AbortError') {
          throw new Error("Le délai de traitement de la commande a été dépassé (25s). Cliquez à nouveau sur 'Valider la commande' pour vérifier si elle a été confirmée.");
        }
        throw fetchErr;
      }
    }
    
    const data = (await response.json()) as {
      error?: string;
      orderId?: string;
      grandTotal?: number;
      guestUserId?: string;
      guestRecoveryToken?: string;
    };

    if (!response.ok) {
       throw new Error(data.error || "Erreur critique lors du traitement de la commande.");
    }
    
    const grandTotal = typeof data.grandTotal === 'number' ? data.grandTotal : 0;
    const orderId = typeof data.orderId === 'string' ? data.orderId : '';
    const guestUserId = typeof data.guestUserId === 'string' ? data.guestUserId : undefined;
    const guestRecoveryToken = typeof data.guestRecoveryToken === 'string' ? data.guestRecoveryToken : undefined;

    return {
      orderId,
      total: grandTotal,
      codAmount: grandTotal,
      guestUserId,
      guestRecoveryToken,
    }; 
  } catch (error: unknown) {
    if (import.meta.env.DEV) {
      safeLogger.error("[Checkout] Checkout error", { err: error instanceof Error ? error.message : "Internal error" });
    }
    const message = error instanceof Error ? error.message : "Erreur critique lors du traitement de la commande.";
    throw new Error(message, { cause: error });
  } finally {
    clearTimeout(timeoutId);
  }
};

