import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { doc, onSnapshot, DocumentSnapshot, DocumentData } from "firebase/firestore";
import { db } from "../lib/firebase";
import { safeLogger } from "../utils/logger";

/**
 * Hook to automatically synchronize Firestore translation overrides in real time.
 * When an administrator saves or modifies translations, all connected clients receive
 * instant updates in their active language without needing to refresh the page.
 */
export function useTranslationRealtimeSync(): void {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (!db) return;

    const rawLang = i18n.language || "fr";
    const cleanLng = rawLang.split("-")[0];
    if (!["fr", "ar", "en"].includes(cleanLng)) return;

    const translationDocRef = doc(db, "translations", cleanLng);

    const unsubscribe = onSnapshot(
      translationDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (!snapshot.exists()) return;

        const data = snapshot.data();
        if (!data) return;

        const dynamicOverrides: Record<string, string> = {};
        for (const [key, value] of Object.entries(data)) {
          if (
            typeof value === "string" &&
            !["updatedAt", "updatedBy", "createdAt"].includes(key)
          ) {
            dynamicOverrides[key] = value;
          }
        }

        if (Object.keys(dynamicOverrides).length > 0) {
          // Merge overrides directly into i18next resource bundle (deep merge, overwrite)
          i18n.addResourceBundle(cleanLng, "translation", dynamicOverrides, true, true);
          
          // Trigger reactive re-render for currently mounted components
          i18n.emit("added", cleanLng, "translation");
          i18n.emit("loaded", [cleanLng]);
        }
      },
      (error: Error) => {
        safeLogger.warn("[TranslationRealtimeSync] ⚠️ Realtime sync error (non-fatal)", {
          lang: cleanLng,
          err: error.message,
        });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [i18n, i18n.language]);
}
