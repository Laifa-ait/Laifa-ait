import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { safeLogger } from '../utils/logger';
import { resilientFetch, googleCircuitBreaker } from '../utils/resilientFetch';

/**
 * Ce service gère les interactions côté client pour les APIs Google Workspace
 * via notre backend Node.js avec résilience, timeout d'annulation AbortController,
 * budget de deadline global et protection Circuit Breaker.
 */
let cachedGoogleToken: string | null = null;

// Maximum upload size limit for Base64 inlined payload (10 MB)
export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

// Instance de l'authentification Firebase existante (le config Firebase est déjà initialisé ailleurs)
export const getGoogleToken = async (forceRefresh = false): Promise<string> => {
  if (cachedGoogleToken && !forceRefresh) {
    return cachedGoogleToken;
  }

  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  
  // Demande des scopes nécessaires
  provider.addScope('https://www.googleapis.com/auth/spreadsheets');
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  provider.addScope('https://www.googleapis.com/auth/calendar.events');

  // Paramétrer pour s'assurer que c'est un compte G-Suite (si besoin) ou forcer le prompt
  provider.setCustomParameters({
    prompt: 'select_account'
  });

  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (credential && credential.accessToken) {
      cachedGoogleToken = credential.accessToken;
      return cachedGoogleToken;
    } else {
      throw new Error("Impossible de récupérer le token d'accès Google.");
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      safeLogger.error("Erreur de connexion Google Workspace", { err: error instanceof Error ? error.message : "Erreur inconnue" });
    }
    throw error;
  }
};

/**
 * Helper to safely read a file as DataURL with a strict timeout to prevent pending promises.
 */
export function readFileAsDataUrlWithTimeout(file: File, timeoutMs = 15000): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error("Fichier invalide ou non fourni"));
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return reject(new Error(`Taille du fichier dépasse la limite autorisée (${MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)} Mo)`));
    }

    const reader = new FileReader();
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        try {
          reader.abort();
        } catch {
          // Ignore reader abort errors
        }
        reject(new Error("Délai de lecture du fichier dépassé (Timeout)"));
      }
    }, timeoutMs);

    reader.onload = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(reader.result as string);
      }
    };

    reader.onerror = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(reader.error || new Error("Erreur de lecture du fichier"));
      }
    };

    reader.onabort = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(new Error("Lecture du fichier interrompue (Aborted)"));
      }
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 1. Exporter les données vers Google Sheets
 */
export const exportPremiumToSheets = async (payload: Record<string, unknown>) => {
  const token = await getGoogleToken();
  const response = await resilientFetch('/api/v1/workspace/sheets/export-premium', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-google-token': token
    },
    body: JSON.stringify(payload)
  }, {
    circuitBreaker: googleCircuitBreaker,
    timeoutMs: 12000,
    totalDeadlineMs: 25000,
  });

  if (!response.ok) {
    const err = await response.json() as { error?: string };
    throw new Error(err.error || 'Erreur lors de l’export');
  }
  return response.json();
};

/**
 * 2. Upload Google Drive
 */
export const uploadToDrive = async (file: File) => {
  const dataUrl = await readFileAsDataUrlWithTimeout(file);
  const base64Data = dataUrl.split(',')[1];
  const token = await getGoogleToken();

  const response = await resilientFetch('/api/v1/workspace/drive/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-google-token': token
    },
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type,
      base64Data
    })
  }, {
    circuitBreaker: googleCircuitBreaker,
    timeoutMs: 15000,
    totalDeadlineMs: 30000,
  });

  if (!response.ok) {
    const err = await response.json() as { error?: string };
    throw new Error(err.error || "Erreur upload Drive");
  }
  
  return response.json();
};

/**
 * 2b. System Upload for KYC to Google Drive (No Google Token Required for the Seller)
 */
export const systemUploadKYCToDrive = async (file: File, sellerId: string): Promise<string> => {
  const dataUrl = await readFileAsDataUrlWithTimeout(file);
  const base64Data = dataUrl.split(',')[1];

  const response = await resilientFetch('/api/v1/workspace/drive/system-upload-kyc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type,
      base64Data,
      sellerId
    })
  }, {
    circuitBreaker: googleCircuitBreaker,
    timeoutMs: 15000,
    totalDeadlineMs: 30000,
  });

  if (!response.ok) {
    const err = await response.json() as { error?: string };
    throw new Error(err.error || "Erreur upload System Drive");
  }
  
  const data = await response.json() as { file: { webViewLink?: string; id?: string } };
  return data.file.webViewLink || data.file.id || "";
};

/**
 * 3. Planifier une vérification Meet via Google Calendar
 */
export const scheduleVerificationMeet = async (sellerEmail: string | string[], startTime: string, endTime: string, summary?: string, description?: string) => {
  const token = await getGoogleToken();
  const response = await resilientFetch('/api/v1/workspace/calendar/schedule', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-google-token': token
    },
    body: JSON.stringify({
      sellerEmail: Array.isArray(sellerEmail) ? undefined : sellerEmail,
      sellerEmails: Array.isArray(sellerEmail) ? sellerEmail : undefined,
      startTime,
      endTime,
      summary,
      description
    })
  }, {
    circuitBreaker: googleCircuitBreaker,
    timeoutMs: 12000,
    totalDeadlineMs: 25000,
  });

  if (!response.ok) {
    const err = await response.json() as { error?: string };
    throw new Error(err.error || 'Erreur lors de la création Meet');
  }
  
  return response.json();
};

