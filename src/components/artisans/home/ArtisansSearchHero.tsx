import React from 'react';
import { Search, Sparkles } from 'lucide-react';
import { WilayaCommuneSelector } from '../WilayaCommuneSelector';

interface ArtisansSearchHeroProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  selectedWilaya: string;
  selectedCommune: string;
  onWilayaChange: (wilaya: string, commune: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export const ArtisansSearchHero: React.FC<ArtisansSearchHeroProps> = ({
  searchTerm,
  onSearchTermChange,
  selectedWilaya,
  selectedCommune,
  onWilayaChange,
  onSearchSubmit,
}) => {
  return (
    <section className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white p-6 sm:p-12 overflow-hidden shadow-2xl">
      <div className="relative z-10 max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Trouvez un professionnel de confiance près de chez vous</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Artisans & Travaux qualifiés dans toute l'Algérie
          </h1>
          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            Plombiers, électriciens, peintres, maçons et spécialistes du bâtiment vérifiés dans les 58 Wilayas.
          </p>
        </div>

        {/* Global Search Bar */}
        <form
          onSubmit={onSearchSubmit}
          className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200/50 shadow-2xl flex flex-col md:flex-row items-stretch md:items-center gap-3 text-slate-800"
        >
          {/* Keyword Search */}
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Ex: Plombier, Électricien, Peintre..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="w-full bg-transparent border-none text-xs font-medium focus:outline-hidden"
            />
          </div>

          {/* Wilaya Filter */}
          <div className="flex-1 min-w-[240px]">
            <WilayaCommuneSelector
              selectedWilaya={selectedWilaya}
              selectedCommune={selectedCommune}
              onChange={(w, c) => onWilayaChange(w, c)}
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer shrink-0"
          >
            Rechercher
          </button>
        </form>
      </div>
    </section>
  );
};
