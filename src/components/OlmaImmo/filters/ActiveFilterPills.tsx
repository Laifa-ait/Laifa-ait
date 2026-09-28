import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FilterState } from '../SearchFilters';
import { LEGAL_PAPERS_CONFIG } from '../../../constants/legalPapers';

interface ActiveFilterPillsProps {
  filters: FilterState;
  onRemoveFilter: (key: keyof FilterState) => void;
  onResetAll: () => void;
  className?: string;
}

export const ActiveFilterPills: React.FC<ActiveFilterPillsProps> = ({
  filters,
  onRemoveFilter,
  onResetAll,
  className = '',
}) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar' || i18n.language?.startsWith('ar');

  const activeItems: Array<{
    key: keyof FilterState;
    label: string;
    variant: 'brand' | 'accent' | 'highlight' | 'neutral' | 'success';
  }> = [];

  if (filters.listingType) {
    const label =
      filters.listingType === 'sale'
        ? (isAr ? 'شراء' : t('buy', 'Achat'))
        : filters.listingType === 'rent_long'
        ? (isAr ? 'كراء' : t('rent', 'Location'))
        : (isAr ? 'إقامة' : t('stay', 'Séjour'));
    activeItems.push({ key: 'listingType', label, variant: 'brand' });
  }

  if (filters.propertyType) {
    const typeLabels: Record<string, string> = {
      apartment: isAr ? 'شقة' : t('apartment', 'Appartement'),
      villa: isAr ? 'فيلا' : t('villa', 'Villa'),
      house: isAr ? 'منزل' : t('house', 'Maison'),
      studio: isAr ? 'استوديو' : t('studio', 'Studio'),
      commercial: isAr ? 'تجاري' : t('commercial', 'Commerce'),
      land: isAr ? 'أرض' : t('land', 'Terrain'),
      office: isAr ? 'مكتب' : t('office', 'Bureau'),
    };
    activeItems.push({
      key: 'propertyType',
      label: typeLabels[filters.propertyType] || filters.propertyType,
      variant: 'neutral',
    });
  }

  if (filters.wilaya) {
    activeItems.push({
      key: 'wilaya',
      label: isAr ? `الولاية: ${filters.wilaya}` : `Wilaya: ${filters.wilaya}`,
      variant: 'highlight',
    });
  }

  if (filters.daira) {
    activeItems.push({
      key: 'daira',
      label: isAr ? `الدائرة: ${filters.daira}` : `Daïra: ${filters.daira}`,
      variant: 'highlight',
    });
  }

  if (filters.commune) {
    activeItems.push({
      key: 'commune',
      label: isAr ? `البلدية: ${filters.commune}` : `Commune: ${filters.commune}`,
      variant: 'highlight',
    });
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    let priceLabel = '';
    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      priceLabel = `${filters.minPrice.toLocaleString()} - ${filters.maxPrice.toLocaleString()} DZD`;
    } else if (filters.minPrice !== undefined) {
      priceLabel = `≥ ${filters.minPrice.toLocaleString()} DZD`;
    } else {
      priceLabel = `≤ ${(filters.maxPrice as number).toLocaleString()} DZD`;
    }
    activeItems.push({ key: 'minPrice', label: priceLabel, variant: 'accent' });
  }

  if (filters.minRooms !== undefined) {
    activeItems.push({
      key: 'minRooms',
      label: isAr ? `F${filters.minRooms}+ (${filters.minRooms} غرف)` : `F${filters.minRooms}+ (${filters.minRooms} pièces)`,
      variant: 'neutral',
    });
  }

  if (filters.minArea !== undefined) {
    activeItems.push({
      key: 'minArea',
      label: `≥ ${filters.minArea} m²`,
      variant: 'neutral',
    });
  }

  if (filters.hasActeNotarie) {
    activeItems.push({
      key: 'hasActeNotarie',
      label: isAr ? 'عقد توثيقي' : 'Acte Notarié',
      variant: 'success',
    });
  }

  if (filters.hasLivretFoncier) {
    activeItems.push({
      key: 'hasLivretFoncier',
      label: isAr ? 'دفتر عقاري' : 'Livret Foncier',
      variant: 'success',
    });
  }

  if (filters.legalPaperType) {
    const config = LEGAL_PAPERS_CONFIG[filters.legalPaperType];
    activeItems.push({
      key: 'legalPaperType',
      label: config ? config.shortLabel : filters.legalPaperType,
      variant: 'neutral',
    });
  }

  if (activeItems.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 py-2 ${className}`}>
      <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
        {isAr ? 'الفلاتر النشطة :' : t('active_filters_colon', 'Filtres actifs :')}
      </span>

      {activeItems.map((item) => (
        <span
          key={item.key}
          className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full text-xs font-bold bg-slate-50 text-[#1E3A8A] border border-slate-200 shadow-2xs transition-all hover:border-slate-400"
        >
          <span>{item.label}</span>
          <button
            type="button"
            onClick={() => onRemoveFilter(item.key)}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 cursor-pointer transition"
            aria-label={`Supprimer le filtre ${item.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onResetAll}
        className="text-xs font-bold text-rose-700 hover:text-rose-900 underline flex items-center gap-1 cursor-pointer ml-1 py-1"
      >
        <RotateCcw className="w-3 h-3" />
        <span>{isAr ? `مسح الكل (${activeItems.length})` : `${t('clear_all', 'Tout effacer')} (${activeItems.length})`}</span>
      </button>
    </div>
  );
};
