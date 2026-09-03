import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Property, PropertyMapResult } from '../../../types/realEstate';
import { X, ExternalLink, BedDouble, Maximize2, Tag, TrendingDown, TrendingUp } from 'lucide-react';
import { formatPriceAlgeria } from '../mapStyles';

interface NeighborPropertyModalProps {
  property: Property | PropertyMapResult;
  referencePrice: number;
  onClose: () => void;
}

export const NeighborPropertyModal: React.FC<NeighborPropertyModalProps> = ({
  property,
  referencePrice,
  onClose,
}) => {
  const navigate = useNavigate();

  const price = property.price;
  const priceDiff = price - referencePrice;
  const pctDiff = referencePrice > 0 ? Math.round((priceDiff / referencePrice) * 100) : 0;

  const image =
    ('images' in property && property.images?.[0]) ||
    ('mainImage' in property && property.mainImage) ||
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80';

  const rooms = property.rooms || 0;
  const area = property.areaSquareMeters || 0;

  return (
    <div className="bg-white/98 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-[#0D281E]/15 shadow-2xl space-y-3 w-full max-w-sm pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
      {/* Header with Title & Close */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/70 text-[10px] font-extrabold uppercase tracking-wider">
            <Tag className="w-3 h-3 text-amber-600" />
            <span>Bien Voisin</span>
          </span>
          <span className="text-[11px] font-semibold text-stone-500">
            {property.commune || ('location' in property && property.location?.commune) || 'Alger'}, {property.wilaya || ('location' in property && property.location?.wilaya) || 'Alger'}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main card body */}
      <div className="flex gap-3 items-center">
        <img
          src={image}
          alt={property.title}
          referrerPolicy="no-referrer"
          className="w-20 h-20 rounded-xl object-cover shrink-0 border border-stone-100 shadow-2xs"
        />

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-[#0D281E] line-clamp-1">{property.title}</h4>

          <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-1">
            {rooms > 0 && (
              <span className="flex items-center gap-0.5">
                <BedDouble className="w-3 h-3 text-emerald-700" />
                <span>{rooms} pces</span>
              </span>
            )}
            {area > 0 && (
              <span className="flex items-center gap-0.5">
                <Maximize2 className="w-3 h-3 text-emerald-700" />
                <span>{area} m²</span>
              </span>
            )}
          </div>

          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-sm font-extrabold text-[#0D281E]">
              {formatPriceAlgeria(price, property.pricePeriod)}
            </span>
          </div>
        </div>
      </div>

      {/* Comparison badge */}
      <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center justify-between text-[11px]">
        <span className="text-stone-600 font-medium">Écart vs ce logement :</span>
        {pctDiff === 0 ? (
          <span className="font-bold text-stone-700">Même niveau de prix</span>
        ) : pctDiff < 0 ? (
          <span className="inline-flex items-center gap-1 font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            <TrendingDown className="w-3 h-3 text-emerald-600" />
            <span>{Math.abs(pctDiff)}% plus abordable</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
            <TrendingUp className="w-3 h-3 text-amber-700" />
            <span>+{pctDiff}% supérieur</span>
          </span>
        )}
      </div>

      {/* Action button */}
      <button
        type="button"
        onClick={() => navigate(`/immo/property/${property.id}`)}
        className="w-full py-2 px-3 rounded-xl bg-[#0D281E] hover:bg-[#163e30] text-[#EBDCB8] text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
      >
        <span>Consulter cette annonce</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
