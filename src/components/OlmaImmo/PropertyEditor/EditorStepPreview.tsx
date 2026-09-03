import React from 'react';
import { Eye, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { PropertyType, ListingType, GeoPointLocation, LegalPaperType } from '../../../types/realEstate';
import { getLegalPaperInfo } from '../../../constants/legalPapers';

interface EditorStepPreviewProps {
  title: string;
  description: string;
  listingType: ListingType;
  propertyType: PropertyType;
  legalPaperType?: LegalPaperType;
  location: GeoPointLocation;
  price: number;
  pricePeriod: 'night' | 'month' | 'total';
  rooms: number;
  areaSquareMeters: number;
  bathrooms: number;
  images: string[];
  features: string[];
  contactPhone: string;
}

export const EditorStepPreview: React.FC<EditorStepPreviewProps> = ({
  title,
  description,
  listingType,
  propertyType,
  legalPaperType,
  location,
  price,
  pricePeriod,
  rooms,
  areaSquareMeters,
  bathrooms,
  images,
  features,
  contactPhone,
}) => {
  const legalPaperInfo = getLegalPaperInfo(legalPaperType);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e2d4] shadow-xs space-y-6">
      <div>
        <h3 className="text-xl font-bold text-[#1a3831] font-['Playfair_Display',serif] flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#1a3831]" />
          <span>Aperçu avant publication</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Vérifiez l'ensemble des informations de votre annonce.
        </p>
      </div>

      <div className="bg-[#faf8f5] rounded-3xl border border-[#e8e2d4] overflow-hidden">
        {/* Photo Header */}
        <div className="relative aspect-16/9 sm:aspect-21/9 bg-slate-900 overflow-hidden">
          <img loading="lazy" decoding="async" src={images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'}
            alt="Aperçu annonce"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
            <span className="px-3 py-1 bg-[#1a3831] text-[#ebdcb8] text-xs font-black rounded-full uppercase tracking-wider">
              {listingType === 'sale' ? 'Vente' : listingType === 'rent_long' ? 'Location' : 'Séjour'}
            </span>
            <span className="px-3 py-1 bg-[#f4ecd8] text-[#1a3831] text-xs font-bold rounded-full capitalize">
              {propertyType}
            </span>
            {legalPaperInfo && (
              <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 shadow-xs border ${legalPaperInfo.badgeBg} ${legalPaperInfo.badgeText} ${legalPaperInfo.badgeBorder}`}>
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>{legalPaperInfo.shortLabel}</span>
              </span>
            )}
          </div>

          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-xs text-[#1a3831] px-4 py-2 rounded-2xl shadow-md">
            <span className="text-lg font-black">{new Intl.NumberFormat('fr-DZ').format(price)} DA</span>
            {pricePeriod === 'month' && <span className="text-xs"> / mois</span>}
            {pricePeriod === 'night' && <span className="text-xs"> / nuit</span>}
          </div>
        </div>

        {/* Info Body */}
        <div className="p-6 space-y-4">
          <div>
            <h4 className="text-xl font-bold text-[#1a3831] font-['Playfair_Display',serif]">
              {title || 'Titre de votre annonce'}
            </h4>
            <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#1a3831]" />
              <span>{location.commune}, Wilaya de {location.wilaya}</span>
            </p>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-3 gap-3 text-center py-3 border-y border-[#e8e2d4]">
            <div>
              <span className="text-[11px] text-slate-500 block">Pièces</span>
              <span className="font-bold text-[#1a3831] text-sm">F{rooms}</span>
            </div>
            <div className="border-x border-[#e8e2d4]">
              <span className="text-[11px] text-slate-500 block">Superficie</span>
              <span className="font-bold text-[#1a3831] text-sm">{areaSquareMeters} m²</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Salles de bain</span>
              <span className="font-bold text-[#1a3831] text-sm">{bathrooms}</span>
            </div>
          </div>

          <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
            {description || 'Aucune description rédigée.'}
          </p>

          {contactPhone && (
            <div className="flex items-center gap-1.5 text-xs text-[#1a3831] font-semibold pt-1">
              <Phone className="w-3.5 h-3.5" />
              <span>Contact : {contactPhone}</span>
            </div>
          )}

          {features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {features.map((f, i) => (
                <span key={i} className="px-2.5 py-1 bg-white border border-[#e8e2d4] text-[#1a3831] rounded-lg text-[11px] font-semibold">
                  ✓ {f}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
