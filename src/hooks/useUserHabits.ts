import { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { apiPost } from "../lib/api";
import { UserAffinityAccumulator } from "../services/UserAffinityAccumulator";

// Interface définissant la structure de nos données d'habitudes
export interface UserHabits {
  historique_recherches: string[];
  categories_visitees: Record<string, number>;
}

export function useUserHabits() {
  // 1. État pour vérifier si l'utilisateur a déjà répondu à la bannière de consentement
  const [aReponduConsentement, setAReponduConsentement] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("olma_consentement") !== null;
    }
    return false;
  });

  // 2. État pour le consentement actif (RGPD)
  const [consentementAccepte, setConsentementAccepte] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("olma_consentement") === "true";
    }
    return false;
  });

  // 3. État des habitudes de l'utilisateur
  const [habitudes, setHabitudes] = useState<UserHabits>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("olma_habitudes");
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (error) {
        console.error("Erreur lors de la lecture du localStorage", error);
      }
    }
    return { historique_recherches: [], categories_visitees: {} };
  });

  // Synchronisation UNIQUE quotidienne (0 écriture répétée / 24h max)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user && consentementAccepte) {
        // Vérifie si le délai quotidien (24h) et le seuil de cumul sont atteints
        if (UserAffinityAccumulator.shouldSync()) {
          try {
            const digest = UserAffinityAccumulator.getLocalDigest();
            await apiPost("/api/v1/user/affinity-digest", digest);
            UserAffinityAccumulator.markSyncCompleted();
          } catch {
            // Silencieux et non-bloquant
          }
        }
      }
    });

    return () => unsub();
  }, [consentementAccepte]);

  // Synchronisation locale dans le localStorage (0 écriture DB)
  useEffect(() => {
    if (consentementAccepte && typeof window !== "undefined") {
      localStorage.setItem("olma_habitudes", JSON.stringify(habitudes));
    }
  }, [habitudes, consentementAccepte]);

  // Fonctions de gestion du consentement
  const accepterConsentement = () => {
    setConsentementAccepte(true);
    setAReponduConsentement(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("olma_consentement", "true");
    }
  };

  const refuserConsentement = () => {
    setConsentementAccepte(false);
    setAReponduConsentement(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("olma_consentement", "false");
      localStorage.removeItem("olma_habitudes");
      setHabitudes({ historique_recherches: [], categories_visitees: {} });
    }
  };

  // Fonction de tracking : Clic sur une catégorie
  const trackCategorie = (categorieId: string) => {
    if (!consentementAccepte) return;

    // 1. Mise à jour du buffer de cumul
    UserAffinityAccumulator.track({
      category: categorieId,
      type: "click",
      timestamp: Date.now(),
    });

    setHabitudes((prev) => {
      const currentCount = prev.categories_visitees[categorieId] || 0;
      return {
        ...prev,
        categories_visitees: {
          ...prev.categories_visitees,
          [categorieId]: currentCount + 1,
        },
      };
    });
  };

  // Fonction de tracking : Consultation / clic produit
  const trackProductClick = (product: { id: string; category?: string; subcategory?: string; price?: number }) => {
    if (!consentementAccepte) return;

    UserAffinityAccumulator.track({
      productId: product.id,
      category: product.category,
      subcategory: product.subcategory,
      price: product.price,
      type: "click",
      timestamp: Date.now(),
    });

    if (product.category) {
      trackCategorie(product.category);
    }
  };

  // Fonction de tracking : Soumission d'une recherche
  const trackRecherche = (motCle: string) => {
    const terme = motCle.trim();
    if (!consentementAccepte || !terme) return;

    // Enregistrement dans le cumul
    UserAffinityAccumulator.track({
      query: terme,
      type: "search",
      timestamp: Date.now(),
    });

    setHabitudes((prev) => {
      const historiquePropre = prev.historique_recherches.filter((k) => k.toLowerCase() !== terme.toLowerCase());
      const nvxHistorique = [terme, ...historiquePropre].slice(0, 5);

      return {
        ...prev,
        historique_recherches: nvxHistorique,
      };
    });
  };

  // Algorithme d'extraction de la catégorie favorite avec tolérance au bruit
  const getCategorieFavorite = (): string | null => {
    // Check if there is a simulated/forced category in session storage for presentation review
    const forced = typeof window !== "undefined" ? sessionStorage.getItem("olma_simulated_category") : null;
    if (forced) return forced;

    const categories = Object.entries(habitudes.categories_visitees);
    if (categories.length === 0) return null;

    // Trie pour trouver celle avec le plus grand compte
    categories.sort((a, b) => (b[1] as number) - (a[1] as number));
    return categories[0][0]; // Retourne la clé de la catégorie favorite
  };

  // Helper pour obtenir la liste complète des catégories triées par préférence de l'utilisateur
  const getSortedCategories = (defaultCategories: string[]): string[] => {
    const favorite = getCategorieFavorite();
    if (!favorite) return defaultCategories;

    // Placer la favorite en premier, puis les autres
    const filtered = defaultCategories.filter((cat) => cat !== favorite);
    return [favorite, ...filtered];
  };

  // Permet de simuler/forcer instantanément une catégorie pour tester la personnalisation sans clic répété
  const forceCategorieFavorite = (category: string | null) => {
    if (typeof window !== "undefined") {
      if (category) {
        sessionStorage.setItem("olma_simulated_category", category);
        // Also feed habits state to keep them aligned
        setHabitudes((prev) => ({
          ...prev,
          categories_visitees: {
            ...prev.categories_visitees,
            [category]: (prev.categories_visitees[category] || 0) + 10,
          },
        }));
      } else {
        sessionStorage.removeItem("olma_simulated_category");
      }
    }
  };

  const clearHabits = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("olma_habitudes");
      sessionStorage.removeItem("olma_simulated_category");
      setHabitudes({ historique_recherches: [], categories_visitees: {} });
    }
  };

  return {
    consentementAccepte,
    aReponduConsentement,
    accepterConsentement,
    refuserConsentement,
    trackCategorie,
    trackProductClick,
    trackRecherche,
    getCategorieFavorite,
    getSortedCategories,
    forceCategorieFavorite,
    clearHabits,
    categoriesVisiteesCount: habitudes.categories_visitees,
    historiqueRecherches: habitudes.historique_recherches,
  };
}
