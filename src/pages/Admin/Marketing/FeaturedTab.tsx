import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { Star, LayoutGrid, AlertCircle, Clock, Check } from "lucide-react";

export interface ProposedTranslation {
  ar: string;
  en: string;
  isNew: boolean;
}

export interface FeaturedTabProps {
  showTranslateModal: boolean;
  setShowTranslateModal: (show: boolean) => void;
  translateTerms: string[];
  proposedTranslations: Record<string, ProposedTranslation>;
  setProposedTranslations?: React.Dispatch<React.SetStateAction<Record<string, ProposedTranslation>>>;
  handleEditTranslation: (term: string, lang: "ar" | "en", value: string) => void;
  loadingTranslations: boolean;
  translationError: string | null;
  savingTranslations: boolean;
  handleApplyTranslations: () => void;
}

export const FeaturedTab: React.FC<FeaturedTabProps> = ({
  showTranslateModal,
  setShowTranslateModal,
  translateTerms,
  proposedTranslations,
  handleEditTranslation,
  loadingTranslations,
  translationError,
  savingTranslations,
  handleApplyTranslations,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        key="featured"
        className="bg-white rounded-[3.5rem] border border-zinc-100 shadow-sm p-12"
      >
        <h4 className="text-xl font-sans font-bold flex items-center gap-4 mb-10">
          <Star className="w-7 h-7 text-orange-500 fill-orange-500" />
          {t("Produits mis en avant")}
        </h4>
        <div className="p-20 border-2 border-dashed border-zinc-100 rounded-[3rem] text-center">
          <LayoutGrid className="w-16 h-16 text-zinc-100 mx-auto mb-6" />
          <p className="text-zinc-400 font-bold uppercase tracking-widest rtl:tracking-normal text-xs">
            {t('Utilisez le module Modération pour flagger un produit comme "Featured".')}
          </p>
        </div>
      </motion.div>

      {/* AI Translation Preview & Edit Modal */}
      <AnimatePresence>
        {showTranslateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowTranslateModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl border border-zinc-100 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-zinc-100 bg-zinc-50/50">
                <h3 className="text-2xl font-sans font-bold text-zinc-950 flex items-center gap-3">
                  <Star className="w-6 h-6 text-indigo-500 fill-indigo-500" />
                  {t("Traductions suggérées par l'IA")}
                </h3>
              </div>
              <div className="p-8 overflow-y-auto flex-1 space-y-6">
                {loadingTranslations ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mb-6" />
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs font-mono">
                      {t("Génération des traductions en cours...")}
                    </p>
                  </div>
                ) : translationError ? (
                  <div className="p-8 bg-red-50 text-red-600 rounded-3xl border border-red-100 flex items-center gap-4">
                    <AlertCircle className="w-8 h-8 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm">{t("Erreur de traduction")}</h4>
                      <p className="text-xs mt-1">{translationError}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4 pb-4 border-b border-zinc-100 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      <div>{t("Terme Source (FR)")}</div>
                      <div>{t("Arabe (AR)")}</div>
                      <div>{t("Anglais (EN)")}</div>
                    </div>
                    <div className="space-y-2">
                      {translateTerms.map((term: string) => {
                        const translation = proposedTranslations[term] || { ar: "", en: "", isNew: true };
                        return (
                          <div key={term} className="grid grid-cols-3 gap-4 pt-3 items-center group">
                            <div className="text-xs font-bold text-zinc-800 uppercase tracking-wide flex items-center gap-2">
                              <span>{term}</span>
                              {translation.isNew && (
                                <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 text-[8px] px-1.5 py-0.5 rounded-full font-black font-mono">
                                  NEW
                                </span>
                              )}
                            </div>
                            <div>
                              <input
                                type="text"
                                value={translation.ar}
                                onChange={(e) => handleEditTranslation(term, "ar", e.target.value)}
                                className="w-full bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white border border-zinc-200 focus:border-indigo-500 px-3 py-2 rounded-xl text-xs font-semibold text-right text-zinc-800 outline-none"
                                dir="rtl"
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                value={translation.en}
                                onChange={(e) => handleEditTranslation(term, "en", e.target.value)}
                                className="w-full bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white border border-zinc-200 focus:border-indigo-500 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-800 outline-none"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              {!loadingTranslations && !translationError && (
                <div className="p-8 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                  <span className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest font-mono">
                    {t("{{count}} termes configurés", { count: translateTerms.length })}
                  </span>
                  <div className="flex items-center gap-4">
                    <button
                      disabled={savingTranslations}
                      onClick={() => setShowTranslateModal(false)}
                      className="px-6 py-3 border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                    >
                      {t("Annuler")}
                    </button>
                    <button
                      disabled={savingTranslations}
                      onClick={handleApplyTranslations}
                      className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 shadow-lg"
                    >
                      {savingTranslations ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          {t("Enregistrement...")}
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          {t("Appliquer & Publier")}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
