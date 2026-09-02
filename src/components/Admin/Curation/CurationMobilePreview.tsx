import React from "react";
import { Smartphone, Heart, ShoppingBag, Image as ImageIcon, Truck, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Product } from "../../../domains/product/product.types";

interface CurationMobilePreviewProps {
  selectedProduct: Product;
  isEditMode: boolean;
  editForm: (Omit<Partial<Product>, "promoPrice"> & { promoPrice?: number | string }) | null;
  activeImageIndex: number;
  setActiveImageIndex: (index: number) => void;
}

export const CurationMobilePreview: React.FC<CurationMobilePreviewProps> = ({
  selectedProduct,
  isEditMode,
  editForm,
  activeImageIndex,
  setActiveImageIndex,
}) => {
  const { t } = useTranslation();
  const target = isEditMode && editForm ? editForm : selectedProduct;
  const images = ((target.images && target.images.length > 0 ? target.images : [target.image]).filter(Boolean) as string[]);
  const currentImg = images[activeImageIndex] || target.image;
  const price = Number(target.price || 0);
  const promoPrice = target.promoPrice ? Number(target.promoPrice) : null;

  return (
    <div className="xl:col-span-5 flex justify-center">
      <div className="space-y-4 w-full max-w-[340px]">
        <div className="flex items-center gap-2 justify-center text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest">
          <Smartphone className="w-4 h-4" />
          {t("Preview du rendu sur mobile")}
        </div>

        <div className="w-full aspect-[9/18.5] bg-zinc-950 rounded-[44px] p-3 shadow-2xl relative border-4 border-zinc-800 ring-1 ring-white/10 overflow-hidden flex flex-col">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-zinc-950 rounded-b-2xl z-50 flex items-center justify-center">
            <div className="w-12 h-1 bg-zinc-800 rounded-full" />
          </div>

          <div className="w-full h-full bg-[#FCFAF7] rounded-[36px] overflow-hidden flex flex-col relative text-zinc-900 text-xs">
            <div className="h-6 bg-transparent shrink-0 flex items-center justify-between px-6 text-[9px] font-bold text-zinc-400 select-none">
              <span>12:45</span>
              <div className="flex items-center gap-1.5">
                <span>5G</span>
                <div className="w-4 h-2 bg-zinc-400 rounded-sm" />
              </div>
            </div>

            <div className="h-10 bg-white/70 border-b border-zinc-100 flex items-center justify-between px-4 sticky top-0 z-40">
              <span className="font-sans font-bold text-[10px] text-zinc-800 uppercase tracking-wide">
                Olmart Marketplace
              </span>
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-zinc-400" />
                <ShoppingBag className="w-4 h-4 text-zinc-400" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-14">
              <div className="aspect-square bg-zinc-100 relative overflow-hidden">
                {currentImg ? (
                  <>
                    <img loading="lazy" decoding="async" src={currentImg} alt="Mobile preview" className="w-full h-full object-cover" />
                    {images.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/30 px-2 py-1 rounded-full">
                        {images.map((_: string, i: number) => (
                          <button
                            key={i}
                            onClick={() => setActiveImageIndex(i)}
                            className={`w-1.5 h-1.5 rounded-full border-none cursor-pointer ${
                              i === activeImageIndex ? "bg-[#ea580c]" : "bg-white/60"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-baseline gap-2">
                  {promoPrice && promoPrice < price ? (
                    <>
                      <span className="text-base font-sans font-bold text-[#ea580c]">
                        {promoPrice} DA
                      </span>
                      <span className="text-[10px] text-zinc-400 line-through font-bold">
                        {price} DA
                      </span>
                    </>
                  ) : (
                    <span className="text-base font-sans font-bold text-zinc-900">
                      {price} DA
                    </span>
                  )}
                </div>

                <h3 className="text-xs font-sans font-bold text-zinc-900 uppercase leading-snug">
                  {target.name}
                </h3>

                <div className="flex flex-wrap gap-1">
                  <span className="bg-green-50 text-green-700 text-[8px] font-bold px-1.5 py-0.5 rounded-md">
                    {t("Authentique")}
                  </span>
                  <span className="bg-amber-50 text-amber-700 text-[8px] font-bold px-1.5 py-0.5 rounded-md">
                    {t("Garantie Qualité")}
                  </span>
                  {target.freeShipping && (
                    <span className="bg-orange-50 text-[#ea580c] text-[8px] font-bold px-1.5 py-0.5 rounded-md">
                      {t("Livraison Gratuite")}
                    </span>
                  )}
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-500 border border-zinc-200">
                      {(target.sellerName || "P")[0]}
                    </div>
                    <div>
                      <h5 className="text-[9px] font-sans font-bold text-zinc-800 uppercase tracking-tight">
                        {target.sellerName || t("Vendeur Créateur")}
                      </h5>
                      <p className="text-[8px] text-zinc-400 font-bold">
                        {t("Artisan Certifié Olmart")}
                      </p>
                    </div>
                  </div>
                  <span className="text-[8px] font-sans font-bold bg-transparent text-zinc-600 border border-zinc-200/60 px-2 py-0.5 rounded-md">
                    {t("Visiter")}
                  </span>
                </div>

                <div className="bg-amber-50/40 border border-amber-100 p-2.5 rounded-xl space-y-1.5">
                  <h4 className="text-[8px] font-sans font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                    <Truck className="w-3 h-3 text-[#ea580c]" />
                    {t("Logistique & Expédition Algérie")}
                  </h4>
                  <p className="text-[8px] text-zinc-500 font-medium">
                    {t("Paiement à la livraison (Cash on Delivery) supporté dans")} <strong>58 wilayas</strong>.
                  </p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-[8px] font-sans font-bold text-zinc-400 uppercase tracking-wider">
                    {t("Description de l'article")}
                  </h4>
                  <p className="text-[9px] text-zinc-600 font-medium leading-relaxed">
                    {target.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-12 bg-white border-t border-zinc-100 flex items-center justify-between px-3 z-40">
              <button className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 bg-transparent cursor-pointer">
                <MessageCircle className="w-4 h-4" />
              </button>
              <button className="flex-1 ms-2 py-2 bg-[#ea580c] text-white text-[9px] font-sans font-bold uppercase tracking-widest rounded-xl border-none cursor-pointer text-center">
                {t("Ajouter au panier")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
