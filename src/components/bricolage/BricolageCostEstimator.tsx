import React, { useState } from 'react';
import { Calculator, ArrowRight } from 'lucide-react';
import { BricolageServiceCategory } from '../../types/bricolage';

interface BricolageCostEstimatorProps {
  categories: BricolageServiceCategory[];
  onOrderEstimate: (category: BricolageServiceCategory, serviceName: string, estimatedMin: number, estimatedMax: number) => void;
}

export const BricolageCostEstimator: React.FC<BricolageCostEstimatorProps> = ({
  categories,
  onOrderEstimate
}) => {
  const [selectedCatId, setSelectedCatId] = useState(categories[0]?.id || 'plomberie');
  const [selectedService, setSelectedService] = useState(categories[0]?.popularServices[0] || 'Dépannage Fuite');
  const [quantity, setQuantity] = useState(1);
  const urgencyMultiplier = 1;

  const activeCat = categories.find(c => c.id === selectedCatId) || categories[0];

  const minPrice = activeCat ? Math.round(activeCat.avgPriceRangeDZD.min * quantity * urgencyMultiplier) : 2500;
  const maxPrice = activeCat ? Math.round(activeCat.avgPriceRangeDZD.max * quantity * urgencyMultiplier) : 7500;

  const handleCategoryChange = (catId: string) => {
    setSelectedCatId(catId);
    const cat = categories.find(c => c.id === catId);
    if (cat && cat.popularServices.length > 0) {
      setSelectedService(cat.popularServices[0]);
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-3xl p-6 sm:p-8 border-2 border-amber-200/80 shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shadow-md border border-amber-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded border border-amber-300">
              Outil In Situ Algérie
            </span>
            <h2 className="text-xl font-black text-slate-900">
              Calculateur Instantané de Tarif
            </h2>
          </div>
        </div>
        <p className="text-xs text-slate-600 font-semibold max-w-sm">
          Obtenez une estimation immédiate de la main-d'œuvre et des fournitures de base.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-2xl p-6 border border-amber-200/60 shadow-sm">
        {/* Category Picker */}
        <div>
          <label className="text-xs font-extrabold text-slate-800 mb-2 block">
            1. Métier / Spécialité :
          </label>
          <select
            value={selectedCatId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full p-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name.fr}
              </option>
            ))}
          </select>
        </div>

        {/* Prestation Picker */}
        <div>
          <label className="text-xs font-extrabold text-slate-800 mb-2 block">
            2. Prestation exacte :
          </label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full p-3 rounded-xl border-2 border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
          >
            {activeCat?.popularServices.map((srv, idx) => (
              <option key={idx} value={srv}>
                {srv}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity / Complexity */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-extrabold text-slate-800">
              3. Ampleur / Quantité :
            </label>
            <button
              type="button"
              onClick={() => setUrgencyMultiplier((prev) => (prev === 1 ? 1.3 : 1))}
              className={`text-[10px] font-black px-2 py-0.5 rounded transition-colors ${
                urgencyMultiplier > 1
                  ? "bg-red-500 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {urgencyMultiplier > 1 ? "⚡ Urgence (+30%)" : "Normal"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-black text-slate-800 text-lg border border-slate-300"
            >
              -
            </button>
            <div className="flex-1 text-center py-2 bg-slate-50 border-2 border-slate-200 rounded-xl font-black text-slate-900 text-sm">
              {quantity} {quantity === 1 ? 'élément / pièce' : 'éléments / pièces'}
            </div>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-black text-slate-800 text-lg border border-slate-300"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Output Result Box */}
      <div className="mt-6 bg-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg border-2 border-slate-800">
        <div>
          <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider block mb-1">
            Estimation Indicative Moyenne (TTC)
          </span>
          <div className="text-3xl font-black text-white tracking-tight">
            {minPrice.toLocaleString()} - {maxPrice.toLocaleString()} <span className="text-amber-400 text-lg">DA</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Basé sur 1 500+ interventions réalisées en Algérie • Main-d'œuvre incluse
          </p>
        </div>

        <button
          onClick={() => activeCat && onOrderEstimate(activeCat, selectedService, minPrice, maxPrice)}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 shrink-0 border border-amber-400"
        >
          <span>Demander cette Intervention</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>
    </div>
  );
};
