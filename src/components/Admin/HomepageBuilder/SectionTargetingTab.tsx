import React, { useState } from "react";
import { Users, MapPin, Palette, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ALGERIA_WILAYAS } from "../../../constants";
import { HomepageSection } from "../../../domains/home/homepage.types";

interface SectionTargetingTabProps {
  secTargetAudience: HomepageSection["targetAudience"];
  setSecTargetAudience: React.Dispatch<React.SetStateAction<HomepageSection["targetAudience"]>>;
  secTargetRegions: string[];
  setSecTargetRegions: (val: string[]) => void;
  secBackgroundColor: string;
  setSecBackgroundColor: (val: string) => void;
  secThemeName: string;
  setSecThemeName: (val: string) => void;
}

export const SectionTargetingTab: React.FC<SectionTargetingTabProps> = ({
  secTargetAudience,
  setSecTargetAudience,
  secTargetRegions,
  setSecTargetRegions,
  secBackgroundColor,
  setSecBackgroundColor,
  secThemeName,
  setSecThemeName,
}) => {
  const { t } = useTranslation();
  const [wilayaSearch, setWilayaSearch] = useState("");

  const filteredWilayas = ALGERIA_WILAYAS.filter((w) =>
    w.toLowerCase().includes(wilayaSearch.toLowerCase())
  );

  const handleToggleWilaya = (wilaya: string) => {
    if (secTargetRegions.includes(wilaya)) {
      setSecTargetRegions(secTargetRegions.filter((w) => w !== wilaya));
    } else {
      setSecTargetRegions([...secTargetRegions, wilaya]);
    }
  };

  const handleSelectAllWilayas = () => {
    setSecTargetRegions([...ALGERIA_WILAYAS]);
  };

  const handleClearWilayas = () => {
    setSecTargetRegions([]);
  };

  return (
    <div className="space-y-5" id="section-targeting-tab">
      {/* Target Audience */}
      <div>
        <label className="block text-xs font-bold text-zinc-700 mb-2 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-amber-500" />
          {t("Audience Ciblée")}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { value: "all", label: "Tous les visiteurs", desc: "Visiteurs publics & membres" },
            { value: "new", label: "Nouveaux clients", desc: "Première visite sur Olmart" },
            { value: "logged_in", label: "Membres connectés", desc: "Comptes acheteurs actifs" },
            { value: "vip", label: "Acheteurs VIP", desc: "Clients fréquents avec historique" },
          ].map((aud) => {
            const isSelected = (secTargetAudience || "all") === aud.value;
            return (
              <button
                key={aud.value}
                type="button"
                onClick={() => setSecTargetAudience(aud.value as HomepageSection["targetAudience"])}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-50 border-amber-500 ring-2 ring-amber-500/20"
                    : "bg-white border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="text-xs font-bold text-zinc-900">{aud.label}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{aud.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Wilaya Geo-targeting (58 Wilayas) */}
      <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold text-zinc-900">
              {t("Ciblage Géographique par Wilaya")}
              <span className="ml-2 text-zinc-500 font-normal">
                ({secTargetRegions.length === 0 ? "58 Wilayas (Toute l'Algérie)" : `${secTargetRegions.length} sélectionnée(s)`})
              </span>
            </h4>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <button
              type="button"
              onClick={handleSelectAllWilayas}
              className="text-amber-700 hover:text-amber-800 font-bold cursor-pointer"
            >
              {t("Toutes (58)")}
            </button>
            <span className="text-zinc-300">|</span>
            <button
              type="button"
              onClick={handleClearWilayas}
              className="text-zinc-500 hover:text-zinc-700 cursor-pointer"
            >
              {t("Réinitialiser")}
            </button>
          </div>
        </div>

        <input
          type="text"
          value={wilayaSearch}
          onChange={(e) => setWilayaSearch(e.target.value)}
          placeholder={t("Rechercher une wilaya (ex: Alger, Oran, Sétif)...")}
          className="w-full px-3 py-1.5 text-xs rounded-2xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
        />

        <div className="max-h-36 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 p-1">
          {filteredWilayas.map((wilaya) => {
            const isChecked = secTargetRegions.includes(wilaya);
            return (
              <button
                key={wilaya}
                type="button"
                onClick={() => handleToggleWilaya(wilaya)}
                className={`flex items-center gap-2 p-1.5 rounded-lg text-left text-xs transition-all cursor-pointer ${
                  isChecked
                    ? "bg-amber-100/70 text-amber-900 font-bold border border-amber-300"
                    : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200/60"
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                  isChecked ? "bg-amber-500 text-white" : "border border-zinc-300"
                }`}>
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="truncate">{wilaya}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme Name & Background */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">
            {t("Badge ou Nom de Saison / Campagne")}
          </label>
          <input
            type="text"
            value={secThemeName}
            onChange={(e) => setSecThemeName(e.target.value)}
            placeholder={t("Ex: Spécial Ramadan, Soldes d'Été")}
            className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-zinc-500" />
            {t("Couleur de fond personnalisée")}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={secBackgroundColor || "#ffffff"}
              onChange={(e) => setSecBackgroundColor(e.target.value)}
              className="w-10 h-10 p-0.5 rounded-2xl border border-zinc-200 cursor-pointer"
            />
            <input
              type="text"
              value={secBackgroundColor || "#ffffff"}
              onChange={(e) => setSecBackgroundColor(e.target.value)}
              className="flex-1 px-3 py-2 text-xs font-mono rounded-2xl border border-zinc-200 bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
