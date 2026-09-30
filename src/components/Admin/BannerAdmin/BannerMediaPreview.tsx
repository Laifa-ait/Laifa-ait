import React from "react";
import { useTranslation } from "react-i18next";
import { Check, Image as ImageIcon } from "lucide-react";
import { TagType } from "../../../hooks/useBannerAdmin";

export interface BannerMediaPreviewProps {
  bannerDesktopImage: string;
  bannerMobileImage: string;
  bannerTitle: string;
  bannerTitleColor: string;
  bannerSubtitle: string;
  bannerSubtitleColor: string;
  bannerButtonText: string;
  bannerBtnBgColor: string;
  bannerBtnTextColor: string;
  bannerTagId: string;
  tags: TagType[];
}

export const BannerMediaPreview: React.FC<BannerMediaPreviewProps> = ({
  bannerDesktopImage,
  bannerMobileImage,
  bannerTitle,
  bannerTitleColor,
  bannerSubtitle,
  bannerSubtitleColor,
  bannerButtonText,
  bannerBtnBgColor,
  bannerBtnTextColor,
  bannerTagId,
  tags,
}) => {
  const { t } = useTranslation();
  const activeTag = tags.find((t) => t.id === bannerTagId);

  return (
    <div className="space-y-6">
      <div className="sticky top-0 space-y-5">
        <h4 className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
          <Check className="w-4 h-4 text-orange-600 animate-pulse" />
          {t("Aperçu en Temps Réel")}
        </h4>

        {/* Desktop Preview Card (Ratio 2.4:1) */}
        <div className="space-y-1.5">
          <span className="text-xs font-sans font-bold text-zinc-400 uppercase tracking-widest block">
            {t("Format Bureau (Aperçu)")}
          </span>
          <div className="w-full aspect-[2.4/1] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-200 relative shadow-md">
            {bannerDesktopImage ? (
              <img
                loading="lazy"
                src={bannerDesktopImage}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-zinc-400 text-center uppercase gap-1 text-xs font-mono">
                <ImageIcon className="w-8 h-8 opacity-40 shrink-0" />
                <span>{t("Pas d'image desktop")}</span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute inset-y-0 start-0 w-2/3 bg-gradient-to-r from-black/60 via-black/10 to-transparent" />

            {/* Marketing data overlays */}
            <div className="absolute inset-0 flex flex-col justify-end p-4 text-white text-start">
              {activeTag && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-white/15 tracking-widest uppercase font-sans font-bold text-xs w-fit mb-1">
                  {activeTag.name}
                </span>
              )}
              <h3
                className="text-sm font-sans font-bold tracking-tight leading-none mb-0.5 shadow-sm uppercase shrink-0"
                style={{ color: bannerTitleColor }}
              >
                {bannerTitle || "Titre de la Bannière"}
              </h3>
              {bannerSubtitle && (
                <p
                  className="text-xs font-semibold leading-normal mb-1 tracking-wide select-none drop-shadow-sm"
                  style={{ color: bannerSubtitleColor }}
                >
                  {bannerSubtitle}
                </p>
              )}
              <button
                type="button"
                style={{ backgroundColor: bannerBtnBgColor, color: bannerBtnTextColor }}
                className="rounded-lg py-1 px-3 text-xs uppercase tracking-widest font-sans font-bold shrink-0 w-fit pointer-events-none mt-1 shadow-sm"
              >
                {bannerButtonText}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Preview Frame Phone Mockup (Ratio 4:5) */}
        <div className="space-y-1.5">
          <span className="text-xs font-sans font-bold text-zinc-400 uppercase tracking-widest block">
            {t("Format Téléphone (Aperçu)")}
          </span>
          <div className="w-44 aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-200 relative mx-auto shadow-md">
            {bannerMobileImage ? (
              <img
                loading="lazy"
                src={bannerMobileImage}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : bannerDesktopImage ? (
              <div className="w-full h-full relative">
                <img
                  loading="lazy"
                  src={bannerDesktopImage}
                  alt=""
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-1.5 start-1.5 px-1.5 py-0.5 bg-orange-600/90 rounded text-xs font-sans font-bold text-white uppercase tracking-wider select-none leading-none">
                  {t("Desktop Fallback")}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-zinc-400 text-center uppercase gap-1 text-xs font-mono">
                <ImageIcon className="w-6 h-6 opacity-40 shrink-0" />
                <span>{t("Pas d'image")}</span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

            {/* Mobile mockup detail */}
            <div className="absolute inset-x-0 bottom-0 p-3 text-white text-start">
              {activeTag && (
                <span className="inline-block tracking-widest uppercase font-sans font-bold text-xs text-zinc-300 drop-shadow mb-0.5">
                  {activeTag.name}
                </span>
              )}
              <h4
                className="text-xs font-sans font-bold leading-tight mb-0.5 uppercase select-none tracking-tight drop-shadow truncate"
                style={{ color: bannerTitleColor }}
              >
                {bannerTitle || "Titre de la Bannière"}
              </h4>
              {bannerSubtitle && (
                <p
                  className="text-xs font-semibold leading-tight mb-1 opacity-95 truncate"
                  style={{ color: bannerSubtitleColor }}
                >
                  {bannerSubtitle}
                </p>
              )}
              <button
                type="button"
                style={{ backgroundColor: bannerBtnBgColor, color: bannerBtnTextColor }}
                className="rounded py-1 px-2.5 text-xs uppercase tracking-widest font-sans font-bold shrink-0 w-fit pointer-events-none block shadow-sm mt-0.5"
              >
                {bannerButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
