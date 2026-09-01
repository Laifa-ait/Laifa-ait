import { useState, useEffect } from "react";
import { apiGet } from "../lib/api";
import { useTranslation } from "react-i18next";
import { safeLogger } from "../utils/logger";

const CACHE_KEY = "olma_trending_searches_v2";
const CACHE_EXPIRATION_MS = 1 * 60 * 60 * 1000; // 1 hour

export const useTrendingSearches = () => {
  const { t } = useTranslation();
  const [trends, setTrends] = useState<string[]>([]);

  useEffect(() => {
    const getFallbackTrends = () => [
      t("trending_tech", "Smartphones & Tech"),
      t("trending_fashion", "Mode & Vêtements"),
      t("trending_sneakers", "Chaussures & Sneakers"),
      t("trending_home", "Électroménager"),
      t("trending_dresses", "Robes & Caftans"),
      t("trending_tools", "Bricolage & Outillage"),
      t("trending_beauty", "Beauté & Soins"),
      t("trending_computers", "PC & Informatique")
    ];

    setTrends(getFallbackTrends());

    const fetchTrends = async () => {
      const fallbacks = getFallbackTrends();
      try {
        let cached: string | null = null;
        try {
          // Clear legacy cache if exists
          localStorage.removeItem("olma_trending_searches");
          cached = localStorage.getItem(CACHE_KEY);
        } catch (err) {
          safeLogger.warn("localStorage read blocked in useTrendingSearches", { err: err instanceof Error ? err.message : String(err) });
        }

        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_EXPIRATION_MS && Array.isArray(data) && data.length > 0) {
            setTrends(data);
            return;
          }
        }

        const resp = await apiGet<{ terms?: string[]; data?: { terms?: string[] } }>(
          "/api/v1/platform-stats/trending_searches"
        );

        const terms = resp?.terms || resp?.data?.terms;

        if (terms && Array.isArray(terms) && terms.length > 0) {
          const fetchedTrends = terms.slice(0, 8);
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
          setTrends(fallbacks);
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
        setTrends(fallbacks);
      }
    };

    fetchTrends();
  }, [t]);

  return trends;
};

