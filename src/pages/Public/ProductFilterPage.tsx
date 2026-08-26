import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Tag } from 'lucide-react';
import { ProductCard } from '../../components/Product/ProductCard';
import { Product } from "../../domains/product/product.types";
import { useTranslation } from 'react-i18next';
import { UniversalFilterBar } from '../../components/Shop/UniversalFilterBar';

export const ProductFilterPage: React.FC = () => {
  const { tagSlug } = useParams<{ tagSlug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [products, setProducts] = useState<Product[]>([]);
  const [tagName, setTagName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState(12);

  const finalFilteredProducts = useMemo(() => {
    let list = [...products];
    if (activeQuickFilter === 'promo') {
      list = list.filter(p => (p.promoPrice && p.promoPrice > 0) || (p.originalPrice && p.originalPrice > p.price));
    } else if (activeQuickFilter === 'free_shipping') {
      list = list.filter(p => p.freeShipping === true || p.tags?.some((t: string) => t.toLowerCase().includes('gratuit')) || p.description?.toLowerCase().includes('gratuit'));
    } else if (activeQuickFilter === 'rating') {
      list = list.filter(p => p.rating && p.rating >= 4.5);
    } else if (activeQuickFilter === 'price_down') {
      list.sort((a, b) => a.price - b.price);
    }
    return list;
  }, [products, activeQuickFilter]);

  useEffect(() => {
    setDisplayLimit(12);
    const fetchTaggedProducts = async () => {
      if (!tagSlug) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/v1/products-by-tag?tag=${tagSlug.toLowerCase()}`);
        const data = await res.json();
        if (res.ok) {
          const loadedProducts = data.products || [];
          setProducts(loadedProducts);
          if (data.tag) {
            setTagName(data.tag.name);
          } else {
            setTagName(tagSlug);
          }
          
          // Fallback if empty and in development/preview
          if (loadedProducts.length === 0) {
            // Intentionally removed mock fallback here as requested by user.
          }
        } else {
          console.error(data.error);
        }
      } catch (err) {
        console.error("Erreur d'import des produits du tag", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaggedProducts();
  }, [tagSlug]);

  return (
    <div className="bg-transparent min-h-screen pb-20">
      
      {/* Decorative Header Banner Section: White-Lit Architecture (Premium Minimalist) */}
      <div className="relative border-b border-[var(--color-orange-600, #ea580c)]/40 bg-transparent text-[var(--color-slate-900, #0f172a)] py-16 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--color-orange-600, #ea580c)]/5 rounded-full blur-[100px] -mr-48 -mt-48 opacity-30" />
        
        <div className="max-w-[1850px] mx-auto relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest rtl:tracking-normal text-[var(--color-slate-900, #0f172a)]/60 hover:text-[var(--color-orange-600, #ea580c)] transition-colors mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("Retour")}</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-slate-900, #0f172a)]/5 border border-[var(--color-slate-900, #0f172a)]/10 text-[9px] uppercase font-sans font-bold tracking-widest rtl:tracking-normal text-[var(--color-orange-600, #ea580c)]">
                <Tag className="w-3.5 h-3.5 fill-current" />
                {t("Collection Sélectionnée")}</span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-sans font-bold tracking-tight rtl:tracking-normal uppercase text-[var(--color-slate-900, #0f172a)]">
                {isLoading ? 'Chargement...' : tagName}
              </h1>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest rtl:tracking-normal">
                {products.length === 1 ? '1 produit d\'exception répertorié' : `${products.length} produits d'exception répertoriés`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <UniversalFilterBar activeFilter={activeQuickFilter} onSelectFilter={setActiveQuickFilter} />

      {/* Main product listings grid results */}
      <div className="max-w-[1850px] mx-auto px-6 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-24 space-y-4">
            <div className="w-10 h-10 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin" />
            <span className="text-xs font-sans font-bold text-zinc-500 uppercase tracking-widest rtl:tracking-normal">{t("Hydratation des produits sous le tag...")}</span>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-[2rem] border border-zinc-100 shadow-sm space-y-4 max-w-lg mx-auto">
            <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
            <h3 className="text-base font-sans font-bold text-zinc-700 uppercase">{t("Aucun produit pour l'instant")}</h3>
            <p className="text-zinc-500 text-xs leading-relaxed">
              {t("Il n'y a pas encore de produits associés à ce tag spécifique. Revenez bientôt ou continuez à explorer nos autres offres !")}</p>
            <button
              onClick={() => navigate('/shop')}
              className="mt-4 px-6 py-3 bg-zinc-950 text-white rounded-xl font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal hover:bg-orange-600 hover:text-white transition-colors cursor-pointer shadow-md select-none"
            >
              {t("Explorer la boutique")}</button>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {finalFilteredProducts.slice(0, displayLimit).map((p, index) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={index}
                  onClick={(prod) => navigate(`/product/${prod.id}`)}
                />
              ))}
            </div>

            {finalFilteredProducts.length > displayLimit && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setDisplayLimit(prev => prev + 12)}
                  className="px-8 py-3.5 bg-zinc-950 text-white hover:bg-orange-600 rounded-xl font-sans font-bold text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center gap-3 cursor-pointer"
                >
                  {t("Voir plus de produits") || "Afficher plus"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
