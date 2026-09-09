import React from 'react';
import { Sparkles, RefreshCw, HelpCircle } from 'lucide-react';
import { OlmaSurface } from './primitives/OlmaSurface';
import { OlmaButton } from './primitives/OlmaButton';
import { FilterState } from './SearchFilters';

interface OlmaImmoEmptyStateProps {
  filters?: FilterState;
  onResetFilters: () => void;
  className?: string;
}

export const OlmaImmoEmptyState: React.FC<OlmaImmoEmptyStateProps> = ({
  filters,
  onResetFilters,
  className = '',
}) => {
  const activeTags: string[] = [];
  if (filters?.wilaya) activeTags.push(`Wilaya : ${filters.wilaya}`);
  if (filters?.commune) activeTags.push(`Commune : ${filters.commune}`);
  if (filters?.listingType) {
    const mapListing: Record<string, string> = {
      sale: 'Achat / Vente',
      rent_long: 'Location',
      rent_short: 'Séjour vacances',
    };
    activeTags.push(mapListing[filters.listingType] || filters.listingType);
  }
  if (filters?.propertyType) activeTags.push(`Type : ${filters.propertyType}`);
  if (filters?.minPrice || filters?.maxPrice) {
    const min = filters.minPrice ? `${filters.minPrice.toLocaleString('fr-DZ')} DA` : '0';
    const max = filters.maxPrice ? `${filters.maxPrice.toLocaleString('fr-DZ')} DA` : 'max';
    activeTags.push(`Budget : ${min} - ${max}`);
  }

  return (
    <OlmaSurface
      variant="default"
      elevation="card"
      radius="3xl"
      padding="xl"
      bordered
      borderVariant="default"
      className={`text-center space-y-5 my-6 flex flex-col items-center max-w-2xl mx-auto ${className}`}
    >
      <div className="w-14 h-14 bg-[#0D281E] text-[#EBDCB8] rounded-2xl flex items-center justify-center mx-auto shadow-md border border-[#EBDCB8]/20">
        <Sparkles className="w-7 h-7 text-amber-400" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-extrabold text-[#0D281E] font-['Playfair_Display',serif]">
          Aucun bien ne correspond à ces critères
        </h3>
        <p className="text-stone-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
          Nous n'avons pas trouvé d'annonces correspondant exactement à votre sélection actuelle en Algérie.
        </p>
      </div>

      {activeTags.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1">
            Critères testés :
          </span>
          {activeTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FAF8F5] text-stone-700 border border-stone-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Helpful suggestions */}
      <div className="w-full bg-[#FAF8F5] rounded-2xl p-4 border border-[#EBE5DA] text-left text-xs text-stone-600 space-y-2">
        <div className="font-bold text-[#0D281E] flex items-center gap-1.5 text-xs">
          <HelpCircle className="w-4 h-4 text-emerald-700" />
          <span>Suggestions pour trouver votre bien :</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-stone-600 text-[11px] sm:text-xs">
          <li>Élargissez votre recherche aux communes voisines ou à l'ensemble de la wilaya.</li>
          <li>Ajustez ou augmentez la fourchette de prix minimum et maximum.</li>
          <li>Consultez d'autres types de transactions (ex: location au lieu d'achat).</li>
        </ul>
      </div>

      <OlmaButton
        onClick={onResetFilters}
        variant="dark"
        size="md"
        leftIcon={<RefreshCw className="w-3.5 h-3.5 text-amber-400" />}
        className="mt-2"
      >
        Réinitialiser tous les filtres
      </OlmaButton>
    </OlmaSurface>
  );
};
