import React from 'react';
import { motion } from 'motion/react';
import {
  Wrench,
  Zap,
  ThermometerSnowflake,
  Paintbrush,
  Hammer,
  Drill,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { BricolageServiceCategory } from '../../types/bricolage';
import { useBricolageI18n } from '../../hooks/useBricolageI18n';

interface ServiceCategoryGridProps {
  categories: BricolageServiceCategory[];
  lang?: 'fr' | 'ar' | 'en';
  onSelectCategory?: (category: BricolageServiceCategory, specificTask?: string) => void;
  onRequestQuote?: (category: BricolageServiceCategory, specificTask?: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Wrench,
  Zap,
  ThermometerSnowflake,
  Paintbrush,
  Hammer,
  Drill
};

export const ServiceCategoryGrid: React.FC<ServiceCategoryGridProps> = ({
  categories,
  lang,
  onSelectCategory,
  onRequestQuote
}) => {
  const { tBricolage, currentLang } = useBricolageI18n();
  const activeLang = lang || currentLang;

  const handleQuoteRequest = (cat: BricolageServiceCategory, task?: string) => {
    if (typeof onRequestQuote === 'function') {
      onRequestQuote(cat, task);
    } else if (typeof onSelectCategory === 'function') {
      onSelectCategory(cat, task);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
            {tBricolage('grid.categoriesBadge', "Catégories d'Intervention")}
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-2">
            {tBricolage('grid.title', 'Sélectionnez votre type de travaux')}
          </h2>
        </div>
        <p className="text-xs font-semibold text-slate-500 max-w-sm">
          {tBricolage('grid.subtitle', "Demande d'intervention rapide et devis personnalisé sans engagement.")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const IconComponent = ICON_MAP[cat.icon] || Wrench;
          const name = cat.name[activeLang] || cat.name.fr;
          const description = cat.description[activeLang] || cat.description.fr;

          return (
            <motion.div
              key={cat.id}
              whileHover={{ y: -4 }}
              className="bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 flex items-center justify-center shadow-sm">
                    <IconComponent className="w-7 h-7 stroke-[2.5]" />
                  </div>

                  {cat.badge && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-amber-400">
                      {cat.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                  {name}
                </h3>

                <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                  {description}
                </p>

                {/* Popular Services Sub-list */}
                <div className="space-y-2 mb-5">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    {tBricolage('grid.frequentServices', 'Prestations fréquentes :')}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.popularServices.map((task, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuoteRequest(cat, task)}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 transition-colors flex items-center gap-1.5 border border-slate-200/80"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>{task}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleQuoteRequest(cat)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>{tBricolage('grid.requestIntervention', "Demander une Intervention")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
