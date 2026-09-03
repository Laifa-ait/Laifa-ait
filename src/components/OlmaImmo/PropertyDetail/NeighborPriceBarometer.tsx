import React from 'react';
import { Property, PropertyMapResult } from '../../../types/realEstate';
import { TrendingUp, BarChart2, Eye, EyeOff } from 'lucide-react';
import { formatPriceAlgeria } from '../mapStyles';

interface NeighborPriceBarometerProps {
  currentPrice: number;
  neighbors: (Property | PropertyMapResult)[];
  commune: string;
  wilaya: string;
  showNeighborsOnMap: boolean;
  onToggleShowNeighbors: () => void;
  onSelectNeighbor?: (id: string) => void;
}

export const NeighborPriceBarometer: React.FC<NeighborPriceBarometerProps> = ({
  currentPrice,
  neighbors,
  commune,
  wilaya,
  showNeighborsOnMap,
  onToggleShowNeighbors,
  onSelectNeighbor,
}) => {
  if (neighbors.length === 0) {
    return null;
  }

  const allPrices = [currentPrice, ...neighbors.map((n) => n.price)].filter((p) => p > 0);
  const avgPrice = Math.round(allPrices.reduce((acc, p) => acc + p, 0) / allPrices.length);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);

  const priceRatio = avgPrice > 0 ? (currentPrice / avgPrice) : 1;
  let statusText = 'Prix aligné avec la moyenne du quartier';
  let statusBadgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';

  if (priceRatio < 0.9) {
    const savingPct = Math.round((1 - priceRatio) * 100);
    statusText = `Offre très compétitive (${savingPct}% sous la moyenne)`;
    statusBadgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
  } else if (priceRatio > 1.15) {
    statusText = 'Bien de standing supérieur (Prestation haut de gamme)';
    statusBadgeColor = 'bg-amber-50 text-amber-900 border-amber-200';
  }

  return (
    <div className="bg-[#FAF8F5] rounded-2xl p-4 sm:p-5 border border-[#EBE4D8] space-y-3.5">
      {/* Top row with Title & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#0D281E] text-[#EBDCB8] flex items-center justify-center shadow-2xs">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
          </span>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#0D281E]">
              Prix comparés dans le secteur ({commune || wilaya})
            </h4>
            <p className="text-[11px] text-stone-500 font-medium">
              {neighbors.length} autre{neighbors.length > 1 ? 's' : ''} logement{neighbors.length > 1 ? 's' : ''} géolocalisé{neighbors.length > 1 ? 's' : ''} à proximité immédiate
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleShowNeighbors}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer active:scale-95 shrink-0 ${
            showNeighborsOnMap
              ? 'bg-white text-stone-800 border-stone-300 shadow-2xs hover:bg-stone-50'
              : 'bg-[#0D281E] text-[#EBDCB8] border-[#0D281E] shadow-sm'
          }`}
        >
          {showNeighborsOnMap ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-stone-500" />
              <span>Masquer repères voisins</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-amber-300" />
              <span>Afficher voisins sur la carte ({neighbors.length})</span>
            </>
          )}
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-200/60">
        <div className="bg-white p-2.5 rounded-xl border border-stone-200/80">
          <span className="text-[10px] uppercase font-bold text-stone-400 block truncate">Prix ce logement</span>
          <span className="text-xs sm:text-sm font-black text-[#0D281E] block mt-0.5">
            {formatPriceAlgeria(currentPrice)}
          </span>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-stone-200/80">
          <span className="text-[10px] uppercase font-bold text-stone-400 block truncate">Moyenne du quartier</span>
          <span className="text-xs sm:text-sm font-bold text-stone-800 block mt-0.5">
            {formatPriceAlgeria(avgPrice)}
          </span>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-stone-200/80">
          <span className="text-[10px] uppercase font-bold text-stone-400 block truncate">Fourchette secteur</span>
          <span className="text-[11px] sm:text-xs font-semibold text-stone-700 block mt-0.5 truncate">
            {formatPriceAlgeria(minPrice)} - {formatPriceAlgeria(maxPrice)}
          </span>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs flex-wrap gap-2">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-[11px] ${statusBadgeColor}`}>
          <TrendingUp className="w-3 h-3" />
          <span>{statusText}</span>
        </span>

        {onSelectNeighbor && neighbors.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
            <span className="text-[10px] text-stone-500 font-bold uppercase shrink-0">Accès rapide :</span>
            {neighbors.slice(0, 4).map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => onSelectNeighbor(n.id)}
                className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-[10px] font-bold text-stone-700 hover:border-[#0D281E] hover:text-[#0D281E] transition cursor-pointer shrink-0"
              >
                {formatPriceAlgeria(n.price)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
