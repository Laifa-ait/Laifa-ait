import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Globe, Wand2 } from 'lucide-react';

interface AuditState {
  static: { ar: number; en: number; total: number };
  products: { ar: number; en: number; total: number };
}

interface TranslationAuditTabProps {
  auditState: AuditState;
  completenessAr: number;
  completenessEn: number;
  isTranslating: boolean;
  handleAutoTranslateProducts: () => Promise<void>;
  handleTranslateUI: () => Promise<void>;
}

export const TranslationAuditTab: React.FC<TranslationAuditTabProps> = ({
  auditState,
  completenessAr,
  completenessEn,
  isTranslating,
  handleAutoTranslateProducts,
  handleTranslateUI,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      key="audit-view"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="space-y-10"
      id="translation-audit-tab"
    >
      {/* Audit Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-2xl shadow-zinc-200/40 relative overflow-hidden group">
          <div className="absolute top-0 end-0 w-32 h-32 bg-orange-500/5 rounded-full -me-10 -mt-10 group-hover:bg-orange-500/10 transition-colors" />
          <div className="space-y-6 relative">
            <h3 className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-[0.3em]">
              {t("Static Content (UI)")}
            </h3>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-5xl font-sans font-bold text-zinc-950">{auditState.static.total}</span>
                <p className="text-[10px] font-sans font-bold text-zinc-400 uppercase">
                  {t("Keys found in Source (FR)")}
                </p>
              </div>
              <div className="w-20 h-20 rounded-full border-4 border-emerald-50 content-center flex items-center justify-center">
                <span className="text-xl font-sans font-bold text-emerald-500">100%</span>
              </div>
            </div>
            <div className="pt-6 border-t border-zinc-50 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-sans font-bold text-zinc-400 uppercase mb-2">
                  {t("Completion AR")}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 transition-all duration-1000"
                      style={{ width: `${completenessAr}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-sans font-bold text-zinc-950">{completenessAr}%</span>
                </div>
              </div>
              <div>
                <p className="text-[9px] font-sans font-bold text-zinc-400 uppercase mb-2">
                  {t("Completion EN")}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-950 transition-all duration-1000"
                      style={{ width: `${completenessEn}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-sans font-bold text-zinc-950">{completenessEn}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-2xl shadow-zinc-200/40 relative overflow-hidden group">
          <div className="space-y-6 relative">
            <h3 className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-[0.3em]">
              {t("Catalog Health")}
            </h3>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-5xl font-sans font-bold text-zinc-950">{auditState.products.total}</span>
                <p className="text-[10px] font-sans font-bold text-zinc-400 uppercase">
                  {t("Products Audited")}
                </p>
              </div>
              <div className="w-20 h-20 rounded-full border-4 border-orange-50 content-center flex items-center justify-center">
                <span className="text-xl font-sans font-bold text-orange-500 group-hover:scale-110 transition-transform">
                  {auditState.products.ar + auditState.products.en}
                </span>
              </div>
            </div>
            <div className="pt-6 border-t border-zinc-50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-[10px] font-sans font-bold uppercase text-zinc-600">
                    {t("Missing AR (Arabe)")}
                  </span>
                </div>
                <span className="text-[10px] font-sans font-bold text-zinc-950">
                  {auditState.products.ar} {t("Items")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-400" />
                  <span className="text-[10px] font-sans font-bold uppercase text-zinc-600">
                    {t("Missing EN (Anglais)")}
                  </span>
                </div>
                <span className="text-[10px] font-sans font-bold text-zinc-950">
                  {auditState.products.en} {t("Items")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-orange-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-orange-500/30 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 end-0 p-8 opacity-20">
            <Wand2 className="w-24 h-24 rotate-12" />
          </div>
          <div className="space-y-3">
            <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-orange-200">
              {t("One-Click Global Fix")}
            </h3>
            <h2 className="text-2xl font-sans font-bold tracking-tight rtl:tracking-normal leading-tight">
              {t("Traduire l'Écosystème par IA")}
            </h2>
            <p className="text-[11px] text-orange-100 opacity-90 leading-relaxed font-medium">
              {t("Analyse et traduit automatiquement toutes les fiches produits, mais aussi l'intégralité des")}
              <strong>{t("Catégories")}</strong>, <strong>{t("Sous-catégories")}</strong>, <strong>{t("Sous-sous-catégories")}</strong>
              {t(", et")}<strong>{t("Bannières/Sections promotionnelles")}</strong> {t("ajoutées par l'administrateur.")}
            </p>
          </div>
          <div className="mt-6 space-y-3">
            <button
              onClick={handleAutoTranslateProducts}
              disabled={isTranslating}
              className="w-full bg-white text-zinc-950 py-4 max-lg:py-5 rounded-2xl font-sans font-bold text-xs uppercase tracking-widest rtl:tracking-normal flex items-center justify-center gap-3 hover:bg-zinc-50 active:scale-95 transition-all shadow-xl disabled:opacity-50 border-none cursor-pointer"
            >
              <Wand2 className={`w-4 h-4 ${isTranslating ? 'animate-spin' : ''}`} />
              {isTranslating
                ? (t("admin.translation.processing") !== "admin.translation.processing" ? t("admin.translation.processing") : 'Traitement...')
                : (t("admin.translation.fix_catalog") !== "admin.translation.fix_catalog" ? t("admin.translation.fix_catalog") : 'Réparer le Catalogue')}
            </button>
            <button
              onClick={handleTranslateUI}
              disabled={isTranslating}
              className="w-full bg-orange-800 text-white py-4 max-lg:py-5 rounded-2xl font-sans font-bold text-xs uppercase tracking-widest rtl:tracking-normal flex items-center justify-center gap-3 hover:bg-orange-900 active:scale-95 transition-all disabled:opacity-50 border border-orange-700/50 cursor-pointer"
            >
              <Globe className={`w-4 h-4 ${isTranslating ? 'animate-spin' : ''}`} />
              {isTranslating
                ? (t("admin.translation.in_progress") !== "admin.translation.in_progress" ? t("admin.translation.in_progress") : 'En cours...')
                : (t("admin.translation.translate_ui") !== "admin.translation.translate_ui" ? t("admin.translation.translate_ui") : "Traduire l'UI & Contenu d'Admin")}
            </button>
          </div>
        </div>
      </div>

      {/* Visual Completeness Report */}
      <div className="bg-white rounded-[3.5rem] border border-zinc-100 shadow-sm p-12 space-y-8">
        <div className="flex items-center justify-between border-b border-zinc-50 pb-8">
          <div>
            <h4 className="text-xl font-sans font-bold text-zinc-950 italic">
              {t("admin.translation.report_title") !== "admin.translation.report_title" ? t("admin.translation.report_title") : "Rapport de Conformité Linguistique"}
            </h4>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mt-1">
              {t("admin.translation.report_subtitle") !== "admin.translation.report_subtitle" ? t("admin.translation.report_subtitle") : "Analyse détaillée des fichiers .json locaux"}
            </p>
          </div>
          <Globe className="w-8 h-8 text-zinc-200" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {[
            { lang: 'Français (Source)', code: 'FR', score: 100, color: 'bg-emerald-500', icon: '🇫🇷' },
            { lang: 'Arabe (Algérie)', code: 'AR', score: completenessAr, color: 'bg-orange-500', icon: '🇩🇿' },
            { lang: 'Anglais (Global)', code: 'EN', score: completenessEn, color: 'bg-zinc-950', icon: '🇬🇧' }
          ].map((l) => {
            return (
              <div key={l.code} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{l.icon}</span>
                    <div>
                      <p className="font-sans font-bold text-sm text-zinc-950">{l.lang}</p>
                      <p className="text-[10px] font-sans font-bold text-zinc-400">
                        {t("STATUS:")}{l.score === 100 ? 'OPÉRATIONNEL' : 'INCOMPLET'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${l.score === 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                    {l.score}%
                  </span>
                </div>
                <div className="h-3 w-full bg-zinc-50 rounded-full overflow-hidden">
                  <div className={`h-full ${l.color} transition-all duration-1000`} style={{ width: `${l.score}%` }} />
                </div>
                {l.score < 100 && (
                  <div className="bg-zinc-50 p-4 rounded-2xl flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
                    <p className="text-[10px] font-sans font-bold text-zinc-500 uppercase leading-relaxed">
                      {l.lang} {t("possède")} {l.code === 'AR' ? auditState.static.ar : auditState.static.en} {t("clés vides ou identiques au français.")}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
