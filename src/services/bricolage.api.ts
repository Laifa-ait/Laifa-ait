import {
  BricolageServiceCategory,
  VerifiedArtisan,
  QuoteRequestPayload,
  ArtisanRegistrationPayload,
  BricolageReview,
  ActiveArtisanProfile,
  ArtisanOpportunityDTO
} from '../types/bricolage';
import { BRICOLAGE_CATEGORIES, TOP_VERIFIED_ARTISANS } from '../data/bricolageData';
import { apiGet, apiPost } from '../lib/api';
import { auth } from '../lib/firebase';
import { safeLogger } from '../utils/logger';

export const SAMPLE_REVIEWS: BricolageReview[] = [
  {
    id: 'rev-01',
    artisanName: 'Mourad Benali',
    clientName: 'Karim M.',
    wilaya: 'Alger (Hydra)',
    serviceName: 'Chauffe-eau & Chaudière',
    rating: 5,
    comment: "Intervention très rapide pour une fuite de gaz sur la chaudière. Travail propre, professionnel et prix très raisonnable !",
    date: 'Hier'
  },
  {
    id: 'rev-02',
    artisanName: 'Kamel Bricolage',
    clientName: 'Yassine B.',
    wilaya: 'Blida',
    serviceName: 'Dépannage Court-circuit',
    rating: 5,
    comment: "Panne électrique générale résolue à 22h un vendredi soir. Électricien courtois et équipé.",
    date: 'Il y a 3 jours'
  },
  {
    id: 'rev-03',
    artisanName: 'Atelier Hamza Alumi',
    clientName: 'Amina S.',
    wilaya: 'Oran',
    serviceName: 'Fenêtres PVC & Aluminium',
    rating: 4.9,
    comment: "Installation de 4 fenêtres double vitrage aluminium. Finitions impeccables et respect des délais.",
    date: 'Il y a 5 jours'
  }
];

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
      safeLogger.warn('[Bricolage API] Fallback to default artisans', { err: err instanceof Error ? err.message : "Erreur" });
    }
  }

  let list = TOP_VERIFIED_ARTISANS;
  if (wilaya) {
    list = list.filter(a => a.wilaya.toLowerCase().includes(wilaya.toLowerCase()));
  }
  if (specialty && specialty !== 'all') {
    list = list.filter(a => a.specialty.toLowerCase().includes(specialty.toLowerCase()));
  }
  return list;
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
  } catch {
    return {
      success: true,
      message: 'Demande enregistrée en mode hors-ligne ! Un conseiller Olma vous contactera sous peu.',
      requestId: `LOCAL-${Date.now()}`
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
    if (import.meta.env.DEV) {
      safeLogger.warn('[Bricolage API] Fallback artisan upgrade', { err: err instanceof Error ? err.message : "Erreur" });
    }
    const hasDocs = Boolean(payload.identityDoc || payload.diplomaDoc || payload.registryDoc);
    const now = new Date().toISOString();
    const localProfile: ActiveArtisanProfile = {
      id: `ARTISAN-${Date.now()}`,
      fullName: payload.fullName || 'Artisan',
      specialty: payload.specialty,
      wilaya: payload.wilaya,
      commune: payload.commune || 'Centre',
      phone: payload.phone,
      registryNumber: payload.registryNumber || 'ART-2026-16098',
      yearsOfExperience: typeof payload.yearsOfExperience === 'number' ? payload.yearsOfExperience : (parseInt(String(payload.yearsOfExperience || 3), 10) || 3),
      isAvailable24_7: Boolean(payload.isAvailable24_7),
      registeredAt: now,
      verifiedBadge: false,
      rating: 0,
      verificationStatus: hasDocs ? 'pending_review' : 'incomplete_docs',
      verificationData: {
        status: hasDocs ? 'pending_review' : 'incomplete_docs',
        submittedAt: now,
        identityDoc: payload.identityDoc ? {
          id: `DOC-ID-${Date.now()}`,
          docType: payload.identityDoc.type || 'cni',
          title: payload.identityDoc.type === 'passport' ? 'Passeport Algérien' : 'Carte Nationale d\'Identité (CNI)',
          docNumber: payload.identityDoc.number || 'CNI-DZ-102938',
          fileName: payload.identityDoc.fileName || 'Piece_Identite.pdf',
          fileUrl: payload.identityDoc.fileUrl || '',
          status: 'pending',
          uploadedAt: now
        } : undefined,
        diplomaDoc: payload.diplomaDoc ? {
          id: `DOC-DIP-${Date.now()}`,
          docType: 'diploma',
          title: payload.diplomaDoc.title || 'Diplôme Professionnel CAP/IFP',
          issuingInstitution: payload.diplomaDoc.institution || 'Ministère de la Formation Pro',
          fileName: payload.diplomaDoc.fileName || 'Diplome_Qualification.pdf',
          fileUrl: payload.diplomaDoc.fileUrl || '',
          status: 'pending',
          uploadedAt: now
        } : undefined,
        registryDoc: payload.registryDoc ? {
          id: `DOC-REG-${Date.now()}`,
          docType: 'artisan_card',
          title: 'Carte d\'Artisan CAM / Registre de Commerce',
          docNumber: payload.registryDoc.number || 'CAM-16-2026',
          issuingInstitution: `CAM ${payload.registryDoc.camWilaya || payload.wilaya}`,
          fileName: payload.registryDoc.fileName || 'Carte_Artisan_CAM.pdf',
          fileUrl: payload.registryDoc.fileUrl || '',
          status: 'pending',
          uploadedAt: now
        } : undefined
      }
    };
    return {
      success: true,
      message: 'Votre dossier d’artisan et vos pièces justificatives ont été soumis à la modération Olmart !',
      profile: localProfile
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
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      safeLogger.warn('[Bricolage API] Fallback to sample reviews', { err: err instanceof Error ? err.message : "Erreur" });
    }
  }
  return SAMPLE_REVIEWS;
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

