import { useState, useEffect } from "react";
import { apiGet } from "../lib/api";
import { useTranslation } from "react-i18next";
import { safeLogger } from "../utils/logger";

const CACHE_KEY = "olma_trending_searches";
const CACHE_EXPIRATION_MS = 1 * 60 * 60 * 1000; // 1 hour

export const useTrendingSearches = () => {
  const { t } = useTranslation();
  const [trends, setTrends] = useState<string[]>([]);

  useEffect(() => {
    const getFallbackTrends = () => [
      t("trending.tapis", "Tapis Berbère"),
      t("trending.robe", "Robe Kabyle"),
      t("trending.poterie", "Poterie"),
      t("trending.bijoux", "Bijoux en Argent"),
      t("trending.burnous", "Burnous"),
      t("trending.tajine", "Tajine Algérien")
    ];

    setTrends(getFallbackTrends());

    const fetchTrends = async () => {
      const fallbacks = getFallbackTrends();
      try {
        let cached: string | null = null;
        try {
          cached = localStorage.getItem(CACHE_KEY);
        } catch (err) {
          safeLogger.warn("localStorage read blocked in useTrendingSearches", { err: err instanceof Error ? err.message : String(err) });
        }

        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_EXPIRATION_MS) {
            setTrends(data);
            return;
          }
        }

        const data = await apiGet<{ terms?: string[] }>("/api/v1/platform-stats/trending_searches");

        if (data && data.terms && Array.isArray(data.terms)) {
          const fetchedTrends = data.terms.slice(0, 8);
          setTrends(fetchedTrends);
          try {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({
                data: fetchedTrends,
                timestamp: Date.now(),
              })
            );
          } catch (err) {
            safeLogger.warn("localStorage write failed in useTrendingSearches", { err: err instanceof Error ? err.message : String(err) });
          }
        } else {
          try {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({
                data: fallbacks,
                timestamp: Date.now(),
              })
            );
          } catch (err) {
            safeLogger.warn("localStorage fallback write failed in useTrendingSearches", { err: err instanceof Error ? err.message : String(err) });
          }
        }
      } catch (error) {
        safeLogger.error("Error fetching trending searches", { err: error instanceof Error ? error.message : String(error) });
      }
    };

    fetchTrends();
  }, [t]);

  return trends;
};
