import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../../context/AuthContext";
import toast from "react-hot-toast";
import { Product } from "../../../../domains/product/product.types";

export const useModerationActions = (
  showConfirmModal: (text: string) => Promise<boolean>,
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  fetchProducts: () => Promise<void>,
  activeTab: "pending" | "active" | "rejected" | "pending_deletion"
) => {
  const { t, i18n } = useTranslation();
  const { currentUser, userProfile } = useAuth();
  const isArabic = i18n.language === "ar" || i18n.language?.startsWith("ar");

  const handleApprove = useCallback(async (product: Product) => {
    if (!currentUser || userProfile?.role !== 'admin') {
      toast.error("Action non autorisée");
      return;
    }
    const toastId = toast.loading(t("Approbation en cours..."));
    try {
      const token = await currentUser?.getIdToken(true);
      if (!token) throw new Error("Non authentifié");
      const res = await fetch("/api/v1/admin/products/" + product.id + "/approve", {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Erreur serveur");
      await res.json();
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success(
        isArabic
          ? "تمت الموافقة على المنتج " + product.name + " بنجاح!"
          : "Produit " + product.name + " approuvé avec succès !",
        { id: toastId }
      );
    } catch (err) {
      console.error(err);
      toast.error(t("Erreur lors de l'approbation du produit."), { id: toastId });
    }
  }, [currentUser, userProfile?.role, isArabic, setProducts, t]);

  const handleRejectSubmit = useCallback(async (
    targetProduct: Product | null,
    finalReason: string,
    onSuccess: () => void
  ) => {
    if (!currentUser || userProfile?.role !== 'admin') {
      toast.error("Action non autorisée");
      return;
    }
    if (!targetProduct) return;
    if (!finalReason.trim()) {
      toast.error(t("Veuillez renseigner ou sélectionner un motif de refus."));
      return;
    }
    const toastId = toast.loading(t("Rejet en cours..."));
    try {
      const token = await currentUser?.getIdToken(true);
      if (!token) throw new Error("Non authentifié");
      const res = await fetch("/api/v1/admin/products/" + targetProduct.id + "/reject", {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
        body: JSON.stringify({ reason: finalReason }),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      setProducts((prev) => prev.filter((p) => p.id !== targetProduct.id));
      onSuccess();
      toast.success(
        isArabic ? "تم رفض المنتج " + targetProduct.name + "." : "Le produit " + targetProduct.name + " a été rejeté.",
        { id: toastId }
      );
    } catch (err) {
      console.error(err);
      toast.error(t("Erreur lors du rejet du produit."), { id: toastId });
    }
  }, [currentUser, userProfile?.role, isArabic, setProducts, t]);

  const handleConfirmDelete = useCallback(async (product: Product) => {
    if (!currentUser || userProfile?.role !== 'admin') {
      toast.error("Action non autorisée");
      return;
    }
    const confirmationText = isArabic
      ? `هل تريد حذف المنتج "${product.name}" نهائيًا من الكتالوج؟`
      : `SUPPRIMER DÉFINITIVEMENT ce produit ? Cette action est irréversible.`;

    const confirmed = await showConfirmModal(confirmationText);
    if (!confirmed) return;

    try {
      const token = await currentUser?.getIdToken(true);
      if (!token) throw new Error("Non authentifié");

      const res = await fetch("/api/v1/admin/products/" + product.id + "/delete", {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Erreur serveur");

      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success(t("Produit supprimé (soft delete)"));
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error(t("Erreur lors de la suppression."));
    }
  }, [currentUser, userProfile?.role, isArabic, showConfirmModal, setProducts, t]);

  const handleDenyDelete = useCallback(async (product: Product) => {
    if (!currentUser || userProfile?.role !== 'admin') {
      toast.error("Action non autorisée");
      return;
    }
    const confirmationText = isArabic
      ? `هل تريد رفض الحذف والإبقاء على المنتج "${product.name}" نشطًا عبر الإنترنت؟`
      : `Voulez-vous refuser la suppression et conserver le produit "${product.name}" actif en ligne ?`;

    const confirmed = await showConfirmModal(confirmationText);
    if (!confirmed) return;

    try {
      const token = await currentUser?.getIdToken(true);
      if (!token) throw new Error("Non authentifié");

      const res = await fetch("/api/v1/admin/products/" + product.id + "/deny-delete", {
        method: "POST",
        headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Erreur serveur");

      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success(t("La suppression a été refusée et le produit est réactivé."));
    } catch (err) {
      console.error("Error setting product as active:", err);
      toast.error(t("Erreur lors de la réactivation."));
    }
  }, [currentUser, userProfile?.role, isArabic, showConfirmModal, setProducts, t]);

  const handleRecalculateScores = useCallback(async () => {
    if (activeTab !== "active") return;
    const toastId = toast.loading(t("Recalcul de tous les scores de pertinence..."));
    try {
      const token = await currentUser?.getIdToken(true);
      if (!token) throw new Error("Non authentifié");
      const res = await fetch("/api/v1/admin/products/recalculate-scores", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) throw new Error("Erreur serveur");
      await fetchProducts();
      toast.success(t("Scores recalculés avec succès !"), { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(t("Erreur lors du recalcul des scores."), { id: toastId });
    }
  }, [currentUser, activeTab, fetchProducts, t]);

  return {
    handleApprove,
    handleRejectSubmit,
    handleConfirmDelete,
    handleDenyDelete,
    handleRecalculateScores,
  };
};
