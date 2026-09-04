import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { PublicSponsoredProductDTO } from "../../types/sponsoredCampaign";
import { SponsoredProductCard } from "../Sponsorship/SponsoredProductCard";

export const SponsoredSection: React.FC = () => {
  const [sponsoredItems, setSponsoredItems] = useState<PublicSponsoredProductDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSponsoredProducts() {
      try {
        const res = await fetch("/api/v1/public/sponsored/products?placement=home&limit=8");
        if (!res.ok) {
          if (isMounted) setLoading(false);
          return;
        }
        const json = await res.json();
        if (isMounted && json?.success && Array.isArray(json.data)) {
          setSponsoredItems(json.data);
        }
      } catch {
        // Silently fail - zero disruptive UI on network errors
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSponsoredProducts();

    return () => {
      isMounted = false;
    };
  }, []);

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
      // ignore tracking failure
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

  // If loading or zero items, render strictly null
  if (loading || sponsoredItems.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-zinc-50/50 border-y border-zinc-200/60 my-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
                  Sélection Sponsorisée
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-zinc-200/80 text-zinc-600">
                  Sponsorisé
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Produits mis en avant par nos vendeurs partenaires certifiés
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {sponsoredItems.map((item) => (
            <SponsoredProductCard
              key={item.campaignId}
              item={item}
              onImpression={handleImpression}
              onClick={handleClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
