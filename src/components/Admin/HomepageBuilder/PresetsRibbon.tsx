import React from "react";
import { Sparkles, Plus, Zap, Crown, Smartphone, Flame, LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { HomepageSection } from "../../../domains/home/homepage.types";

interface PresetsRibbonProps {
  onApplyPreset: (preset: Partial<HomepageSection>) => void;
}

interface PresetItem {
  name: string;
  icon: LucideIcon;
  iconColor: string;
  data: Partial<HomepageSection>;
}

const PRESETS: PresetItem[] = [
  {
    name: "Vente Flash Ramadan",
    icon: Zap,
    iconColor: "text-rose-500",
    data: {
      name: "Vente Flash Ramadan",
      type: "flash_sale",
      style: "premium",
      title: "Ventes Flash Ramadan",
      subtitle: "Offres exceptionnelles limitées dans le temps",
      limit: 8,
    },
  },
  {
    name: "Sélection Prestige DZ",
    icon: Crown,
    iconColor: "text-amber-500",
    data: {
      name: "Sélection Prestige & Artisanat",
      type: "top_picks",
      style: "premium",
      title: "Sélection Prestige Algérienne",
      subtitle: "Haute facture et marques renommées d'Algérie",
      limit: 8,
    },
  },
  {
    name: "Nouveautés High-Tech",
    icon: Smartphone,
    iconColor: "text-sky-500",
    data: {
      name: "High-Tech & Gaming",
      type: "new_arrivals",
      category: "Électronique",
      style: "immersive",
      title: "Derniers Arrivages Tech",
      subtitle: "Smartphones, ordinateurs et accessoires garantis",
      limit: 10,
    },
  },
  {
    name: "Tendances du Moment",
    icon: Flame,
    iconColor: "text-orange-500",
    data: {
      name: "Tendances Shopping",
      type: "trending",
      style: "glass",
      title: "🔥 Les Incontournables & Top Ventes",
      subtitle: "Les meilleures sélections plébiscitées partout en Algérie",
      limit: 8,
    },
  },
];

export const PresetsRibbon: React.FC<PresetsRibbonProps> = ({ onApplyPreset }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm" id="presets-ribbon">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
            {t("Modèles Prédéfinis & Tendances 2026")}
          </h4>
        </div>
        <span className="text-[11px] font-medium text-zinc-500">
          {t("Création instantanée en 1 clic")}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PRESETS.map((preset) => {
          const PresetIcon = preset.icon;
          return (
            <button
              key={preset.name}
              type="button"
              onClick={() => onApplyPreset(preset.data)}
              className="flex items-center justify-between p-3 rounded-2xl border border-zinc-200 hover:border-amber-400 bg-zinc-50/50 hover:bg-amber-50/30 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-white shadow-xs border border-zinc-100 group-hover:scale-110 transition-transform">
                  <PresetIcon className={`w-3.5 h-3.5 ${preset.iconColor}`} />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-900 group-hover:text-amber-800">
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-medium">
                    Type: {preset.data.type}
                  </div>
                </div>
              </div>
              <Plus className="w-4 h-4 text-zinc-400 group-hover:text-amber-600 transition-colors" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
