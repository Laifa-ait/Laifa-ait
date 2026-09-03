import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Scale, Trash2, Plus, ArrowRight, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useComparatorStore } from '../../store/useComparatorStore';
import { formatPrice } from '../../utils/format';

export const ComparatorDrawer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { products, removeProduct, clear } = useComparatorStore();
  const [isMinimized, setIsMinimized] = useState(false);

  if (products.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="fixed bottom-[4.75rem] md:bottom-5 inset-x-2 sm:inset-x-4 max-w-4xl mx-auto z-[95] pointer-events-auto"
      >
        <div className="bg-white/95 backdrop-blur-xl border border-amber-200/90 text-zinc-900 shadow-[0_16px_40px_rgba(217,119,6,0.12)] rounded-2xl p-2.5 sm:p-3.5 transition-all">
          {/* Header Bar when Collapsed or Expanded Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-amber-600" />
                {t("Comparateur Pro") || "Comparateur Pro"}
              </span>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200">
                {products.length} / 4
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-900 transition-colors"
                title={isMinimized ? "Agrandir" : "Réduire"}
              >
                {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={clear}
                className="p-1 hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded-lg transition-colors ms-1"
                title={t("Vider la liste") || "Vider la liste"}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-0.5">
              {/* Product Thumbnails Horizontal Scroll List without scrollbars */}
              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pt-2.5 pb-1 px-1">
                <AnimatePresence mode="popLayout">
                  {products.map((p) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.85, opacity: 0 }}
                      onClick={() => navigate(`/product/${p.id}`)}
                      className="group relative flex items-center gap-2 bg-zinc-50 border border-zinc-200/80 p-1.5 pe-3 rounded-2xl shrink-0 hover:border-amber-400 hover:bg-amber-50/40 transition-all cursor-pointer"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeProduct(p.id);
                        }}
                        className="absolute -top-2 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md transition-transform hover:scale-110 z-10"
                        title="Supprimer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-white border border-zinc-200/60 shrink-0 p-0.5">
                        <img loading="lazy" decoding="async" src={p.image} alt={p.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0 max-w-[85px] sm:max-w-[110px]">
                        <p className="text-[11px] font-semibold text-zinc-900 truncate">{p.name}</p>
                        <p className="text-[10px] font-extrabold text-amber-700">{formatPrice(p.price)}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {products.length < 4 && (
                  <button
                    onClick={() => navigate('/shop')}
                    className="flex items-center gap-1.5 h-12 px-3 border border-dashed border-zinc-300 hover:border-amber-500 hover:bg-amber-50/50 rounded-2xl text-zinc-400 hover:text-amber-700 text-xs font-medium transition-all shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t("Ajouter") || "Ajouter"}</span>
                  </button>
                )}
              </div>

              {/* Primary Action Button */}
              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                <button
                  onClick={() => navigate('/compare')}
                  disabled={products.length < 2}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-5 py-2.5 rounded-2xl font-black text-xs shadow-md shadow-amber-600/20 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t("Lancer la Comparaison") || "Lancer la Comparaison"} ({products.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

