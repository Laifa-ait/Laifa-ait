import React, { useEffect, useState } from 'react';
import { useFeaturedProducts } from '../../hooks/queries/useProducts';
import { productsApi } from '../../services/api/products.api';
import { Product } from "../../domains/product/product.types";
import { ProductCard } from '../../components/Product/ProductCard';
import { Layout } from '../../components/Layout/Layout';
import { motion } from 'motion/react';
import { ChevronLeft, Filter, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";

export const FeaturedProducts: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const initialLimit = typeof window !== 'undefined' ? (window.innerWidth >= 1024 ? 10 : window.innerWidth >= 768 ? 8 : 6) : 6;
  
  const { data: initialProducts, isLoading, error } = useFeaturedProducts(initialLimit, 0);

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(initialLimit);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts);
      setHasMore(initialProducts.length === initialLimit);
    }
  }, [initialProducts, initialLimit]);

  const fetchMore = async () => {
    setLoadingMore(true);
    try {
      const fetchLimit = 6;
      const newProducts = await productsApi.getFeaturedProducts(fetchLimit, offset);
      setProducts(prev => [...prev, ...newProducts]);
      setOffset(prev => prev + fetchLimit);
      setHasMore(newProducts.length === fetchLimit);
    } catch (err) {
      console.error('Error fetching more featured products:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-transparent pb-20">
        {/* Page Header */}
        <div className="bg-white border-b border-[var(--color-orange-600, #ea580c)]/40 pt-10 pb-6 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-zinc-400 hover:text-[var(--color-slate-900, #0f172a)] transition-colors mb-6 text-sm font-bold uppercase tracking-widest rtl:tracking-normal"
            >
              <ChevronLeft className="w-4 h-4" />
              {t("Retour")}</button>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-[var(--color-orange-600, #ea580c)]" />
                  <span className="text-xs font-sans font-bold text-[var(--color-orange-600, #ea580c)] uppercase tracking-[0.3em]">{t("Édition Limitée")}</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-sans font-bold text-[var(--color-slate-900, #0f172a)] uppercase tracking-tighter rtl:tracking-normal leading-none">
                  {t("Nos Incontournables")}</h1>
                <p className="text-zinc-500 mt-2 font-medium">{t("Les produits les plus plébiscités par notre communauté.")}</p>
              </div>
              <div className="flex items-center gap-2 bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-100">
                <Filter className="w-4 h-4 text-[var(--color-slate-900, #0f172a)]" />
                <span className="text-xs font-sans font-bold text-[var(--color-slate-900, #0f172a)] uppercase tracking-widest rtl:tracking-normal">{t("Trier par Popularité")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-10">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pb-20">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-[3/4] bg-zinc-200 rounded-[2rem] animate-pulse border border-white/20 shadow-sm" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-red-500 font-bold">
              <p>{t("Erreur de chargement des produits.")}</p>
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-12 pb-20">
              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {products.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center pt-8">
                  <button
                    onClick={fetchMore}
                    disabled={loadingMore}
                    className="flex items-center gap-3 px-10 py-4 bg-[var(--color-slate-900, #0f172a)] text-white rounded-full text-xs font-sans font-bold uppercase tracking-[0.2em] shadow-2xl shadow-[var(--color-slate-900, #0f172a)]/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loadingMore ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>{t("Charger plus de pépites")}</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <Sparkles className="w-10 h-10 text-zinc-200" />
              </div>
              <h3 className="text-xl font-sans font-bold text-[var(--color-slate-900, #0f172a)] uppercase">{t("Aucun incontournable ?")}</h3>
              <p className="text-zinc-500 max-w-xs mt-2">{t("Revenez plus tard, nos vendeurs préparent de nouvelles offres.")}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
