import React from "react";
import { Package } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SellerCatalogEmptyStateProps {
  searchTerm: string;
  isShopValidated: boolean;
  onAddClick: () => void;
}

export const SellerCatalogEmptyState: React.FC<SellerCatalogEmptyStateProps> = ({
  searchTerm,
  isShopValidated,
  onAddClick,
}) => {
  const { t } = useTranslation();

  return (
    <div className="text-center py-12 px-4" id="seller-catalog-empty-state">
      <div className="w-16 h-16 bg-[#FDF6EC] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#FDBA74]/30">
        <Package className="w-8 h-8 text-[#C75C1A]" />
      </div>
      <h3 className="text-base font-bold text-zinc-900 mb-1">
        {searchTerm ? t("Aucun produit ne correspond à votre recherche") : t("Votre catalogue est vide")}
      </h3>
      <p className="text-xs text-zinc-500 max-w-xs mx-auto mb-4">
        {searchTerm
          ? t("Essayez un autre mot-clé ou filtre.")
          : t("Commencez à ajouter vos articles pour vendre sur Olmart.")}
      </p>
      {!searchTerm && isShopValidated && (
        <button
          type="button"
          id="seller-add-first-product-btn"
          onClick={onAddClick}
          className="bg-[#C75C1A] text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-[#B34E13] transition-all shadow-md shadow-[#C75C1A]/20 cursor-pointer border-none"
        >
          {t("Ajouter un premier produit")}
        </button>
      )}
    </div>
  );
};
