import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Share2, Eye } from 'lucide-react';
import { PublicPropertyDTO, LegalPaperType } from '../../../types/realEstate';
import {
  PropertyBadge,
  PropertyLocation,
  PropertyPrice,
  PropertyFavoriteButton,
  OlmaPill,
} from '../primitives';

interface DetailHeaderProps {
  property: PublicPropertyDTO;
  isFav: boolean;
  onFavoriteClick: () => void;
  onShare: () => void;
}

export const DetailHeader: React.FC<DetailHeaderProps> = ({
  property,
  isFav,
  onFavoriteClick,
  onShare,
}) => {
  const legalPapersList: LegalPaperType[] =
    Array.isArray(property.legalPapers) && property.legalPapers.length > 0
      ? property.legalPapers
      : property.legalPaperType
      ? [property.legalPaperType]
      : [];

  const propertyTypeLabel = React.useMemo(() => {
    switch (property.propertyType) {
      case 'apartment': return 'Appartement';
      case 'villa': return 'Villa';
      case 'studio': return 'Studio';
      case 'commercial': return 'Local Commercial';
      default: return property.propertyType;
    }
  }, [property.propertyType]);

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/immo"
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-700 hover:text-[#1E3A8A] bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-2xs hover:shadow-xs transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-[#1E3A8A]" />
          <span>Explorer les annonces</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onShare}
            className="p-2.5 bg-white border border-slate-200 text-stone-700 hover:bg-slate-50 rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
            title="Partager l'annonce"
            aria-label="Partager l'annonce"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <PropertyFavoriteButton
            isFav={isFav}
            onClick={onFavoriteClick}
            variant="solid"
            size="md"
          />
        </div>
      </div>

      {/* Main title & Price card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <PropertyBadge type="listingType" value={property.listingType} size="md" />

            <OlmaPill variant="highlight" size="md">
              {propertyTypeLabel}
            </OlmaPill>

            {/* Papiers Fonciers DZ Official Badges (groupés proprement) */}
            {legalPapersList.slice(0, 2).map((paperType) => (
              <PropertyBadge key={paperType} type="legalPaper" value={paperType} size="md" />
            ))}

            {legalPapersList.length > 2 && (
              <span className="px-2.5 py-1 bg-blue-50 text-[#1E3A8A] border border-blue-200 rounded-full text-xs font-semibold">
                +{legalPapersList.length - 2} autres titres
              </span>
            )}

            {property.isLegalVerified && (
              <PropertyBadge type="verified" size="md" />
            )}

            <span className="px-3 py-1 bg-stone-50 text-stone-500 text-xs rounded-full flex items-center gap-1.5 border border-stone-200">
              <Eye className="w-3.5 h-3.5 text-stone-400" />
              <span>{property.viewsCount || 1} vues</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1E3A8A] font-['Playfair_Display',serif] leading-tight">
            {property.title}
          </h1>

          <PropertyLocation
            commune={property.location.commune}
            wilaya={property.location.wilaya}
            address={property.location.address}
            showAddress
            size="md"
            variant="default"
          />
        </div>

        <div className="bg-[#1E3A8A] text-white px-7 py-5 rounded-2xl shadow-md shrink-0 text-left lg:text-right border border-blue-900">
          <span className="block text-[10px] text-amber-300 uppercase font-bold tracking-widest mb-1">
            Prix demandé
          </span>
          <PropertyPrice
            price={property.price}
            period={property.pricePeriod}
            listingType={property.listingType}
            variant="light"
            size="xl"
          />
          {property.pricePeriod && (
            <span className="block text-[11px] text-stone-300 font-medium mt-1">
              Disponibilité immédiate
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
