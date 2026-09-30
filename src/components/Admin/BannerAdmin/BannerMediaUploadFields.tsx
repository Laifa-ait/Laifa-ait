import React from "react";
import { useTranslation } from "react-i18next";
import { Upload, Check } from "lucide-react";

export interface BannerMediaUploadFieldsProps {
  bannerDesktopImage: string;
  setBannerDesktopImage: (v: string) => void;
  bannerMobileImage: string;
  setBannerMobileImage: (v: string) => void;
  isUploadingDesktop: boolean;
  uploadProgressDesktop: number;
  isUploadingMobile: boolean;
  uploadProgressMobile: number;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, type: "desktop" | "mobile") => Promise<void>;
}

export const BannerMediaUploadFields: React.FC<BannerMediaUploadFieldsProps> = ({
  bannerDesktopImage,
  setBannerDesktopImage,
  bannerMobileImage,
  setBannerMobileImage,
  isUploadingDesktop,
  uploadProgressDesktop,
  isUploadingMobile,
  uploadProgressMobile,
  handleImageUpload,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 pt-1 border-t border-zinc-100">
      {/* Desktop configuration */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-baseline">
          <label className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500">
            {t("Image Bureau * (1920x800 px)")}
          </label>
          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 rounded">{t("Obligatoire")}</span>
        </div>
        <div className="flex flex-col gap-2">
          {bannerDesktopImage && (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-2xl p-3 text-xs font-semibold">
              <Check className="w-4 h-4 text-green-600 shrink-0" />
              <span className="truncate flex-1">{t("Image bureau sélectionnée avec succès !")}</span>
              <button
                type="button"
                onClick={() => setBannerDesktopImage("")}
                className="text-xs text-zinc-500 hover:text-red-500 border border-zinc-200 hover:border-red-200 bg-white px-2 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                {t("Effacer")}
              </button>
            </div>
          )}
          <label
            className={`w-full h-11 px-4 rounded-2xl border-2 border-dashed flex items-center justify-between cursor-pointer transition-all select-none group ${
              bannerDesktopImage ? "border-zinc-200 hover:border-orange-300 hover:bg-zinc-50/50" : "border-orange-500 hover:border-orange-600 bg-orange-50/10"
            }`}
          >
            <div className="flex items-center gap-2 text-zinc-700 font-bold text-xs uppercase tracking-wider">
              <Upload className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
              <span>{bannerDesktopImage ? t("Remplacer l'image") : t("Importer une photo de bureau")}</span>
            </div>
            <span className="text-xs text-zinc-400 font-medium">{t("PNG, JPG, WEBP")}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleImageUpload(e, "desktop")}
              disabled={isUploadingDesktop}
            />
          </label>
        </div>
        {isUploadingDesktop && (
          <div className="flex flex-col gap-1 mt-1">
            <div className="text-xs text-orange-600 font-bold uppercase transition flex items-center justify-between">
              <span>{t("Chargement...")}</span>
              <span>{uploadProgressDesktop}%</span>
            </div>
            <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full transition-all duration-300" style={{ width: `${uploadProgressDesktop}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Mobile configuration */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-baseline">
          <label className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500">
            {t("Image Mobile (800x1000 px)")}
          </label>
          <span className="text-xs font-bold text-zinc-400 uppercase">{t("Optionnel")}</span>
        </div>
        <div className="flex flex-col gap-2">
          {bannerMobileImage && (
            <div className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-2xl p-3 text-xs font-semibold">
              <Check className="w-4 h-4 text-green-600 shrink-0" />
              <span className="truncate flex-1">{t("Image mobile sélectionnée avec succès !")}</span>
              <button
                type="button"
                onClick={() => setBannerMobileImage("")}
                className="text-xs text-zinc-500 hover:text-red-500 border border-zinc-200 hover:border-red-200 bg-white px-2 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                {t("Effacer")}
              </button>
            </div>
          )}
          <label
            className={`w-full h-11 px-4 rounded-2xl border-2 border-dashed flex items-center justify-between cursor-pointer transition-all select-none group ${
              bannerMobileImage ? "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50" : "border-zinc-300 hover:border-zinc-500 bg-zinc-50/10"
            }`}
          >
            <div className="flex items-center gap-2 text-zinc-700 font-bold text-xs uppercase tracking-wider">
              <Upload className="w-4 h-4 text-zinc-500 group-hover:scale-110 transition-transform" />
              <span>{bannerMobileImage ? t("Remplacer l'image") : t("Importer une photo mobile (Optionnelle)")}</span>
            </div>
            <span className="text-xs text-zinc-400 font-medium font-semibold">{t("Optionnel")}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleImageUpload(e, "mobile")}
              disabled={isUploadingMobile}
            />
          </label>
        </div>
        {isUploadingMobile && (
          <div className="flex flex-col gap-1 mt-1">
            <div className="text-xs text-zinc-600 font-bold uppercase transition flex items-center justify-between">
              <span>{t("Chargement...")}</span>
              <span>{uploadProgressMobile}%</span>
            </div>
            <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-zinc-500 h-full transition-all duration-300" style={{ width: `${uploadProgressMobile}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
