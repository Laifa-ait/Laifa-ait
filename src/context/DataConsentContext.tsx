import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserDataConsentPreferences, StorageQuotaEstimate } from "../types/documents";
import { getStorageQuotaEstimate, clearNonEssentialBrowserStorage } from "../utils/userStorageManager";
import { fetchUserConsent, saveUserConsent } from "../services/documents.service";
import { useAuth } from "./AuthContext";

const STORAGE_KEY = "olmart_data_consent_preferences_v1";

const DEFAULT_PREFERENCES: UserDataConsentPreferences = {
  essential: true,
  localStorageCache: false,
  documentMemory: false,
  analyticsPerformance: false,
  consentTimestamp: "",
  consentVersion: "1.0",
};

interface DataConsentContextType {
  preferences: UserDataConsentPreferences;
  hasConsented: boolean;
  isConsentModalOpen: boolean;
  storageUsage: StorageQuotaEstimate | null;
  openConsentModal: () => void;
  closeConsentModal: () => void;
  acceptAll: () => Promise<void>;
  savePreferences: (custom: Partial<UserDataConsentPreferences>) => Promise<void>;
  revokeNonEssential: () => Promise<void>;
  refreshStorageUsage: () => Promise<void>;
  clearBrowserCache: () => { clearedKeys: number; clearedBytes: number };
}

const DataConsentContext = createContext<DataConsentContextType | undefined>(undefined);

export const DataConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [preferences, setPreferences] = useState<UserDataConsentPreferences>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.warn("[DataConsent] Erreur lecture localStorage:", e);
      }
    }
    return DEFAULT_PREFERENCES;
  });

  const [hasConsented, setHasConsented] = useState<boolean>(() => {
    return !!preferences.consentTimestamp;
  });

  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [storageUsage, setStorageUsage] = useState<StorageQuotaEstimate | null>(null);

  const refreshStorageUsage = useCallback(async () => {
    try {
      const estimate = await getStorageQuotaEstimate();
      setStorageUsage(estimate);
    } catch (err) {
      console.warn("[DataConsent] Erreur rafraîchissement quota:", err);
    }
  }, []);

  useEffect(() => {
    refreshStorageUsage();
  }, [refreshStorageUsage]);

  // Sync with Firestore if logged in
  useEffect(() => {
    if (!currentUser) return;
    let isMounted = true;
    fetchUserConsent()
      .then((remoteConsent) => {
        if (remoteConsent && isMounted) {
          setPreferences(remoteConsent);
          setHasConsented(true);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteConsent));
        }
      })
      .catch((err) => console.warn("[DataConsent] Sync distant:", err));

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const persistConsent = async (newPrefs: UserDataConsentPreferences) => {
    setPreferences(newPrefs);
    setHasConsented(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
    if (currentUser) {
      try {
        await saveUserConsent(newPrefs);
      } catch (e) {
        console.warn("[DataConsent] Sauvegarde distante impossible:", e);
      }
    }
    await refreshStorageUsage();
  };

  const acceptAll = async () => {
    const fullConsent: UserDataConsentPreferences = {
      essential: true,
      localStorageCache: true,
      documentMemory: true,
      analyticsPerformance: true,
      consentTimestamp: new Date().toISOString(),
      consentVersion: "1.0",
    };
    await persistConsent(fullConsent);
    setIsConsentModalOpen(false);
  };

  const savePreferences = async (custom: Partial<UserDataConsentPreferences>) => {
    const merged: UserDataConsentPreferences = {
      ...preferences,
      ...custom,
      essential: true,
      consentTimestamp: new Date().toISOString(),
      consentVersion: "1.0",
    };
    await persistConsent(merged);
    setIsConsentModalOpen(false);
  };

  const revokeNonEssential = async () => {
    const minimal: UserDataConsentPreferences = {
      essential: true,
      localStorageCache: false,
      documentMemory: false,
      analyticsPerformance: false,
      consentTimestamp: new Date().toISOString(),
      consentVersion: "1.0",
    };
    clearNonEssentialBrowserStorage();
    await persistConsent(minimal);
  };

  const clearBrowserCache = () => {
    const result = clearNonEssentialBrowserStorage();
    refreshStorageUsage();
    return result;
  };

  return (
    <DataConsentContext.Provider
      value={{
        preferences,
        hasConsented,
        isConsentModalOpen,
        storageUsage,
        openConsentModal: () => setIsConsentModalOpen(true),
        closeConsentModal: () => setIsConsentModalOpen(false),
        acceptAll,
        savePreferences,
        revokeNonEssential,
        refreshStorageUsage,
        clearBrowserCache,
      }}
    >
      {children}
    </DataConsentContext.Provider>
  );
};

export const useDataConsent = () => {
  const ctx = useContext(DataConsentContext);
  if (!ctx) {
    throw new Error("useDataConsent doit être utilisé au sein de DataConsentProvider");
  }
  return ctx;
};
