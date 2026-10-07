import React from "react";
import { Sparkles, LayoutGrid } from "lucide-react";
import { useTranslation } from "react-i18next";
import { HomepageSection } from "../../../domains/home/homepage.types";
import { SectionFrameStyleSelector } from "./SectionFrameStyleSelector";

interface SectionGeneralTabProps {
  secName: string;
  setSecName: (val: string) => void;
  secTitle: string;
  setSecTitle: (val: string) => void;
  secSubtitle: string;
  setSecSubtitle: (val: string) => void;
  secType: HomepageSection["type"];
  setSecType: React.Dispatch<React.SetStateAction<HomepageSection["type"]>>;
  secLayout: HomepageSection["layout"];
  setSecLayout: React.Dispatch<React.SetStateAction<HomepageSection["layout"]>>;
  secStyle: string;
  setSecStyle: (val: string) => void;
  secIsActive: boolean;
  setSecIsActive: (val: boolean) => void;
}

const SECTION_TYPES: Array<{
  value: HomepageSection["type"];
  label: string;
  description: string;
}> = [
  { value: "top_picks", label: "Sélection Star", description: "Mise en avant prestige" },
  { value: "flash_sale", label: "Vente Flash", description: "Compte à rebours & promos" },
  { value: "new_arrivals", label: "Nouveautés", description: "Derniers produits récents" },
  { value: "trending", label: "Tendances", description: "Articles les plus consultés" },
  { value: "recommended", label: "Recommandés", description: "Suggestions personnalisées" },
  { value: "brands", label: "Boutiques Officielles", description: "Commerçants certifiés" },
  { value: "sellers", label: "Meilleurs Artisans", description: "Artisans & créateurs DZ" },
  { value: "collections", label: "Collections Thématiques", description: "Saisons & Ramadan" },
];

export const SectionGeneralTab: React.FC<SectionGeneralTabProps> = ({
  secName,
  setSecName,
  secTitle,
  setSecTitle,
  secSubtitle,
  setSecSubtitle,
  secType,
  setSecType,
  secLayout,
  setSecLayout,
  secStyle,
  setSecStyle,
  secIsActive,
  setSecIsActive,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4" id="section-general-tab">
      {/* Title & Subtitle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">
            {t("Titre affiché aux clients")} *
          </label>
          <input
            type="text"
            required
            value={secTitle}
            onChange={(e) => setSecTitle(e.target.value)}
            placeholder={t("Ex: Les Offres Exceptionnelles")}
            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">
            {t("Nom interne (Admin)")}
          </label>
          <input
            type="text"
            value={secName}
            onChange={(e) => setSecName(e.target.value)}
            placeholder={t("Ex: Section Flash Ramadan 2026")}
            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-700 mb-1">
          {t("Sous-titre explicatif")}
        </label>
        <input
          type="text"
          value={secSubtitle}
          onChange={(e) => setSecSubtitle(e.target.value)}
          placeholder={t("Ex: Jusqu'à -50% sur l'électroménager et le high-tech")}
          className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
        />
      </div>

      {/* Section Type Selector */}
      <div>
        <label className="block text-xs font-bold text-zinc-700 mb-1.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          {t("Type de Section")}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {SECTION_TYPES.map((st) => {
            const isSelected = secType === st.value;
            return (
              <button
                key={st.value}
                type="button"
                onClick={() => setSecType(st.value)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20"
                    : "bg-white border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="text-xs font-bold text-zinc-900">{st.label}</div>
                <div className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">
                  {st.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Layout & Publication status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-zinc-100">
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center gap-1">
            <LayoutGrid className="w-3.5 h-3.5 text-zinc-500" />
            {t("Disposition (Layout)")}
          </label>
          <select
            value={secLayout || "standard"}
            onChange={(e) => setSecLayout(e.target.value as HomepageSection["layout"])}
            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
          >
            <option value="standard">{t("Grille Standard (4 colonnes)")}</option>
            <option value="compact">{t("Carrousel Compact (Défilement fluide)")}</option>
            <option value="large">{t("Vitrine Bento Hero (Vedette + Grille)")}</option>
            <option value="minimal">{t("Minimaliste Épuré (Ligne simple)")}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">
            {t("Statut de publication")}
          </label>
          <button
            type="button"
            onClick={() => setSecIsActive(!secIsActive)}
            className={`w-full px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
              secIsActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : "bg-zinc-100 text-zinc-500 border-zinc-200"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${secIsActive ? "bg-emerald-500" : "bg-zinc-400"}`} />
            {secIsActive ? t("Actif (Visible en ligne)") : t("Désactivé (Brouillon)")}
          </button>
        </div>
      </div>

      {/* Frame Style Selector with Live Preview */}
      <SectionFrameStyleSelector
        currentStyle={secStyle}
        onStyleChange={setSecStyle}
      />
    </div>
  );
};
