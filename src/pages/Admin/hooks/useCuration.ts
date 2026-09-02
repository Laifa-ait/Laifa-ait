import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useShop } from "../../../context/ShopContext";
import { PRODUCT_HIERARCHY } from "../../../constants";
import { Product } from "../../../domains/product/product.types";
import {
  fetchCollectionSample,
  updateAdminDoc,
  addAdminDoc
} from "../../../services/adminRepository";
import { handleFirestoreError, OperationType } from "../../../lib/firebase";
import { serverTimestamp } from "firebase/firestore";

export function useCuration() {
  const { t, i18n } = useTranslation();
  const { categoryHierarchy: shopHierarchy } = useShop();

  const isArabic = i18n.language === "ar" || i18n.language?.startsWith("ar");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<(Omit<Partial<Product>, "promoPrice"> & { promoPrice?: number | string }) | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  const [complianceOverrides, setComplianceOverrides] = useState<Record<string, Record<string, boolean>>>({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const hierarchy = useMemo(() => {
    return Object.keys(shopHierarchy || {}).length > 0 ? shopHierarchy : PRODUCT_HIERARCHY;
  }, [shopHierarchy]);

  const fetchPendingProducts = useCallback(async () => {
    try {
      setLoading(true);
      const allProducts = await fetchCollectionSample("products", 200);
      const data = allProducts.filter((p) => p.status === "pending") as Product[];
      setProducts(data);
      
      setSelectedProduct((prev) => {
        if (prev) {
          const stillPending = data.find((p) => p.id === prev.id);
          return stillPending || data[0] || null;
        }
        return data[0] || null;
      });
    } catch {
      toast.error(t("Erreur de chargement des produits"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPendingProducts();
  }, [fetchPendingProducts]);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!selectedProduct?.category) {
        setRelatedProducts([]);
        return;
      }
      try {
        const allProducts = await fetchCollectionSample("products", 200);
        const list = allProducts.filter((p) => p.category === selectedProduct.category && p.status === "active") as Product[];
        setRelatedProducts(list);
      } catch (error) {
        console.error("Fetch related error", error);
      }
    };
    fetchRelated();
    setIsEditMode(false);
    setEditForm(null);
    setIsRejecting(false);
    setRejectionReason("");
    setActiveImageIndex(0);
  }, [selectedProduct]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(term) ||
        p.sellerName?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  const checklist = useMemo(() => {
    if (!selectedProduct) return [];
    const target = isEditMode && editForm ? editForm : selectedProduct;
    const prodId = selectedProduct.id;
    const overrides = complianceOverrides[prodId] || {};

    return [
      {
        key: "imageQuality",
        title: t("Photo claire & HD"),
        desc: t("L'image de présentation principale est nette, sans filigrane ni flou majeurs."),
        status: overrides.imageQuality !== undefined ? overrides.imageQuality : !!target.image,
      },
      {
        key: "priceReasonable",
        title: t("Prix réaliste et cohérent"),
        desc: t("Tarif positif et non aberrant pour la catégorie sélectionnée."),
        status: overrides.priceReasonable !== undefined ? overrides.priceReasonable : (Number(target.price || 0) > 0),
      },
      {
        key: "titleCompliant",
        title: t("Titre descriptif & propre"),
        desc: t("Au moins 8 caractères sans MAJUSCULES ABUSIVES ni termes interdits."),
        status: overrides.titleCompliant !== undefined ? overrides.titleCompliant : ((target.name || "").length >= 8 && (target.name || "") !== (target.name || "").toUpperCase()),
      },
      {
        key: "categoryAccurate",
        title: t("Catégorisation exacte"),
        desc: t("Catégorie et sous-catégorie spécifiées correspondant au produit."),
        status: overrides.categoryAccurate !== undefined ? overrides.categoryAccurate : !!target.category,
      },
      {
        key: "stockSpecified",
        title: t("Stock physique garanti"),
        desc: t("Quantité disponible précisée (stock > 0)."),
        status: overrides.stockSpecified !== undefined ? overrides.stockSpecified : (Number(target.stock || 0) > 0),
      },
    ];
  }, [selectedProduct, isEditMode, editForm, complianceOverrides, t]);

  const handleToggleCompliance = (key: string) => {
    if (!selectedProduct) return;
    const prodId = selectedProduct.id;
    const currentStatus = checklist.find((item) => item.key === key)?.status;

    setComplianceOverrides((prev) => ({
      ...prev,
      [prodId]: {
        ...(prev[prodId] || {}),
        [key]: !currentStatus,
      },
    }));
  };

  const calculatedScore = useMemo(() => {
    if (checklist.length === 0) return 0;
    const passedCount = checklist.filter((item) => item.status).length;
    return Math.round((passedCount / checklist.length) * 100);
  }, [checklist]);

  const duplicates = useMemo(() => {
    if (!selectedProduct) return [];
    const targetName = (isEditMode && editForm ? editForm.name : selectedProduct.name)?.toLowerCase().trim() || "";
    if (!targetName) return [];

    return relatedProducts.filter((p) => {
      const pName = p.name.toLowerCase().trim();
      return pName.includes(targetName) || targetName.includes(pName);
    });
  }, [selectedProduct, isEditMode, editForm, relatedProducts]);

  const handleApproveProduct = async () => {
    if (!selectedProduct) return;
    setIsActionInProgress(true);
    const toastId = toast.loading(t("Approbation et publication en cours..."));

    try {
      await updateAdminDoc("products", selectedProduct.id, {
        status: "active",
        qualityScore: calculatedScore,
        approvedAt: serverTimestamp(),
      });

      if (selectedProduct.sellerId) {
        await addAdminDoc("notifications", {
          userId: selectedProduct.sellerId,
          title: t("Produit Approuvé ! 🎉"),
          message: t("Votre produit {{name}} a été validé par la modération Olmart et est désormais en ligne.", { name: selectedProduct.name }),
          type: "product_approval",
          productId: selectedProduct.id,
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      toast.success(t("Produit approuvé avec succès et mis en ligne ! 🚀"), { id: toastId });
      await fetchPendingProducts();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${selectedProduct.id}`);
      toast.error(t("Erreur lors de l'approbation"), { id: toastId });
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleRejectProduct = async () => {
    if (!selectedProduct) return;
    if (!rejectionReason.trim()) {
      toast.error(t("Veuillez indiquer un motif de refus clair pour l'artisan."));
      return;
    }

    setIsActionInProgress(true);
    const toastId = toast.loading(t("Rejet du produit en cours..."));

    try {
      await updateAdminDoc("products", selectedProduct.id, {
        status: "rejected",
        rejectionReason: rejectionReason.trim(),
        rejectedAt: serverTimestamp(),
      });

      if (selectedProduct.sellerId) {
        await addAdminDoc("notifications", {
          userId: selectedProduct.sellerId,
          title: t("Produit Refusé ⚠️"),
          message: t("Votre produit {{name}} requiert des modifications avant publication : {{reason}}", { name: selectedProduct.name, reason: rejectionReason.trim() }),
          type: "product_rejection",
          productId: selectedProduct.id,
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      toast.success(t("Produit refusé. L'artisan a été notifié."), { id: toastId });
      setIsRejecting(false);
      setRejectionReason("");
      await fetchPendingProducts();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${selectedProduct.id}`);
      toast.error(t("Erreur lors du refus"), { id: toastId });
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleStartEditing = () => {
    if (!selectedProduct) return;
    setEditForm({
      name: selectedProduct.name,
      description: selectedProduct.description,
      price: selectedProduct.price,
      promoPrice: selectedProduct.promoPrice || "",
      stock: selectedProduct.stock,
      category: selectedProduct.category,
      subcategory: selectedProduct.subcategory || "",
      image: selectedProduct.image,
      images: selectedProduct.images || [selectedProduct.image],
      freeShipping: selectedProduct.freeShipping || false,
      wilaya: selectedProduct.wilaya || "Alger",
    });
    setIsEditMode(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedProduct || !editForm) return;
    setIsSaving(true);
    const toastId = toast.loading(t("Enregistrement..."));

    try {
      await updateAdminDoc("products", selectedProduct.id, {
        name: (editForm.name || "").trim(),
        description: (editForm.description || "").trim(),
        price: Number(editForm.price || 0),
        promoPrice: editForm.promoPrice ? Number(editForm.promoPrice) : null,
        stock: Number(editForm.stock || 0),
        category: editForm.category || "",
        subcategory: editForm.subcategory || "",
        image: editForm.image ? editForm.image.trim() : "",
        images: editForm.images || [],
        freeShipping: !!editForm.freeShipping,
        wilaya: editForm.wilaya || "Alger",
        qualityScore: calculatedScore,
        updatedAt: serverTimestamp(),
      });

      toast.success(t("Fiche produit modifiée et mise à jour en temps réel ! ✨"), { id: toastId });
      setIsEditMode(false);
      await fetchPendingProducts();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${selectedProduct.id}`);
      toast.error(t("Erreur de sauvegarde"), { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    t,
    isArabic,
    products,
    loading,
    searchTerm,
    setSearchTerm,
    selectedProduct,
    setSelectedProduct,
    relatedProducts,
    isEditMode,
    setIsEditMode,
    editForm,
    setEditForm,
    isSaving,
    isRejecting,
    setIsRejecting,
    rejectionReason,
    setRejectionReason,
    isActionInProgress,
    activeImageIndex,
    setActiveImageIndex,
    hierarchy,
    filteredProducts,
    checklist,
    calculatedScore,
    duplicates,
    handleToggleCompliance,
    handleApproveProduct,
    handleRejectProduct,
    handleStartEditing,
    handleSaveChanges
  };
}
