import { useState, useEffect } from "react";
import { apiGet } from "../lib/api";
import { useTranslation } from "react-i18next";

const CACHE_KEY = "olma_trending_searches";
const CACHE_EXPIRATION_MS = 1 * 60 * 60 * 1000; // 1 hour

export const useTrendingSearches = () => {
  const { t } = useTranslation();

  const getFallbackTrends = () => [
    t("trending.tapis", "Tapis Berbère"),
    t("trending.robe", "Robe Kabyle"),
    t("trending.poterie", "Poterie"),
    t("trending.bijoux", "Bijoux en Argent"),
    t("trending.burnous", "Burnous"),
    t("trending.tajine", "Tajine Algérien")
  ];

  const [trends, setTrends] = useState<string[]>([]);

  useEffect(() => {
    setTrends(getFallbackTrends());

    const fetchTrends = async () => {
      const fallbacks = getFallbackTrends();
      try {
        let cached: string | null = null;
        try {
          cached = localStorage.getItem(CACHE_KEY);
        } catch (err) {
          console.warn("localStorage read blocked in useTrendingSearches:", err);
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
            console.warn("localStorage write failed in useTrendingSearches:", err);
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
            console.warn("localStorage fallback write failed in useTrendingSearches:", err);
          }
        }
      } catch (error) {
        console.error("Error fetching trending searches:", error);
      }
    };

    fetchTrends();
  }, [t]);

  return trends;
};
