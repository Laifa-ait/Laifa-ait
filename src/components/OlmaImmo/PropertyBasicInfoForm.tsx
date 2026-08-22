import React from 'react';
import { PropertyFormData } from '../../types/realEstate';

interface PropertyBasicInfoFormProps {
  formData: PropertyFormData;
  setFormData: React.Dispatch<React.SetStateAction<PropertyFormData>>;
  isEditMode: boolean;
}

export const PropertyBasicInfoForm: React.FC<PropertyBasicInfoFormProps> = ({
  formData,
  setFormData,
  isEditMode,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
      <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
        <span>Informations principales</span>
        {isEditMode && (
          <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
            Modification
          </span>
        )}
      </h2>

      {/* Titre */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Titre de l'annonce <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData((prev: PropertyFormData) => ({ ...prev, title: e.target.value }))}
          placeholder="Ex: Bel appartement F4 vue sur mer à Hydra"
          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>

      {/* Type de transaction & Type de bien */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Type de transaction <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.listingType}
            onChange={(e) =>
              setFormData((prev: PropertyFormData) => ({
                ...prev,
                listingType: e.target.value as PropertyFormData['listingType'],
              }))
            }
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="rent_long">Location longue durée</option>
            <option value="rent_short">Location courte durée (Vacances / Nuitées)</option>
            <option value="sale">Vente</option>
            <option value="commercial">Commercial / Bureaux</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Type de bien <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.propertyType}
            onChange={(e) =>
              setFormData((prev: PropertyFormData) => ({
                ...prev,
                propertyType: e.target.value as PropertyFormData['propertyType'],
              }))
            }
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="apartment">Appartement</option>
            <option value="villa">Villa / Maison</option>
            <option value="studio">Studio</option>
            <option value="duplex">Duplex / Penthouse</option>
            <option value="office">Bureau / Local commercial</option>
            <option value="land">Terrain</option>
          </select>
        </div>
      </div>

      {/* Prix, Période & Superficie */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Prix (DZD) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.price}
            onChange={(e) => setFormData((prev: PropertyFormData) => ({ ...prev, price: Number(e.target.value) }))}
            placeholder="Ex: 85000"
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Périodicité</label>
          <select
            value={formData.pricePeriod || ''}
            onChange={(e) =>
              setFormData((prev: PropertyFormData) => ({
                ...prev,
                pricePeriod: (e.target.value || undefined) as PropertyFormData['pricePeriod'],
              }))
            }
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="month">Par mois</option>
            <option value="night">Par nuit</option>
            <option value="total">Prix total (Vente)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Superficie (m²) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            min="1"
            value={formData.areaSquareMeters}
            onChange={(e) => setFormData((prev: PropertyFormData) => ({ ...prev, areaSquareMeters: Number(e.target.value) }))}
            placeholder="Ex: 120"
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Description complète <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData((prev: PropertyFormData) => ({ ...prev, description: e.target.value }))}
          placeholder="Décrivez l'état du bien, le quartier, la proximité des transports, commerces..."
          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-y"
        />
      </div>
    </div>
  );
};
