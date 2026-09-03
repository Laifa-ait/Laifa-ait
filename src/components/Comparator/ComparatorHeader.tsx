import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Filter, 
  Search, 
  Share2, 
  Printer, 
  Trash2, 
  Check, 
  Plus, 
  SlidersHorizontal,
  Table,
  LayoutGrid
} from 'lucide-react';

interface ComparatorHeaderProps {
  productCount: number;
  showOnlyDifferences: boolean;
  onToggleDifferences: () => void;
  specFilter: string;
  onSpecFilterChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  categories: string[];
  onOpenAddModal: () => void;
  onClear: () => void;
  viewMode: 'matrix' | 'cards';
  onViewModeChange: (mode: 'matrix' | 'cards') => void;
}

export const ComparatorHeader: React.FC<ComparatorHeaderProps> = ({
  productCount,
  showOnlyDifferences,
  onToggleDifferences,
  specFilter,
  onSpecFilterChange,
  selectedCategory,
  onCategoryChange,
  categories,
  onOpenAddModal,
  onClear,
  viewMode,
  onViewModeChange,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm mb-6 space-y-4">
      {/* Top Title & Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              {t("Matrice de Comparaison Pro") || "Matrice de Comparaison Pro"}
            </h1>
            <span className="bg-amber-100 text-amber-900 font-bold text-xs px-3 py-1 rounded-full border border-amber-200">
              {productCount} / 4 {t("produits") || "produits"}
            </span>
          </div>
          <p className="text-zinc-500 text-xs sm:text-sm mt-1">
            {t("Analysez côte à côte les performances, tarifs et garanties sans aucune concession.") ||
              "Analysez côte à côte les performances, tarifs et garanties sans aucune concession."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher */}
          <div className="bg-zinc-100 p-1 rounded-2xl flex items-center me-2">
            <button
              onClick={() => onViewModeChange('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'matrix'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Vue Tableau Matrice"
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("Tableau") || "Tableau"}</span>
            </button>
            <button
              onClick={() => onViewModeChange('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Vue Cartes Côtes-à-Côte"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("Cartes") || "Cartes"}</span>
            </button>
          </div>

          {productCount < 4 && (
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t("Ajouter un produit") || "Ajouter un produit"}</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 text-xs font-semibold px-3.5 py-2.5 rounded-2xl transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? (t("Lien copié !") || "Lien copié !") : (t("Partager") || "Partager")}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 text-xs font-semibold px-3.5 py-2.5 rounded-2xl transition-all hidden lg:flex"
          >
            <Printer className="w-4 h-4" />
            <span>{t("Imprimer") || "Imprimer"}</span>
          </button>

          <button
            onClick={onClear}
            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold px-3 py-2.5 rounded-2xl transition-all ms-auto md:ms-0"
            title={t("Vider la comparaison") || "Vider la comparaison"}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Control Bar: Filters & Toggles */}
      <div className="pt-3 border-t border-zinc-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider me-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {t("Filtres") || "Filtres"}:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input & Diffs Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={specFilter}
              onChange={(e) => onSpecFilterChange(e.target.value)}
              placeholder={t("Filtrer une caractéristique...") || "Filtrer une caractéristique..."}
              className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl pl-9 pr-3 py-1.5 text-xs text-zinc-800 placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>

          <button
            onClick={onToggleDifferences}
            className={`flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-2xl text-xs font-bold border transition-all ${
              showOnlyDifferences
                ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{t("Uniquement les différences") || "Uniquement les différences"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
