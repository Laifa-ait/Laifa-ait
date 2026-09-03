import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Share2, Heart, MapPin, ShieldCheck, Eye, CheckCircle2 } from 'lucide-react';
import { Property } from '../../../types/realEstate';
import { getLegalPaperInfo } from '../../../constants/legalPapers';

interface DetailHeaderProps {
  property: Property;
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
  const formatPrice = (price: number, period?: string) => {
    const formatted = new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(price);
    let suffix = '';
    if (period === 'night') suffix = ' / nuit';
    else if (period === 'month') suffix = ' / mois';
    return `${formatted} DA${suffix}`;
  };

  const getListingTypeLabel = (type: string) => {
    switch (type) {
      case 'sale': return 'Vente';
      case 'rent_long': return 'Location';
      case 'rent_short': return 'Séjour / Vacances';
      default: return type;
    }
  };

  const legalPapersList = Array.isArray(property.legalPapers) && property.legalPapers.length > 0
    ? property.legalPapers
    : (property.legalPaperType ? [property.legalPaperType] : []);

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/immo"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#1a3831] bg-white border border-[#e8e2d4] px-4 py-2.5 rounded-xl shadow-2xs hover:shadow-xs transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-[#1a3831]" />
          <span>Explorer les annonces</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onShare}
            className="p-2.5 bg-white border border-[#e8e2d4] text-slate-700 hover:bg-[#faf8f5] rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center hover:scale-105"
            title="Partager l'annonce"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onFavoriteClick}
            className={`p-2.5 border rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center hover:scale-105 ${
              isFav
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-[#e8e2d4] text-slate-700 hover:bg-[#faf8f5]'
            }`}
            title="Ajouter aux favoris"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main title & Price card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e2d4] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3.5 py-1 bg-[#1a3831] text-[#ebdcb8] font-black text-[11px] rounded-full uppercase tracking-wider shadow-2xs">
              {getListingTypeLabel(property.listingType)}
            </span>

            <span className="px-3 py-1 bg-[#f4ecd8] text-[#1a3831] font-bold text-xs rounded-full capitalize border border-[#ebdcb8]">
              {property.propertyType === 'apartment' ? 'Appartement' : property.propertyType === 'villa' ? 'Villa' : property.propertyType === 'studio' ? 'Studio' : property.propertyType === 'commercial' ? 'Local Commercial' : property.propertyType}
            </span>

            {/* Papiers Fonciers DZ Official Badges */}
            {legalPapersList.map((paperType) => {
              const info = getLegalPaperInfo(paperType);
              if (!info) return null;
              return (
                <span
                  key={paperType}
                  className={`px-3 py-1 font-bold text-xs rounded-full flex items-center gap-1.5 border shadow-2xs ${info.badgeBg} ${info.badgeText} ${info.badgeBorder}`}
                  title={info.description}
                >
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>{info.label}</span>
                </span>
              );
            })}

            {property.isLegalVerified && (
              <span className="px-3 py-1 font-bold text-xs rounded-full flex items-center gap-1.5 border shadow-2xs bg-emerald-100 text-emerald-800 border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Dossier Vérifié Olmart</span>
              </span>
            )}

            <span className="px-3 py-1 bg-slate-50 text-slate-500 text-xs rounded-full flex items-center gap-1.5 border border-slate-200">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              {property.viewsCount || 1} vues
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1a3831] font-['Playfair_Display',serif] leading-tight">
            {property.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1.5 font-medium">
            <MapPin className="w-4 h-4 text-[#1a3831] shrink-0" />
            <span>{property.location.commune}, Wilaya de {property.location.wilaya}</span>
            {property.location.address && (
              <span className="text-slate-400">({property.location.address})</span>
            )}
          </p>
        </div>

        <div className="bg-[#1a3831] text-white px-7 py-5 rounded-2xl shadow-md shrink-0 text-left lg:text-right border border-[#274b42]">
          <span className="block text-[10px] text-[#ebdcb8] uppercase font-bold tracking-widest mb-1">
            Prix demandé
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white">
            {formatPrice(property.price, property.pricePeriod)}
          </span>
          {property.pricePeriod && (
            <span className="block text-[11px] text-slate-300 font-medium mt-1">
              Disponibilité immédiate
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
