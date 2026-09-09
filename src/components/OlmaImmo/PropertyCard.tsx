import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { PublicPropertyDTO, PropertyMapResult, LegalPaperType } from '../../types/realEstate';
import { isFavoritePropertyId, toggleFavoritePropertyId } from '../../utils/realEstateFavorites';
import {
  OlmaButton,
  OlmaPill,
  PropertyMedia,
  PropertyPrice,
  PropertyLocation,
  PropertyMeta,
  PropertyFavoriteButton,
  PropertyBadge,
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
    className={`bg-white rounded-3xl border border-[#E8E2D4] shadow-xs overflow-hidden flex flex-col animate-pulse ${
      isCompact ? 'max-w-xs' : 'w-full'
    } ${className}`}
  >
    <div className="relative aspect-16/11 bg-stone-200" />
    <div className="p-5 flex-1 flex flex-col justify-between gap-3">
      <div className="space-y-2">
        <div className="h-5 bg-stone-200 rounded-xl w-3/4" />
        <div className="h-3.5 bg-stone-200 rounded-lg w-1/2" />
      </div>
      <div className="flex items-center gap-3 py-2 border-t border-stone-100">
        <div className="h-3.5 bg-stone-200 rounded-lg w-14" />
        <div className="h-3.5 bg-stone-200 rounded-lg w-12" />
        <div className="h-3.5 bg-stone-200 rounded-lg w-16" />
      </div>
      <div className="h-11 bg-stone-200 rounded-2xl w-full mt-1" />
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

  const legalPapersList: LegalPaperType[] =
    'legalPapers' in property && Array.isArray(property.legalPapers) && property.legalPapers.length > 0
      ? property.legalPapers
      : property.legalPaperType
      ? [property.legalPaperType]
      : [];

  const isNegotiable = 'isPriceNegotiable' in property ? Boolean(property.isPriceNegotiable) : false;
  const advanceMonths =
    'paymentAdvanceMonths' in property && property.paymentAdvanceMonths && property.listingType === 'rent_long'
      ? property.paymentAdvanceMonths
      : undefined;

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`group bg-white rounded-3xl border border-[#E6E0D4] shadow-[0_4px_20px_rgba(26,56,49,0.05)] hover:shadow-[0_20px_45px_rgba(13,40,30,0.12)] transition-all duration-300 overflow-hidden flex flex-col relative ${
        isCompact ? 'max-w-xs' : 'w-full'
      } ${className}`}
    >
      {/* Immersive Photo Frame with Scrim & Sub-primitives */}
      <PropertyMedia
        alt={property.title}
        aspectRatio="16/11"
        images={imagesList}
        activeImageIndex={activeImageIdx}
        onSelectImageIndex={setActiveImageIdx}
        topBadges={
          <>
            <PropertyBadge type="listingType" value={property.listingType} size="sm" />

            {isNegotiable && (
              <OlmaPill variant="warning" size="sm" className="shadow-xs uppercase tracking-wider font-extrabold text-[10px]">
                Négociable 🤝
              </OlmaPill>
            )}

            {advanceMonths && (
              <OlmaPill variant="brand" size="sm" className="shadow-xs uppercase tracking-wider font-extrabold text-[10px]">
                Avance {advanceMonths}M
              </OlmaPill>
            )}

            {legalPapersList.slice(0, 2).map((paperType) => (
              <PropertyBadge key={paperType} type="legalPaper" value={paperType} size="sm" />
            ))}
          </>
        }
        topActions={
          <PropertyFavoriteButton
            isFav={isFav}
            onClick={handleFavoriteClick}
            size="md"
            variant="glass"
          />
        }
        bottomOverlay={
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-2xl bg-[#0D281E]/95 backdrop-blur-md border border-[#EBDCB8]/30 shadow-lg">
            <PropertyPrice
              price={property.price}
              period={property.pricePeriod}
              listingType={property.listingType}
              variant="light"
              size="md"
            />
          </div>
        }
      />

      {/* Card Body Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3 bg-white">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-extrabold text-[#0D281E] text-base leading-snug line-clamp-1 group-hover:text-emerald-700 transition-colors font-['Playfair_Display',serif]">
              {property.title}
            </h3>
            <span title="Bien vérifié Olmart" className="inline-flex shrink-0 text-emerald-600 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>

          <PropertyLocation
            commune={commune}
            wilaya={wilaya}
            size="sm"
            variant="muted"
            className="mt-1"
          />
        </div>

        {/* Specifications Matrix */}
        <PropertyMeta
          rooms={property.rooms}
          bathrooms={'bathrooms' in property ? property.bathrooms : 1}
          areaSquareMeters={property.areaSquareMeters}
          layout="bar"
          size="sm"
        />

        {/* Tactile CTA Button */}
        <OlmaButton
          as={Link}
          to={`/immo/property/${property.id}`}
          variant="dark"
          size="md"
          fullWidth
          rightIcon={
            <ArrowRight className="w-4 h-4 text-[var(--olma-brand-highlight)] transition-transform group-hover:translate-x-1" />
          }
        >
          Consulter le bien
        </OlmaButton>
      </div>
    </motion.article>
  );
};
