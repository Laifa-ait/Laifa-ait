import React from "react";
import { Sparkles, Zap, Flame, ShieldCheck, Layers, Eye, LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface FrameStyleOption {
  id: string;
  label: string;
  description: string;
  borderClass: string;
  badgeText: string;
  badgeBg: string;
  badgeIcon: LucideIcon;
  shadowClass: string;
  bgClass: string;
}

export const FRAME_STYLE_PRESETS: FrameStyleOption[] = [
  {
    id: "clean",
    label: "Épuré Minimaliste",
    description: "Design blanc net, bordure fine zinc, sobre et rapide",
    borderClass: "border-zinc-200 hover:border-zinc-300",
    badgeText: "POPULAIRE",
    badgeBg: "bg-zinc-800 text-white",
    badgeIcon: ShieldCheck,
    shadowClass: "shadow-2xs hover:shadow-md",
    bgClass: "bg-white",
  },
  {
    id: "premium",
    label: "Prestige & Doré",
    description: "Bordure dorée soignée, badge ambre luxe et lueur subtile",
    borderClass: "border-amber-400/90 ring-1 ring-amber-400/30",
    badgeText: "PRESTIGE",
    badgeBg: "bg-gradient-to-r from-amber-500 to-amber-600 text-white",
    badgeIcon: Sparkles,
    shadowClass: "shadow-[0_4px_20px_rgba(245,158,11,0.15)]",
    bgClass: "bg-white",
  },
  {
    id: "immersive",
    label: "Vente Flash & Dynamique",
    description: "Bordure rose/corail vibrante, badge compte à rebours",
    borderClass: "border-rose-500/90 ring-1 ring-rose-400/30",
    badgeText: "FLASH -40%",
    badgeBg: "bg-gradient-to-r from-rose-600 to-red-600 text-white",
    badgeIcon: Zap,
    shadowClass: "shadow-[0_4px_20px_rgba(244,63,94,0.15)]",
    bgClass: "bg-white",
  },
  {
    id: "glass",
    label: "Moderne & Doux (Glass)",
    description: "Verre dépoli blanc translucide, reflet doux et ombre flottante",
    borderClass: "border-white/80 backdrop-blur-md",
    badgeText: "ÉDITION 2026",
    badgeBg: "bg-white/90 text-zinc-900 border border-zinc-200/50",
    badgeIcon: Layers,
    shadowClass: "shadow-[0_8px_30px_rgba(0,0,0,0.06)]",
    bgClass: "bg-white/85",
  },
  {
    id: "elevated",
    label: "Flottant & Élégant",
    description: "Coins ultra-arrondis, élévation 3D et bordure invisible",
    borderClass: "border-zinc-100 hover:border-zinc-200",
    badgeText: "TENDANCE",
    badgeBg: "bg-indigo-600 text-white",
    badgeIcon: Flame,
    shadowClass: "shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)]",
    bgClass: "bg-white",
  },
  {
    id: "dark",
    label: "Contraste Sombre DZ",
    description: "Fond ardoise profond, bordure contrastée et typographie or",
    borderClass: "border-zinc-700 hover:border-zinc-600",
    badgeText: "EXCLUSIF",
    badgeBg: "bg-amber-400 text-zinc-950",
    badgeIcon: Sparkles,
    shadowClass: "shadow-lg shadow-black/40",
    bgClass: "bg-zinc-900 text-white",
  },
];

interface SectionFrameStyleSelectorProps {
  currentStyle: string;
  onStyleChange: (styleId: string) => void;
}

export const SectionFrameStyleSelector: React.FC<SectionFrameStyleSelectorProps> = ({
  currentStyle,
  onStyleChange,
}) => {
  const { t } = useTranslation();
  const selectedPreset =
    FRAME_STYLE_PRESETS.find((p) => p.id === (currentStyle || "clean")) ||
    FRAME_STYLE_PRESETS[0];

  const SelectedIcon = selectedPreset.badgeIcon;

  return (
    <div className="space-y-3 pt-3 border-t border-zinc-100" id="frame-style-selector">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {t("Design & Finition des Cadres Produits")}
          </label>
          <p className="text-[11px] text-zinc-500">
            {t("Sélectionnez le style de cadre pour voir l'effet en direct")}
          </p>
        </div>
        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
          {selectedPreset.label}
        </span>
      </div>

      {/* Grid of Clickable Style Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {FRAME_STYLE_PRESETS.map((preset) => {
          const isSelected = (currentStyle || "clean") === preset.id;
          const PresetIcon = preset.badgeIcon;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onStyleChange(preset.id)}
              className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border relative flex flex-col justify-between ${
                isSelected
                  ? "bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/25 shadow-xs"
                  : "bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold text-zinc-900 truncate">
                    {preset.label}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-zinc-500 line-clamp-2 leading-tight">
                  {preset.description}
                </p>
              </div>

              {/* Mini visual indicator */}
              <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center gap-1.5">
                <span
                  className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1 ${preset.badgeBg}`}
                >
                  <PresetIcon className="w-2.5 h-2.5 shrink-0" />
                  {preset.badgeText}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Interactive Sandbox Preview */}
      <div className="bg-zinc-50 p-3 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <Eye className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-zinc-800">
            {t("Aperçu en Direct du Cadre :")}
          </span>
        </div>

        {/* The Live Rendered Card Preview */}
        <div
          className={`flex-1 w-full max-w-xs p-3 rounded-2xl border transition-all duration-300 ${selectedPreset.bgClass} ${selectedPreset.borderClass} ${selectedPreset.shadowClass}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${selectedPreset.badgeBg}`}
            >
              <SelectedIcon className="w-2.5 h-2.5 shrink-0" />
              {selectedPreset.badgeText}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">Cadre Actif</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200/60 overflow-hidden flex items-center justify-center text-[10px] text-zinc-400 font-bold shrink-0">
              Img
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate">Exemple Smartphone 5G</p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xs font-extrabold text-amber-600">
                  48 500 DZD
                </span>
                <span className="text-[10px] text-zinc-400 line-through">
                  56 000 DZD
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
