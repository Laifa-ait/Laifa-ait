import React from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { Truck } from "lucide-react";
import { Product } from "../../../domains/product/product.types";
import { Shop } from "../../../domains/seller/shop.types";
import { formatPrice } from "../../../utils/format";

export interface ProductAccordionShippingProps {
  product: Product;
  shop: Shop | null;
  isOpen: boolean;
  onToggle: () => void;
}

export const ProductAccordionShipping: React.FC<ProductAccordionShippingProps> = ({
  product,
  shop,
  isOpen,
  onToggle,
}) => {
  const { t } = useTranslation();

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-start font-sans font-bold text-xs uppercase tracking-wider text-[#2C2C28] cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#008BB5]" />
          {t("Livraison / retour")}
        </span>
        <span
          className={`text-stone-400 font-light text-base transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 space-y-4 text-xs text-stone-600 bg-[#FAF6F0]/25">
              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-[#008BB5]/10 flex items-center justify-center text-[#008BB5] font-bold text-[10px] shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <p className="font-bold text-[#2C2C28]">
                    {t("Livraison sur les 69 Wilayas d'Algérie")}
                  </p>
                  <p className="text-[10px] text-stone-500">
                    {product.deliveryPrice !== undefined && product.deliveryPrice !== null
                      ? Number(product.deliveryPrice) === 0
                        ? "Livraison gratuite offerte par le vendeur !"
                        : `Frais de livraison estimés : ${formatPrice(Number(product.deliveryPrice))}`
                      : t("Paiement sécurisé en espèces à la livraison.")}
                  </p>
                </div>
              </div>
              {(product.wilaya || shop?.wilaya) && (
                <div className="flex gap-2.5 items-start border-t border-[#EAE3D5]/40 pt-3">
                  <div className="w-5 h-5 rounded-full bg-[#008BB5]/10 flex items-center justify-center text-[#008BB5] font-bold text-[10px] shrink-0 mt-0.5">
                    📍
                  </div>
                  <div>
                    <p className="font-bold text-[#2C2C28]">{t("Origine d'expédition")}</p>
                    <p className="text-[10px] text-stone-500">
                      {t("Expédié depuis")} :{" "}
                      <span className="font-semibold text-stone-800">
                        {product.wilaya || shop?.wilaya}
                      </span>
                    </p>
                  </div>
                </div>
              )}
              {(product.preparationTime || shop?.avgPreparationTime) && (
                <div className="flex gap-2.5 items-start border-t border-[#EAE3D5]/40 pt-3">
                  <div className="w-5 h-5 rounded-full bg-[#008BB5]/10 flex items-center justify-center text-[#008BB5] font-bold text-[10px] shrink-0 mt-0.5">
                    ⏱
                  </div>
                  <div>
                    <p className="font-bold text-[#2C2C28]">{t("Délai de préparation du vendeur")}</p>
                    <p className="text-[10px] text-stone-500">
                      {t("Prêt pour expédition en")}{" "}
                      {product.preparationTime || shop?.avgPreparationTime || "24-48h"}.
                    </p>
                  </div>
                </div>
              )}
              <div className="flex gap-2.5 items-start border-t border-[#EAE3D5]/40 pt-3">
                <div className="w-5 h-5 rounded-full bg-[#008BB5]/10 flex items-center justify-center text-[#008BB5] font-bold text-[10px] shrink-0 mt-0.5">
                  ↺
                </div>
                <div>
                  <p className="font-bold text-[#2C2C28]">{t("Politique d'échange et retour")}</p>
                  <p className="text-[10px] text-stone-500">
                    {product.returnPolicy
                      ? t(
                          "Retours acceptés sous conditions du vendeur si le produit est dans son emballage d'origine."
                        )
                      : t("Les retours et échanges sont gérés directement par le vendeur concerné.")}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
