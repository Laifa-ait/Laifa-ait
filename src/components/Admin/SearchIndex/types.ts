export interface SearchIndexingModel {
  objectID: string;
  name: string;
  name_arab?: string;
  name_english?: string;
  description: string;
  price: number;
  promoPrice?: number;
  hasPromo: boolean;
  category: string;
  subcategory?: string;
  image: string;
  rating: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  stockCount: number;
  wilaya: string;
  sellerId: string;
  sellerName?: string;
  tags: string[];
  createdAt_timestamp: number;
  rankingScore: number;
}
