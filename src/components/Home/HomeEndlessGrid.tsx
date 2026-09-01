import React, { useState, useEffect } from "react";
import { Product } from "../../domains/product/product.types";
import { ProductCard } from "../Product/ProductCard";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";

export const HomeEndlessGrid: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const INITIAL_FETCH_LIMIT = 20;
  const LOAD_MORE_LIMIT = 8;

  useEffect(() => {
    let cancelled = false;
    const fetchInitial = async () => {
      try {
        let docs: Product[] = [];
        // Attempt 1: dedicated endless grid endpoint
        const res = await fetch(`/api/v1/public/home-endless-grid?limit=${INITIAL_FETCH_LIMIT}`);
        if (res.ok) {
          const data = await res.json();
          docs = data.products || [];
        }
        
        // Attempt 2: fallback to general products API if endpoint returned empty
        if (docs.length === 0) {
          const fallbackRes = await fetch(`/api/v1/products?limit=${INITIAL_FETCH_LIMIT}`);
          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            docs = fallbackData.products || [];
          }
        }

        // Attempt 3: fallback to home-data if still empty
        if (docs.length === 0) {
          const homeDataRes = await fetch(`/api/v1/public/home-data`);
          if (homeDataRes.ok) {
            const homeData = await homeDataRes.json();
            docs = homeData.featuredProducts || [];
          }
        }
        
        if (!cancelled) {
          const validDocs = docs.filter((d) => d.stock === undefined || d.stock > 0);
          setProducts(validDocs);
          setHasMore(docs.length >= INITIAL_FETCH_LIMIT);
        }
      } catch (err) {
        console.error("Error fetching endless grid:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchInitial();
    return () => { cancelled = true; };
  }, []);

  const loadMoreProducts = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/v1/public/home-endless-grid?limit=${LOAD_MORE_LIMIT}&offset=${products.length}`);
      let newDocs: Product[] = [];
      if (res.ok) {
        const data = await res.json();
        newDocs = data.products || [];
      } else {
        const fallbackRes = await fetch(`/api/v1/products?limit=${LOAD_MORE_LIMIT}&offset=${products.length}`);
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          newDocs = data.products || [];
        }
      }

      const validNewDocs = newDocs.filter((d) => d.stock === undefined || d.stock > 0);
      
      setProducts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const filteredNew = validNewDocs.filter((p) => !existingIds.has(p.id));
        return [...prev, ...filteredNew];
      });
      
      setHasMore(newDocs.length >= LOAD_MORE_LIMIT);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 pb-16">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col items-center justify-center text-center mb-8">
            <div className="w-32 h-6 bg-slate-200 animate-pulse rounded-full mb-4" />
            <div className="w-64 h-8 bg-slate-200 animate-pulse rounded-lg mb-2" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-4 md:gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl sm:rounded-2xl bg-slate-100/80 animate-pulse border border-slate-200/60" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="mb-6 sm:mb-8 relative z-20">
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-5 sm:p-6 lg:p-8 relative">

      <div className="flex flex-col items-center justify-center text-center mb-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] mb-5 border border-slate-200">
          <Sparkles className="w-3.5 h-3.5" />
          {t("home.endless_grid.badge") || "COLLECTION INFINIE"}
        </div>
        <h3 className="font-sans text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
          {t("home.endless_grid.title") || "Galerie d'Inspirations"}
        </h3>
        <p className="font-sans text-sm md:text-base text-slate-500 max-w-2xl leading-relaxed mt-4">
          {t("home.endless_grid.desc") || "Explorez notre collection complète. De nouvelles merveilles s'ajoutent continuellement."}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-4 md:gap-5">
        {products.map((product, i) => (
          <div key={product.id}>
            <ProductCard product={product} index={i} />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-12">
          <button
            onClick={loadMoreProducts}
            disabled={loadingMore}
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium tracking-wide uppercase rounded-full transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {loadingMore ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              </div>
            ) : (
              <span>{t("home.endless_grid.load_more") || "Afficher plus"}</span>
            )}
          </button>
        </div>
      )}
      </div>
      </div>
    </section>
  );
};
