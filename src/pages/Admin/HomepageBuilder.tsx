import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useHomepageBuilderState } from "../../hooks/useHomepageBuilderState";
import { SectionsBannersList } from "../../components/Admin/HomepageBuilder/SectionsBannersList";
import { CataloguesMarketplace } from "../../components/Admin/HomepageBuilder/CataloguesMarketplace";
import { ItemFormModal } from "../../components/Admin/HomepageBuilder/ItemFormModal";
import { BackupVersionsPanel } from "../../components/Admin/HomepageBuilder/BackupVersionsPanel";

export const HomepageBuilder: React.FC = () => {
  const { t } = useTranslation();
  const state = useHomepageBuilderState();
  const [showBackups, setShowBackups] = useState(false);

  // Filter products by searching
  const filteredProducts = state.categoryProducts.filter((p) =>
    p.name.toLowerCase().includes(state.searchProductQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="homepage-builder-container">
      {/* Upper header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-sans font-bold text-zinc-950 uppercase tracking-tighter rtl:tracking-normal">
            {t("Homepage Builder")}
          </h2>
          <p className="text-sm font-bold text-zinc-950/60">
            {t("Gestion simplifiée des sections et catalogues personnalisés")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Backups trigger */}
          <button
            type="button"
            onClick={() => setShowBackups(!showBackups)}
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 rounded-xl font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal transition-colors cursor-pointer border-none"
          >
            {showBackups ? t("Fermer Sauvegardes") : t("Sauvegardes & Versions")}
          </button>

          <div className="flex bg-zinc-50 rounded-xl p-1 border border-zinc-200">
            {(["sections", "categories"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => state.setActiveTab(tab)}
                className={`px-4 sm:px-6 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider rtl:tracking-normal transition-all cursor-pointer border-none ${
                  state.activeTab === tab ? "bg-zinc-950 text-white shadow-md" : "text-zinc-950/60 hover:text-zinc-950"
                }`}
              >
                {tab === "sections" && t("Sections")}
                {tab === "categories" && t("Catégories & Vedettes")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Backups/Versions panel */}
      {showBackups && (
        <BackupVersionsPanel
          backupName={state.backupName}
          setBackupName={state.setBackupName}
          handleCreateBackup={state.handleCreateBackup}
          isLoadingVersions={state.isLoadingVersions}
          versions={state.versions}
          handleRestoreBackup={state.handleRestoreBackup}
          handleDeleteVersion={state.handleDeleteVersion}
        />
      )}

      {/* Main Builder UI content area */}
      {state.activeTab === "sections" ? (
        <SectionsBannersList
          sections={state.sections}
          isLoading={state.isLoading}
          handleAddItem={state.handleAddItem}
          handleEditItem={state.handleEditItem}
          handleDelete={state.handleDelete}
        />
      ) : (
        <CataloguesMarketplace
          selectedCategory={state.selectedCategory}
          setSelectedCategory={state.setSelectedCategory}
          catTitle={state.catTitle}
          setCatTitle={state.setCatTitle}
          catSubtitle={state.catSubtitle}
          setCatSubtitle={state.setCatSubtitle}
          catImage={state.catImage}
          setCatImage={state.setCatImage}
          catSubImages={state.catSubImages}
          setCatSubImages={state.setCatSubImages}
          catFeaturedIds={state.catFeaturedIds}
          toggleProductFeatured={state.toggleProductFeatured}
          filteredProducts={filteredProducts}
          searchProductQuery={state.searchProductQuery}
          setSearchProductQuery={state.setSearchProductQuery}
          isLoadingProducts={state.isLoadingProducts}
          isSavingCategory={state.isSavingCategory}
          handleSaveCategory={state.handleSaveCategory}
          handleFileUpload={state.handleFileUpload}
        />
      )}

      {/* Item Form Modal */}
      {state.isModalOpen &&
        createPortal(
          <ItemFormModal
            isModalOpen={state.isModalOpen}
            setIsModalOpen={state.setIsModalOpen}
            editItem={state.editItem}
            activeModalStep={state.activeModalStep}
            setActiveModalStep={state.setActiveModalStep}
            secName={state.secName}
            setSecName={state.setSecName}
            secType={state.secType}
            setSecType={state.setSecType}
            secLayout={state.secLayout || "standard"}
            setSecLayout={state.setSecLayout}
            secBackgroundColor={state.secBackgroundColor}
            setSecBackgroundColor={state.setSecBackgroundColor}
            secLimit={state.secLimit}
            setSecLimit={state.setSecLimit}
            secStyle={state.secStyle}
            setSecStyle={state.setSecStyle}
            secThemeName={state.secThemeName}
            setSecThemeName={state.setSecThemeName}
            secThemeImage={state.secThemeImage}
            setSecThemeImage={state.setSecThemeImage}
            secTheme={state.secTheme || "light"}
            setSecTheme={state.setSecTheme}
            secCategory={state.secCategory}
            setSecCategory={state.setSecCategory}
            secTag={state.secTag}
            setSecTag={state.setSecTag}
            secTitle={state.secTitle}
            setSecTitle={state.setSecTitle}
            secSubtitle={state.secSubtitle}
            setSecSubtitle={state.setSecSubtitle}
            secIsActive={state.secIsActive}
            setSecIsActive={state.setSecIsActive}
            secTargetAudience={state.secTargetAudience || "all"}
            setSecTargetAudience={state.setSecTargetAudience}
            secTargetRegions={state.secTargetRegions}
            setSecTargetRegions={state.setSecTargetRegions}
            searchSecProduct={state.searchSecProduct}
            setSearchSecProduct={state.setSearchSecProduct}
            modalSearchCategory={state.modalSearchCategory}
            setModalSearchCategory={state.setModalSearchCategory}
            secManualLinks={state.secManualLinks}
            setSecManualLinks={state.setSecManualLinks}
            allProducts={state.allProducts}
            handleFileUpload={state.handleFileUpload}
            handleSaveItem={state.handleSaveItem}
          />,
          document.body
        )}
    </div>
  );
};
