import {
  BricolageServiceCategory,
  VerifiedArtisan,
  QuoteRequestPayload,
  ArtisanRegistrationPayload,
  BricolageReview,
  ActiveArtisanProfile,
  ArtisanOpportunityDTO
} from '../types/bricolage';
import { BRICOLAGE_CATEGORIES } from '../data/bricolageData';
import { apiGet, apiPost } from '../lib/api';
import { auth } from '../lib/firebase';
import { safeLogger } from '../utils/logger';

export async function fetchBricolageCategories(): Promise<BricolageServiceCategory[]> {
  try {
    const res = await fetch('/api/v1/bricolage/categories');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      safeLogger.warn('[Bricolage API] Fallback to default categories', { err: err instanceof Error ? err.message : "Erreur" });
    }
  }
  return BRICOLAGE_CATEGORIES;
}

export async function fetchVerifiedArtisans(wilaya?: string, specialty?: string): Promise<VerifiedArtisan[]> {
  try {
    let url = '/api/v1/bricolage/artisans';
    const params = new URLSearchParams();
    if (wilaya) params.append('wilaya', wilaya);
    if (specialty) params.append('specialty', specialty);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      safeLogger.warn('[Bricolage API] Error fetching artisans', { err: err instanceof Error ? err.message : "Erreur" });
    }
  }
  return [];
}

export async function submitQuoteRequest(payload: QuoteRequestPayload): Promise<{ success: boolean; message: string; requestId?: string; estimatedPriceDZD?: { min: number; max: number } }> {
  try {
    const res = await fetch('/api/v1/bricolage/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.success && json.data) {
      return {
        success: true,
        message: json.data.message,
        requestId: json.data.requestId,
        estimatedPriceDZD: json.data.estimatedPriceDZD
      };
    }
    return { success: false, message: json.error || 'Erreur lors de la soumission.' };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Erreur de connexion au serveur.'
    };
  }
}

export async function submitArtisanOffer(payload: {
  requestId: string;
  priceDZD: number;
  estimatedDuration: string;
  notes: string;
  artisanName?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const json = await apiPost<{ success: boolean; data?: { offerId: string; message: string }; error?: string }>('/api/v1/bricolage/offers', payload);
    if (json?.success && json.data) {
      return { success: true, message: json.data.message };
    }
    return { success: false, message: json?.error || 'Erreur lors de l’envoi du devis.' };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Erreur lors de l’envoi du devis.';
    return { success: false, message: errMsg };
  }
}

export async function registerArtisan(payload: ArtisanRegistrationPayload): Promise<{
  success: boolean;
  message: string;
  applicationId?: string;
  profile?: ActiveArtisanProfile;
}> {
  const result = await upgradeToArtisanProfile(payload);
  return {
    success: result.success,
    message: result.message,
    applicationId: result.profile?.id,
    profile: result.profile
  };
}

export async function upgradeToArtisanProfile(payload: ArtisanRegistrationPayload): Promise<{
  success: boolean;
  message: string;
  profile?: ActiveArtisanProfile;
}> {
  try {
    const json = await apiPost<{ success: boolean; data?: { profile: ActiveArtisanProfile; message: string }; error?: string }>('/api/v1/bricolage/artisans/upgrade', payload);
    if (json?.success && json?.data?.profile) {
      return {
        success: true,
        message: json.data.message || 'Votre dossier artisan a été transmis avec succès pour vérification !',
        profile: json.data.profile
      };
    }
    return { success: false, message: json?.error || 'Erreur lors de la soumission de la demande d’artisan.' };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Erreur lors de la soumission de la demande.';
    return {
      success: false,
      message: errMsg
    };
  }
}

export async function fetchPendingArtisanVerifications(): Promise<ActiveArtisanProfile[]> {
  try {
    const json = await apiGet<{ success: boolean; data: ActiveArtisanProfile[] }>('/api/v1/bricolage/admin/artisans/pending');
    if (json?.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      safeLogger.warn('[Bricolage API] Error fetching pending verifications', { err: err instanceof Error ? err.message : "Erreur" });
    }
  }
  return [];
}

export async function adminVerifyArtisanDoc(payload: {
  artisanId: string;
  action: 'approve' | 'reject';
  rejectionReason?: string;
  docType?: 'identity' | 'diploma' | 'registry' | 'all';
}): Promise<{ success: boolean; message: string }> {
  try {
    const json = await apiPost<{ success: boolean; message?: string; error?: string }>('/api/v1/bricolage/admin/artisans/verify', payload);
    return {
      success: Boolean(json?.success),
      message: json?.message || json?.error || 'Statut mis à jour.'
    };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du statut.';
    return {
      success: false,
      message: errMsg
    };
  }
}

export async function fetchBricolageReviews(): Promise<BricolageReview[]> {
  try {
    const res = await fetch('/api/v1/bricolage/reviews');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      safeLogger.warn('[Bricolage API] Error fetching reviews', { err: err instanceof Error ? err.message : "Erreur" });
    }
  }
  return [];
}

export async function getArtisanOpportunities(
  filters?: { wilaya?: string; category?: string },
  token?: string
): Promise<{ success: boolean; data?: ArtisanOpportunityDTO[]; error?: string; status?: number }> {
  try {
    let url = '/api/v1/bricolage/opportunities';
    const params = new URLSearchParams();
    if (filters?.wilaya && filters.wilaya !== 'all') params.append('wilaya', filters.wilaya);
    if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
    if (params.toString()) url += `?${params.toString()}`;

    let authToken = token;
    if (!authToken && auth.currentUser) {
      try {
        authToken = await auth.currentUser.getIdToken();
      } catch (e) {
        if (import.meta.env.DEV) {
          safeLogger.warn('[Bricolage API] Error getting idToken', { err: e instanceof Error ? e.message : "Erreur" });
        }
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const res = await fetch(url, { headers });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        error: json.error || `Erreur ${res.status}`,
        status: res.status
      };
    }

    if (json.success && Array.isArray(json.data)) {
      return { success: true, data: json.data, status: 200 };
    }

    return {
      success: false,
      error: json.error || 'Format de réponse invalide.',
      status: res.status
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur réseau lors de la récupération des opportunités.';
    return {
      success: false,
      error: errorMessage,
      status: 500
    };
  }
}

export async function acceptQuoteOffer(
  requestId: string,
  offerId: string,
  token?: string
): Promise<{
  success: boolean;
  data?: {
    requestId: string;
    status: string;
    acceptedOffer: Record<string, unknown>;
  };
  error?: string;
  status?: number;
}> {
  try {
    const url = `/api/v1/bricolage/quotes/${encodeURIComponent(requestId)}/accept-offer`;

    let authToken = token;
    if (!authToken && auth.currentUser) {
      try {
        authToken = await auth.currentUser.getIdToken();
      } catch (e) {
        if (import.meta.env.DEV) {
          safeLogger.warn('[Bricolage API] Error getting idToken for acceptQuoteOffer', { err: e instanceof Error ? e.message : "Erreur" });
        }
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ offerId })
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        error: json.error || `Erreur ${res.status}`,
        status: res.status
      };
    }

    if (json.success && json.data) {
      return {
        success: true,
        data: json.data,
        status: res.status || 200
      };
    }

    return {
      success: false,
      error: json.error || 'Format de réponse invalide.',
      status: res.status
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur réseau lors de l\'acceptation du devis.';
    return {
      success: false,
      error: errorMessage,
      status: 500
    };
  }
}

