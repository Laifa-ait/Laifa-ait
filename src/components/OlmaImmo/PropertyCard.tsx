import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { PublicPropertyDTO, PropertyMapResult } from '../../types/realEstate';
import { isFavoritePropertyId, toggleFavoritePropertyId } from '../../utils/realEstateFavorites';
import {
  PropertyMedia,
  PropertyFavoriteButton,
} from './primitives';

export interface PropertyCardProps {
  property: PublicPropertyDTO | PropertyMapResult;
  onFavoriteToggle?: (id: string, isFav: boolean) => void;
  className?: string;
  isCompact?: boolean;
}

export const PropertyCardSkeleton: React.FC<{ isCompact?: boolean; className?: string }> = ({
  isCompact = false,
  className = '',
}) => (
  <div
    className={`bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col animate-pulse ${
      isCompact ? 'max-w-xs' : 'w-full'
    } ${className}`}
  >
    <div className="relative aspect-16/11 bg-slate-200" />
    <div className="p-5 flex-1 flex flex-col justify-between gap-3">
      <div className="space-y-2">
        <div className="h-5 bg-slate-200 rounded-xl w-3/4" />
        <div className="h-3.5 bg-slate-200 rounded-lg w-1/2" />
      </div>
      <div className="flex items-center gap-3 py-2 border-t border-slate-100">
        <div className="h-3.5 bg-slate-200 rounded-lg w-14" />
        <div className="h-3.5 bg-slate-200 rounded-lg w-12" />
        <div className="h-3.5 bg-slate-200 rounded-lg w-16" />
      </div>
      <div className="h-11 bg-slate-200 rounded-2xl w-full mt-1" />
    </div>
  </div>
);

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onFavoriteToggle,
  className = '',
  isCompact = false,
}) => {
  const [isFav, setIsFav] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

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

  const imagesList =
    'images' in property && Array.isArray(property.images) && property.images.length > 0
      ? property.images
      : 'mainImage' in property && property.mainImage
      ? [property.mainImage]
      : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'];

  const commune = 'location' in property ? property.location.commune : property.commune;
  const wilaya = 'location' in property ? property.location.wilaya : property.wilaya;

  // Build location string: e.g. "Oran, Les Falaises"
  const locationString = [wilaya, commune].filter(Boolean).join(', ') || 'Algérie';

  // Build specs string: e.g. "5 pces • 320 m² • 4 sdb"
  const specsParts: string[] = [];
  if (property.rooms) specsParts.push(`${property.rooms} pces`);
  if (property.areaSquareMeters) specsParts.push(`${property.areaSquareMeters} m²`);
  const bathrooms = 'bathrooms' in property && property.bathrooms ? property.bathrooms : undefined;
  if (bathrooms) specsParts.push(`${bathrooms} sdb`);

  // Format price: e.g. "45 000 000 DZD"
  const formattedPrice = `${new Intl.NumberFormat('fr-FR').format(property.price)} DZD${
    property.pricePeriod === 'month' ? ' / mois' : property.pricePeriod === 'night' ? ' / nuit' : ''
  }`;

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`group bg-white rounded-2xl overflow-hidden flex flex-col relative transition-all duration-200 ${
        isCompact ? 'max-w-xs' : 'w-full'
      } ${className}`}
    >
      <Link to={`/immo/property/${property.id}`} className="block focus:outline-none">
        {/* Radical Badge Removal: Completely pure image with only subtle Heart in top-right */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-100">
          <PropertyMedia
            alt={property.title}
            aspectRatio="16/11"
            images={imagesList}
            activeImageIndex={activeImageIdx}
            onSelectImageIndex={setActiveImageIdx}
            topActions={
              <PropertyFavoriteButton
                isFav={isFav}
                onClick={handleFavoriteClick}
                size="sm"
                variant="glass"
                className="bg-black/30 hover:bg-black/50 text-white backdrop-blur-xs border-0 shadow-none"
              />
            }
          />
        </div>

        {/* Metadata underneath the photo in refined slate/cool grey typography (image_7.png) */}
        <div className="pt-3 pb-2 px-1 flex flex-col gap-0.5">
          {/* Ligne 1 : Titre (Gras, sombre) */}
          <h3 className="font-bold text-[#1E293B] text-[15px] sm:text-base leading-snug line-clamp-1 group-hover:text-slate-600 transition-colors">
            {property.title}
          </h3>

          {/* Ligne 2 : Localisation (Gris moyen) */}
          <p className="text-xs sm:text-[13px] font-normal text-[#64748B] line-clamp-1">
            {locationString}
          </p>

          {/* Ligne 3 : Spécifications "5 pces • 320 m² • 4 sdb" (Gris clair/moyen avec puces) */}
          {specsParts.length > 0 && (
            <p className="text-xs font-normal text-[#94A3B8] tracking-normal pt-0.5">
              {specsParts.join(' • ')}
            </p>
          )}

          {/* Ligne 4 : Prix "45 000 000 DZD" (Noir/Charbon, mis en valeur mais sobre) */}
          <p className="text-sm sm:text-[15px] font-bold text-[#1E293B] tracking-tight pt-1">
            {formattedPrice}
          </p>
        </div>
      </Link>
    </motion.article>
  );
};
