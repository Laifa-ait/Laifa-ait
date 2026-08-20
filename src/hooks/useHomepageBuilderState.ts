import { useState, useEffect, useCallback } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { HomepageSection } from "../domains/home/homepage.types";
import { Product } from "../domains/product/product.types";
import { useFirebaseHomepage } from "./useFirebaseHomepage";
import { useHomepageBuilder } from "./useHomepageBuilder";

import { useHomepageSections } from "./homepageBuilder/useHomepageSections";
import { useHomepageCategories, CategoryConfig } from "./homepageBuilder/useHomepageCategories";
import { useHomepageVersions, VersionInfo } from "./homepageBuilder/useHomepageVersions";
import { useHomepageModalState } from "./homepageBuilder/useHomepageModalState";

export type { VersionInfo, CategoryConfig };

export function useHomepageBuilderState() {
  const { currentUser } = useAuth();
  const { fetchData: fetchHookData, saveItem: saveHookItem } = useFirebaseHomepage();
  const { deleteItem } = useHomepageBuilder();

  const modal = useHomepageModalState();
  const sectionsState = useHomepageSections();
  const categoriesState = useHomepageCategories();
  const versionsState = useHomepageVersions();

  const [isLoading, setIsLoading] = useState(true);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const resetForm = useCallback(() => {
    modal.setEditItem(null);
    modal.setActiveModalStep(1);
    sectionsState.resetSectionForm();
  }, [modal, sectionsState]);

  const handleAddItem = useCallback(() => {
    resetForm();
    modal.setIsModalOpen(true);
  }, [resetForm, modal]);

  const handleEditItem = useCallback((item: HomepageSection) => {
    modal.setEditItem(item);
    modal.setActiveModalStep(1);
    sectionsState.populateSectionForm(item);
    modal.setIsModalOpen(true);
  }, [modal, sectionsState]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const rawSections = await fetchHookData("homepage_sections");
      const sortedSections = [...(rawSections || [])].sort(
        (a: Record<string, unknown>, b: Record<string, unknown>) =>
          (Number(a.orderIndex) || 0) - (Number(b.orderIndex) || 0)
      );
      sectionsState.setSections(sortedSections as HomepageSection[]);
      versionsState.fetchVersions();
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchHookData, sectionsState, versionsState]);

  const loadCategoryConfigAndProducts = useCallback(async () => {
    await categoriesState.loadCategoryConfigAndProducts(setIsLoading);
  }, [categoriesState]);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(400));
        const snap = await getDocs(q);
        const prods = snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as Product));
        setAllProducts(prods);
      } catch (err) {
        console.error("Error fetching all products:", err);
      }
    };
    fetchAllProducts();
  }, []);

  useEffect(() => {
    if (modal.activeTab !== "categories") {
      fetchData();
    } else {
      loadCategoryConfigAndProducts();
    }
  }, [modal.activeTab, categoriesState.selectedCategory, fetchData, loadCategoryConfigAndProducts]);

  const handleSaveItem = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: sectionsState.secName,
      type: sectionsState.secType,
      layout: sectionsState.secLayout,
      backgroundColor: sectionsState.secBackgroundColor,
      limit: sectionsState.secLimit,
      style: sectionsState.secStyle,
      theme: sectionsState.secTheme,
      themeName: sectionsState.secThemeName,
      themeImage: sectionsState.secThemeImage,
      tag: sectionsState.secTag,
      category: sectionsState.secCategory,
      manualProducts: sectionsState.secManualLinks
        .map((val) => {
          const str = val.trim();
          if (str.includes("/product/")) {
            return str.split("/product/")[1].split("?")[0].split("/")[0].split("#")[0];
          }
          return str;
        })
        .filter((id) => id),
      title: sectionsState.secTitle,
      subtitle: sectionsState.secSubtitle,
      isActive: sectionsState.secIsActive,
      startDate: sectionsState.secStartDate || null,
      endDate: sectionsState.secEndDate || null,
      targetAudience: sectionsState.secTargetAudience,
      targetRegions: sectionsState.secTargetRegions,
      orderIndex: modal.editItem ? modal.editItem.orderIndex : sectionsState.sections.length + 1,
    };

    try {
      await saveHookItem("homepage_sections", modal.editItem ? modal.editItem.id : null, payload);
      modal.setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
    }
  }, [
    modal,
    sectionsState,
    saveHookItem,
    resetForm,
    fetchData,
  ]);

  const handleCreateBackup = useCallback(async () => {
    await versionsState.handleCreateBackup(
      sectionsState.sections,
      currentUser?.email || undefined
    );
  }, [versionsState, sectionsState.sections, currentUser]);

  const handleRestoreBackup = useCallback(async (version: VersionInfo) => {
    await versionsState.handleRestoreBackup(version, fetchData);
  }, [versionsState, fetchData]);

  const handleSaveCategory = useCallback(async () => {
    await categoriesState.handleSaveCategory(loadCategoryConfigAndProducts);
  }, [categoriesState, loadCategoryConfigAndProducts]);

  const handleDelete = useCallback(async (id: string) => {
    const success = await deleteItem("sections", id);
    if (success) fetchData();
  }, [deleteItem, fetchData]);

  return {
    currentUser,
    activeTab: modal.activeTab,
    setActiveTab: modal.setActiveTab,
    sections: sectionsState.sections,
    isLoading,
    allProducts,
    searchSecProduct: sectionsState.searchSecProduct,
    setSearchSecProduct: sectionsState.setSearchSecProduct,
    modalSearchCategory: sectionsState.modalSearchCategory,
    setModalSearchCategory: sectionsState.setModalSearchCategory,
    isModalOpen: modal.isModalOpen,
    setIsModalOpen: modal.setIsModalOpen,
    editItem: modal.editItem,
    secName: sectionsState.secName,
    setSecName: sectionsState.setSecName,
    secType: sectionsState.secType,
    setSecType: sectionsState.setSecType,
    secLayout: sectionsState.secLayout,
    setSecLayout: sectionsState.setSecLayout,
    secBackgroundColor: sectionsState.secBackgroundColor,
    setSecBackgroundColor: sectionsState.setSecBackgroundColor,
    secLimit: sectionsState.secLimit,
    setSecLimit: sectionsState.setSecLimit,
    secStyle: sectionsState.secStyle,
    setSecStyle: sectionsState.setSecStyle,
    secTheme: sectionsState.secTheme,
    setSecTheme: sectionsState.setSecTheme,
    secThemeName: sectionsState.secThemeName,
    setSecThemeName: sectionsState.setSecThemeName,
    secThemeImage: sectionsState.secThemeImage,
    setSecThemeImage: sectionsState.setSecThemeImage,
    secTag: sectionsState.secTag,
    setSecTag: sectionsState.setSecTag,
    secCategory: sectionsState.secCategory,
    setSecCategory: sectionsState.setSecCategory,
    secManualProducts: sectionsState.secManualProducts,
    setSecManualProducts: sectionsState.setSecManualProducts,
    secTitle: sectionsState.secTitle,
    setSecTitle: sectionsState.setSecTitle,
    secSubtitle: sectionsState.secSubtitle,
    setSecSubtitle: sectionsState.setSecSubtitle,
    secIsActive: sectionsState.secIsActive,
    setSecIsActive: sectionsState.setSecIsActive,
    secStartDate: sectionsState.secStartDate,
    setSecStartDate: sectionsState.setSecStartDate,
    secEndDate: sectionsState.secEndDate,
    setSecEndDate: sectionsState.setSecEndDate,
    activeModalStep: modal.activeModalStep,
    setActiveModalStep: modal.setActiveModalStep,
    secManualLinks: sectionsState.secManualLinks,
    setSecManualLinks: sectionsState.setSecManualLinks,
    secTargetAudience: sectionsState.secTargetAudience,
    setSecTargetAudience: sectionsState.setSecTargetAudience,
    secTargetRegions: sectionsState.secTargetRegions,
    setSecTargetRegions: sectionsState.setSecTargetRegions,
    draggedIdx: modal.draggedIdx,
    setDraggedIdx: modal.setDraggedIdx,
    versions: versionsState.versions,
    setVersions: versionsState.setVersions,
    backupName: versionsState.backupName,
    setBackupName: versionsState.setBackupName,
    isLoadingVersions: versionsState.isLoadingVersions,
    setIsLoadingVersions: versionsState.setIsLoadingVersions,
    previewDeviceMode: modal.previewDeviceMode,
    setPreviewDeviceMode: modal.setPreviewDeviceMode,
    dbCategories: categoriesState.dbCategories,
    selectedCategory: categoriesState.selectedCategory,
    setSelectedCategory: categoriesState.setSelectedCategory,
    catTitle: categoriesState.catTitle,
    setCatTitle: categoriesState.setCatTitle,
    catSubtitle: categoriesState.catSubtitle,
    setCatSubtitle: categoriesState.setCatSubtitle,
    catImage: categoriesState.catImage,
    setCatImage: categoriesState.setCatImage,
    catSubImages: categoriesState.catSubImages,
    setCatSubImages: categoriesState.setCatSubImages,
    catFeaturedIds: categoriesState.catFeaturedIds,
    setCatFeaturedIds: categoriesState.setCatFeaturedIds,
    categoryProducts: categoriesState.categoryProducts,
    searchProductQuery: categoriesState.searchProductQuery,
    setSearchProductQuery: categoriesState.setSearchProductQuery,
    isSavingCategory: categoriesState.isSavingCategory,
    isLoadingProducts: categoriesState.isLoadingProducts,
    resetForm,
    handleAddItem,
    handleEditItem,
    handleSaveItem,
    handleFileUpload: modal.handleFileUpload,
    handleCreateBackup,
    handleRestoreBackup,
    handleDeleteVersion: versionsState.handleDeleteVersion,
    handleSaveCategory,
    toggleProductFeatured: categoriesState.toggleProductFeatured,
    handleDelete,
  };
}
