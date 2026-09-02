import React, { useState, useEffect } from 'react';
import { Search, X, Plus, Check, Package, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Product } from '../../domains/product/product.types';
import { productsApi } from '../../services/api/products.api';
import { formatPrice } from '../../utils/format';

interface ComparatorAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  alreadySelectedIds: string[];
}

export const ComparatorAddModal: React.FC<ComparatorAddModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  alreadySelectedIds,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    productsApi.getProducts({ limit: 40 })
      .then((data) => {
        if (isMounted) {
          setProducts(data || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load catalog for comparison modal", err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredProducts = products.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/60 to-orange-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">{t("Ajouter un produit à la comparaison") || "Ajouter un produit à la comparaison"}</h3>
              <p className="text-xs text-slate-500">{t("Sélectionnez un produit du catalogue") || "Sélectionnez un produit du catalogue"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:border-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Rechercher par nom, marque, catégorie...") || "Rechercher par nom, marque, catégorie..."}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Products List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-7 h-7 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium">{t("Chargement du catalogue...") || "Chargement du catalogue..."}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-center">
              <Package className="w-12 h-12 text-slate-200 mb-2" />
              <p className="text-sm font-semibold text-slate-700">{t("Aucun produit trouvé") || "Aucun produit trouvé"}</p>
              <p className="text-xs text-slate-400 mt-1">{t("Essayez une autre recherche") || "Essayez une autre recherche"}</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const isAdded = alreadySelectedIds.includes(product.id);
              return (
                <div
                  key={product.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isAdded
                      ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed"
                      : "bg-white border-slate-100 hover:border-amber-400 hover:shadow-md cursor-pointer"
                  }`}
                  onClick={() => {
                    if (!isAdded) {
                      onSelectProduct(product);
                      onClose();
                    }
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img loading="lazy" decoding="async" src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-xl border border-slate-100 bg-slate-50 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs sm:text-sm text-slate-900 truncate">{product.name}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{product.brand || "Marque Standard"}</span>
                        <span>•</span>
                        <span className="text-amber-600 font-bold">{formatPrice(product.price)}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={isAdded}
                    className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isAdded
                        ? "bg-slate-200 text-slate-500"
                        : "bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{t("Ajouté") || "Ajouté"}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t("Choisir") || "Choisir"}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
