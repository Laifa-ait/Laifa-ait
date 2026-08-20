export type OlmaAppStatus = 'active' | 'beta' | 'coming_soon' | 'maintenance';

export interface OlmaAppModule {
  id: string;
  slug: string;
  title: Record<'fr' | 'ar' | 'en', string>;
  description: Record<'fr' | 'ar' | 'en', string>;
  longDescription?: Record<'fr' | 'ar' | 'en', string>;
  icon: string;
  category: 'services' | 'immo' | 'auto' | 'ecommerce' | 'logistics' | 'food';
  status: OlmaAppStatus;
  badge?: Record<'fr' | 'ar' | 'en', string>;
  isFeatured: boolean;
  order: number;
  targetRoute?: string;
  externalUrl?: string;
  tags?: string[];
  waitingListCount?: number;
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
