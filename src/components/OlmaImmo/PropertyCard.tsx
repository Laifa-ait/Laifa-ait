import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize, Bed, Bath, Heart, Eye } from 'lucide-react';
import { Property, PropertyMapResult } from '../../types/realEstate';
import { isFavoritePropertyId, toggleFavoritePropertyId } from '../../utils/realEstateFavorites';

interface PropertyCardProps {
  property: Property | PropertyMapResult;
  onFavoriteToggle?: (id: string, isFav: boolean) => void;
  className?: string;
  isCompact?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onFavoriteToggle,
  className = '',
  isCompact = false,
}) => {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    setIsFav(isFavoritePropertyId(property.id));
  }, [property.id]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updatedFav = toggleFavoritePropertyId(property.id);
    setIsFav(updatedFav);
    if (onFavoriteToggle) {
      onFavoriteToggle(property.id, updatedFav);
    }
  };

  // Helper for listing type badge label
  const getListingBadge = (type: string) => {
    switch (type) {
      case 'sale':
        return { label: 'Vente', color: 'bg-emerald-600 text-white' };
      case 'rent_long':
        return { label: 'Location', color: 'bg-teal-600 text-white' };
      case 'rent_short':
        return { label: 'Séjour', color: 'bg-amber-600 text-white' };
      default:
        return { label: 'Immobilier', color: 'bg-slate-700 text-white' };
    }
  };

  // Helper for property type label
  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case 'apartment':
        return 'Appartement';
      case 'villa':
        return 'Villa';
      case 'studio':
        return 'Studio';
      case 'commercial':
        return 'Local Commercial';
      case 'land':
        return 'Terrain';
      default:
        return type;
    }
  };

  // Format price display in DZD
  const formatPrice = (price: number, period?: string) => {
    const formatted = new Intl.NumberFormat('fr-DZ', {
      maximumFractionDigits: 0,
    }).format(price);

    let periodSuffix = '';
    if (period === 'night') periodSuffix = ' / nuit';
    else if (period === 'month') periodSuffix = ' / mois';

    return `${formatted} DA${periodSuffix}`;
  };

  const imageSrc =
    'mainImage' in property && property.mainImage
      ? property.mainImage
      : 'images' in property && property.images && property.images.length > 0
      ? property.images[0]
      : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

  const listingBadge = getListingBadge(property.listingType);

  const commune = 'location' in property ? property.location.commune : property.commune;
  const wilaya = 'location' in property ? property.location.wilaya : property.wilaya;

  return (
    <div
      className={`group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col ${
        isCompact ? 'max-w-xs' : 'w-full'
      } ${className}`}
    >
      {/* Image Thumbnail Container */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        <img
          src={imageSrc}
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Top Heart Badge overlay */}
        <div className="absolute top-3 right-3 pointer-events-none">
          <button
            onClick={handleFavoriteClick}
            aria-label="Ajouter aux favoris"
            className="pointer-events-auto p-2 rounded-full bg-white text-slate-800 shadow-md hover:scale-110 transition-all active:scale-95 cursor-pointer flex items-center justify-center min-w-[38px] min-h-[38px]"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFav ? 'fill-rose-600 text-rose-600' : 'text-slate-700'
              }`}
            />
          </button>
        </div>

        {/* Price Tag Overlay at Bottom Left of Image */}
        <div className="absolute bottom-3 left-3 bg-[#1e3835]/95 backdrop-blur-md text-white px-3 py-1.5 rounded-xl font-bold text-sm shadow-md">
          <span>{formatPrice(property.price, property.pricePeriod)}</span>
        </div>
      </div>

      {/* Card Details Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between gap-1.5">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-[#1e3835] transition-colors">
              {property.title}
            </h3>
            <span className="w-4 h-4 rounded-full bg-[#1e3835] text-white flex items-center justify-center text-[9px] shrink-0" title="Annonce vérifiée">
              ✓
            </span>
          </div>

          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            {commune} · {wilaya}
          </p>
        </div>

        <p className="text-slate-600 text-xs mt-1 font-normal">
          {property.rooms ? `${property.rooms} chambres` : 'Non précisé'} · {'bathrooms' in property && property.bathrooms ? `${property.bathrooms} sdb` : '1 sdb'} · {property.areaSquareMeters} m²
        </p>

        {/* View Details Link */}
        <Link
          to={`/immo/property/${property.id}`}
          className="mt-2 w-full text-center py-2 px-3 bg-[#f2eee5] hover:bg-[#1e3835] text-[#1e3835] hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer"
        >
          Voir l'annonce
        </Link>
      </div>
    </div>
  );
};
