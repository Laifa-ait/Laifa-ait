import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { PublicSponsoredProductDTO } from "../../types/sponsoredCampaign";
import { getOptimizedImageUrl } from "../../utils/imageUtils";

export const SponsoredSection: React.FC = () => {
  const [sponsoredItems, setSponsoredItems] = useState<PublicSponsoredProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const reportedImpressionsRef = useRef<Set<string>>(new Set());

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

  // Track impressions once per campaign
  useEffect(() => {
    if (sponsoredItems.length === 0) return;

    for (const item of sponsoredItems) {
      if (!reportedImpressionsRef.current.has(item.campaignId)) {
        reportedImpressionsRef.current.add(item.campaignId);
        // Fire-and-forget unitary impression tracking
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
      }
    }
  }, [sponsoredItems]);

  const handleProductClick = (item: PublicSponsoredProductDTO) => {
    // Fire-and-forget unitary click tracking
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

  // Rule: If loading or zero items, render strictly null (never show empty containers or mock fallback)
  if (loading || sponsoredItems.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-zinc-50/50 border-y border-zinc-200/60 my-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {sponsoredItems.map((item) => {
            const { product } = item;
            return (
              <Link
                key={item.campaignId}
                to={`/product/${product.id}`}
                onClick={() => handleProductClick(item)}
                className="group flex flex-col bg-white rounded-2xl border border-zinc-200/80 overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all duration-200"
              >
                {/* Image Container */}
                <div className="relative aspect-square bg-zinc-100 overflow-hidden">
                  <img
                    src={getOptimizedImageUrl(product.image, 300)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Subtle Sponsored Badge on Card */}
                  <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900/80 text-white text-[10px] font-semibold tracking-wide backdrop-blur-sm">
                    <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                    Sponsorisé
                  </span>
                </div>

                {/* Content */}
                <div className="p-3.5 flex flex-col flex-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider truncate mb-1">
                    {product.category}
                  </span>
                  <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
                    {product.name}
                  </h3>

                  <div className="mt-auto pt-2 flex items-center justify-between border-t border-zinc-100">
                    <div>
                      <span className="text-sm sm:text-base font-bold text-orange-600">
                        {product.price?.toLocaleString()} DZD
                      </span>
                      {product.promoPrice && product.promoPrice < product.price && (
                        <span className="block text-[10px] text-zinc-400 line-through">
                          {product.promoPrice.toLocaleString()} DZD
                        </span>
                      )}
                    </div>
                    {product.sellerName && (
                      <span className="text-[10px] text-zinc-400 truncate max-w-[80px]">
                        {product.sellerName}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
