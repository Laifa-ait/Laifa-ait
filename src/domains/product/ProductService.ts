import type { Product } from "./product.types";

export interface ProductQueryOptions {
  limit?: number;
  category?: string;
  sellerId?: string;
  status?: string;
}

export class ProductService {
  static async getProducts(_options?: ProductQueryOptions): Promise<Product[]> {
    return [];
  }
}

