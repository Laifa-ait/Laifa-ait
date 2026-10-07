import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Star } from "lucide-react";
import { PublicSponsoredProductDTO } from "../../types/sponsoredCampaign";
import { getOptimizedImageUrl } from "../../utils/imageUtils";

interface SponsoredProductCardProps {
  item: PublicSponsoredProductDTO;
  onImpression?: (item: PublicSponsoredProductDTO) => void;
  onClick?: (item: PublicSponsoredProductDTO) => void;
}

export const SponsoredProductCard: React.FC<SponsoredProductCardProps> = ({
  item,
  onImpression,
  onClick,
}) => {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const impressionSentRef = useRef(false);
  const { product } = item;

  useEffect(() => {
    const el = cardRef.current;
    if (!el || impressionSentRef.current || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !impressionSentRef.current) {
            impressionSentRef.current = true;
            onImpression?.(item);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [item, onImpression]);

  const discountPercent =
    product.promoPrice && product.price > product.promoPrice
      ? Math.round(((product.price - product.promoPrice) / product.price) * 100)
      : 0;

  return (
    <Link
      ref={cardRef}
      to={`/product/${product.id}`}
      onClick={() => onClick?.(item)}
      className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all duration-200"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        {product.image ? (
          <img
            src={getOptimizedImageUrl(product.image, 400)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
            Aucune image
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <Sparkles className="w-3 h-3 text-amber-500" /> Sponsorisé
          </span>
          {discountPercent > 0 && (
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-red-600 text-white shadow-xs">
              -{discountPercent}%
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1">
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5 truncate">
          {product.category}
        </p>
        <h3 className="font-semibold text-xs text-slate-900 line-clamp-2 mb-2 group-hover:text-emerald-700 transition-colors">
          {product.name}
        </h3>

        <div className="mt-auto pt-2 flex items-baseline justify-between border-t border-slate-100">
          <div>
            <div className="font-extrabold text-sm text-emerald-700 font-mono">
              {(product.promoPrice || product.price).toLocaleString()} DZD
            </div>
            {product.promoPrice && product.promoPrice < product.price && (
              <div className="text-[10px] text-slate-400 line-through font-mono">
                {product.price.toLocaleString()} DZD
              </div>
            )}
          </div>
          {typeof product.rating === "number" && product.rating > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] font-bold text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded-full border border-slate-200">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
