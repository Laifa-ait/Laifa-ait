import React, { useState } from "react";
import { X, Save, Sliders } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SponsorshipPackConfig, SponsorshipTier } from "../../../domains/seller/sponsorship.types";

interface AdminPackConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPacks: Record<SponsorshipTier, SponsorshipPackConfig>;
  onSave: (packs: Record<SponsorshipTier, SponsorshipPackConfig>) => Promise<void>;
}

export const AdminPackConfigModal: React.FC<AdminPackConfigModalProps> = ({
  isOpen,
  onClose,
  initialPacks,
  onSave
}) => {
  const { t } = useTranslation();
  const [packsState, setPacksState] = useState<Record<SponsorshipTier, SponsorshipPackConfig>>(initialPacks);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handlePriceChange = (tier: SponsorshipTier, duration: number, value: number) => {
    setPacksState((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        pricing: {
          ...prev[tier].pricing,
          [duration]: value
        }
      }
    }));
  };

  const handleMultiplierChange = (tier: SponsorshipTier, val: number) => {
    setPacksState((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        boostMultiplier: val
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      await onSave(packsState);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-zinc-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-zinc-900 to-amber-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400 border border-amber-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-sans uppercase tracking-wide">
                {t("Configuration des Tarifs Sponsoring")}
              </h3>
              <p className="text-xs text-zinc-400">
                {t("Ajustez les prix dynamiques et multiplicateurs pour les vendeurs.")}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {(["bronze", "silver", "gold"] as SponsorshipTier[]).map((tierKey) => {
            const pack = packsState[tierKey];

            return (
              <div key={tierKey} className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase px-2.5 py-1 rounded-md bg-zinc-900 text-white">
                      Pack {tierKey.toUpperCase()}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">({pack?.name})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 font-bold">{t("Multiplicateur Algorithme")}:</span>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="10"
                      value={pack?.boostMultiplier || 1.5}
                      onChange={(e) => handleMultiplierChange(tierKey, parseFloat(e.target.value) || 1)}
                      className="w-16 px-2 py-1 rounded-lg border border-zinc-300 text-xs font-bold font-mono text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[7, 14, 30].map((days) => (
                    <div key={days} className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">
                        {days} {t("Jours (DA)")}
                      </label>
                      <input
                        type="number"
                        min="500"
                        step="500"
                        value={pack?.pricing[days] || 1500}
                        onChange={(e) => handlePriceChange(tierKey, days, parseInt(e.target.value, 10) || 0)}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-bold font-mono bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-100 border-t border-zinc-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-700 hover:bg-zinc-200"
          >
            {t("Annuler")}
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-amber-600 text-white hover:bg-amber-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-amber-600/20"
          >
            <Save className="w-4 h-4" />
            {isSaving ? t("Enregistrement...") : t("Enregistrer les Tarifs")}
          </button>
        </div>
      </div>
    </div>
  );
};
