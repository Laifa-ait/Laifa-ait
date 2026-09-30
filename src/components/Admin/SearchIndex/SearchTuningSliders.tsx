import React from 'react';
import { useTranslation } from "react-i18next";
import { Sliders, Play, Search, MapPin } from 'lucide-react';
import { Product } from "../../../domains/product/product.types";
import { SearchIndexingModel } from './types';

export interface SearchTuningSlidersProps {
  weightTitle: number;
  onWeightTitleChange: (v: number) => void;
  weightDesc: number;
  onWeightDescChange: (v: number) => void;
  weightRatings: number;
  onWeightRatingsChange: (v: number) => void;
  weightPromo: number;
  onWeightPromoChange: (v: number) => void;
  weightStock: number;
  onWeightStockChange: (v: number) => void;
  simulatedSearch: string;
  onSimulatedSearchChange: (v: string) => void;
  simulatedResults: SearchIndexingModel[];
  products: Product[];
}

export const SearchTuningSliders: React.FC<SearchTuningSlidersProps> = ({
  weightTitle,
  onWeightTitleChange,
  weightDesc,
  onWeightDescChange,
  weightRatings,
  onWeightRatingsChange,
  weightPromo,
  onWeightPromoChange,
  weightStock,
  onWeightStockChange,
  simulatedSearch,
  onSimulatedSearchChange,
  simulatedResults,
  products,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Search Simulator */}
      <div className="bg-white border border-zinc-900 rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden">
        <h3 className="text-base font-sans font-bold uppercase text-zinc-900 flex items-center gap-2 mb-2">
          <Play className="w-5 h-5 text-[#ea580c] fill-[#ea580c]" />
          {t("Simulateur de Pertinence")}
        </h3>
        <p className="text-xs text-zinc-500 mb-6">{t("Testez le tri de pertinence en fonction des curseurs ci-dessous.")}</p>

        <div className="relative mb-6">
          <input
            type="text"
            placeholder={t("Ex: Poterie, cuir, bijoux...") || "Ex: Poterie, cuir, bijoux..."}
            value={simulatedSearch}
            onChange={(e) => onSimulatedSearchChange(e.target.value)}
            className="w-full bg-zinc-100 border border-transparent rounded-2xl ps-10 pe-4 py-3 text-xs font-bold text-zinc-800 outline-none focus:bg-white focus:border-zinc-300 transition-all"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute start-4 top-3.5" />
        </div>

        <div className="space-y-4">
          {simulatedResults.length === 0 ? (
            <div className="text-center py-6 bg-zinc-50 rounded-2xl text-xs text-zinc-400 font-semibold uppercase">
              {t("Aucun résultat")}
            </div>
          ) : (
            simulatedResults.map((item, index) => (
              <div key={item.objectID} className="p-3 bg-zinc-50 rounded-xl border border-zinc-150 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-sans font-bold text-zinc-400 font-mono">#{index + 1}</span>
                  <div>
                    <h4 className="text-xs font-extrabold text-zinc-800 leading-tight">{item.name}</h4>
                    <span className="text-[9px] text-zinc-500 font-mono">Rating: {item.rating} • Stock: {item.stockCount}</span>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold text-[#ea580c] font-mono shrink-0">
                  {item.rankingScore} pts
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Relevance weights tuning sliders */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-sans font-bold text-zinc-900 uppercase flex items-center gap-2">
            <Sliders className="w-5 h-5 text-orange-600" />
            {t("Poids du Tri Personnalisé")}
          </h3>
          <p className="text-xs text-zinc-500 mt-1">{t("Ajustez la pondération de l'index de tri.")}</p>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-zinc-700 uppercase mb-2">
              <span>{t("Match Titre")}</span>
              <span className="font-mono text-orange-600">x{weightTitle}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={weightTitle}
              onChange={(e) => onWeightTitleChange(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-[#ea580c]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold text-zinc-700 uppercase mb-2">
              <span>{t("Match Description")}</span>
              <span className="font-mono text-orange-600">x{weightDesc}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={weightDesc}
              onChange={(e) => onWeightDescChange(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-[#ea580c]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold text-zinc-700 uppercase mb-2">
              <span>{t("Évaluations Clients")}</span>
              <span className="font-mono text-orange-600">x{weightRatings}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={weightRatings}
              onChange={(e) => onWeightRatingsChange(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-[#ea580c]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold text-zinc-700 uppercase mb-2">
              <span>{t("Bonus Promotion")}</span>
              <span className="font-mono text-orange-600">x{weightPromo}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={weightPromo}
              onChange={(e) => onWeightPromoChange(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-[#ea580c]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold text-zinc-700 uppercase mb-2">
              <span>{t("Disponibilité Stock")}</span>
              <span className="font-mono text-orange-600">x{weightStock}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={weightStock}
              onChange={(e) => onWeightStockChange(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-[#ea580c]"
            />
          </div>
        </div>
      </div>

      {/* Algérie Geographical Distribution stats */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 space-y-4">
        <h4 className="text-xs font-sans font-bold text-zinc-800 uppercase tracking-widest flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-600" />
          {t("Répartition Géographique")}
        </h4>
        <div className="space-y-3">
          {['Tizi Ouzou', 'Ghardaïa', 'Constantine', 'Alger', 'Tlemcen'].map(wil => {
            const count = products.filter(p => p.wilaya === wil).length;
            const percentage = products.length > 0 ? Math.round((count / products.length) * 100) : 0;
            return (
              <div key={wil} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600">
                  <span>{wil}</span>
                  <span>{count} ({percentage}%)</span>
                </div>
                <div className="w-full h-1 bg-zinc-200 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-600 rounded-full" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
