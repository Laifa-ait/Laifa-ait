import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTagProducts } from '../../hooks/queries/useProducts';
import { ProductCard } from '../../components/Product/ProductCard';
import { ArrowLeft, Loader2, Tag } from 'lucide-react';
import { useTranslation } from "react-i18next";

export const TagCollectionPage: React.FC = () => {
  const { t } = useTranslation();
  const { tagId } = useParams();
  const navigate = useNavigate();

  const [displayLimit, setDisplayLimit] = useState(10);
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1024) setDisplayLimit(10);
      else if (window.innerWidth >= 768) setDisplayLimit(8);
      else setDisplayLimit(6);
    }
  }, []);

  const { data: productsData, error, isLoading } = useTagProducts(tagId || '');

  const products = productsData || [];
  const visibleProducts = products.slice(0, displayLimit);
  const hasMore = displayLimit < products.length;

  return (
    <div className="pt-24 pb-20 max-w-[1850px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1">
          <button 
            onClick={() => navigate(-1)} 
            className="text-[var(--color-slate-900, #0f172a)]/60 hover:text-[var(--color-slate-900, #0f172a)] flex items-center gap-2 text-sm font-bold mb-6 transition-colors w-fit cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("Retour")}</button>

          <h1 className="text-3xl md:text-5xl font-sans font-bold tracking-tighter rtl:tracking-normal text-[var(--color-slate-900, #0f172a)] flex items-center gap-3">
            <Tag className="w-8 h-8 md:w-10 md:h-10 text-[var(--color-orange-600, #ea580c)]" />
            {t("Collection:")}<span className="text-[var(--color-orange-600, #ea580c)] capitalize">{tagId}</span>
          </h1>
          <p className="mt-3 text-[var(--color-slate-900, #0f172a)]/70 font-semibold max-w-2xl">
            {t("Découvrez tous les produits associés à cette sélection spéciale.")}</p>
        </div>
        
        {!isLoading && !error && (
          <div className="bg-transparent text-[var(--color-slate-900, #0f172a)] px-4 py-2 rounded-xl text-xs uppercase tracking-widest rtl:tracking-normal font-sans font-bold inline-flex items-center shadow-sm w-fit">
            {products.length} {products.length > 1 ? 'Articles' : 'Article'}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <Loader2 className="w-10 h-10 text-[var(--color-orange-600, #ea580c)] animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-100">
          <h2 className="text-lg font-bold text-red-600 mb-2">{t("Erreur de chargement")}</h2>
          <p className="text-red-500/80 font-medium">{String(error)}</p>
        </div>
      ) : visibleProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center mt-12 mb-8 relative z-20">
              <button
                onClick={() => setDisplayLimit(prev => prev + 10)}
                className="px-8 py-3.5 bg-red-600 text-white hover:bg-red-700 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center gap-3 cursor-pointer"
              >
                {t("Afficher plus")}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-zinc-100">
          <p className="text-zinc-400 font-medium">{t("Aucun produit disponible pour cette collection pour le moment.")}</p>
        </div>
      )}
    </div>
  );
};
