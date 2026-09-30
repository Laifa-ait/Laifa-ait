import React from "react";
import { useTranslation } from "react-i18next";
import { X, Check } from "lucide-react";
import { DbBanner, TagType } from "../../../hooks/useBannerAdmin";
import { Product } from "../../../domains/product/product.types";
import { BannerVisualForm } from "./BannerVisualForm";
import { BannerMediaUploadFields } from "./BannerMediaUploadFields";
import { BannerFeaturedProductsForm } from "./BannerFeaturedProductsForm";
import { BannerTargetingForm } from "./BannerTargetingForm";
import { BannerMediaPreview } from "./BannerMediaPreview";

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBanner: DbBanner | null;
  tags: TagType[];
  allProducts: Product[];

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
  bannerDesktopImage: string;
  setBannerDesktopImage: (v: string) => void;
  bannerMobileImage: string;
  setBannerMobileImage: (v: string) => void;
  bannerTagId: string;
  setBannerTagId: (v: string) => void;
  bannerIsActive: boolean;
  setBannerIsActive: (v: boolean) => void;
  bannerFeaturedProducts: string[];
  setBannerFeaturedProducts: React.Dispatch<React.SetStateAction<string[]>>;
  bannerTargetUserType: "all" | "new" | "logged_in";
  setBannerTargetUserType: (v: "all" | "new" | "logged_in") => void;
  bannerTargetRegions: string[];
  setBannerTargetRegions: (v: string[]) => void;
  bannerStartDate: string;
  setBannerStartDate: (v: string) => void;
  bannerEndDate: string;
  setBannerEndDate: (v: string) => void;
  bannerAbGroup: "all" | "A" | "B";
  setBannerAbGroup: (v: "all" | "A" | "B") => void;
  bannerZone: "carousel_main" | "grid_top" | "grid_bottom" | "sidebar";
  setBannerZone: (v: "carousel_main" | "grid_top" | "grid_bottom" | "sidebar") => void;

  productSearchTerm: string;
  setProductSearchTerm: (v: string) => void;
  isUploadingDesktop: boolean;
  uploadProgressDesktop: number;
  isUploadingMobile: boolean;
  uploadProgressMobile: number;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, type: "desktop" | "mobile") => Promise<void>;
  handleSaveBanner: (e: React.FormEvent) => Promise<void>;
}

export const BannerFormModal: React.FC<BannerFormModalProps> = ({
  isOpen,
  onClose,
  selectedBanner,
  tags,
  allProducts,
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
  bannerDesktopImage,
  setBannerDesktopImage,
  bannerMobileImage,
  setBannerMobileImage,
  bannerTagId,
  setBannerTagId,
  bannerIsActive,
  setBannerIsActive,
  bannerFeaturedProducts,
  setBannerFeaturedProducts,
  bannerTargetUserType,
  setBannerTargetUserType,
  bannerTargetRegions,
  setBannerTargetRegions,
  bannerStartDate,
  setBannerStartDate,
  bannerEndDate,
  setBannerEndDate,
  bannerAbGroup,
  setBannerAbGroup,
  bannerZone,
  setBannerZone,
  productSearchTerm,
  setProductSearchTerm,
  isUploadingDesktop,
  uploadProgressDesktop,
  isUploadingMobile,
  uploadProgressMobile,
  handleImageUpload,
  handleSaveBanner,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transition-transform scale-100 border border-zinc-100 flex flex-col">
        {/* Modal Header */}
        <div className="p-6 sm:p-8 border-b border-zinc-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-sans font-bold text-zinc-900 uppercase tracking-tight">
              {selectedBanner ? t("Modifier la Bannière") : t("Créer une Bannière d'Accueil")}
            </h3>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
              {t("Remplissez et validez soigneusement les dimensions requises")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-2xl text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Grid content */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto flex-1">
          {/* Form parameters */}
          <form onSubmit={handleSaveBanner} className="space-y-5">
            <BannerVisualForm
              bannerTitle={bannerTitle}
              setBannerTitle={setBannerTitle}
              bannerTitleColor={bannerTitleColor}
              setBannerTitleColor={setBannerTitleColor}
              bannerSubtitle={bannerSubtitle}
              setBannerSubtitle={setBannerSubtitle}
              bannerSubtitleColor={bannerSubtitleColor}
              setBannerSubtitleColor={setBannerSubtitleColor}
              bannerButtonText={bannerButtonText}
              setBannerButtonText={setBannerButtonText}
              bannerBtnBgColor={bannerBtnBgColor}
              setBannerBtnBgColor={setBannerBtnBgColor}
              bannerBtnTextColor={bannerBtnTextColor}
              setBannerBtnTextColor={setBannerBtnTextColor}
              bannerTagId={bannerTagId}
              setBannerTagId={setBannerTagId}
              tags={tags}
            />

            <BannerMediaUploadFields
              bannerDesktopImage={bannerDesktopImage}
              setBannerDesktopImage={setBannerDesktopImage}
              bannerMobileImage={bannerMobileImage}
              setBannerMobileImage={setBannerMobileImage}
              isUploadingDesktop={isUploadingDesktop}
              uploadProgressDesktop={uploadProgressDesktop}
              isUploadingMobile={isUploadingMobile}
              uploadProgressMobile={uploadProgressMobile}
              handleImageUpload={handleImageUpload}
            />

            <BannerFeaturedProductsForm
              allProducts={allProducts}
              bannerFeaturedProducts={bannerFeaturedProducts}
              setBannerFeaturedProducts={setBannerFeaturedProducts}
              productSearchTerm={productSearchTerm}
              setProductSearchTerm={setProductSearchTerm}
            />

            <BannerTargetingForm
              bannerIsActive={bannerIsActive}
              setBannerIsActive={setBannerIsActive}
              bannerTargetUserType={bannerTargetUserType}
              setBannerTargetUserType={setBannerTargetUserType}
              bannerTargetRegions={bannerTargetRegions}
              setBannerTargetRegions={setBannerTargetRegions}
              bannerStartDate={bannerStartDate}
              setBannerStartDate={setBannerStartDate}
              bannerEndDate={bannerEndDate}
              setBannerEndDate={setBannerEndDate}
              bannerZone={bannerZone}
              setBannerZone={setBannerZone}
              bannerAbGroup={bannerAbGroup}
              setBannerAbGroup={setBannerAbGroup}
            />

            {/* Confirm saving */}
            <button
              type="submit"
              disabled={isUploadingDesktop || isUploadingMobile}
              className="w-full h-12 bg-zinc-950 text-white hover:bg-zinc-850 rounded-2xl font-sans font-bold text-xs uppercase tracking-widest transition-colors select-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{t("Enregistrer la Bannière")}</span>
            </button>
          </form>

          {/* REAL-TIME PREVIEW PANEL */}
          <BannerMediaPreview
            bannerDesktopImage={bannerDesktopImage}
            bannerMobileImage={bannerMobileImage}
            bannerTitle={bannerTitle}
            bannerTitleColor={bannerTitleColor}
            bannerSubtitle={bannerSubtitle}
            bannerSubtitleColor={bannerSubtitleColor}
            bannerButtonText={bannerButtonText}
            bannerBtnBgColor={bannerBtnBgColor}
            bannerBtnTextColor={bannerBtnTextColor}
            bannerTagId={bannerTagId}
            tags={tags}
          />
        </div>
      </div>
    </div>
  );
};
