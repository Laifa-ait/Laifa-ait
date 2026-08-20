import { auth } from '../lib/firebase';
import { CartItem } from '../domains/product/product.types';

const MIN_ORDER_AMOUNT = import.meta.env.VITE_MIN_ORDER_AMOUNT ? parseInt(import.meta.env.VITE_MIN_ORDER_AMOUNT, 10) : 100;

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
}

export const processCheckout = async (payload: CheckoutPayload): Promise<CheckoutResponse> => {
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

    let response = await fetch('/api/v1/place-order', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if ((response.status === 401 || response.status === 403) && user) {
      token = await user.getIdToken(true); // force refresh
      headers['Authorization'] = `Bearer ${token}`;
      response = await fetch('/api/v1/place-order', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
    }
    
    const data = (await response.json()) as {
      error?: string;
      orderId?: string;
      grandTotal?: number;
    };

    if (!response.ok) {
       throw new Error(data.error || "Erreur critique lors du traitement de la commande.");
    }
    
    const grandTotal = typeof data.grandTotal === 'number' ? data.grandTotal : 0;
    const orderId = typeof data.orderId === 'string' ? data.orderId : '';

    return {
      orderId,
      total: grandTotal,
      codAmount: grandTotal,
    }; 
  } catch (error: unknown) {
    console.error("Erreur backend checkout:", error);
    const message = error instanceof Error ? error.message : "Erreur critique lors du traitement de la commande.";
    throw new Error(message, { cause: error });
  }
};

