import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Maximize2, Heart, CheckCircle2, Camera, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Property, PropertyMapResult, LegalPaperType } from '../../types/realEstate';
import { isFavoritePropertyId, toggleFavoritePropertyId } from '../../utils/realEstateFavorites';
import { getLegalPaperInfo } from '../../constants/legalPapers';

interface PropertyCardProps {
  property: Property | PropertyMapResult;
  onFavoriteToggle?: (id: string, isFav: boolean) => void;
  className?: string;
  isCompact?: boolean;
}

export const PropertyCardSkeleton: React.FC<{ isCompact?: boolean; className?: string }> = ({
  isCompact = false,
  className = '',
}) => (
  <div className={`bg-white rounded-3xl border border-[#E8E2D4] shadow-xs overflow-hidden flex flex-col animate-pulse ${isCompact ? 'max-w-xs' : 'w-full'} ${className}`}>
    <div className="relative aspect-[16/11] bg-stone-200" />
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
      : 'mainImage' in property && property.mainImage ? [property.mainImage]
      : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'];

  const currentImage = imagesList[activeImageIdx] || imagesList[0];

  const getListingBadge = (type: string) => {
    if (type === 'sale') return { label: 'Vente', bg: 'bg-[#0D281E] text-[#EBDCB8] border-[#EBDCB8]/30' };
    if (type === 'rent_long') return { label: 'Location', bg: 'bg-emerald-800 text-white border-white/20' };
    if (type === 'rent_short') return { label: 'Séjour & Vacances', bg: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-white/20' };
    return { label: 'Immobilier', bg: 'bg-stone-800 text-white border-white/20' };
  };

  const formatPrice = (price: number, period?: string) => {
    const formatted = new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(price);
    const suffix = period === 'night' ? ' / nuit' : period === 'month' ? ' / mois' : '';
    return `${formatted} DA${suffix}`;
  };

  const badge = getListingBadge(property.listingType);
  const commune = 'location' in property ? property.location.commune : property.commune;
  const wilaya = 'location' in property ? property.location.wilaya : property.wilaya;

  const legalPapersList: LegalPaperType[] =
    'legalPapers' in property && Array.isArray(property.legalPapers) && property.legalPapers.length > 0
      ? property.legalPapers
      : (property.legalPaperType ? [property.legalPaperType] : []);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`group bg-white rounded-3xl border border-[#E6E0D4] shadow-[0_4px_20px_rgba(26,56,49,0.05)] hover:shadow-[0_20px_45px_rgba(13,40,30,0.12)] transition-all duration-300 overflow-hidden flex flex-col relative ${
        isCompact ? 'max-w-xs' : 'w-full'
      } ${className}`}
    >
      {/* Immersive Photo Frame with Scrim & Multi-Indicators */}
      <div className="relative aspect-[16/11] bg-stone-100 overflow-hidden">
        <img
          src={currentImage}
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Ambient Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-stone-950/10 pointer-events-none" />

        {/* Top-Left: High-Grade Badges (Type, Financials, Legal) */}
        <div className="absolute top-3 left-3 pointer-events-none flex flex-wrap gap-1.5 max-w-[78%]">
          <span className={`backdrop-blur-md font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border ${badge.bg}`}>
            {badge.label}
          </span>

          {'isPriceNegotiable' in property && property.isPriceNegotiable && (
            <span className="bg-[#B45309]/95 backdrop-blur-md text-amber-100 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm border border-amber-300/30">
              Négociable 🤝
            </span>
          )}

          {'paymentAdvanceMonths' in property && property.paymentAdvanceMonths && property.listingType === 'rent_long' && (
            <span className="bg-[#0D281E]/95 backdrop-blur-md text-[#EBDCB8] font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm border border-[#EBDCB8]/30">
              Avance {property.paymentAdvanceMonths}M
            </span>
          )}

          {legalPapersList.slice(0, 2).map((paperType) => {
            const info = getLegalPaperInfo(paperType);
            if (!info) return null;
            return (
              <span
                key={paperType}
                title={info.label}
                className={`backdrop-blur-md font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm border flex items-center gap-1 ${
                  info.isVerifiedLegal
                    ? 'bg-emerald-700/95 text-white border-white/20'
                    : 'bg-stone-800/90 text-stone-200 border-white/10'
                }`}
              >
                <ShieldCheck className="w-3 h-3 shrink-0 text-emerald-300" />
                <span>{info.shortLabel}</span>
              </span>
            );
          })}
        </div>

        {/* Top-Right: Tactile Glass Favorite Button */}
        <div className="absolute top-3 right-3">
          <motion.button
            whileTap={{ scale: 1.25 }}
            whileHover={{ scale: 1.1 }}
            onClick={handleFavoriteClick}
            aria-label="Ajouter aux favoris"
            className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md text-stone-700 hover:text-rose-500 hover:bg-white transition-all shadow-md cursor-pointer flex items-center justify-center border border-white/40"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFav ? 'text-rose-500 fill-rose-500' : 'text-stone-700'
              }`}
            />
          </motion.button>
        </div>

        {/* Bottom-Left Overlay: Luxury Price Tag */}
        <div className="absolute bottom-3 left-3 bg-[#0D281E]/95 backdrop-blur-md text-[#EBDCB8] font-extrabold text-sm sm:text-base px-3.5 py-1.5 rounded-2xl border border-[#EBDCB8]/30 shadow-lg">
          <span>{formatPrice(property.price, property.pricePeriod)}</span>
        </div>

        {/* Bottom-Right Overlay: Photos Counter */}
        <div className="absolute bottom-3 right-3 bg-stone-900/70 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full border border-white/10 shadow-xs flex items-center gap-1">
          <Camera className="w-3 h-3 text-stone-300" />
          <span>{imagesList.length} photos</span>
        </div>

        {/* Multi-Photo Carousel Dot Pager (on hover) */}
        {imagesList.length > 1 && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            {imagesList.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveImageIdx(idx);
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  activeImageIdx === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </div>

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

          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mt-1">
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{commune} · Wilaya de {wilaya}</span>
          </div>
        </div>

        {/* Specifications Matrix */}
        <div className="flex items-center justify-between text-xs text-stone-600 font-medium py-2 px-3 rounded-xl bg-[#FAF8F5] border border-[#EDE7DC]">
          <span className="flex items-center gap-1.5">
            <BedDouble className="w-3.5 h-3.5 text-emerald-700" />
            <span>{property.rooms ? `${property.rooms} ch.` : '1 ch.'}</span>
          </span>
          <span className="text-stone-300">|</span>
          <span className="flex items-center gap-1.5">
            <Bath className="w-3.5 h-3.5 text-emerald-700" />
            <span>{'bathrooms' in property && property.bathrooms ? `${property.bathrooms} sdb` : '1 sdb'}</span>
          </span>
          <span className="text-stone-300">|</span>
          <span className="flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>{property.areaSquareMeters} m²</span>
          </span>
        </div>

        {/* Revolutionary Tactile CTA Button */}
        <Link to={`/immo/property/${property.id}`} className="w-full py-3 rounded-2xl bg-[#0D281E] hover:bg-[#153e31] text-[#EBDCB8] font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_16px_rgba(13,40,30,0.2)] border border-[#EBDCB8]/20 transition-all duration-300 active:scale-[0.98]">
          <span>Consulter le bien</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-amber-400" />
        </Link>
      </div>
    </motion.div>
  );
};


