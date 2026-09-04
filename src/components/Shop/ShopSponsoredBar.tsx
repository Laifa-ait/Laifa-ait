import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { PublicSponsoredProductDTO } from "../../types/sponsoredCampaign";
import { SponsoredProductCard } from "../Sponsorship/SponsoredProductCard";

interface ShopSponsoredBarProps {
  placement: "category" | "search";
  category?: string;
  searchQuery?: string;
  onSponsoredProductIdsLoaded?: (ids: string[]) => void;
}

export const ShopSponsoredBar: React.FC<ShopSponsoredBarProps> = ({
  placement,
  category,
  searchQuery,
  onSponsoredProductIdsLoaded,
}) => {
  const [items, setItems] = useState<PublicSponsoredProductDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          placement,
          limit: "4",
        });

        if (category) {
          queryParams.set("category", category);
        }
        if (searchQuery) {
          queryParams.set("q", searchQuery);
        }

        const res = await fetch(`/api/v1/public/sponsored/products?${queryParams.toString()}`);
        if (!res.ok) {
          if (isMounted) setLoading(false);
          return;
        }

        const json = await res.json();
        if (isMounted && json?.success && Array.isArray(json.data)) {
          setItems(json.data);
          const ids = json.data.map((i: PublicSponsoredProductDTO) => i.product.id);
          onSponsoredProductIdsLoaded?.(ids);
        }
      } catch {
        // Silently fail - no breaking of organic shopping
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [placement, category, searchQuery, onSponsoredProductIdsLoaded]);

  const handleImpression = (item: PublicSponsoredProductDTO) => {
    fetch("/api/v1/public/sponsored/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId: item.campaignId,
        eventType: "impression",
        placement: item.placement,
        productId: item.product.id,
      }),
    }).catch(() => {
      // ignore
    });
  };

  const handleClick = (item: PublicSponsoredProductDTO) => {
    fetch("/api/v1/public/sponsored/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId: item.campaignId,
        eventType: "click",
        placement: item.placement,
        productId: item.product.id,
      }),
    }).catch(() => {
      // ignore
    });
  };

  if (loading || items.length === 0) {
    return null;
  }

  const title =
    placement === "category"
      ? `Recommandations Sponsorisées en ${category || "cette catégorie"}`
      : `Résultats Sponsorisés pour "${searchQuery}"`;

  return (
    <div className="mb-8 p-5 bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-transparent rounded-3xl border border-orange-200/60 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-orange-100 text-orange-600">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <h3 className="font-extrabold text-xs text-zinc-900 uppercase tracking-wider">{title}</h3>
          <span className="text-[10px] font-bold text-zinc-500 bg-white/80 border border-zinc-200/80 px-2 py-0.5 rounded-full">
            Sponsorisé
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <SponsoredProductCard
            key={item.campaignId}
            item={item}
            onImpression={handleImpression}
            onClick={handleClick}
          />
        ))}
      </div>
    </div>
  );
};
