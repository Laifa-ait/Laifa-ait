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

        {/* Top Badges overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-md uppercase tracking-wider ${listingBadge.color}`}
            >
              {listingBadge.label}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900/70 backdrop-blur-md text-white shadow-md">
              {getPropertyTypeLabel(property.propertyType)}
            </span>
          </div>

          <button
            onClick={handleFavoriteClick}
            aria-label="Ajouter aux favoris"
            className="pointer-events-auto p-2.5 rounded-full bg-white/90 backdrop-blur-md text-slate-700 hover:text-rose-600 shadow-md transition-all active:scale-90 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-600 hover:text-rose-500'
              }`}
            />
          </button>
        </div>

        {/* Price Tag Overlay at Bottom of Image */}
        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-1">
          <span className="text-emerald-400 font-extrabold">{formatPrice(property.price, property.pricePeriod)}</span>
        </div>
      </div>

      {/* Card Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900 text-base line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {property.title}
          </h3>

          <div className="flex items-center text-slate-500 text-xs mt-1.5">
            <MapPin className="w-3.5 h-3.5 me-1 text-emerald-600 shrink-0" />
            <span className="truncate font-medium">
              {commune}, {wilaya}
            </span>
            {'distanceKm' in property && typeof property.distanceKm === 'number' && (
              <span className="ms-auto text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md">
                {property.distanceKm < 1 ? `${Math.round(property.distanceKm * 1000)} m` : `${property.distanceKm.toFixed(1)} km`}
              </span>
            )}
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <Bed className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-800">{property.rooms ? `F${property.rooms}` : 'N/A'}</span>
          </div>

          <div className="flex items-center gap-1">
            <Maximize className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-800">{property.areaSquareMeters} m²</span>
          </div>

          <div className="flex items-center gap-1 justify-end">
            {'bathrooms' in property && property.bathrooms ? (
              <>
                <Bath className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-800">{property.bathrooms} sdb</span>
              </>
            ) : 'viewsCount' in property ? (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-800">{property.viewsCount} vues</span>
              </>
            ) : (
              <span className="text-slate-400">-</span>
            )}
          </div>
        </div>

        {/* View Details Link */}
        <Link
          to={`/immo/property/${property.id}`}
          className="w-full text-center py-2.5 px-4 bg-slate-50 hover:bg-emerald-600 text-slate-700 hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          Voir l'annonce
        </Link>
      </div>
    </div>
  );
};
