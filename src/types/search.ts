import { Product } from '../domains/product/product.types';

export interface SearchStoreResult {
  id?: string;
  shopName?: string;
  displayName?: string;
  shopDescription?: string;
  logoUrl?: string;
  wilaya?: string | number;
  uid?: string;
  [key: string]: unknown;
}

export interface SearchApiResponse {
  products: Product[];
  stores: SearchStoreResult[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
