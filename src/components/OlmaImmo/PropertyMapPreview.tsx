import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize, Bed, Bath, Heart, X, ArrowUpRight } from 'lucide-react';
import { Property, PropertyMapResult } from '../../types/realEstate';
import { isFavoritePropertyId, toggleFavoritePropertyId } from '../../utils/realEstateFavorites';

interface PropertyMapPreviewProps {
  property: Property | PropertyMapResult;
  onClose?: () => void;
  className?: string;
}

export const PropertyMapPreview: React.FC<PropertyMapPreviewProps> = ({
  property,
  onClose,
  className = '',
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsFavorite(isFavoritePropertyId(property.id));
  }, [property.id]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(toggleFavoritePropertyId(property.id));
  };

  const imageUrl =
    'images' in property && property.images && property.images.length > 0
      ? property.images[0]
      : 'mainImage' in property && property.mainImage
      ? property.mainImage
      : 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80';

  const formatPrice = (price: number, period?: string) => {
    const formatted = new Intl.NumberFormat('fr-DZ').format(price);
    if (period === 'night') return `${formatted} DZD / nuit`;
    if (period === 'month') return `${formatted} DZD / mois`;
    return `${formatted} DZD`;
  };

  const getListingBadge = (type: string) => {
    switch (type) {
      case 'sale':
        return { label: 'Vente', bg: 'bg-emerald-700 text-white' };
      case 'rent_long':
        return { label: 'Location', bg: 'bg-teal-700 text-white' };
      case 'rent_short':
        return { label: 'Séjour', bg: 'bg-amber-600 text-white' };
      default:
        return { label: 'Immo', bg: 'bg-slate-800 text-white' };
    }
  };

  const badge = getListingBadge(property.listingType);
  const commune = 'location' in property ? property.location.commune : property.commune;
  const wilaya = 'location' in property ? property.location.wilaya : property.wilaya;
  const bathrooms = 'bathrooms' in property ? property.bathrooms : 1;

  return (
    <div
      className={`bg-white rounded-2xl shadow-2xl border border-[#d8d2c4] overflow-hidden flex flex-col sm:flex-row w-full backdrop-blur-md bg-white/98 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300 ${className}`}
    >
      {/* Thumbnail Container */}
      <div className="relative w-full sm:w-36 sm:min-w-[144px] h-32 sm:h-auto shrink-0 bg-slate-100 overflow-hidden">
        <img loading="lazy" decoding="async" src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80';
          }}
        />
        {/* Listing Type Badge */}
        <span
          className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm ${badge.bg}`}
        >
          {badge.label}
        </span>

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          aria-label="Ajouter aux favoris"
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/95 text-slate-800 shadow-md hover:scale-110 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
            }`}
          />
        </button>
      </div>

      {/* Info Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between gap-1.5">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-bold text-[#1c211e] text-sm line-clamp-1 font-['Playfair_Display',serif]">
              {property.title}
            </h4>
            {onClose && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                }}
                aria-label="Fermer"
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-[#f2eee5] transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <p className="text-[#1e3835] font-black text-sm mt-0.5">
            {formatPrice(property.price, property.pricePeriod)}
          </p>

          <p className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1 line-clamp-1">
            <MapPin className="w-3 h-3 text-[#1e3835] shrink-0" />
            <span>
              {commune}, {wilaya}
            </span>
          </p>
        </div>

        {/* Features & Action */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#f0ece3] gap-2">
          <div className="flex items-center gap-2.5 text-slate-600 text-[11px] font-medium">
            {property.rooms > 0 && (
              <span className="flex items-center gap-1" title="Chambres">
                <Bed className="w-3.5 h-3.5 text-slate-400" /> {property.rooms}
              </span>
            )}
            {bathrooms > 0 && (
              <span className="flex items-center gap-1" title="Salles de bain">
                <Bath className="w-3.5 h-3.5 text-slate-400" /> {bathrooms}
              </span>
            )}
            {property.areaSquareMeters > 0 && (
              <span className="flex items-center gap-1" title="Surface">
                <Maximize className="w-3.5 h-3.5 text-slate-400" /> {property.areaSquareMeters} m²
              </span>
            )}
          </div>

          <Link
            to={`/immo/property/${property.id}`}
            className="px-3 py-1.5 bg-[#1e3835] hover:bg-[#152725] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>Voir l'annonce</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
