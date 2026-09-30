import React from "react";
import { useTranslation } from "react-i18next";
import { ALGERIA_WILAYAS } from "../../../constants/wilayas";

export interface BannerTargetingFormProps {
  bannerIsActive: boolean;
  setBannerIsActive: (v: boolean) => void;
  bannerTargetUserType: "all" | "new" | "logged_in";
  setBannerTargetUserType: (v: "all" | "new" | "logged_in") => void;
  bannerTargetRegions: string[];
  setBannerTargetRegions: (v: string[]) => void;
  bannerStartDate: string;
  setBannerStartDate: (v: string) => void;
  bannerEndDate: string;
  setBannerEndDate: (v: string) => void;
  bannerZone: "carousel_main" | "grid_top" | "grid_bottom" | "sidebar";
  setBannerZone: (v: "carousel_main" | "grid_top" | "grid_bottom" | "sidebar") => void;
  bannerAbGroup: "all" | "A" | "B";
  setBannerAbGroup: (v: "all" | "A" | "B") => void;
}

export const BannerTargetingForm: React.FC<BannerTargetingFormProps> = ({
  bannerIsActive,
  setBannerIsActive,
  bannerTargetUserType,
  setBannerTargetUserType,
  bannerTargetRegions,
  setBannerTargetRegions,
  bannerStartDate,
  setBannerStartDate,
  bannerEndDate,
  setBannerEndDate,
  bannerZone,
  setBannerZone,
  bannerAbGroup,
  setBannerAbGroup,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Published Draft slider */}
      <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
        <div className="space-y-0.5">
          <label className="text-xs font-extrabold text-zinc-950 uppercase">
            {t("Statut de la publication")}
          </label>
          <p className="text-xs font-bold text-zinc-500 uppercase">
            {t("Visible en page d'accueil si coché")}
          </p>
        </div>
        <input
          type="checkbox"
          checked={bannerIsActive}
          onChange={(e) => setBannerIsActive(e.target.checked)}
          className="w-6 h-6 text-orange-500 border-zinc-300 rounded focus:ring-orange-500 accent-orange-600 shrink-0 cursor-pointer"
        />
      </div>

      {/* Ciblage d'Audience & de Wilayas pour la Bannière */}
      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-3">
        <div className="space-y-0.5">
          <label className="text-xs font-extrabold text-zinc-950 uppercase flex items-center gap-1.5">
            <span>{t("🎯 Ciblage Fin & Personnalisation")}</span>
          </label>
          <p className="text-xs font-bold text-zinc-500 uppercase">
            {t("Ajustez l'affichage de la bannière sur l'accueil")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-start">
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-zinc-700 mb-1">
              {t("Audience Cible")}
            </label>
            <select
              value={bannerTargetUserType}
              onChange={(e) => setBannerTargetUserType(e.target.value as "all" | "new" | "logged_in")}
              className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-800 font-bold text-xs bg-white text-zinc-850 cursor-pointer"
            >
              <option value="all">{t("Tout le monde (Tous)")}</option>
              <option value="new">{t("Nouveaux Visiteurs uniquement")}</option>
              <option value="logged_in">{t("Utilisateurs Connectés uniquement")}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-zinc-700 mb-1">
              {t("Wilayas Cibles (")}
              {bannerTargetRegions.length})
            </label>
            <select
              onChange={(e) => {
                const val = e.target.value;
                if (val && !bannerTargetRegions.includes(val)) {
                  setBannerTargetRegions([...bannerTargetRegions, val]);
                }
                e.target.value = "";
              }}
              className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-800 font-bold text-xs bg-white text-zinc-850 cursor-pointer"
            >
              <option value="">{t("+ Ajouter une Wilaya")}</option>
              {ALGERIA_WILAYAS.map((w) => (
                <option key={w.code} value={`${w.code} - ${w.name}`}>
                  {w.code} - {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {bannerTargetRegions.length > 0 && (
          <div className="flex flex-wrap gap-1 p-2 bg-white border border-zinc-200 rounded-2xl max-h-[70px] overflow-y-auto">
            {bannerTargetRegions.map((w) => (
              <span
                key={w}
                className="inline-flex items-center gap-1 bg-zinc-900/5 text-zinc-900 border border-zinc-900/10 px-2 py-0.5 rounded-lg text-xs font-sans font-bold"
              >
                {w}
                <button
                  type="button"
                  onClick={() => setBannerTargetRegions(bannerTargetRegions.filter((item) => item !== w))}
                  className="hover:text-red-600 text-xs font-sans font-bold leading-none ms-1 bg-transparent border-none p-0 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={() => setBannerTargetRegions([])}
              className="text-red-500 hover:text-red-700 text-xs font-bold underline bg-transparent border-none p-0 cursor-pointer ms-auto"
            >
              {t("Vider tout")}
            </button>
          </div>
        )}
      </div>

      {/* Programmation de la publication */}
      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-3">
        <div className="space-y-0.5">
          <label className="text-xs font-extrabold text-zinc-950 uppercase flex items-center gap-1.5">
            <span>{t("📅 Programmation temporelle")}</span>
          </label>
          <p className="text-xs font-bold text-zinc-500 uppercase">
            {t("Configurez la période d'activité de la bannière")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-start">
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-zinc-700 mb-1">
              {t("Date de début")}
            </label>
            <input
              type="datetime-local"
              value={bannerStartDate}
              onChange={(e) => setBannerStartDate(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-800 font-bold text-xs bg-white text-zinc-850"
            />
          </div>
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-zinc-700 mb-1">
              {t("Date de fin")}
            </label>
            <input
              type="datetime-local"
              value={bannerEndDate}
              onChange={(e) => setBannerEndDate(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-800 font-bold text-xs bg-white text-zinc-850"
            />
          </div>
        </div>
      </div>

      {/* A/B Testing & Zone de Bannière */}
      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-3">
        <div className="space-y-0.5">
          <label className="text-xs font-extrabold text-zinc-950 uppercase flex items-center gap-1.5">
            <span>{t("📊 Zone d'affichage & Test A/B")}</span>
          </label>
          <p className="text-xs font-bold text-zinc-500 uppercase">
            {t("Associez la bannière à une zone et un groupe de test")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-start">
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-zinc-700 mb-1">
              {t("Zone d'affichage")}
            </label>
            <select
              value={bannerZone}
              onChange={(e) => setBannerZone(e.target.value as "carousel_main" | "grid_top" | "grid_bottom" | "sidebar")}
              className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-800 font-bold text-xs bg-white text-zinc-850 cursor-pointer"
            >
              <option value="carousel_main">{t("Carrousel Principal")}</option>
              <option value="grid_top">{t("Grille Haute")}</option>
              <option value="grid_bottom">{t("Grille Basse")}</option>
              <option value="sidebar">{t("Bannière Latérale")}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-sans font-bold uppercase tracking-wider text-zinc-700 mb-1">
              {t("Groupe de Test A/B")}
            </label>
            <select
              value={bannerAbGroup}
              onChange={(e) => setBannerAbGroup(e.target.value as "all" | "A" | "B")}
              className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-800 font-bold text-xs bg-white text-zinc-850 cursor-pointer"
            >
              <option value="all">{t("Tous (Pas d'A/B test)")}</option>
              <option value="A">{t("Groupe de test A")}</option>
              <option value="B">{t("Groupe de test B")}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
