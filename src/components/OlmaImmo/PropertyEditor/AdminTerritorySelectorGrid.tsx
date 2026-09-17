import React from 'react';
import { ALGERIA_WILAYAS } from '../../../constants/wilayas';
import { HelpCircle, ListFilter, Edit3, CheckCircle2 } from 'lucide-react';

export interface AdminTerritorySelectorGridProps {
  wilaya?: string;
  daira?: string;
  commune?: string;
  effectiveDaira?: string;
  availableDairas: string[];
  availableCommunes: { name: string; postal_code?: string; name_ar?: string }[];
  isManualTextEntry: boolean;
  onToggleManualTextEntry: () => void;
  onWilayaChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onDairaChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onCommuneSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onCommuneTextChange: (val: string) => void;
  onOpenTerritoryModal: () => void;
}

export const AdminTerritorySelectorGrid: React.FC<AdminTerritorySelectorGridProps> = ({
  wilaya,
  daira,
  commune,
  effectiveDaira,
  availableDairas,
  availableCommunes,
  isManualTextEntry,
  onToggleManualTextEntry,
  onWilayaChange,
  onDairaChange,
  onCommuneSelect,
  onCommuneTextChange,
  onOpenTerritoryModal,
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-stone-700">Division Administrative</span>
        <button
          type="button"
          onClick={onOpenTerritoryModal}
          className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1.5 cursor-pointer hover:underline"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Comprendre Wilaya / Daïra / Baladia</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Wilaya */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            1. Wilaya * ({ALGERIA_WILAYAS.length})
          </label>
          <select
            value={wilaya || ''}
            onChange={onWilayaChange}
            required
            className="w-full bg-white border border-stone-200 text-stone-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 min-h-[44px] cursor-pointer"
          >
            <option value="" disabled>
              Sélectionnez une Wilaya
            </option>
            {ALGERIA_WILAYAS.map((w) => (
              <option key={w.code} value={w.name}>
                {w.code} - {w.name} {w.name_ar ? `(${w.name_ar})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Daïra */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1">
            2. Daïra (District) {availableDairas.length > 0 ? `(${availableDairas.length})` : ''}
          </label>
          <select
            value={daira || ''}
            onChange={onDairaChange}
            disabled={!wilaya}
            className="w-full bg-white border border-stone-200 text-stone-800 text-xs font-medium rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 min-h-[44px] disabled:bg-stone-100 disabled:text-stone-400 cursor-pointer"
          >
            <option value="">
              {wilaya ? 'Toutes les Daïras (ou auto-détectée)' : "Choisissez d'abord une Wilaya"}
            </option>
            {availableDairas.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Commune / Baladia */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-stone-700">
              3. Baladia / Commune * {availableCommunes.length > 0 ? `(${availableCommunes.length})` : ''}
            </label>
            {wilaya && availableCommunes.length > 0 && (
              <button
                type="button"
                onClick={onToggleManualTextEntry}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                {isManualTextEntry ? (
                  <>
                    <ListFilter className="w-3 h-3" />
                    <span>Liste</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3 h-3" />
                    <span>Saisie libre</span>
                  </>
                )}
              </button>
            )}
          </div>

          {!isManualTextEntry ? (
            <select
              value={commune || ''}
              onChange={onCommuneSelect}
              required
              disabled={!wilaya}
              className="w-full bg-white border border-stone-200 text-stone-800 text-xs font-bold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 min-h-[44px] disabled:bg-stone-100 disabled:text-stone-400 cursor-pointer"
            >
              <option value="" disabled>
                {wilaya
                  ? `-- Choisir une commune (${availableCommunes.length}) --`
                  : "Sélectionnez d'abord une Wilaya"}
              </option>
              {availableCommunes.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} {c.postal_code ? `(${c.postal_code})` : ''} {c.name_ar ? `• ${c.name_ar}` : ''}
                </option>
              ))}
              <option value="__custom__">✍️ Autre commune / saisie manuelle...</option>
            </select>
          ) : (
            <div className="relative">
              <input
                type="text"
                required
                list="communes-datalist"
                placeholder="Ex: Bab Ezzouar, Hydra, Bir El Djir..."
                value={commune || ''}
                onChange={(e) => onCommuneTextChange(e.target.value)}
                className="w-full bg-white border border-stone-200 text-stone-800 text-xs font-medium rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
              />
              {availableCommunes.length > 0 && (
                <datalist id="communes-datalist">
                  {availableCommunes.map((c) => (
                    <option key={c.name} value={c.name} />
                  ))}
                </datalist>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation feedback when Wilaya and Commune are locked */}
      {wilaya && commune && (
        <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs text-emerald-950 font-medium shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Pieu positionné sur Commune de <strong>{commune}</strong>
              {effectiveDaira ? <> (Daïra de <strong>{effectiveDaira}</strong>)</> : null}
              {' • Wilaya de '}
              <strong>{wilaya}</strong>.
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Localisation prête
          </span>
        </div>
      )}
    </>
  );
};
