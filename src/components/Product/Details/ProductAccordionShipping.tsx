import React from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { Truck, ChevronDown, MapPin, Clock } from "lucide-react";
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
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-start font-bold text-xs uppercase tracking-wider text-zinc-900 hover:text-emerald-700 transition-colors cursor-pointer border-none bg-transparent"
      >
        <span className="flex items-center gap-2.5">
          <Truck className="w-4 h-4 text-emerald-600" />
          <span>{t("Livraison & Retours")}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-zinc-700" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-4 pt-1 space-y-2.5 text-xs text-zinc-600 divide-y divide-zinc-100">
              <div className="pt-1">
                <p className="font-bold text-zinc-900">
                  {t("Livraison sur les 58 Wilayas d'Algérie")}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {product.deliveryPrice !== undefined && product.deliveryPrice !== null
                    ? Number(product.deliveryPrice) === 0
                      ? "Livraison gratuite offerte !"
                      : `Frais de livraison estimés : ${formatPrice(Number(product.deliveryPrice))}`
                    : t("Paiement sécurisé en espèces à la livraison (COD).")}
                </p>
              </div>

              {(product.wilaya || shop?.wilaya) && (
                <div className="flex gap-2 items-center pt-2 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {t("Expédié depuis")} : <span className="font-semibold text-zinc-800">{product.wilaya || shop?.wilaya}</span>
                  </span>
                </div>
              )}

              {(product.preparationTime || shop?.avgPreparationTime) && (
                <div className="flex gap-2 items-center pt-2 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {t("Préparation")} : <span className="font-semibold text-zinc-800">{product.preparationTime || shop?.avgPreparationTime || "24-48h"}</span>
                  </span>
                </div>
              )}

              <div className="pt-2 text-[11px] text-zinc-500">
                {t("Retours acceptés sous 48h en cas de non-conformité ou produit défectueux.")}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
