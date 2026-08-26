import React from "react";
import { useTranslation } from "react-i18next";
import { useBannerAdmin } from "../../hooks/useBannerAdmin";
import { BannerListTable } from "../../components/Admin/BannerAdmin/BannerListTable";
import { BannerFormModal } from "../../components/Admin/BannerAdmin/BannerFormModal";
import { BannerPreviewModal } from "../../components/Admin/BannerAdmin/BannerPreviewModal";
import { TagManagerSection } from "../../components/Admin/BannerAdmin/TagManagerSection";
import { BannerAdminHeader } from "../../components/Admin/BannerAdmin/BannerAdminHeader";

export const BannerAdmin: React.FC = () => {
  const { t } = useTranslation();
  const state = useBannerAdmin();

  const {
    activeTab,
    setActiveTab,
    banners,
    tags,
    allProducts,
    isLoading,
    isBannerModalOpen,
    setIsBannerModalOpen,
    selectedBanner,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    previewBannerData,
    previewDeviceMode,
    setPreviewDeviceMode,
    tagName,
    tagSlug,
    setTagSlug,
    handleCreateTag,
    handleDeleteTag,
    handleTagNameChange,
    handleOpenBannerModal,
    handleDeleteBanner,
    shiftIndex,
    handleDragStart,
    handleDragOver,
    handleDrop,
  } = state;

  return (
    <div id="banner-admin-root" className="min-h-screen bg-[#fcfcfd] p-4 sm:p-8 space-y-8 pb-24">
      <BannerAdminHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleOpenBannerModal={handleOpenBannerModal}
      />

      {/* Main interactive tabs routing */}
      {isLoading ? (
        <div id="banner-admin-loading-spinner" className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
            {t("Chargement des configurations d'Algérie...")}
          </span>
        </div>
      ) : activeTab === "banners" ? (
        <div id="tab-content-banners" className="animate-fade-in">
          <BannerListTable
            banners={banners}
            tags={tags}
            handleOpenBannerModal={handleOpenBannerModal}
            handleDeleteBanner={handleDeleteBanner}
            shiftIndex={shiftIndex}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            draggedIndex={state.draggedIndex}
            setPreviewDeviceMode={state.setPreviewDeviceMode}
            setIsPreviewModalOpen={setIsPreviewModalOpen}
            setPreviewBannerData={state.setPreviewBannerData}
          />
        </div>
      ) : (
        <TagManagerSection
          tags={tags}
          tagName={tagName}
          tagSlug={tagSlug}
          setTagSlug={setTagSlug}
          handleCreateTag={handleCreateTag}
          handleDeleteTag={handleDeleteTag}
          handleTagNameChange={handleTagNameChange}
        />
      )}

      {/* MODAL EDIT / CREATE BANNER PANEL */}
      <BannerFormModal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        selectedBanner={selectedBanner}
        tags={tags}
        allProducts={allProducts}
        bannerTitle={state.bannerTitle}
        setBannerTitle={state.setBannerTitle}
        bannerTitleColor={state.bannerTitleColor}
        setBannerTitleColor={state.setBannerTitleColor}
        bannerSubtitle={state.bannerSubtitle}
        setBannerSubtitle={state.setBannerSubtitle}
        bannerSubtitleColor={state.bannerSubtitleColor}
        setBannerSubtitleColor={state.setBannerSubtitleColor}
        bannerButtonText={state.bannerButtonText}
        setBannerButtonText={state.setBannerButtonText}
        bannerBtnBgColor={state.bannerBtnBgColor}
        setBannerBtnBgColor={state.setBannerBtnBgColor}
        bannerBtnTextColor={state.bannerBtnTextColor}
        setBannerBtnTextColor={state.setBannerBtnTextColor}
        bannerDesktopImage={state.bannerDesktopImage}
        setBannerDesktopImage={state.setBannerDesktopImage}
        bannerMobileImage={state.bannerMobileImage}
        setBannerMobileImage={state.setBannerMobileImage}
        bannerTagId={state.bannerTagId}
        setBannerTagId={state.setBannerTagId}
        bannerIsActive={state.bannerIsActive}
        setBannerIsActive={state.setBannerIsActive}
        bannerFeaturedProducts={state.bannerFeaturedProducts}
        setBannerFeaturedProducts={state.setBannerFeaturedProducts}
        bannerTargetUserType={state.bannerTargetUserType}
        setBannerTargetUserType={state.setBannerTargetUserType}
        bannerTargetRegions={state.bannerTargetRegions}
        setBannerTargetRegions={state.setBannerTargetRegions}
        bannerStartDate={state.bannerStartDate}
        setBannerStartDate={state.setBannerStartDate}
        bannerEndDate={state.bannerEndDate}
        setBannerEndDate={state.setBannerEndDate}
        bannerAbGroup={state.bannerAbGroup}
        setBannerAbGroup={state.setBannerAbGroup}
        bannerZone={state.bannerZone}
        setBannerZone={state.setBannerZone}
        productSearchTerm={state.productSearchTerm}
        setProductSearchTerm={state.setProductSearchTerm}
        isUploadingDesktop={state.isUploadingDesktop}
        uploadProgressDesktop={state.uploadProgressDesktop}
        isUploadingMobile={state.isUploadingMobile}
        uploadProgressMobile={state.uploadProgressMobile}
        handleImageUpload={state.handleImageUpload}
        handleSaveBanner={state.handleSaveBanner}
      />

      {/* RESPONSIVE SIMULATOR PREVIEW MODAL */}
      <BannerPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          state.setPreviewBannerData(null);
        }}
        previewBannerData={previewBannerData}
        tags={tags}
        previewDeviceMode={previewDeviceMode}
        setPreviewDeviceMode={setPreviewDeviceMode}
      />
    </div>
  );
};
