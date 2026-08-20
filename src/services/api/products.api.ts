import { apiGet, apiPost, apiPut } from '../../lib/api';
import { Product } from '../../domains/product/product.types';
import { Shop } from '../../domains/seller/shop.types';

export interface GetProductsParams {
  category?: string;
  limit?: number;
  featured?: boolean;
  offset?: number;
}

export interface GetProductsResponse {
  products: Product[];
  total?: number;
}

export interface GetCollectionResponse {
  products: Product[];
  title?: string;
  bannerImage?: string;
}

export interface GetProductDetailResponse {
  product: Product;
  shop: Shop | null;
}

export interface ProductReview {
  id: string;
  userId: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface GetProductReviewsResponse {
  reviews: ProductReview[];
}

export interface CreateProductInput extends Partial<Product> {
  name: string;
  price: number;
  category: string;
}

export interface UpdateProductInput extends Partial<Product> {
  id: string;
}

export const productsApi = {

  getFlashSaleProducts: async (limit?: number, offset?: number): Promise<Product[]> => {
    const res = await apiGet<{ products: Product[] }>(`/api/v1/products?flashSaleActive=true&limit=${limit || 20}&offset=${offset || 0}`);
    return res.products || [];
  },
  getProducts: async (params?: GetProductsParams): Promise<Product[]> => {
    let url = `/api/v1/products?limit=${params?.limit ?? 20}`;
    if (params?.category) {
      url += `&category=${encodeURIComponent(params.category)}`;
    }
    if (params?.featured) {
      url += `&featured=true`;
    }
    if (params?.offset !== undefined) {
      url += `&offset=${params.offset}`;
    }
    const res = await apiGet<GetProductsResponse>(url);
    return res.products || [];
  },

  getFeaturedProducts: async (limit = 10, offset = 0): Promise<Product[]> => {
    const res = await apiGet<GetProductsResponse>(`/api/v1/products?featured=true&limit=${limit}&offset=${offset}`);
    return res.products || [];
  },

  getTagProducts: async (tagId: string): Promise<Product[]> => {
    if (!tagId) return [];
    const res = await apiGet<GetProductsResponse>(`/api/v1/products?tag=${encodeURIComponent(tagId)}&limit=100`);
    return res.products || [];
  },

  getCollectionProducts: async (collectionName: string): Promise<GetCollectionResponse> => {
    const name = collectionName ? encodeURIComponent(collectionName) : "all";
    return apiGet<GetCollectionResponse>(`/api/v1/collections/${name}`);
  },

  getProductById: async (productId: string): Promise<GetProductDetailResponse | null> => {
    if (!productId) return null;
    return apiGet<GetProductDetailResponse>(`/api/v1/products-by-id/${encodeURIComponent(productId)}`);
  },

  getProductReviews: async (productId: string): Promise<ProductReview[]> => {
    if (!productId) return [];
    const res = await apiGet<GetProductReviewsResponse>(`/api/v1/products-by-id/${encodeURIComponent(productId)}/reviews`);
    return res.reviews || [];
  },

  createProduct: async (input: CreateProductInput): Promise<{ id: string; success: boolean }> => {
    return apiPost<{ id: string; success: boolean }>('/api/v1/seller/products', input);
  },

  updateProduct: async (input: UpdateProductInput): Promise<{ success: boolean }> => {
    const { id, ...data } = input;
    return apiPut<{ success: boolean }>(`/api/v1/seller/products/${encodeURIComponent(id)}`, data);
  },

  deleteProduct: async (productId: string): Promise<{ success: boolean }> => {
    return apiPut<{ success: boolean }>(`/api/v1/seller/products/${encodeURIComponent(productId)}`, { status: 'deleted' });
  },
};
