import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Maximize2, Heart, CheckCircle2, Camera, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Property, PropertyMapResult } from '../../types/realEstate';
import { isFavoritePropertyId, toggleFavoritePropertyId } from '../../utils/realEstateFavorites';

interface PropertyCardProps {
  property: Property | PropertyMapResult;
  onFavoriteToggle?: (id: string, isFav: boolean) => void;
  className?: string;
  isCompact?: boolean;
}

export const PropertyCardSkeleton: React.FC<{ isCompact?: boolean; className?: string }> = ({
  isCompact = false,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden flex flex-col animate-pulse ${
        isCompact ? 'max-w-xs' : 'w-full'
      } ${className}`}
    >
      <div className="relative aspect-[16/11] bg-stone-200" />
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-2">
          <div className="h-5 bg-stone-200 rounded-xl w-3/4" />
          <div className="h-3.5 bg-stone-200 rounded-lg w-1/2" />
        </div>
        <div className="flex items-center gap-3 py-1">
          <div className="h-3.5 bg-stone-200 rounded-lg w-14" />
          <div className="h-3.5 bg-stone-200 rounded-lg w-12" />
          <div className="h-3.5 bg-stone-200 rounded-lg w-16" />
        </div>
        <div className="h-10 bg-stone-200 rounded-2xl w-full mt-1" />
      </div>
    </div>
  );
};

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
        return 'Vente';
      case 'rent_long':
        return 'Location';
      case 'rent_short':
        return 'Séjour & Vacances';
      default:
        return 'Immobilier';
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

  const photoCount =
    'images' in property && Array.isArray(property.images) && property.images.length > 0
      ? property.images.length
      : 1;

  const listingLabel = getListingBadge(property.listingType);
  const commune = 'location' in property ? property.location.commune : property.commune;
  const wilaya = 'location' in property ? property.location.wilaya : property.wilaya;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`group bg-white rounded-3xl border border-stone-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(249,115,22,0.14)] transition-all duration-300 overflow-hidden flex flex-col ${
        isCompact ? 'max-w-xs' : 'w-full'
      } ${className}`}
    >
      {/* Immersive Photo Container with Dark Gradient Scrim */}
      <div className="relative aspect-[16/11] bg-stone-100 overflow-hidden">
        <img
          src={imageSrc}
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Ambient Bottom Gradient for High Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/20 to-transparent pointer-events-none" />

        {/* Top-Left: Translucent Warm Capsule Badge */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className="bg-amber-500/90 backdrop-blur-md text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-white/20">
            {listingLabel}
          </span>
        </div>

        {/* Top-Right: Floating Glass Heart Favorite Button with Elastic Beat on Tap */}
        <div className="absolute top-3 right-3 pointer-events-none">
          <motion.button
            whileTap={{ scale: 1.25 }}
            whileHover={{ scale: 1.1 }}
            onClick={handleFavoriteClick}
            aria-label="Ajouter aux favoris"
            className="pointer-events-auto w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-stone-700 hover:text-rose-500 hover:bg-white transition-colors shadow-md cursor-pointer flex items-center justify-center border-none"
          >
            <motion.div
              animate={{ scale: isFav ? [1, 1.35, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFav ? 'text-rose-500 fill-rose-500' : 'text-stone-700'
                }`}
              />
            </motion.div>
          </motion.button>
        </div>

        {/* Bottom-Left Overlay: Luxury Dark Price Badge with Solar Gold text */}
        <div className="absolute bottom-3 left-3 bg-stone-950/80 backdrop-blur-md text-amber-300 font-extrabold text-sm sm:text-base px-3.5 py-1.5 rounded-2xl border border-white/10 shadow-md">
          <span>{formatPrice(property.price, property.pricePeriod)}</span>
        </div>

        {/* Bottom-Right Overlay: Minimalist Photo Counter */}
        <div className="absolute bottom-3 right-3 bg-stone-900/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full border border-white/10 shadow-sm flex items-center gap-1">
          <Camera className="w-3 h-3 text-stone-300" />
          <span>1/{photoCount}</span>
        </div>
      </div>

      {/* Card Details Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-center justify-between gap-1.5">
            <h3 className="font-bold text-stone-900 text-base leading-snug line-clamp-1 group-hover:text-orange-600 transition-colors font-['Poppins',sans-serif]">
              {property.title}
            </h3>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" title="Vérifié par Olma" />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mt-1">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>{commune} · {wilaya}</span>
          </div>
        </div>

        {/* Characteristics Indicators with Micro-icons */}
        <div className="flex items-center gap-2.5 text-xs text-stone-600 font-medium py-1.5 border-t border-stone-100">
          <span className="flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5 text-orange-500" />
            {property.rooms ? `${property.rooms} ch.` : '1 ch.'}
          </span>
          <span className="text-stone-300">·</span>
          <span className="flex items-center gap-1">
            <Bath className="w-3.5 h-3.5 text-orange-500" />
            {'bathrooms' in property && property.bathrooms ? `${property.bathrooms} sdb` : '1 sdb'}
          </span>
          <span className="text-stone-300">·</span>
          <span className="flex items-center gap-1">
            <Maximize2 className="w-3.5 h-3.5 text-orange-500" />
            {property.areaSquareMeters} m²
          </span>
        </div>

        {/* High-Conversion Deep Gradient CTA Button */}
        <Link
          to={`/immo/property/${property.id}`}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white font-semibold text-xs sm:text-sm text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:from-orange-600 hover:to-rose-600 transition-all duration-300 active:scale-[0.98]"
        >
          <span>Voir l'annonce</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </motion.div>
  );
};

