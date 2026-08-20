import React from 'react';
import { useTranslation } from 'react-i18next';
import { PackageCheck, AlertCircle } from 'lucide-react';
import { SellerProduct } from '../../../types/seller';

interface SellerProfile {
  shopLogo?: string;
  shopName?: string;
  name?: string;
  displayName?: string;
  status?: string;
}

interface SellerCatalogHeaderProps {
  userProfile: SellerProfile | null;
  products: SellerProduct[];
}

export const SellerCatalogHeader: React.FC<SellerCatalogHeaderProps> = ({
  userProfile,
  products,
}) => {
  const { t } = useTranslation();
  const activeCount = products.filter(p => p.status === 'active' && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E5DED4] p-4 sm:p-5 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Shop Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FDF6EC] border-2 border-[#C75C1A] flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
            {userProfile?.shopLogo ? (
              <img
                src={userProfile.shopLogo}
                alt={userProfile?.shopName || "Boutique"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[#C75C1A] text-xl sm:text-2xl font-black">
                {userProfile?.shopName?.charAt(0) || userProfile?.name?.charAt(0) || "B"}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#2C2118] truncate">
                {userProfile?.shopName || t("Votre Boutique")}
              </h2>
              <span className="shrink-0 px-2 py-0.5 rounded-md bg-[#FFF7ED] text-[#C75C1A] text-[10px] font-bold border border-[#FDBA74]/40">
                {t("Vendeur OLMART")}
              </span>
            </div>
            <p className="text-xs text-[#8B7355] mt-0.5 truncate">
              {products.length} {t("produits au catalogue")}
            </p>
          </div>
        </div>

        {/* Compact Metrics on Mobile & Desktop */}
        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t border-zinc-100 sm:border-t-0">
          <div className="flex-1 sm:flex-initial flex items-center gap-2 px-3 py-2 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <PackageCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-emerald-700 font-semibold block uppercase leading-none">
                {t("Actifs")}
              </span>
              <span className="text-sm font-black text-emerald-800 leading-tight">
                {activeCount}
              </span>
            </div>
          </div>

          <div className="flex-1 sm:flex-initial flex items-center gap-2 px-3 py-2 bg-amber-50/60 rounded-xl border border-amber-100">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-amber-700 font-semibold block uppercase leading-none">
                {t("En rupture")}
              </span>
              <span className="text-sm font-black text-amber-800 leading-tight">
                {outOfStockCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
