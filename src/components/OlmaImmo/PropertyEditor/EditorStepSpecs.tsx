import React from 'react';
import { Layers, Bed, Maximize, Bath, CheckCircle2 } from 'lucide-react';

interface EditorStepSpecsProps {
  areaSquareMeters: number;
  setAreaSquareMeters: (val: number) => void;
  rooms: number;
  setRooms: (val: number) => void;
  bathrooms: number;
  setBathrooms: (val: number) => void;
  features: string[];
  setFeatures: (features: string[]) => void;
}

const AMENITIES_LIST = [
  'Climatisation',
  'Chauffage central',
  'Piscine',
  'Garage fermé',
  'Parking sous-sol',
  'Ascenseur',
  'Balcon / Terrasse',
  'Jardin privatif',
  'Cuisine équipée',
  'Vue sur mer',
  'Entièrement meublé',
  'Bâche à eau / Réservoir',
  'Sécurité 24/7',
  'Acte & Livret Foncier',
];

export const EditorStepSpecs: React.FC<EditorStepSpecsProps> = ({
  areaSquareMeters,
  setAreaSquareMeters,
  rooms,
  setRooms,
  bathrooms,
  setBathrooms,
  features,
  setFeatures,
}) => {
  const toggleFeature = (name: string) => {
    if (features.includes(name)) {
      setFeatures(features.filter((f) => f !== name));
    } else {
      setFeatures([...features, name]);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e2d4] shadow-xs space-y-8">
      {/* Physical Specs */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-[#1a3831] font-['Playfair_Display',serif] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#1a3831]" />
            <span>Caractéristiques Principales</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Superficie globale et découpage des pièces.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[#faf8f5] rounded-2xl border border-[#e8e2d4] space-y-2">
            <label className="text-xs font-bold text-[#1a3831] flex items-center gap-1.5">
              <Maximize className="w-4 h-4" />
              <span>Superficie (m²)</span>
            </label>
            <input
              type="number"
              min="10"
              max="50000"
              value={areaSquareMeters}
              onChange={(e) => setAreaSquareMeters(Math.max(1, Number(e.target.value)))}
              className="w-full px-3.5 py-2.5 bg-white border border-[#e8e2d4] rounded-xl text-sm font-bold text-[#1a3831] focus:outline-none focus:border-[#1a3831]"
            />
          </div>

          <div className="p-4 bg-[#faf8f5] rounded-2xl border border-[#e8e2d4] space-y-2">
            <label className="text-xs font-bold text-[#1a3831] flex items-center gap-1.5">
              <Bed className="w-4 h-4" />
              <span>Nombre de Pièces (F)</span>
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={rooms}
              onChange={(e) => setRooms(Math.max(1, Number(e.target.value)))}
              className="w-full px-3.5 py-2.5 bg-white border border-[#e8e2d4] rounded-xl text-sm font-bold text-[#1a3831] focus:outline-none focus:border-[#1a3831]"
            />
          </div>

          <div className="p-4 bg-[#faf8f5] rounded-2xl border border-[#e8e2d4] space-y-2">
            <label className="text-xs font-bold text-[#1a3831] flex items-center gap-1.5">
              <Bath className="w-4 h-4" />
              <span>Salles de bain</span>
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={bathrooms}
              onChange={(e) => setBathrooms(Math.max(0, Number(e.target.value)))}
              className="w-full px-3.5 py-2.5 bg-white border border-[#e8e2d4] rounded-xl text-sm font-bold text-[#1a3831] focus:outline-none focus:border-[#1a3831]"
            />
          </div>
        </div>
      </div>

      {/* Amenities & Equipments */}
      <div className="space-y-4 pt-6 border-t border-[#f0eae0]">
        <div>
          <h3 className="text-xl font-bold text-[#1a3831] font-['Playfair_Display',serif]">
            Équipements & Atouts ({features.length} sélectionnés)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cochez les commodités disponibles pour enrichir la fiche descriptive.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {AMENITIES_LIST.map((item) => {
            const isChecked = features.includes(item);

            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleFeature(item)}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                  isChecked
                    ? 'border-[#1a3831] bg-[#f4ecd8]/60 text-[#1a3831] font-bold'
                    : 'border-[#e8e2d4] bg-[#faf8f5] text-slate-700 hover:bg-white'
                }`}
              >
                <span className="text-xs">{item}</span>
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${isChecked ? 'text-[#1a3831]' : 'text-slate-300'}`} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
