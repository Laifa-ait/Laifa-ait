import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';
import {
  ArtisanProfile,
  ArtisanTrade,
  ArtisanService,
  ArtisanPortfolioItem,
  ArtisanQuoteRequest,
  ArtisanReview,
  ArtisanAdminAuditLog,
  ArtisanStatsSummary,
  ArtisanApplicationPayload,
  ArtisanStatus,
} from '../types/artisan';
import { DEFAULT_ARTISAN_TRADES } from '../data/artisanTrades';

// ==========================================
// PUBLIC API CALLS
// ==========================================

export async function fetchApprovedArtisans(filters?: {
  tradeId?: string;
  wilaya?: string;
  commune?: string;
  search?: string;
  isAvailable?: boolean;
  limit?: number;
}): Promise<ArtisanProfile[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.tradeId) params.append('tradeId', filters.tradeId);
    if (filters?.wilaya) params.append('wilaya', filters.wilaya);
    if (filters?.commune) params.append('commune', filters.commune);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.isAvailable !== undefined) params.append('isAvailable', String(filters.isAvailable));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await apiGet<{ success: boolean; data: ArtisanProfile[] }>(
      `/api/v1/artisans${queryString}`
    );
    return res?.data || [];
  } catch {
    return [];
  }
}

export async function searchPublicArtisans(filters?: {
  tradeId?: string;
  wilaya?: string;
  commune?: string;
  search?: string;
  isAvailable?: boolean;
  limit?: number;
}): Promise<{ artisans: ArtisanProfile[]; total: number }> {
  const list = await fetchApprovedArtisans(filters);
  return { artisans: list, total: list.length };
}

export async function fetchArtisanTrades(): Promise<ArtisanTrade[]> {
  try {
    const res = await apiGet<{ success: boolean; data: ArtisanTrade[] }>('/api/v1/artisans/trades');
    return res?.data && res.data.length > 0 ? res.data : DEFAULT_ARTISAN_TRADES;
  } catch {
    return DEFAULT_ARTISAN_TRADES;
  }
}

export async function fetchArtisanById(id: string): Promise<ArtisanProfile | null> {
  try {
    const res = await apiGet<{ success: boolean; data: ArtisanProfile }>(
      `/api/v1/artisans/profile/${encodeURIComponent(id)}`
    );
    return res?.data || null;
  } catch {
    return null;
  }
}

export const fetchArtisanProfile = fetchArtisanById;

export async function fetchArtisanReviews(artisanId: string): Promise<ArtisanReview[]> {
  try {
    const res = await apiGet<{ success: boolean; data: ArtisanReview[] }>(
      `/api/v1/artisans/${encodeURIComponent(artisanId)}/reviews`
    );
    return res?.data || [];
  } catch {
    return [];
  }
}

export async function addArtisanReview(
  artisanId: string,
  payload: {
    rating: number;
    comment: string;
    userName?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  return await apiPost<{ success: boolean; error?: string }>(
    `/api/v1/artisans/${encodeURIComponent(artisanId)}/reviews`,
    payload
  );
}

export const submitArtisanReview = addArtisanReview;

// ==========================================
// AUTHENTICATED ARTISAN API CALLS
// ==========================================

export async function submitArtisanApplication(
  payload: ArtisanApplicationPayload
): Promise<{ success: boolean; data?: ArtisanProfile; error?: string }> {
  return await apiPost<{ success: boolean; data?: ArtisanProfile; error?: string }>(
    '/api/v1/artisans/apply',
    payload
  );
}

export async function fetchMyArtisanProfile(): Promise<ArtisanProfile | null> {
  try {
    const res = await apiGet<{ success: boolean; data: ArtisanProfile | null }>(
      '/api/v1/artisans/me'
    );
    return res?.data || null;
  } catch {
    return null;
  }
}

export async function updateArtisanMyProfile(
  payload: Partial<ArtisanProfile>
): Promise<{ success: boolean; data?: ArtisanProfile; error?: string }> {
  return await apiPut<{ success: boolean; data?: ArtisanProfile; error?: string }>(
    '/api/v1/artisans/me',
    payload
  );
}

export const updateMyArtisanProfile = updateArtisanMyProfile;

export async function addArtisanService(
  serviceData: Omit<ArtisanService, 'id'>
): Promise<{ success: boolean; data?: ArtisanService; error?: string }> {
  return await apiPost<{ success: boolean; data?: ArtisanService; error?: string }>(
    '/api/v1/artisans/me/services',
    serviceData
  );
}

export async function updateArtisanService(
  serviceId: string,
  serviceData: Partial<ArtisanService>
): Promise<{ success: boolean; error?: string }> {
  return await apiPut<{ success: boolean; error?: string }>(
    `/api/v1/artisans/me/services/${encodeURIComponent(serviceId)}`,
    serviceData
  );
}

export async function deleteArtisanService(
  serviceId: string
): Promise<{ success: boolean; error?: string }> {
  return await apiDelete<{ success: boolean; error?: string }>(
    `/api/v1/artisans/me/services/${encodeURIComponent(serviceId)}`
  );
}

export async function addArtisanPortfolioItem(
  itemData: Omit<ArtisanPortfolioItem, 'id'>
): Promise<{ success: boolean; data?: ArtisanPortfolioItem; error?: string }> {
  return await apiPost<{ success: boolean; data?: ArtisanPortfolioItem; error?: string }>(
    '/api/v1/artisans/me/portfolio',
    itemData
  );
}

export async function deleteArtisanPortfolioItem(
  itemId: string
): Promise<{ success: boolean; error?: string }> {
  return await apiDelete<{ success: boolean; error?: string }>(
    `/api/v1/artisans/me/portfolio/${encodeURIComponent(itemId)}`
  );
}

export async function fetchArtisanMyQuotes(): Promise<ArtisanQuoteRequest[]> {
  try {
    const res = await apiGet<{ success: boolean; data: ArtisanQuoteRequest[] }>(
      '/api/v1/artisans/me/requests'
    );
    return res?.data || [];
  } catch {
    return [];
  }
}

export const fetchArtisanRequests = fetchArtisanMyQuotes;

export async function updateArtisanQuoteStatus(
  quoteId: string,
  status: ArtisanQuoteRequest['status'],
  extra?: { estimatedPrice?: number; artisanNotes?: string }
): Promise<{ success: boolean; error?: string }> {
  return await apiPut<{ success: boolean; error?: string }>(
    `/api/v1/artisans/me/requests/${encodeURIComponent(quoteId)}/status`,
    { status, ...extra }
  );
}

export const updateArtisanRequestStatus = updateArtisanQuoteStatus;

// ==========================================
// CLIENT API CALLS
// ==========================================

export async function submitClientQuoteRequest(payload: {
  artisanId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  tradeId: string;
  serviceTitle?: string;
  title: string;
  description: string;
  wilaya: string;
  commune: string;
  address?: string;
  urgency?: 'urgent' | 'standard' | 'flexible';
  preferredDate?: string;
  estimatedBudget?: number;
}): Promise<{ success: boolean; data?: ArtisanQuoteRequest; error?: string }> {
  return await apiPost<{ success: boolean; data?: ArtisanQuoteRequest; error?: string }>(
    '/api/v1/artisans/requests',
    payload
  );
}

export async function fetchClientMyRequests(): Promise<ArtisanQuoteRequest[]> {
  try {
    const res = await apiGet<{ success: boolean; data: ArtisanQuoteRequest[] }>(
      '/api/v1/artisans/my-requests'
    );
    return res?.data || [];
  } catch {
    return [];
  }
}

// ==========================================
// ADMIN API CALLS
// ==========================================

export async function adminFetchAllArtisans(filters?: {
  status?: ArtisanStatus | 'all';
  search?: string;
  tradeId?: string;
  wilaya?: string;
  page?: number;
  limit?: number;
}): Promise<{ artisans: ArtisanProfile[]; total: number }> {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.tradeId) params.append('tradeId', filters.tradeId);
    if (filters?.wilaya) params.append('wilaya', filters.wilaya);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await apiGet<{ success: boolean; data: { artisans: ArtisanProfile[]; total: number } }>(
      `/api/v1/artisans/admin/all${queryString}`
    );
    if (res?.data && Array.isArray(res.data.artisans)) {
      return { artisans: res.data.artisans, total: res.data.total || res.data.artisans.length };
    }
    const legacyRes = res as unknown as { data: ArtisanProfile[]; total: number };
    return { artisans: Array.isArray(legacyRes?.data) ? legacyRes.data : [], total: legacyRes?.total || 0 };
  } catch {
    return { artisans: [], total: 0 };
  }
}

export async function adminFetchStats(): Promise<ArtisanStatsSummary> {
  try {
    const res = await apiGet<{ success: boolean; data: ArtisanStatsSummary }>(
      '/api/v1/artisans/admin/stats'
    );
    return (
      res?.data || {
        totalArtisans: 0,
        approvedCount: 0,
        pendingCount: 0,
        underReviewCount: 0,
        rejectedCount: 0,
        suspendedCount: 0,
        totalQuoteRequests: 0,
        totalTrades: DEFAULT_ARTISAN_TRADES.length,
      }
    );
  } catch {
    return {
      totalArtisans: 0,
      approvedCount: 0,
      pendingCount: 0,
      underReviewCount: 0,
      rejectedCount: 0,
      suspendedCount: 0,
      totalQuoteRequests: 0,
      totalTrades: DEFAULT_ARTISAN_TRADES.length,
    };
  }
}

export async function adminUpdateArtisanStatus(
  artisanId: string,
  status: ArtisanStatus,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  return await apiPut<{ success: boolean; error?: string }>(
    `/api/v1/artisans/admin/${artisanId}/status`,
    { status, reason }
  );
}

export async function adminSaveTrade(
  tradeData: ArtisanTrade
): Promise<{ success: boolean; data?: ArtisanTrade; error?: string }> {
  return await apiPost<{ success: boolean; data?: ArtisanTrade; error?: string }>(
    '/api/v1/artisans/admin/trades',
    tradeData
  );
}

export async function adminDeleteTrade(
  tradeId: string
): Promise<{ success: boolean; error?: string }> {
  return await apiDelete<{ success: boolean; error?: string }>(
    `/api/v1/artisans/admin/trades/${encodeURIComponent(tradeId)}`
  );
}

export async function adminFetchAuditLogs(): Promise<ArtisanAdminAuditLog[]> {
  try {
    const res = await apiGet<{ success: boolean; data: ArtisanAdminAuditLog[] }>(
      '/api/v1/artisans/admin/audit-logs'
    );
    return res?.data || [];
  } catch {
    return [];
  }
}
