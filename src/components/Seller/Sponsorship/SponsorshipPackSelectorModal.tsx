import React, { useState } from "react";
import { X, Check, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SponsorshipPackConfig, SponsorshipTier } from "../../../domains/seller/sponsorship.types";

interface SponsorshipPackSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: { id: string; name: string; image: string; price: number } | null;
  packs: Record<SponsorshipTier, SponsorshipPackConfig>;
  onSubmit: (data: { productId: string; tier: SponsorshipTier; durationDays: number }) => Promise<void>;
}

export const SponsorshipPackSelectorModal: React.FC<SponsorshipPackSelectorModalProps> = ({
  isOpen,
  onClose,
  product,
  packs,
  onSubmit
}) => {
  const { t } = useTranslation();
  const [selectedTier, setSelectedTier] = useState<SponsorshipTier>("silver");
  const [selectedDuration, setSelectedDuration] = useState<number>(7);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const currentPack = packs[selectedTier] || packs.bronze;
  const price = currentPack.pricing[selectedDuration] || currentPack.pricing[7] || 1500;

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        productId: product.id,
        tier: selectedTier,
        durationDays: selectedDuration
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const tierColors: Record<SponsorshipTier, { bg: string; border: string; text: string; badge: string }> = {
    bronze: { bg: "bg-amber-50/50", border: "border-amber-700/30", text: "text-amber-800", badge: "bg-amber-700 text-white" },
    silver: { bg: "bg-slate-50/50", border: "border-slate-400/40", text: "text-slate-900", badge: "bg-slate-700 text-white" },
    gold: { bg: "bg-amber-500/10", border: "border-amber-500/60", text: "text-amber-950", badge: "bg-amber-500 text-zinc-950 font-black" }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-zinc-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white flex items-center justify-between border-b border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400 border border-amber-500/30">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold font-sans uppercase tracking-wide">
                {t("Sponsoriser un Produit")}
              </h3>
              <p className="text-xs text-zinc-400 line-clamp-1">
                {product.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Step 1: Pack Tier Choice */}
          <div>
            <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block mb-2.5">
              {t("1. Choisir le niveau de Pack")}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["bronze", "silver", "gold"] as SponsorshipTier[]).map((tierKey) => {
                const pack = packs[tierKey];
                const isSelected = selectedTier === tierKey;
                const style = tierColors[tierKey];

                return (
                  <button
                    key={tierKey}
                    type="button"
                    onClick={() => setSelectedTier(tierKey)}
                    className={`relative p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? `${style.border} ${style.bg} ring-2 ring-orange-500 shadow-md`
                        : "border-zinc-200 hover:border-zinc-300 bg-white"
                    }`}
                  >
                    {pack?.popular && (
                      <span className="absolute -top-2.5 right-3 bg-orange-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm">
                        {t("POPULAIRE")}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${style.badge}`}>
                          {pack?.name || tierKey}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-orange-600 font-bold" />}
                      </div>
                      <p className="text-xs font-bold text-zinc-900 mt-2">
                        Boost {pack?.boostMultiplier}x
                      </p>
                      <p className="text-[10px] text-zinc-500 line-clamp-2 mt-1">
                        {pack?.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-200/60">
                      <p className="text-xs font-black text-zinc-900">
                        {pack?.pricing[selectedDuration]?.toLocaleString()} DA
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Duration Choice */}
          <div>
            <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block mb-2.5">
              {t("2. Durée de la campagne")}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[7, 14, 30].map((days) => {
                const p = currentPack.pricing[days] || 0;
                const isSelected = selectedDuration === days;
                return (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setSelectedDuration(days)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? "border-orange-600 bg-orange-50 text-orange-950 font-bold ring-2 ring-orange-500/20"
                        : "border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700"
                    }`}
                  >
                    <p className="text-xs font-bold">{days} {t("Jours")}</p>
                    <p className="text-xs font-mono font-extrabold mt-0.5 text-orange-600">{p.toLocaleString()} DA</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-400">{t("Tarif du Pack")}</p>
            <p className="text-lg font-black font-mono text-zinc-900">
              {price.toLocaleString()} <span className="text-xs font-sans">DA</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              {t("Annuler")}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl bg-orange-600 text-white hover:bg-orange-700 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-600/20 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {isSubmitting ? t("Traitement...") : t("Soumettre la Demande")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
