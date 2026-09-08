import React from 'react';
import { BedDouble, Bath, Maximize2, Building2 } from 'lucide-react';

export type PropertyMetaLayout = 'bar' | 'grid' | 'inline';
export type PropertyMetaSize = 'sm' | 'md' | 'lg';

export interface PropertyMetaProps {
  rooms?: number;
  bathrooms?: number;
  areaSquareMeters?: number;
  propertyType?: string;
  layout?: PropertyMetaLayout;
  size?: PropertyMetaSize;
  className?: string;
  id?: string;
}

const formatPropertyType = (type?: string): string => {
  if (!type) return '';
  switch (type.toLowerCase()) {
    case 'apartment': return 'Appartement';
    case 'villa': return 'Villa';
    case 'studio': return 'Studio';
    case 'commercial': return 'Local commercial';
    case 'land': return 'Terrain';
    case 'office': return 'Bureau';
    case 'duplex': return 'Duplex';
    default: return type;
  }
};

export const PropertyMeta: React.FC<PropertyMetaProps> = ({
  rooms,
  bathrooms,
  areaSquareMeters,
  propertyType,
  layout = 'bar',
  size = 'sm',
  className = '',
  id,
}) => {
  const formattedType = React.useMemo(() => formatPropertyType(propertyType), [propertyType]);

  // Layout: Grid (Used in Property Detail specs)
  if (layout === 'grid') {
    return (
      <div
        id={id}
        className={`bg-white rounded-3xl p-6 border border-[#E8E2D4] shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-center ${className}`}
      >
        {typeof rooms === 'number' && rooms > 0 && (
          <div className="space-y-1 p-2">
            <BedDouble className="w-5 h-5 text-[#1A3831] mx-auto" aria-hidden="true" />
            <span className="block text-xs text-stone-500 font-medium">Pièces</span>
            <span className="font-bold text-[#1A3831] text-base sm:text-lg">F{rooms}</span>
          </div>
        )}

        {typeof areaSquareMeters === 'number' && areaSquareMeters > 0 && (
          <div className="space-y-1 p-2 sm:border-l border-[#F0EAE0]">
            <Maximize2 className="w-5 h-5 text-[#1A3831] mx-auto" aria-hidden="true" />
            <span className="block text-xs text-stone-500 font-medium">Superficie</span>
            <span className="font-bold text-[#1A3831] text-base sm:text-lg">{areaSquareMeters} m²</span>
          </div>
        )}

        {typeof bathrooms === 'number' && bathrooms > 0 && (
          <div className="space-y-1 p-2 border-t sm:border-t-0 sm:border-l border-[#F0EAE0]">
            <Bath className="w-5 h-5 text-[#1A3831] mx-auto" aria-hidden="true" />
            <span className="block text-xs text-stone-500 font-medium">Salles de bain</span>
            <span className="font-bold text-[#1A3831] text-base sm:text-lg">{bathrooms}</span>
          </div>
        )}

        {formattedType && (
          <div className="space-y-1 p-2 border-t sm:border-t-0 sm:border-l border-[#F0EAE0]">
            <Building2 className="w-5 h-5 text-[#1A3831] mx-auto" aria-hidden="true" />
            <span className="block text-xs text-stone-500 font-medium">Catégorie</span>
            <span className="font-bold text-[#1A3831] text-sm sm:text-base capitalize line-clamp-1">
              {formattedType}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Layout: Inline (Compact text with dividers)
  if (layout === 'inline') {
    const items: Array<{ key: string; icon: React.ReactNode; text: string }> = [];
    if (typeof rooms === 'number' && rooms > 0) {
      items.push({ key: 'rooms', icon: <BedDouble className="w-3.5 h-3.5" />, text: `F${rooms}` });
    }
    if (typeof areaSquareMeters === 'number' && areaSquareMeters > 0) {
      items.push({ key: 'area', icon: <Maximize2 className="w-3.5 h-3.5" />, text: `${areaSquareMeters} m²` });
    }
    if (typeof bathrooms === 'number' && bathrooms > 0) {
      items.push({ key: 'baths', icon: <Bath className="w-3.5 h-3.5" />, text: `${bathrooms} sdb` });
    }

    return (
      <div id={id} className={`flex items-center gap-2 flex-wrap text-xs text-stone-600 font-medium ${className}`}>
        {items.map((it, idx) => (
          <React.Fragment key={it.key}>
            <span className="inline-flex items-center gap-1">
              <span className="text-stone-400">{it.icon}</span>
              <span>{it.text}</span>
            </span>
            {idx < items.length - 1 && <span className="text-stone-300">•</span>}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Layout: Bar (Default, used in PropertyCard)
  const iconSize = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  const textSize = size === 'md' ? 'text-sm' : 'text-xs';

  return (
    <div
      id={id}
      className={`flex items-center justify-between ${textSize} text-stone-600 font-medium py-2 px-3 rounded-xl bg-[#FAF8F5] border border-[#EDE7DC] ${className}`}
    >
      <span className="flex items-center gap-1.5" title={`${rooms || 1} chambre(s)`}>
        <BedDouble className={`${iconSize} text-emerald-700 shrink-0`} aria-hidden="true" />
        <span>{rooms ? `${rooms} ch.` : '1 ch.'}</span>
      </span>

      <span className="w-px h-3.5 bg-[#EDE7DC]" aria-hidden="true" />

      <span className="flex items-center gap-1.5" title={`${bathrooms || 1} salle(s) de bain`}>
        <Bath className={`${iconSize} text-emerald-700 shrink-0`} aria-hidden="true" />
        <span>{bathrooms ? `${bathrooms} sdb` : '1 sdb'}</span>
      </span>

      <span className="w-px h-3.5 bg-[#EDE7DC]" aria-hidden="true" />

      <span className="flex items-center gap-1.5 font-semibold text-stone-700" title={`Superficie: ${areaSquareMeters || 80} m²`}>
        <Maximize2 className={`${iconSize} text-emerald-700 shrink-0`} aria-hidden="true" />
        <span>{areaSquareMeters || 80} m²</span>
      </span>
    </div>
  );
};
