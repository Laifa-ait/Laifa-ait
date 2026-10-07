import React from "react";
import { X, SlidersHorizontal, RotateCcw, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { ALGERIA_WILAYAS } from "../../constants";

interface CollectionFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWilaya: string;
  onChangeWilaya: (wilaya: string) => void;
  minPrice: string;
  maxPrice: string;
  onChangeMinPrice: (val: string) => void;
  onChangeMaxPrice: (val: string) => void;
  activeQuickFilter: string | null;
  onSelectQuickFilter: (id: string | null) => void;
  onResetAll: () => void;
}

export const CollectionFilterDrawer: React.FC<CollectionFilterDrawerProps> = ({
  isOpen,
  onClose,
  selectedWilaya,
  onChangeWilaya,
  minPrice,
  maxPrice,
  onChangeMinPrice,
  onChangeMaxPrice,
  activeQuickFilter,
  onSelectQuickFilter,
  onResetAll,
}) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[200] cursor-pointer"
          />

          {/* Slide-over Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-zinc-200 shadow-2xl z-[201] flex flex-col text-zinc-900"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
                <h2 className="font-serif italic text-lg text-zinc-950 font-normal">
                  {t("filter_advanced_title", "Filtres de recherche")}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t("common_close", "Fermer")}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-200/60 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Filters Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Wilaya Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider uppercase text-slate-800 flex items-center justify-between">
                  <span>{t("wilaya_delivery_label", "Wilaya de livraison")}</span>
                  <span className="text-[10px] text-emerald-700 font-extrabold">58 Wilayas</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedWilaya}
                    onChange={(e) => onChangeWilaya(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 focus:outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="all">{t("all_wilayas_option", "Toutes les 58 Wilayas d'Algérie")}</option>
                    {ALGERIA_WILAYAS.map((w) => (
                      <option key={w.code} value={w.name}>
                        {w.code} - {w.name} {w.name_ar ? `(${w.name_ar})` : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold tracking-wider uppercase text-slate-800">
                  {t("price_range_label", "Budget & Prix (Dinar Algérien DA)")}
                </label>
                
                {/* Quick Budget Chips */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {[
                    { label: "< 5 000 DA", min: "", max: "5000" },
                    { label: "5 000 - 20 000 DA", min: "5000", max: "20000" },
                    { label: "20 000 - 50 000 DA", min: "20000", max: "50000" },
                    { label: "> 50 000 DA", min: "50000", max: "" },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onChangeMinPrice(preset.min);
                        onChangeMaxPrice(preset.max);
                      }}
                      className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors cursor-pointer border border-slate-200/60 text-center"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      {t("min_label", "Prix Min (DA)")}
                    </span>
                    <input
                      type="number"
                      placeholder="0 DA"
                      value={minPrice}
                      onChange={(e) => onChangeMinPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      {t("max_label", "Prix Max (DA)")}
                    </span>
                    <input
                      type="number"
                      placeholder="Illimité"
                      value={maxPrice}
                      onChange={(e) => onChangeMaxPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Specific Express Options */}
              <div className="space-y-2.5 pt-2">
                <label className="text-xs font-bold tracking-wider uppercase text-slate-800">
                  {t("criteria_label", "Avantages & Critères")}
                </label>
                <div className="space-y-2">
                  {[
                    { id: "free-shipping", name: "🚚 Livraison Gratuite", desc: "Expédition offerte sans frais de port" },
                    { id: "on-sale", name: "🏷️ Remises & Promos Choc", desc: "Articles avec prix barrés et réductions" },
                    { id: "trending", name: "⭐ Les Mieux Notés (★ 4.5+)", desc: "Plébiscités par la communauté algérienne" },
                  ].map((opt) => {
                    const isChecked = activeQuickFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onSelectQuickFilter(isChecked ? null : opt.id)}
                        className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isChecked
                            ? "bg-rose-50/80 border-rose-500 text-slate-950 shadow-xs"
                            : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <div
                          className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                            isChecked ? "bg-rose-600 border-rose-600 text-white" : "border-slate-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold">{opt.name}</div>
                          <div className="text-[11px] text-slate-500 font-medium">{opt.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 grid grid-cols-2 gap-3 shrink-0">
              <button
                type="button"
                onClick={onResetAll}
                className="px-4 py-3 rounded-2xl border border-slate-300 hover:bg-slate-200/80 text-xs font-bold uppercase tracking-wider text-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t("common_reset", "Réinitialiser")}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-700 hover:to-amber-600 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md active:scale-95"
              >
                <span>{t("common_apply", "Appliquer")}</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
