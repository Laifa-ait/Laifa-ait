import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutTemplate,
  Grid,
  History,
  Eye,
  RefreshCw,
} from "lucide-react";
import { useHomepageBuilderState } from "../../hooks/useHomepageBuilderState";
import { SectionsBannersList } from "../../components/Admin/HomepageBuilder/SectionsBannersList";
import { CataloguesMarketplace } from "../../components/Admin/HomepageBuilder/CataloguesMarketplace";
import { ItemFormModal } from "../../components/Admin/HomepageBuilder/ItemFormModal";
import { BackupVersionsPanel } from "../../components/Admin/HomepageBuilder/BackupVersionsPanel";
import { HomepageLivePreview } from "../../components/Admin/HomepageBuilder/HomepageLivePreview";

export const HomepageBuilder: React.FC = () => {
  const { t } = useTranslation();
  const state = useHomepageBuilderState();
  const [activeTab, setActiveTab] = useState<"sections" | "categories" | "versions" | "preview">("sections");

  const filteredCategoryProducts = state.categoriesState.categoryProducts.filter((p) =>
    p.name.toLowerCase().includes(state.categoriesState.searchProductQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="homepage-builder-container">
      {/* 2026 Studio Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-slate-950">
                Homepage Studio 2.0
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {state.sections.filter((s) => s.isActive).length} {t("sections actives en ligne")}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {t("Éditeur de Page d'Accueil Olmart")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {t("Personnalisez les rayons, ventes flash, sélections prestige et bannières avec synchronisation instantanée 58 wilayas.")}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={state.isSyncingCache}
              onClick={state.handleSyncCache}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold transition-all border border-slate-700 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${state.isSyncingCache ? "animate-spin" : ""}`} />
              {state.isSyncingCache ? t("Synchronisation...") : t("Vider le Cache")}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab(activeTab === "preview" ? "sections" : "preview")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "preview"
                  ? "bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
            >
              <Eye className="w-4 h-4 text-amber-400" />
              {activeTab === "preview" ? t("Fermer le Simulateur") : t("Simulateur Storefront")}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("sections")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "sections"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <LayoutTemplate className="w-4 h-4 text-amber-500" />
            {t("Sections d'Accueil")} ({state.sections.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "categories"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Grid className="w-4 h-4 text-amber-500" />
            {t("Rayons & Catégories")}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("versions")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "versions"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <History className="w-4 h-4 text-amber-500" />
            {t("Sauvegardes")} ({state.versionsState.versions.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`hidden sm:flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "preview"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eye className="w-4 h-4 text-amber-500" />
            {t("Simulateur 2026")}
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === "preview" && (
        <HomepageLivePreview
          sections={state.sections}
          allProducts={state.allProducts}
          onClose={() => setActiveTab("sections")}
        />
      )}

      {activeTab === "sections" && (
        <SectionsBannersList
          sections={state.sections}
          isLoading={state.isLoading}
          handleAddItem={state.handleAddItem}
          handleEditItem={state.handleEditItem}
          handleDelete={state.handleDelete}
          handleToggleActive={state.handleToggleSectionActive}
          handleMove={state.handleMoveSection}
          handleApplyPreset={state.handleApplyPreset}
          onOpenLivePreview={() => setActiveTab("preview")}
        />
      )}

      {activeTab === "categories" && (
        <CataloguesMarketplace
          selectedCategory={state.categoriesState.selectedCategory}
          setSelectedCategory={state.categoriesState.setSelectedCategory}
          catTitle={state.categoriesState.catTitle}
          setCatTitle={state.categoriesState.setCatTitle}
          catSubtitle={state.categoriesState.catSubtitle}
          setCatSubtitle={state.categoriesState.setCatSubtitle}
          catImage={state.categoriesState.catImage}
          setCatImage={state.categoriesState.setCatImage}
          catSubImages={state.categoriesState.catSubImages}
          setCatSubImages={state.categoriesState.setCatSubImages}
          catFeaturedIds={state.categoriesState.catFeaturedIds}
          toggleProductFeatured={state.categoriesState.toggleProductFeatured}
          filteredProducts={filteredCategoryProducts}
          searchProductQuery={state.categoriesState.searchProductQuery}
          setSearchProductQuery={state.categoriesState.setSearchProductQuery}
          isLoadingProducts={state.categoriesState.isLoadingProducts}
          isSavingCategory={state.categoriesState.isSavingCategory}
          handleSaveCategory={() => state.categoriesState.handleSaveCategory(state.loadCategoryConfigAndProducts)}
        />
      )}

      {activeTab === "versions" && (
        <BackupVersionsPanel
          backupName={state.versionsState.backupName}
          setBackupName={state.versionsState.setBackupName}
          handleCreateBackup={() => state.versionsState.handleCreateBackup(state.sections, state.currentUser?.email || undefined)}
          isLoadingVersions={state.versionsState.isLoadingVersions}
          versions={state.versionsState.versions}
          handleRestoreBackup={(v) => state.versionsState.handleRestoreBackup(v, state.loadCategoryConfigAndProducts)}
          handleDeleteVersion={state.versionsState.handleDeleteVersion}
        />
      )}

      {/* Item Form Modal */}
      {state.isModalOpen &&
        createPortal(
          <ItemFormModal
            isModalOpen={state.isModalOpen}
            setIsModalOpen={state.setIsModalOpen}
            editItem={state.editItem}
            secName={state.sectionsState.secName}
            setSecName={state.sectionsState.setSecName}
            secType={state.sectionsState.secType}
            setSecType={state.sectionsState.setSecType}
            secLayout={state.sectionsState.secLayout || "standard"}
            setSecLayout={state.sectionsState.setSecLayout}
            secBackgroundColor={state.sectionsState.secBackgroundColor}
            setSecBackgroundColor={state.sectionsState.setSecBackgroundColor}
            secLimit={state.sectionsState.secLimit}
            setSecLimit={state.sectionsState.setSecLimit}
            secStyle={state.sectionsState.secStyle}
            setSecStyle={state.sectionsState.setSecStyle}
            secThemeName={state.sectionsState.secThemeName}
            setSecThemeName={state.sectionsState.setSecThemeName}
            secThemeImage={state.sectionsState.secThemeImage}
            setSecThemeImage={state.sectionsState.setSecThemeImage}
            secTheme={state.sectionsState.secTheme || "none"}
            setSecTheme={state.sectionsState.setSecTheme}
            secCategory={state.sectionsState.secCategory}
            setSecCategory={state.sectionsState.setSecCategory}
            secTag={state.sectionsState.secTag}
            setSecTag={state.sectionsState.setSecTag}
            secTitle={state.sectionsState.secTitle}
            setSecTitle={state.sectionsState.setSecTitle}
            secSubtitle={state.sectionsState.secSubtitle}
            setSecSubtitle={state.sectionsState.setSecSubtitle}
            secIsActive={state.sectionsState.secIsActive}
            setSecIsActive={state.sectionsState.setSecIsActive}
            secTargetAudience={state.sectionsState.secTargetAudience || "all"}
            setSecTargetAudience={state.sectionsState.setSecTargetAudience}
            secTargetRegions={state.sectionsState.secTargetRegions}
            setSecTargetRegions={state.sectionsState.setSecTargetRegions}
            searchSecProduct={state.sectionsState.searchSecProduct}
            setSearchSecProduct={state.sectionsState.setSearchSecProduct}
            modalSearchCategory={state.sectionsState.modalSearchCategory}
            setModalSearchCategory={state.sectionsState.setModalSearchCategory}
            secManualLinks={state.sectionsState.secManualLinks}
            setSecManualLinks={state.sectionsState.setSecManualLinks}
            allProducts={state.allProducts}
            handleSaveItem={state.handleSaveItem}
          />,
          document.body
        )}
    </div>
  );
};
