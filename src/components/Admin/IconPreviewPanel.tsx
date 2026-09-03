import React from 'react';
import { Check } from 'lucide-react';
import { GRADIENT_PRESETS, BADGE_PRESETS } from '../../utils/iconRegistry';

interface IconPreviewPanelProps {
  selectedIcon: string;
  selectedGradient: string;
  selectedBadgeColor: string;
  badgeText: string;
  appTitle: string;
  previewIconComponent: React.ComponentType<{ className?: string }>;
  onSelectGradient: (grad: string) => void;
  onSelectBadge: (text: string, color: string) => void;
  onBadgeTextChange: (text: string) => void;
  onClearBadge: () => void;
  onClose: () => void;
  onApply: () => void;
}

export const IconPreviewPanel: React.FC<IconPreviewPanelProps> = ({
  selectedGradient,
  selectedBadgeColor,
  badgeText,
  appTitle,
  previewIconComponent: PreviewIconComponent,
  onSelectGradient,
  onSelectBadge,
  onBadgeTextChange,
  onClearBadge,
  onClose,
  onApply
}) => {
  return (
    <div className="lg:col-span-5 p-5 flex flex-col justify-between bg-zinc-50/40 dark:bg-zinc-900/40 overflow-y-auto max-h-[60vh] lg:max-h-[70vh]">
      <div className="space-y-4">
        {/* Live Preview Card */}
        <div className="bg-white dark:bg-zinc-800/90 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Aperçu Direct
          </span>
          <div className="relative group cursor-pointer my-2 flex flex-col items-center">
            <div
              className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedGradient} p-0.5 shadow-lg shadow-black/10 flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-105`}
            >
              <div className="w-full h-full rounded-[14px] flex items-center justify-center bg-white/10 backdrop-blur-xs">
                <PreviewIconComponent className="w-8 h-8 drop-shadow-sm stroke-[2.2]" />
              </div>
              {badgeText.trim() && (
                <span
                  className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-md uppercase tracking-wider ${selectedBadgeColor}`}
                >
                  {badgeText}
                </span>
              )}
            </div>
            <span className="mt-2 text-xs font-bold text-zinc-800 dark:text-zinc-100 max-w-[120px] truncate">
              {appTitle}
            </span>
          </div>
        </div>

        {/* Gradient Selection */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
            Dégradé de Fond Premium (Palette Olmart)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {GRADIENT_PRESETS.map((grad) => {
              const isGradSelected = selectedGradient === grad.className;
              return (
                <button
                  key={grad.id}
                  type="button"
                  onClick={() => onSelectGradient(grad.className)}
                  className={`group relative h-9 rounded-2xl p-0.5 transition-all duration-200 overflow-hidden ${
                    isGradSelected
                      ? 'ring-2 ring-orange-500 scale-105 shadow-md'
                      : 'hover:scale-102 border border-black/10'
                  }`}
                  title={grad.name}
                >
                  <div
                    className="w-full h-full rounded-[10px] flex items-center justify-center"
                    style={{ background: grad.previewBg }}
                  >
                    {isGradSelected && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Badge Presets & Text */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Badge Flottant (Optionnel)
            </label>
            {badgeText && (
              <button
                type="button"
                onClick={onClearBadge}
                className="text-[11px] text-red-500 hover:underline"
              >
                Effacer badge
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {BADGE_PRESETS.map((preset) => (
              <button
                key={preset.text}
                type="button"
                onClick={() => onSelectBadge(preset.text, preset.badgeColor)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all border ${
                  badgeText === preset.text
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent shadow-xs'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Texte personnalisé du badge (ex: 🔥 HOT, NEW, -30%)..."
            value={badgeText}
            onChange={(e) => onBadgeTextChange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={onApply}
          className="px-5 py-2 text-xs font-bold rounded-2xl bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          Appliquer ce Design
        </button>
      </div>
    </div>
  );
};
