import { describe, it, expect } from 'vitest';
import { resolveProductPrice } from '../utils/priceResolver';
import { ALGERIA_SHIPPING_DATA } from '../constants';

describe('Checkout & Shipping Logic (Production Code Integration)', () => {
  describe('Product Price Resolution', () => {
    it('resolves raw base price correctly', () => {
      const product = { name: "Handmade Rug", price: 1500 };
      expect(resolveProductPrice(product)).toBe(1500);
    });

    it('prioritizes promo price when available', () => {
      const product = { name: "Handmade Rug", price: 1500, promoPrice: 1200 };
      expect(resolveProductPrice(product)).toBe(1200);
    });

    it('resolves variants with override prices', () => {
      const product = {
        name: "Handmade Rug",
        price: 1500,
        variants: [
          { name: "Large", priceOverride: 2000 },
          { name: "Small", priceDiff: -500 }
        ]
      };
      expect(resolveProductPrice(product, "Large")).toBe(2000);
      expect(resolveProductPrice(product, "Small")).toBe(1000);
    });

    it('throws error for invalid pricing parameters', () => {
      const product = { name: "Broken Product", price: "not-a-number" };
      expect(() => resolveProductPrice(product)).toThrow();
    });
  });

  describe('Algerian Shipping Cost Data', () => {
    it('checks real wilaya shipping tariffs from constant metadata', () => {
      const shippingAlger = ALGERIA_SHIPPING_DATA['Alger'];
      const shippingOran = ALGERIA_SHIPPING_DATA['Oran'];
      const shippingTindouf = ALGERIA_SHIPPING_DATA['Tindouf'];

      expect(shippingAlger).toBeDefined();
      expect(shippingAlger.price).toBe(500);

      expect(shippingOran).toBeDefined();
      expect(shippingOran.price).toBe(700);

      expect(shippingTindouf).toBeDefined();
      expect(shippingTindouf.price).toBe(1500);
    });

    it('applies general shipping calculation fallback', () => {
      const getShippingFee = (wilaya: string) => {
        const info = ALGERIA_SHIPPING_DATA[wilaya] || { price: 800 };
        return info.price;
      };

      expect(getShippingFee('Alger')).toBe(500);
      expect(getShippingFee('Inexistant')).toBe(800);
    });
  });
});
