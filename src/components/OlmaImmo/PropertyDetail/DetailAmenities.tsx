import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { School, ShoppingBag, Stethoscope, Waves, Bus } from 'lucide-react';

interface NeighborhoodAmenity {
  icon: React.ElementType;
  key: string;
  defaultLabel: string;
  distance: string;
}

export const NEIGHBORHOOD_AMENITIES: NeighborhoodAmenity[] = [
  { icon: ShoppingBag, key: 'immo_amenity_supermarket', defaultLabel: 'Supermarchés & Supérettes', distance: '350 m' },
  { icon: School, key: 'immo_amenity_school', defaultLabel: 'Écoles primaires & Lycées', distance: '600 m' },
  { icon: Bus, key: 'immo_amenity_transit', defaultLabel: 'Arrêt de bus & Station Tramway', distance: '400 m' },
  { icon: Stethoscope, key: 'immo_amenity_health', defaultLabel: 'Pharmacie de garde & Clinique', distance: '500 m' },
  { icon: Waves, key: 'immo_amenity_coast', defaultLabel: 'Corniche & Vue littorale', distance: '1.2 km' },
];

export const DetailAmenities: React.FC = () => {
  const { t } = useTranslation();
  const [selectedAmenityKey, setSelectedAmenityKey] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <span className="text-[11px] uppercase tracking-wider font-extrabold text-stone-400 block">
        {t('immo_amenities_section_title', 'Commodités & Vie de quartier (Rayon immédiat)')}
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {NEIGHBORHOOD_AMENITIES.map((amenity) => {
          const Icon = amenity.icon;
          const isSelected = selectedAmenityKey === amenity.key;
          const label = t(amenity.key, amenity.defaultLabel);
          return (
            <button
              key={amenity.key}
              type="button"
              onClick={() => setSelectedAmenityKey(isSelected ? null : amenity.key)}
              className={`p-3 rounded-2xl border text-left rtl:text-right flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-xs'
                  : 'bg-slate-50 hover:bg-stone-100 text-stone-700 border-stone-200/80'
              }`}
            >
              <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-[#F59E0B]' : 'text-[#1E3A8A]'}`} />
              <div>
                <span className="text-[11px] font-bold block leading-tight">{label}</span>
                <span className={`text-[10px] font-medium ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                  ~ {amenity.distance}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
