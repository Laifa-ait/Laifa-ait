import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { ALGERIA_WILAYAS_58 } from '../../../data/artisanGeo';

interface BroadcastLocationSectionProps {
  urgency: 'urgent' | 'standard' | 'flexible';
  setUrgency: (u: 'urgent' | 'standard' | 'flexible') => void;
  wilaya: string;
  setWilaya: (w: string) => void;
  commune: string;
  setCommune: (c: string) => void;
  communes: string[];
}

export const BroadcastLocationSection: React.FC<BroadcastLocationSectionProps> = ({
  urgency,
  setUrgency,
  wilaya,
  setWilaya,
  commune,
  setCommune,
  communes,
}) => {
  return (
    <div className="space-y-3">
      {/* Degré d'urgence */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Degré d&apos;urgence
        </label>
        <select
          value={urgency}
          onChange={(e) => setUrgency(e.target.value as 'urgent' | 'standard' | 'flexible')}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="urgent">🔴 Urgent (Dans la journée / 24h)</option>
          <option value="standard">🟡 Sous 48h</option>
          <option value="flexible">🟢 Projet planifié / Flexible</option>
        </select>
      </div>

      {/* Wilaya & Commune */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            Wilaya d&apos;intervention *
          </label>
          <select
            value={wilaya}
            onChange={(e) => {
              setWilaya(e.target.value);
              setCommune('');
            }}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {ALGERIA_WILAYAS_58.map((w) => (
              <option key={w.code} value={w.fullName}>
                {w.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Commune / Quartier *</label>
          {communes.length > 0 ? (
            <select
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="">Sélectionnez la commune...</option>
              {communes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              placeholder="Nom de votre commune"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
            />
          )}
        </div>
      </div>
    </div>
  );
};
