import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { FileText, Globe, Plus } from 'lucide-react';

interface MonthlyItem {
  id: string;
  month: string;
  createdAt?: string;
  updatedAt?: string;
  text_fr: string;
  text_ar: string;
  text_en: string;
}

interface TranslationMonthlyTabProps {
  monthlyContent: MonthlyItem[];
  newMonthlyText: string;
  setNewMonthlyText: (val: string) => void;
  registerMonthlyContent: () => Promise<void>;
}

export const TranslationMonthlyTab: React.FC<TranslationMonthlyTabProps> = ({
  monthlyContent,
  newMonthlyText,
  setNewMonthlyText,
  registerMonthlyContent,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      key="monthly-view"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="space-y-10"
      id="translation-monthly-tab"
    >
      {/* Monthly Content Registration */}
      <div className="bg-white rounded-[3.5rem] border border-zinc-100 shadow-sm p-12 space-y-10">
        <div className="flex items-center gap-4 border-b border-zinc-50 pb-8">
          <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-950">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xl font-sans font-bold text-zinc-950">
              {t("Enregistrer une Mise à Jour Mensuelle")}
            </h4>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mt-1">
              {t("Générez automatiquement les versions AR/EN pour Olma")}
            </p>
          </div>
        </div>

        <div className="bg-zinc-50 rounded-[2.5rem] p-10 space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal ms-2">
              {t("Texte Source (Généralement en Arabe ou Français)")}
            </label>
            <textarea
              rows={5}
              value={newMonthlyText}
              onChange={(e) => setNewMonthlyText(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-[2rem] p-8 font-medium text-zinc-800 outline-none focus:border-orange-500 shadow-sm transition-all"
              placeholder={t("Collez ici le texte marketing, les nouveautés du mois, ou les annonces spéciales...") || "Collez ici le texte marketing, les nouveautés du mois, ou les annonces spéciales..."}
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={registerMonthlyContent}
              className="px-12 py-5 bg-zinc-950 text-white rounded-3xl font-sans font-bold text-xs uppercase tracking-widest rtl:tracking-normal flex items-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl cursor-pointer border-none"
            >
              <Globe className="w-4 h-4 text-orange-500" />
              {t("Déployer & Traduire")}
            </button>
          </div>
        </div>
      </div>

      {/* History of Monthly Updates */}
      <div className="space-y-6">
        <h4 className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-[0.3em] ms-6">
          {t("Archive des Mises à Jour Mensuelles")}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {monthlyContent.length === 0 ? (
            <div className="col-span-full p-20 text-center border-2 border-dashed border-zinc-100 rounded-[3rem] text-zinc-300 font-sans font-bold uppercase tracking-widest rtl:tracking-normal">
              {t("Aucun historique de mise à jour mensuelle enregistré.")}
            </div>
          ) : (
            monthlyContent.map((item) => {
              const itemDate = item.createdAt || item.updatedAt ? new Date(item.createdAt || item.updatedAt || "").toLocaleDateString() : "";
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-[3rem] border border-zinc-100 p-10 shadow-sm space-y-6 relative group overflow-hidden"
                >
                  <div className="absolute top-0 end-0 p-6 opacity-5 bg-zinc-200 rounded-bl-[3rem]">
                    <FileText className="w-10 h-10" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal">
                      {item.month}
                    </span>
                    <span className="text-[9px] font-sans font-bold text-zinc-400 uppercase font-mono">
                      {itemDate}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <p className="text-[9px] font-sans font-bold text-zinc-400 uppercase mb-2">
                        {t("VERSION FRANÇAISE")}
                      </p>
                      <p className="text-xs font-bold text-zinc-950 line-clamp-3 leading-relaxed">
                        {item.text_fr}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-zinc-950 text-white rounded-2xl">
                        <p className="text-[9px] font-sans font-bold text-white/40 uppercase mb-2">
                          {t("VERSION ARABE")}
                        </p>
                        <p className="text-[11px] font-sans font-bold text-white line-clamp-2 leading-relaxed text-end" dir="rtl">
                          {item.text_ar}
                        </p>
                      </div>
                      <div className="p-5 bg-orange-600 text-white rounded-2xl shadow-xl shadow-orange-500/10">
                        <p className="text-[9px] font-sans font-bold text-white/40 uppercase mb-2">
                          {t("VERSION ANGLAISE")}
                        </p>
                        <p className="text-[11px] font-sans font-bold text-white line-clamp-2 leading-relaxed italic">
                          {item.text_en}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
};
