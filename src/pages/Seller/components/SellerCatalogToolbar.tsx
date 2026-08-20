import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, UploadCloud, X } from 'lucide-react';
import { SellerProduct } from '../../../types/seller';

interface SellerCatalogToolbarProps {
  isShopValidated: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  products: SellerProduct[];
  onAddClick: () => void;
  onCsvImport: (file: File) => void;
}

export const SellerCatalogToolbar: React.FC<SellerCatalogToolbarProps> = ({
  isShopValidated,
  searchTerm,
  onSearchChange,
  activeFilter,
  onFilterChange,
  products,
  onAddClick,
  onCsvImport,
}) => {
  const { t } = useTranslation();

  const counts = {
    all: products.filter(p => p.status !== 'deleted').length,
    active: products.filter(p => p.status === 'active' && p.stock > 0).length,
    out_of_stock: products.filter(p => p.stock === 0 && p.status !== 'deleted').length,
    draft: products.filter(p => p.status === 'draft').length,
  };

  const filterTabs = [
    { id: 'all', label: t('Tous'), count: counts.all },
    { id: 'active', label: t('Actifs'), count: counts.active },
    { id: 'out_of_stock', label: t('En rupture'), count: counts.out_of_stock },
    { id: 'draft', label: t('Brouillons'), count: counts.draft },
  ];

  return (
    <div className="space-y-4">
      {/* Title & Action Buttons Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950">
              {t("Mon Catalogue")}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-bold">
              {counts.all}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">
            {t("Gérez vos articles en vente sur Olmart.")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* CSV Import Button */}
          <button
            type="button"
            disabled={!isShopValidated}
            onClick={() => {
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.accept = '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel';
              fileInput.onchange = (e: Event) => {
                const target = e.target as HTMLInputElement;
                const file = target.files?.[0];
                if (file) {
                  onCsvImport(file);
                }
              };
              fileInput.click();
            }}
            title={t("Importer via fichier CSV")}
            className={`h-11 px-3 sm:px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${
              isShopValidated
                ? 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 shadow-sm active:scale-95'
                : 'bg-zinc-100 text-zinc-400 cursor-not-allowed opacity-50 border-zinc-200'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-zinc-600" />
            <span className="hidden md:inline">{t("Import CSV")}</span>
          </button>

          {/* Primary Add Product Button */}
          <button
            type="button"
            onClick={onAddClick}
            disabled={!isShopValidated}
            className={`flex-1 sm:flex-initial h-11 px-4 sm:px-6 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
              isShopValidated
                ? 'bg-[#C75C1A] text-white hover:bg-[#B34E13] shadow-[#C75C1A]/20'
                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed opacity-50'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t("Ajouter un produit")}</span>
          </button>
        </div>
      </div>

      {/* Search Input & Horizontal Filter Tabs */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder={t("Rechercher par nom, SKU ou catégorie...")}
            className="w-full ps-10 pe-9 py-2.5 sm:py-3 bg-white border border-zinc-200 rounded-xl text-sm font-medium outline-none focus:border-[#C75C1A] focus:ring-2 focus:ring-[#C75C1A]/10 transition-all shadow-sm text-zinc-900 placeholder:text-zinc-400"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute end-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Scrollable Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onFilterChange(tab.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'bg-white text-zinc-600 border border-zinc-200/80 hover:bg-zinc-50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-zinc-700 text-zinc-100' : 'bg-zinc-100 text-zinc-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
