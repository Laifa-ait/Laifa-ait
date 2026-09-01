export type OlmaAppStatus = 'active' | 'beta' | 'coming_soon' | 'maintenance' | 'hidden';

export type OlmaAppCategory = 
  | 'services' 
  | 'immo' 
  | 'auto' 
  | 'ecommerce' 
  | 'logistics' 
  | 'food' 
  | 'deals' 
  | 'tech' 
  | 'fashion' 
  | 'artisanat' 
  | 'general';

export interface OlmaAppModule {
  id: string;
  slug: string;
  title: Record<'fr' | 'ar' | 'en', string>;
  description: Record<'fr' | 'ar' | 'en', string>;
  longDescription?: Record<'fr' | 'ar' | 'en', string>;
  icon: string;
  gradient?: string;
  badgeColor?: string;
  category: OlmaAppCategory;
  status: OlmaAppStatus;
  badge?: Record<'fr' | 'ar' | 'en', string>;
  isFeatured: boolean;
  order: number;
  targetRoute?: string;
  actionType?: 'route' | 'category' | 'filter' | 'external';
  filterKey?: string;
  externalUrl?: string;
  tags?: string[];
  waitingListCount?: number;
  showInHomeShortcuts?: boolean;
}

export interface OlmaUniversResponse {
  success: boolean;
  data: OlmaAppModule[];
  source?: 'firestore' | 'default';
  message?: string;
}

export interface WaitlistRegistrationPayload {
  appId: string;
  email?: string;
  phone?: string;
  wilaya?: string;
}

