import React from 'react';
import { Sparkles } from 'lucide-react';

interface BroadcastPresetSelectorProps {
  presets: string[];
  selectedPreset: string;
  onSelectPreset: (preset: string) => void;
}

export const BroadcastPresetSelector: React.FC<BroadcastPresetSelectorProps> = ({
  presets,
  selectedPreset,
  onSelectPreset,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        Sélectionnez un besoin fréquent (en 1 clic) :
      </label>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset) => {
          const isSelected = selectedPreset === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-2xs font-bold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {preset}
            </button>
          );
        })}
      </div>
    </div>
  );
};
