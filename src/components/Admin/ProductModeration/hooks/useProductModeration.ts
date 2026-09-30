import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../../context/AuthContext";
import { Product } from "../../../../domains/product/product.types";
import { useModerationActions } from "./useModerationActions";

export const useProductModeration = (showConfirmModal: (text: string) => Promise<boolean>) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "active" | "rejected" | "pending_deletion">("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [lastVisible, setLastVisible] = useState<string | null>(null);
  const PRODUCTS_PER_PAGE = 25;

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [targetProduct, setTargetProduct] = useState<Product | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const preconfiguredReasons = useMemo(() => [
    t("Image non conforme ou de mauvaise qualité"),
    t("Prix irréaliste ou anormalement incohérent"),
    t("Suspicion de contrefaçon ou non-authenticité"),
    t("Description inappropriée, trompeuse ou incomplète"),
    t("Catégorie ou classification de produit incorrecte"),
    t("Produit interdit ou non conforme à la charte Olmart"),
    t("Absence d'informations obligatoires (ex: Guide des tailles, fiche technique)"),
  ], [t]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const token = await currentUser?.getIdToken(true);
      if (!token) throw new Error("Non authentifié");

      const params = new URLSearchParams({
        status: activeTab,
        limit: PRODUCTS_PER_PAGE.toString(),
      });
      if (selectedCategory !== "Tous") {
        params.append("category", selectedCategory);
      }

      const res = await fetch(`/api/v1/admin/products?${params.toString()}`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setProducts(data.products || []);
      setLastVisible(data.lastVisibleId || null);
    } catch (err) {
      console.error("Error fetching products for moderation:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, activeTab, selectedCategory]);

  const loadMore = useCallback(async () => {
    if (!lastVisible) return;
    try {
      const token = await currentUser?.getIdToken(true);
      if (!token) throw new Error("Non authentifié");

      const params = new URLSearchParams({
        status: activeTab,
        limit: PRODUCTS_PER_PAGE.toString(),
        startAfter: lastVisible,
      });
      if (selectedCategory !== "Tous") {
        params.append("category", selectedCategory);
      }

      const res = await fetch(`/api/v1/admin/products?${params.toString()}`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setProducts((prev) => [...prev, ...(data.products || [])]);
      setLastVisible(data.lastVisibleId || null);
    } catch (err) {
      console.error(err);
    }
  }, [currentUser, activeTab, selectedCategory, lastVisible]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const actions = useModerationActions(
    showConfirmModal,
    setProducts,
    fetchProducts,
    activeTab
  );

  const handleOpenRejectModal = useCallback((product: Product) => {
    setTargetProduct(product);
    setRejectReason(preconfiguredReasons[0]);
    setCustomReason("");
    setRejectModalOpen(true);
  }, [preconfiguredReasons]);

  const onRejectSubmit = useCallback(() => {
    const finalReason = rejectReason === "Autre reason" ? customReason : rejectReason;
    void actions.handleRejectSubmit(targetProduct, finalReason, () => {
      setRejectModalOpen(false);
      setTargetProduct(null);
    });
  }, [actions, targetProduct, rejectReason, customReason]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sellerName && p.sellerName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === "Tous" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  return {
    products,
    loading,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    lastVisible,
    rejectModalOpen,
    setRejectModalOpen,
    targetProduct,
    rejectReason,
    setRejectReason,
    customReason,
    setCustomReason,
    preconfiguredReasons,
    filteredProducts,
    fetchProducts,
    loadMore,
    handleApprove: actions.handleApprove,
    handleOpenRejectModal,
    handleRejectSubmit: onRejectSubmit,
    handleConfirmDelete: actions.handleConfirmDelete,
    handleDenyDelete: actions.handleDenyDelete,
    handleRecalculateScores: actions.handleRecalculateScores,
  };
};
