import React from "react";
import { Sparkles, Star } from "lucide-react";
import { Product } from "../../../domains/product/product.types";
import { formatPrice } from "../../../utils/format";

export interface ProductHeaderBentoProps {
  product: Product;
  currentPrice: number;
  bilingualMode: boolean;
  onToggleBilingualMode: () => void;
  currentLang: string;
}

export const ProductHeaderBento: React.FC<ProductHeaderBentoProps> = ({
  product,
  currentPrice,
  bilingualMode,
  onToggleBilingualMode,
  currentLang,
}) => {
  const isProductFlashActive = false;
  const productName = product.translations?.[currentLang]?.name || product.name;

  return (
    <div className="bg-[#FAF6F0] rounded-[2rem] p-4 sm:p-6 border border-[#EAE3D5] shadow-sm space-y-3.5 relative overflow-hidden">
      {/* Decorative corner curve resembling the arch */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-[#008BB5]/5 rounded-bl-[2.5rem] border-l border-b border-[#EAE3D5]/40 pointer-events-none" />

      <div className="flex items-center justify-between gap-3 relative z-10">
        {product.condition && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-[#FFEAEF] text-[#D81159] border border-[#FFEAEF]">
            <Sparkles className="w-3 h-3" /> {product.condition}
          </span>
        )}
        <button
          type="button"
          onClick={onToggleBilingualMode}
          className={`px-3 py-1 border text-[9px] font-bold uppercase tracking-wider transition-all rounded-full cursor-pointer flex items-center gap-1.5 ${
            bilingualMode
              ? "bg-[#008BB5] text-white border-[#008BB5] shadow-sm"
              : "bg-white border-[#EAE3D5] text-[#008BB5] hover:bg-[#008BB5]/5"
          }`}
        >
          🌍 {bilingualMode ? "AR / FR" : "Affichage Bilingue"}
        </button>
      </div>

      {bilingualMode ? (
        <div className="space-y-1.5 text-start relative z-10">
          <h1 className="text-xl sm:text-2xl font-sans font-extrabold text-[#2C2C28] uppercase tracking-wide leading-tight break-words">
            {product.translations?.["ar"]?.name || product.name}
          </h1>
          <h2 className="text-sm sm:text-base font-sans text-stone-500 uppercase tracking-wide leading-tight break-words border-t border-stone-200/50 pt-1.5 font-medium">
            {product.translations?.["fr"]?.name || product.name}
          </h2>
        </div>
      ) : (
        <h1 className="text-xl sm:text-2xl font-sans font-extrabold text-[#2C2C28] uppercase tracking-wide leading-tight break-words relative z-10">
          {productName}
        </h1>
      )}

      {/* PRICING & RATING ROW */}
      <div className="flex items-center justify-between gap-4 pt-1 border-t border-[#EAE3D5]/50 relative z-10">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-sans font-black text-[#008BB5]">
            {formatPrice(currentPrice)}
          </span>
          {isProductFlashActive ? (
            <span className="text-sm text-stone-400 line-through font-sans">
              {formatPrice(product.price)}
            </span>
          ) : (
            product.onSale && (
              <span className="text-sm text-stone-400 line-through font-sans">
                {formatPrice(currentPrice * 1.2)}
              </span>
            )
          )}
        </div>

        {/* Quick rating snippet with bougainvillea pink stars */}
        {product.stats?.averageRating && (
          <div className="flex items-center gap-1 bg-[#D81159]/5 px-2.5 py-1 rounded-full border border-[#D81159]/10">
            <Star className="w-3.5 h-3.5 fill-[#D81159] text-[#D81159]" />
            <span className="text-xs font-bold text-[#D81159]">
              {Number(product.stats.averageRating).toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {product.energyClass && (
        <div className="flex items-center pt-1">
          <div className="flex items-center border border-stone-300 rounded overflow-hidden">
            <div
              className="text-white font-bold text-[9px] px-2 py-0.5"
              style={{
                backgroundColor: (() => {
                  switch (product.energyClass) {
                    case "A":
                      return "#00A650";
                    case "B":
                      return "#50B848";
                    case "C":
                      return "#C4D400";
                    case "D":
                      return "#FFF200";
                    case "E":
                      return "#F7B500";
                    case "F":
                      return "#EB690B";
                    case "G":
                      return "#E2001A";
                    default:
                      return "#00A650";
                  }
                })(),
              }}
            >
              Classe {product.energyClass}
            </div>
            <div className="bg-stone-100 text-[8px] flex flex-col leading-none px-1.5 py-0.5 font-bold">
              <span>A</span>
              <span>↑</span>
              <span>G</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
