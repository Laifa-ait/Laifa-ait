import React, { useState } from 'react';
import { School, ShoppingBag, Stethoscope, Waves, Bus } from 'lucide-react';

export const NEIGHBORHOOD_AMENITIES = [
  { icon: ShoppingBag, label: 'Supermarchés & Supérettes', distance: '350 m' },
  { icon: School, label: 'Écoles primaires & Lycées', distance: '600 m' },
  { icon: Bus, label: 'Arrêt de bus & Station Tramway', distance: '400 m' },
  { icon: Stethoscope, label: 'Pharmacie de garde & Clinique', distance: '500 m' },
  { icon: Waves, label: 'Corniche & Vue littorale', distance: '1.2 km' },
];

export const DetailAmenities: React.FC = () => {
  const [selectedAmenity, setSelectedAmenity] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <span className="text-[11px] uppercase tracking-wider font-extrabold text-stone-400 block">
        Commodités & Vie de quartier (Rayon immédiat)
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {NEIGHBORHOOD_AMENITIES.map((amenity, idx) => {
          const Icon = amenity.icon;
          const isSelected = selectedAmenity === amenity.label;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedAmenity(isSelected ? null : amenity.label)}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#0D281E] text-[#EBDCB8] border-[#0D281E] shadow-xs'
                  : 'bg-[#FAF8F5] hover:bg-stone-100 text-stone-700 border-stone-200/80'
              }`}
            >
              <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-amber-400' : 'text-emerald-700'}`} />
              <div>
                <span className="text-[11px] font-bold block leading-tight">{amenity.label}</span>
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
