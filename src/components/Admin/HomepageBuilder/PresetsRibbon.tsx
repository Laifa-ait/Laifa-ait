import React from "react";
import { Sparkles, Plus, Zap, Crown, Smartphone, Flame } from "lucide-react";
import { useTranslation } from "react-i18next";
import { HomepageSection } from "../../../domains/home/homepage.types";

interface PresetsRibbonProps {
  onApplyPreset: (preset: Partial<HomepageSection>) => void;
}

const PRESETS: Array<{
  name: string;
  icon: React.ReactNode;
  data: Partial<HomepageSection>;
}> = [
  {
    name: "Vente Flash Ramadan",
    icon: <Zap className="w-3.5 h-3.5 text-rose-500" />,
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
    icon: <Crown className="w-3.5 h-3.5 text-amber-500" />,
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
    icon: <Smartphone className="w-3.5 h-3.5 text-sky-500" />,
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
    icon: <Flame className="w-3.5 h-3.5 text-orange-500" />,
    data: {
      name: "Tendances Shopping",
      type: "trending",
      style: "glass",
      title: "Les Articles les Plus Demandés",
      subtitle: "Sélectionnés par nos algorithmes de popularité",
      limit: 8,
    },
  },
];

export const PresetsRibbon: React.FC<PresetsRibbonProps> = ({ onApplyPreset }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm" id="presets-ribbon">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            {t("Modèles Prédéfinis & Tendances 2026")}
          </h4>
        </div>
        <span className="text-[11px] font-medium text-slate-500">
          {t("Création instantanée en 1 clic")}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => onApplyPreset(preset.data)}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50/50 hover:bg-amber-50/30 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white shadow-xs border border-slate-100 group-hover:scale-110 transition-transform">
                {preset.icon}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-amber-800">
                  {preset.name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Type: {preset.data.type}
                </div>
              </div>
            </div>
            <Plus className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};
