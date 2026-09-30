import React from "react";
import { useTranslation } from "react-i18next";
import { TagType } from "../../../hooks/useBannerAdmin";

export interface BannerVisualFormProps {
  bannerTitle: string;
  setBannerTitle: (v: string) => void;
  bannerTitleColor: string;
  setBannerTitleColor: (v: string) => void;
  bannerSubtitle: string;
  setBannerSubtitle: (v: string) => void;
  bannerSubtitleColor: string;
  setBannerSubtitleColor: (v: string) => void;
  bannerButtonText: string;
  setBannerButtonText: (v: string) => void;
  bannerBtnBgColor: string;
  setBannerBtnBgColor: (v: string) => void;
  bannerBtnTextColor: string;
  setBannerBtnTextColor: (v: string) => void;
  bannerTagId: string;
  setBannerTagId: (v: string) => void;
  tags: TagType[];
}

export const BannerVisualForm: React.FC<BannerVisualFormProps> = ({
  bannerTitle,
  setBannerTitle,
  bannerTitleColor,
  setBannerTitleColor,
  bannerSubtitle,
  setBannerSubtitle,
  bannerSubtitleColor,
  setBannerSubtitleColor,
  bannerButtonText,
  setBannerButtonText,
  bannerBtnBgColor,
  setBannerBtnBgColor,
  bannerBtnTextColor,
  setBannerBtnTextColor,
  bannerTagId,
  setBannerTagId,
  tags,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      {/* Title and Title Color */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500">
            {t("Titre de la Bannière *")}
          </label>
          <input
            type="text"
            required
            placeholder={t("ex: Sélection Premium") || "ex: Sélection Premium"}
            value={bannerTitle}
            onChange={(e) => setBannerTitle(e.target.value)}
            className="w-full h-11 px-4 rounded-2xl border border-zinc-200 text-sm focus:outline-none focus:border-orange-350 bg-white"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500">
            {t("Couleur Titre")}
          </label>
          <div className="flex gap-1.5">
            <input
              type="color"
              value={bannerTitleColor}
              onChange={(e) => setBannerTitleColor(e.target.value)}
              className="w-11 h-11 rounded-2xl cursor-pointer border border-zinc-200 shrink-0 select-none bg-transparent"
            />
            <input
              type="text"
              placeholder="#FFFFFF"
              value={bannerTitleColor}
              onChange={(e) => setBannerTitleColor(e.target.value)}
              className="w-full h-11 px-2.5 border border-zinc-200 rounded-2xl text-xs uppercase font-mono font-bold focus:outline-none focus:border-orange-300 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Subtitle and Subtitle Color */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-100 pt-3">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500">
            {t("Sous-titre de la Bannière")}
          </label>
          <input
            type="text"
            placeholder={t("ex: Découvrez notre nouvelle collection en exclusivité") || "ex: Découvrez notre nouvelle collection en exclusivité"}
            value={bannerSubtitle}
            onChange={(e) => setBannerSubtitle(e.target.value)}
            className="w-full h-11 px-4 rounded-2xl border border-zinc-200 text-sm focus:outline-none focus:border-orange-500 bg-white"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500">
            {t("Couleur Sous-titre")}
          </label>
          <div className="flex gap-1.5">
            <input
              type="color"
              value={bannerSubtitleColor}
              onChange={(e) => setBannerSubtitleColor(e.target.value)}
              className="w-11 h-11 rounded-2xl cursor-pointer border border-zinc-200 shrink-0 select-none bg-transparent"
            />
            <input
              type="text"
              placeholder="#FFFFFF"
              value={bannerSubtitleColor}
              onChange={(e) => setBannerSubtitleColor(e.target.value)}
              className="w-full h-11 px-2.5 border border-zinc-200 rounded-2xl text-xs uppercase font-mono font-bold focus:outline-none focus:border-orange-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Button CTA text and styling */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-100 pt-3">
        <div className="space-y-1.5">
          <label className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500">
            {t("Texte du Bouton *")}
          </label>
          <input
            type="text"
            required
            placeholder={t("ex: Découvrir") || "ex: Découvrir"}
            value={bannerButtonText}
            onChange={(e) => setBannerButtonText(e.target.value)}
            className="w-full h-11 px-4 rounded-2xl border border-zinc-200 text-sm focus:outline-none focus:border-orange-500 bg-white"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500">
            {t("Fond du Bouton")}
          </label>
          <div className="flex gap-1.5">
            <input
              type="color"
              value={bannerBtnBgColor}
              onChange={(e) => setBannerBtnBgColor(e.target.value)}
              className="w-11 h-11 rounded-2xl cursor-pointer border border-zinc-200 shrink-0 select-none bg-transparent"
            />
            <input
              type="text"
              placeholder="#FFFFFF"
              value={bannerBtnBgColor}
              onChange={(e) => setBannerBtnBgColor(e.target.value)}
              className="w-full h-11 px-2.5 border border-zinc-200 rounded-2xl text-xs uppercase font-mono font-bold focus:outline-none focus:border-orange-500 bg-white"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500">
            {t("Écriture Bouton")}
          </label>
          <div className="flex gap-1.5">
            <input
              type="color"
              value={bannerBtnTextColor}
              onChange={(e) => setBannerBtnTextColor(e.target.value)}
              className="w-11 h-11 rounded-2xl cursor-pointer border border-zinc-200 shrink-0 select-none bg-transparent"
            />
            <input
              type="text"
              placeholder="#18181B"
              value={bannerBtnTextColor}
              onChange={(e) => setBannerBtnTextColor(e.target.value)}
              className="w-full h-11 px-2.5 border border-zinc-200 rounded-2xl text-xs uppercase font-mono font-bold focus:outline-none focus:border-orange-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Tag ID selection (required) */}
      <div className="space-y-1.5 pt-1 border-t border-zinc-100">
        <div className="flex justify-between items-baseline">
          <label className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500">
            {t("Tag de Redirection d'Accueil *")}
          </label>
          <span className="text-xs font-bold text-zinc-400">{t("Clic → Filtre Catalogue")}</span>
        </div>
        {tags.length === 0 ? (
          <div className="p-3 bg-red-50 text-red-500 rounded-2xl text-xs font-bold font-mono">
            {t("Veuillez d'abord créer au moins un Tag dans l'onglet tags avant d'ajouter une bannière !")}
          </div>
        ) : (
          <select
            required
            value={bannerTagId}
            onChange={(e) => setBannerTagId(e.target.value)}
            className="w-full h-11 px-4 rounded-2xl border border-zinc-200 text-sm focus:outline-none focus:border-orange-500 bg-white cursor-pointer"
          >
            <option value="">{t("Sélectionnez un tag...")}</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name} (/{tag.slug})
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};
