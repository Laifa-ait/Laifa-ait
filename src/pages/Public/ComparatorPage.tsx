import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useComparatorStore } from '../../store/useComparatorStore';
import { Scale, ArrowLeft, Plus, Sparkles, Trophy, CheckCircle, ShieldCheck } from 'lucide-react';
import { PremiumLayout } from '../../components/Layout/PremiumLayout';
import { ComparatorHeader } from '../../components/Comparator/ComparatorHeader';
import { ComparatorTable } from '../../components/Comparator/ComparatorTable';
import { ComparatorAddModal } from '../../components/Comparator/ComparatorAddModal';
import { Product } from '../../domains/product/product.types';
import { formatPrice } from '../../utils/format';
import { demoProducts } from '../../data/demoProducts';

export const ComparatorPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    products,
    removeProduct,
    clear,
    pinnedProductId,
    setPinnedProduct,
    showOnlyDifferences,
    setShowOnlyDifferences,
    addProduct,
  } = useComparatorStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [specFilter, setSpecFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes');
  const [viewMode, setViewMode] = useState<'matrix' | 'cards'>('matrix');

  const categories = ['Toutes', 'Général', 'Technique', 'Logistique', 'Avis'];

  const handleSelectProductFromModal = (product: Product) => {
    addProduct(product);
  };

  // Pre-load demo products for quick testing if empty
  const handleLoadDemo = () => {
    demoProducts.forEach(p => addProduct(p));
  };

  // Find winner recommendation
  let bestProduct: Product | null = null;
  if (products.length >= 2) {
    const minPrice = Math.min(...products.map(p => p.price));
    const maxPrice = Math.max(...products.map(p => p.price));
    bestProduct = [...products].sort((a, b) => {
      const rA = a.stats?.averageRating || a.rating || 0;
      const rB = b.stats?.averageRating || b.rating || 0;
      const scoreA = rA * 20 - (a.price / (maxPrice || 1)) * 30 + (a.freeShipping ? 10 : 0);
      const scoreB = rB * 20 - (b.price / (maxPrice || 1)) * 30 + (b.freeShipping ? 10 : 0);
      return scoreB - scoreA;
    })[0];
  }

  if (products.length === 0) {
    return (
      <PremiumLayout>
        <div className="pt-20 pb-32 max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-10 sm:p-16 shadow-xl flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 shadow-inner border border-amber-200/60">
              <Scale className="w-10 h-10" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              {t("Votre comparateur est vide") || "Votre comparateur est vide"}
            </h2>

            <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
              {t("Sélectionnez jusqu'à 4 produits dans la boutique pour comparer leurs caractéristiques techniques, prix et garanties côte à côte.") ||
                "Sélectionnez jusqu'à 4 produits dans la boutique pour comparer leurs caractéristiques techniques, prix et garanties côte à côte."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-md transition-all hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>{t("Ajouter des produits") || "Ajouter des produits"}</span>
              </button>

              <button
                onClick={handleLoadDemo}
                className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-sm px-6 py-3.5 rounded-2xl transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{t("Charger un exemple d'essai") || "Charger un exemple d'essai"}</span>
              </button>

              <button
                onClick={() => navigate('/shop')}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm px-6 py-3.5 rounded-2xl transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t("Parcourir le catalogue") || "Parcourir le catalogue"}</span>
              </button>
            </div>
          </div>
        </div>

        <ComparatorAddModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSelectProduct={handleSelectProductFromModal}
          alreadySelectedIds={products.map((p) => p.id)}
        />
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout>
      <div className="pt-20 lg:pt-24 pb-32 max-w-[1440px] mx-auto px-1.5 sm:px-6">
        {/* Breadcrumb / Back button */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/shop')}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("Retour à la boutique") || "Retour à la boutique"}</span>
          </button>
        </div>

        {/* Winner AI Recommendation Banner */}
        {bestProduct && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-3xl p-5 sm:p-6 text-white mb-6 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="relative z-10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
                <Trophy className="w-6 h-6 text-amber-100" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-white/20 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/30">
                    Recommandation Olmart
                  </span>
                </div>
                <h3 className="font-extrabold text-lg sm:text-xl text-white">
                  {bestProduct.name}
                </h3>
                <p className="text-amber-100 text-xs sm:text-sm mt-1 max-w-2xl">
                  {t("Meilleure combinaison rapport qualité-prix : ") || "Meilleure combinaison rapport qualité-prix : "}
                  <strong>{bestProduct.rating ? `noté ${bestProduct.rating.toFixed(1)}/5` : "nouveau produit (aucun avis)"}</strong>
                  {t(" au tarif de ") || " au tarif de "}
                  <strong>{formatPrice(bestProduct.price)}</strong>
                  {bestProduct.freeShipping ? " avec livraison gratuite offerte dans les 58 wilayas." : "."}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/product/${bestProduct.id}`)}
              className="relative z-10 bg-white hover:bg-slate-50 text-amber-900 font-black text-xs px-5 py-3 rounded-2xl transition-all shadow-md shrink-0 flex items-center gap-2"
            >
              <span>{t("Voir l'offre gagnante") || "Voir l'offre gagnante"}</span>
              <CheckCircle className="w-4 h-4 text-amber-600" />
            </button>
          </div>
        )}

        {/* Toolbar Header */}
        <ComparatorHeader
          productCount={products.length}
          showOnlyDifferences={showOnlyDifferences}
          onToggleDifferences={() => setShowOnlyDifferences(!showOnlyDifferences)}
          specFilter={specFilter}
          onSpecFilterChange={setSpecFilter}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onClear={clear}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Matrix Comparison Table */}
        <ComparatorTable
          products={products}
          pinnedProductId={pinnedProductId}
          onSetPinnedProduct={setPinnedProduct}
          onRemoveProduct={removeProduct}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          showOnlyDifferences={showOnlyDifferences}
          specFilter={specFilter}
          selectedCategory={selectedCategory}
          viewMode={viewMode}
        />
      </div>

      {/* Quick Add Product Modal */}
      <ComparatorAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSelectProduct={handleSelectProductFromModal}
        alreadySelectedIds={products.map((p) => p.id)}
      />
    </PremiumLayout>
  );
};
