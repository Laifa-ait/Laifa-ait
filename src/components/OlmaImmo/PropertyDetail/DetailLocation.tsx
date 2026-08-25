import React from 'react';
import { MapPin, Compass } from 'lucide-react';
import { GeoPointLocation, PropertyMapResult } from '../../../types/realEstate';
import { PropertyMapPreview } from '../PropertyMapPreview';

interface DetailLocationProps {
  location: GeoPointLocation;
  title: string;
  price: number;
}

export const DetailLocation: React.FC<DetailLocationProps> = ({ location, title, price }) => {
  const mapProperty: PropertyMapResult = {
    id: 'current-property',
    title,
    propertyType: 'apartment',
    listingType: 'sale',
    price,
    lat: location.lat,
    lng: location.lng,
    commune: location.commune,
    wilaya: location.wilaya,
    mainImage: '',
    rooms: 0,
    areaSquareMeters: 0,
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e2d4] shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#1a3831] font-['Playfair_Display',serif] flex items-center gap-2.5">
          <MapPin className="w-5 h-5 text-[#1a3831]" />
          <span>Emplacement & Quartier</span>
        </h2>
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
          <Compass className="w-3.5 h-3.5" />
          {location.wilaya}
        </span>
      </div>

      <div className="rounded-2xl overflow-hidden border border-[#e8e2d4] shadow-2xs">
        <PropertyMapPreview property={mapProperty} />
      </div>

      <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#f0eae0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-slate-700">
        <div>
          <span className="font-bold text-[#1a3831] block">Adresse approximative</span>
          <span className="text-slate-600">
            {location.address || 'Quartier résidentiel'}, {location.commune}, Wilaya de {location.wilaya}
          </span>
        </div>
        <div className="text-slate-500 text-xs">
          Coordonnées GPS: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
        </div>
      </div>
    </div>
  );
};
