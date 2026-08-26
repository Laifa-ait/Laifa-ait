import { useState, useEffect, useCallback } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { HomepageSection } from "../domains/home/homepage.types";
import { Product } from "../domains/product/product.types";
import { adminHomepageApi } from "../services/api/adminHomepage.api";
import { useFirebaseHomepage } from "./useFirebaseHomepage";
import { useHomepageBuilder } from "./useHomepageBuilder";
import { useHomepageSections } from "./homepageBuilder/useHomepageSections";
import { useHomepageCategories, CategoryConfig } from "./homepageBuilder/useHomepageCategories";
import { useHomepageVersions, VersionInfo } from "./homepageBuilder/useHomepageVersions";
import { useHomepageModalState } from "./homepageBuilder/useHomepageModalState";
import toast from "react-hot-toast";

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
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isSyncingCache, setIsSyncingCache] = useState(false);

  // Extract stable function references to prevent dependency loop
  const { setEditItem, setActiveModalStep, setIsModalOpen } = modal;
  const { resetSectionForm, populateSectionForm, setSections } = sectionsState;
  const { fetchVersions } = versionsState;
  const { loadCategoryConfigAndProducts: loadCategoryFromHook, selectedCategory } = categoriesState;

  const resetForm = useCallback(() => {
    setEditItem(null);
    setActiveModalStep(1);
    resetSectionForm();
  }, [setEditItem, setActiveModalStep, resetSectionForm]);

  const handleAddItem = useCallback(() => {
    resetForm();
    setIsModalOpen(true);
  }, [resetForm, setIsModalOpen]);

  const handleEditItem = useCallback((item: HomepageSection) => {
    setEditItem(item);
    setActiveModalStep(1);
    populateSectionForm(item);
    setIsModalOpen(true);
  }, [setEditItem, setActiveModalStep, populateSectionForm, setIsModalOpen]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const rawSections = await fetchHookData("homepage_sections");
      const sortedSections = [...(rawSections || [])].sort(
        (a: HomepageSection, b: HomepageSection) => (Number(a.orderIndex) || 0) - (Number(b.orderIndex) || 0)
      );
      setSections(sortedSections);
      fetchVersions();
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchHookData, setSections, fetchVersions]);

  const loadCategoryConfigAndProducts = useCallback(async () => {
    await loadCategoryFromHook(setIsLoading);
  }, [loadCategoryFromHook]);

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
  }, [modal.activeTab, selectedCategory, fetchData, loadCategoryConfigAndProducts]);

  const handleSaveItem = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const manualIds = sectionsState.secManualLinks
      .map((val) => {
        const str = (val || "").trim();
        if (str.includes("/product/")) {
          return str.split("/product/")[1].split("?")[0].split("/")[0].split("#")[0];
        }
        return str;
      })
      .filter((id) => Boolean(id));

    const payload = {
      name: sectionsState.secName || "Nouvelle Section",
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
      manualProducts: manualIds,
      title: sectionsState.secTitle,
      subtitle: sectionsState.secSubtitle,
      isActive: sectionsState.secIsActive,
      startDate: sectionsState.secStartDate || undefined,
      endDate: sectionsState.secEndDate || undefined,
      targetAudience: sectionsState.secTargetAudience,
      targetRegions: sectionsState.secTargetRegions,
      orderIndex: modal.editItem ? modal.editItem.orderIndex : sectionsState.sections.length + 1,
    };

    try {
      await saveHookItem("homepage_sections", modal.editItem ? modal.editItem.id : null, payload);
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
    }
  }, [
    sectionsState.secManualLinks,
    sectionsState.secName,
    sectionsState.secType,
    sectionsState.secLayout,
    sectionsState.secBackgroundColor,
    sectionsState.secLimit,
    sectionsState.secStyle,
    sectionsState.secTheme,
    sectionsState.secThemeName,
    sectionsState.secThemeImage,
    sectionsState.secTag,
    sectionsState.secCategory,
    sectionsState.secTitle,
    sectionsState.secSubtitle,
    sectionsState.secIsActive,
    sectionsState.secStartDate,
    sectionsState.secEndDate,
    sectionsState.secTargetAudience,
    sectionsState.secTargetRegions,
    sectionsState.sections.length,
    modal.editItem,
    saveHookItem,
    setIsModalOpen,
    resetForm,
    fetchData,
  ]);

  const handleToggleSectionActive = useCallback(async (section: HomepageSection) => {
    const nextState = !section.isActive;
    // Optimistic local update
    setSections((prev) =>
      prev.map((s) => (s.id === section.id ? { ...s, isActive: nextState } : s))
    );
    try {
      await adminHomepageApi.updateSection(section.id, { isActive: nextState });
      toast.success(nextState ? "Section activée sur la page d'accueil" : "Section désactivée");
    } catch (err) {
      console.error("Error toggling section:", err);
      toast.error("Erreur lors de la mise à jour");
      fetchData();
    }
  }, [setSections, fetchData]);

  const handleReorder = useCallback(async (newSections: HomepageSection[]) => {
    // Optimistic UI update
    setSections(newSections);
    const orderedIds = newSections.map((s) => s.id);
    try {
      await adminHomepageApi.reorderSections(orderedIds);
      toast.success("Ordre des sections sauvegardé !");
    } catch (err) {
      console.error("Error reordering sections:", err);
      toast.error("Erreur de réorganisation");
      fetchData();
    }
  }, [setSections, fetchData]);

  const handleMoveSection = useCallback(async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sectionsState.sections.length) return;

    const updated = [...sectionsState.sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    await handleReorder(updated);
  }, [sectionsState.sections, handleReorder]);

  const handleApplyPreset = useCallback((preset: Partial<HomepageSection>) => {
    resetForm();
    populateSectionForm({
      id: "",
      name: preset.name || "Section Thématique",
      type: preset.type || "top_picks",
      layout: preset.layout || "standard",
      style: preset.style || "premium",
      orderIndex: sectionsState.sections.length + 1,
      isActive: true,
      title: preset.title || "",
      subtitle: preset.subtitle || "",
      category: preset.category || "",
      tag: preset.tag || "",
      theme: preset.theme || "none",
      themeName: preset.themeName || "",
      themeImage: preset.themeImage || "",
      targetRegions: preset.targetRegions || [],
      targetAudience: preset.targetAudience || "all",
      limit: preset.limit || 8,
    } as HomepageSection);
    setIsModalOpen(true);
  }, [resetForm, populateSectionForm, sectionsState.sections.length, setIsModalOpen]);

  const handleSyncCache = useCallback(async () => {
    setIsSyncingCache(true);
    try {
      await adminHomepageApi.syncCache();
      toast.success("Cache storefront actualisé en temps réel !");
      await fetchData();
    } catch (err) {
      console.error("Error syncing cache:", err);
      toast.error("Erreur de synchronisation du cache");
    } finally {
      setIsSyncingCache(false);
    }
  }, [fetchData]);

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
    sectionsState,
    categoriesState,
    versionsState,
    isLivePreviewOpen,
    setIsLivePreviewOpen,
    previewDevice,
    setPreviewDevice,
    isSyncingCache,
    handleSyncCache,
    resetForm,
    handleAddItem,
    handleEditItem,
    handleSaveItem,
    handleToggleSectionActive,
    handleReorder,
    handleMoveSection,
    handleApplyPreset,
    handleDelete,
    loadCategoryConfigAndProducts,
  };
}
