import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, ShieldCheck, Clock, Award, ArrowRight, Wrench, HardHat, CheckCircle2 } from 'lucide-react';
import { BricolageServiceCategory } from '../../types/bricolage';
import { ALGERIAN_WILAYAS_LIST } from '../../data/algeriaRegions';
import { useBricolageI18n } from '../../hooks/useBricolageI18n';

interface BricolageHeroProps {
  categories: BricolageServiceCategory[];
  lang: 'fr' | 'ar' | 'en';
  onSelectCategory: (category: BricolageServiceCategory) => void;
  onSearch: (query: string, wilaya: string) => void;
}

const ALGERIAN_WILAYAS = ['Toutes les Wilayas', ...ALGERIAN_WILAYAS_LIST];

export const BricolageHero: React.FC<BricolageHeroProps> = ({
  categories,
  lang,
  onSelectCategory,
  onSearch
}) => {
  const { tBricolage } = useBricolageI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState('Toutes les Wilayas');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery, selectedWilaya === 'Toutes les Wilayas' ? '' : selectedWilaya);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-slate-50 to-orange-500/10 text-slate-900 pt-10 pb-16 px-4 sm:px-8 rounded-3xl border border-slate-200 shadow-xl">
      {/* Light Pattern / Subtle Construction Accent Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:2rem_2rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        {/* Angi Brand Eyebrow - Industrial Style */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 border border-amber-500/40 text-amber-900 text-xs font-black uppercase tracking-widest shadow-sm"
        >
          <HardHat className="w-4 h-4 text-amber-600" />
          <span>{tBricolage('hero.badge', "INSPIRÉ D'ANGI.COM • ARTISANS VÉRIFIÉS & DÉPANNAGE PRO DZ")}</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-slate-900"
        >
          {tBricolage('hero.title', 'Trouvez un artisan certifié pour vos travaux & dépannages')}
        </motion.h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
          {tBricolage('hero.subtitle', 'Plomberie, électricité, climatisation, peinture, menuiserie et rénovation. Trouvez et contactez directement des artisans vérifiés dans votre wilaya.')}
        </p>

        {/* Industrial Light Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSearchSubmit}
          className="bg-white p-2.5 sm:p-3 rounded-2xl sm:rounded-full shadow-2xl border-2 border-slate-200 hover:border-amber-400 transition-colors flex flex-col sm:flex-row items-stretch gap-2 max-w-3xl mx-auto"
        >
          <div className="flex-1 relative flex items-center px-3">
            <Search className="w-5 h-5 text-amber-600 shrink-0 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tBricolage('hero.searchPlaceholder', "Ex: Réparation fuite d'eau, installation climatiseur...")}
              className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm font-semibold focus:outline-none py-2"
            />
          </div>

          <div className="sm:w-56 relative flex items-center px-3 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0">
            <MapPin className="w-4 h-4 text-orange-600 shrink-0 mr-2" />
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className="w-full bg-transparent text-slate-900 text-xs font-bold focus:outline-none cursor-pointer py-2"
            >
              {ALGERIAN_WILAYAS.map((w) => (
                <option key={w} value={w} className="bg-white text-slate-900">
                  {w}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="py-3 px-7 rounded-xl sm:rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-md shadow-amber-500/30 transition-all flex items-center justify-center gap-2 shrink-0 border border-amber-400"
          >
            <span>{tBricolage('hero.searchButton', 'Trouver un Pro')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.form>

        {/* Feature Badges */}
        <div className="pt-2 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-700 font-bold">
          <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            Identité & Diplôme Vérifiés
          </span>
          <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <Clock className="w-4 h-4 text-orange-600" />
            Réponse Rapide sous 2h
          </span>
          <span className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            100% Gratuit & Sans Engagement
          </span>
        </div>
      </div>
    </div>
  );
};
