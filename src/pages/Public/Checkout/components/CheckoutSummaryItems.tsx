import React from "react";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../../utils/format";
import { ProductImage } from "../../../../components/Product/ProductImage";
import { CartItem } from "../../../../domains/product/product.types";

interface CheckoutSummaryItemsProps {
  groupedCart: Record<
    string,
    { items: CartItem[]; total: number; sellerName: string }
  >;
  getCartItemPrice: (item: CartItem) => number;
}

export const CheckoutSummaryItems: React.FC<CheckoutSummaryItemsProps> = ({
  groupedCart,
  getCartItemPrice,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-h-[350px] overflow-y-auto mb-6 pr-2 custom-scrollbar">
      {Object.values(groupedCart).map((group, idx) => (
        <div
          key={idx}
          className="bg-transparent/50 rounded-xl p-4 border border-stone-100"
          id={`subpackage-group-${idx}`}
        >
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-200/50">
            <span className="bg-[var(--color-slate-900, #0f172a)] text-white text-[9px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal px-2 py-0.5 rounded-full">
              {t("checkout.subpackage") || "Sous-colis"} {idx + 1}
            </span>
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest rtl:tracking-normal">
              {group.sellerName}
            </span>
          </div>
          <div className="space-y-3">
            {group.items.map((item, i: number) => (
              <div key={i} className="flex gap-4">
                <div className="w-14 h-16 rounded-xl bg-white shrink-0 overflow-hidden border border-stone-100">
                  <ProductImage src={item.image} alt={item.name} className="w-full h-full" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <p className="text-[11px] font-bold text-[var(--color-slate-900, #0f172a)] line-clamp-2 leading-tight">
                    {item.name}
                  </p>
                  {item.selectedVariant && (
                    <p className="text-[9px] font-medium text-stone-500 mt-0.5 uppercase tracking-wider">
                      {item.selectedVariant}
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-2 text-stone-500">
                    <span className="text-[10px] font-bold">
                      {t("checkout.qty", "Qté:")} {item.quantity || 1}
                    </span>
                    <span className="text-[10px] font-sans font-bold text-[var(--color-orange-600, #ea580c)] tracking-wider rtl:tracking-normal">
                      {formatPrice(
                        getCartItemPrice(item) * (item.quantity || 1)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
