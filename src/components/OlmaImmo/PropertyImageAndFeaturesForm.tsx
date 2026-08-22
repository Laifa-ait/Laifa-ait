import React from 'react';
import { Camera, Plus, Trash2 } from 'lucide-react';
import { PropertyFormData } from '../../types/realEstate';

export const AMENITIES_OPTIONS = [
  'Climatisation',
  'Chauffage central',
  'Cuisine équipée',
  'Ascenseur',
  'Garage / Parking',
  'Jardin / Cour',
  'Piscine',
  'Bâche à eau / Citerne',
  'Meublé',
  'Interphone / Digicode',
  'Vue dégagée / Mer',
  'Agent de sécurité',
  'Caméras de surveillance',
  'Fibre optique / WiFi',
];

interface PropertyImageAndFeaturesFormProps {
  formData: PropertyFormData;
  setFormData: React.Dispatch<React.SetStateAction<PropertyFormData>>;
  imageInput: string;
  setImageInput: (val: string) => void;
  handleAddImage: () => void;
  handleRemoveImage: (index: number) => void;
  handleToggleAmenity: (amenity: string) => void;
}

export const PropertyImageAndFeaturesForm: React.FC<PropertyImageAndFeaturesFormProps> = ({
  formData,
  setFormData,
  imageInput,
  setImageInput,
  handleAddImage,
  handleRemoveImage,
  handleToggleAmenity,
}) => {
  return (
    <div className="space-y-6">
      {/* Caractéristiques détaillées */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>Caractéristiques spécifiques</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre de pièces</label>
            <input
              type="number"
              min="0"
              value={formData.rooms}
              onChange={(e) => setFormData((prev: PropertyFormData) => ({ ...prev, rooms: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Salles de bain</label>
            <input
              type="number"
              min="0"
              value={formData.bathrooms}
              onChange={(e) => setFormData((prev: PropertyFormData) => ({ ...prev, bathrooms: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Étage (optionnel)</label>
            <input
              type="number"
              value={formData.floor ?? ''}
              onChange={(e) =>
                setFormData((prev: PropertyFormData) => ({
                  ...prev,
                  floor: e.target.value === '' ? undefined : Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Ex: 3"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Total étages</label>
            <input
              type="number"
              value={formData.totalFloors ?? ''}
              onChange={(e) =>
                setFormData((prev: PropertyFormData) => ({
                  ...prev,
                  totalFloors: e.target.value === '' ? undefined : Number(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Ex: 5"
            />
          </div>
        </div>

        {/* Commodités */}
        <div className="pt-3 border-t border-slate-100">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Équipements & Commodités disponibles
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {AMENITIES_OPTIONS.map((item: string) => {
              const isChecked = formData.amenities.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleToggleAmenity(item)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                    isChecked
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    className="w-3.5 h-3.5 rounded-sm text-emerald-600 focus:ring-0 pointer-events-none"
                  />
                  <span className="truncate">{item}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Galerie Photos */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Camera className="w-5 h-5 text-emerald-600" />
          <span>Photos du bien (URLs HTTPS)</span>
        </h2>

        <div className="flex gap-2">
          <input
            type="url"
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddImage}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>

        {formData.images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {formData.images.map((img: string, index: number) => (
              <div key={index} className="relative aspect-video rounded-xl overflow-hidden group border border-slate-200">
                <img src={img} alt={`Aperçu ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1.5 right-1.5 p-1 bg-red-600/90 text-white rounded-lg opacity-90 hover:opacity-100 transition-opacity"
                  title="Supprimer la photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 bg-emerald-800/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                    Principale
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
