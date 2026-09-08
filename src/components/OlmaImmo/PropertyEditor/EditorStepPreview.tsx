import React from 'react';
import { Eye, Phone } from 'lucide-react';
import { PropertyType, ListingType, GeoPointLocation, LegalPaperType } from '../../../types/realEstate';
import {
  PropertyMedia,
  PropertyBadge,
  PropertyPrice,
  PropertyLocation,
  PropertyMeta,
  OlmaPill,
} from '../primitives';

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
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D4] shadow-xs space-y-6">
      <div>
        <h3 className="text-xl font-bold text-[#1A3831] font-['Playfair_Display',serif] flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#1A3831]" aria-hidden="true" />
          <span>Aperçu avant publication</span>
        </h3>
        <p className="text-xs text-stone-500 mt-0.5">
          Vérifiez l'ensemble des informations de votre annonce.
        </p>
      </div>

      <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E2D4] overflow-hidden">
        {/* Photo Header */}
        <PropertyMedia
          src={images[0]}
          alt={title || 'Aperçu annonce'}
          aspectRatio="21/9"
          topBadges={
            <>
              <PropertyBadge type="listingType" value={listingType} size="sm" />
              <OlmaPill variant="highlight" size="sm">
                {propertyType}
              </OlmaPill>
              {legalPaperType && (
                <PropertyBadge type="legalPaper" value={legalPaperType} size="sm" />
              )}
            </>
          }
          bottomOverlay={
            <div className="inline-flex items-center px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-md text-[#1A3831] shadow-md border border-white/50">
              <PropertyPrice
                price={price}
                period={pricePeriod}
                listingType={listingType}
                size="md"
                variant="mineral"
              />
            </div>
          }
        />

        {/* Info Body */}
        <div className="p-6 space-y-4">
          <div>
            <h4 className="text-xl font-bold text-[#1A3831] font-['Playfair_Display',serif]">
              {title || 'Titre de votre annonce'}
            </h4>
            <PropertyLocation
              commune={location.commune}
              wilaya={location.wilaya}
              size="sm"
              variant="muted"
              className="mt-1"
            />
          </div>

          {/* Specs */}
          <PropertyMeta
            rooms={rooms}
            areaSquareMeters={areaSquareMeters}
            bathrooms={bathrooms}
            layout="bar"
            size="md"
          />

          <p className="text-xs text-stone-700 whitespace-pre-line leading-relaxed">
            {description || 'Aucune description rédigée.'}
          </p>

          {contactPhone && (
            <div className="flex items-center gap-1.5 text-xs text-[#1A3831] font-semibold pt-1">
              <Phone className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Contact : {contactPhone}</span>
            </div>
          )}

          {features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {features.map((f, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-white border border-[#E8E2D4] text-[#1A3831] rounded-lg text-[11px] font-semibold"
                >
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
