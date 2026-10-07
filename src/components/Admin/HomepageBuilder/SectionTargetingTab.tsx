import React, { useState } from "react";
import { Users, MapPin, Palette, Check, Sparkles } from "lucide-react";
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

const REGIONAL_CLUSTERS: Record<string, string[]> = {
  Centre: ["16 Alger", "09 Blida", "35 Boumerdès", "42 Tipaza", "15 Tizi Ouzou", "10 Bouira", "26 Médéa"],
  Ouest: ["31 Oran", "27 Mostaganem", "13 Tlemcen", "29 Mascara", "22 Sidi Bel Abbès", "02 Chlef", "48 Relizane", "46 Aïn Témouchent"],
  Est: ["25 Constantine", "19 Sétif", "23 Annaba", "05 Batna", "21 Skikda", "06 Béjaïa", "18 Jijel", "24 Guelma", "41 Souk Ahras"],
  Sud: ["30 Ouargla", "07 Biskra", "08 Béchar", "47 Ghardaïa", "01 Adrar", "11 Tamanrasset", "39 El Oued", "33 Illizi"],
};

const COLOR_PRESETS = [
  { label: "Blanc", value: "#ffffff", border: "border-zinc-200" },
  { label: "Albâtre", value: "#faf8f5", border: "border-amber-100" },
  { label: "Gris Perle", value: "#f8fafc", border: "border-slate-200" },
  { label: "Menthe", value: "#f0fdf4", border: "border-emerald-200" },
  { label: "Ambre", value: "#fffbeb", border: "border-amber-200" },
  { label: "Rose", value: "#fff1f2", border: "border-rose-200" },
];

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

  const handleSelectCluster = (clusterName: keyof typeof REGIONAL_CLUSTERS) => {
    const cluster = REGIONAL_CLUSTERS[clusterName] || [];
    const set = new Set([...secTargetRegions, ...cluster]);
    setSecTargetRegions(Array.from(set));
  };

  return (
    <div className="space-y-4" id="section-targeting-tab">
      {/* Target Audience */}
      <div>
        <label className="block text-xs font-bold text-zinc-700 mb-1.5 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-amber-500" />
          {t("Audience Ciblée")}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { value: "all", label: "Tous les visiteurs", desc: "Public & membres" },
            { value: "new", label: "Nouveaux clients", desc: "Première visite" },
            { value: "logged_in", label: "Membres connectés", desc: "Comptes actifs" },
            { value: "vip", label: "Acheteurs VIP", desc: "Fidélité & réguliers" },
          ].map((aud) => {
            const isSelected = (secTargetAudience || "all") === aud.value;
            return (
              <button
                key={aud.value}
                type="button"
                onClick={() => setSecTargetAudience(aud.value as HomepageSection["targetAudience"])}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20"
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

      {/* Wilaya Geo-targeting (69 Wilayas) */}
      <div className="bg-zinc-50/70 rounded-xl p-3.5 border border-zinc-200 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-zinc-900">
              {t("Ciblage Wilayas")}
              <span className="ml-1.5 text-[11px] font-normal text-zinc-500">
                ({secTargetRegions.length === 0 ? "69 Wilayas (Toute l'Algérie)" : `${secTargetRegions.length} ciblée(s)`})
              </span>
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => setSecTargetRegions([...ALGERIA_WILAYAS])}
              className="px-2 py-0.5 rounded bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold cursor-pointer"
            >
              {t("Toutes (69)")}
            </button>
            {Object.keys(REGIONAL_CLUSTERS).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectCluster(key as keyof typeof REGIONAL_CLUSTERS)}
                className="px-1.5 py-0.5 rounded bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 font-medium cursor-pointer"
              >
                {key}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSecTargetRegions([])}
              className="px-1.5 py-0.5 text-rose-600 hover:text-rose-800 font-medium cursor-pointer ml-1"
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
          className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />

        <div className="max-h-36 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 p-1 bg-white rounded-lg border border-zinc-200/80">
          {filteredWilayas.map((wilaya) => {
            const isChecked = secTargetRegions.includes(wilaya);
            const [num, ...rest] = wilaya.split(" ");
            const name = rest.join(" ");
            return (
              <button
                key={wilaya}
                type="button"
                onClick={() => handleToggleWilaya(wilaya)}
                className={`flex items-center gap-1.5 p-1.5 rounded-lg text-left text-xs transition-all cursor-pointer border ${
                  isChecked
                    ? "bg-emerald-50 text-emerald-950 font-bold border-emerald-300 ring-1 ring-emerald-400/20"
                    : "bg-white text-zinc-700 hover:bg-zinc-50 border-zinc-200/70"
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] shrink-0 ${
                  isChecked ? "bg-emerald-600 text-white" : "border border-zinc-300"
                }`}>
                  {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-100 text-zinc-600 font-bold">{num}</span>
                <span className="truncate text-[11px]">{name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme Name & Background Colors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {t("Badge de Saison / Campagne")}
          </label>
          <input
            type="text"
            value={secThemeName}
            onChange={(e) => setSecThemeName(e.target.value)}
            placeholder={t("Ex: Spécial Ramadan, Soldes d'Été")}
            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-zinc-500" />
            {t("Couleur de fond")}
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {COLOR_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setSecBackgroundColor(p.value)}
                  style={{ backgroundColor: p.value }}
                  className={`w-6 h-6 rounded-md border ${p.border} ${
                    secBackgroundColor === p.value ? "ring-2 ring-amber-500 scale-110" : "hover:scale-105"
                  } transition-all cursor-pointer`}
                  title={p.label}
                />
              ))}
            </div>
            <input
              type="color"
              value={secBackgroundColor || "#ffffff"}
              onChange={(e) => setSecBackgroundColor(e.target.value)}
              className="w-7 h-7 p-0.5 rounded-lg border border-zinc-200 cursor-pointer"
            />
            <input
              type="text"
              value={secBackgroundColor || "#ffffff"}
              onChange={(e) => setSecBackgroundColor(e.target.value)}
              className="w-20 px-2 py-1 text-[11px] font-mono rounded-lg border border-zinc-200 bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
