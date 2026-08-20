import { useState, useEffect, useDeferredValue } from "react";
import Papa from "papaparse";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { apiGet, apiPost, apiPut } from "../../../lib/api";
import { PRODUCT_HIERARCHY } from "../../../constants";
import { SellerProduct } from "../../../types/seller";

export function useSellerCatalog() {
  const { t } = useTranslation();
  const { currentUser, userProfile } = useAuth();
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState<SellerProduct | null>(null);

  const [isAddMode, setIsAddMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [adminTags, setAdminTags] = useState<{ id: string; name: string }[]>([]);
  const [categoryHierarchy, setCategoryHierarchy] = useState<Record<string, Record<string, string[]>>>(PRODUCT_HIERARCHY);
  const [categories, setCategories] = useState<string[]>(Object.keys(PRODUCT_HIERARCHY));

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;

    const fetchData = async () => {
      try {
        const prodData = await apiGet<{ products: SellerProduct[] }>("/api/v1/seller/products");
        if (!cancelled && prodData?.products) {
          setProducts(prodData.products);
        }

        const catData = await apiGet<{ hierarchy?: Record<string, Record<string, string[]>> }>("/api/v1/settings/categories-hierarchy");
        if (!cancelled) {
          const h = catData?.hierarchy;
          if (h && Object.keys(h).length > 0) {
            setCategoryHierarchy(h);
            setCategories(Object.keys(h));
          } else {
            setCategoryHierarchy(PRODUCT_HIERARCHY);
            setCategories(Object.keys(PRODUCT_HIERARCHY));
          }
        }

        const tagsData = await apiGet<{ tags: { id: string; name: string }[] }>("/api/v1/settings/tags");
        if (!cancelled && tagsData?.tags) {
          setAdminTags(tagsData.tags);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Erreur fetch catalog:", err);
          toast.error(t("Impossible de charger le catalogue"));
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [currentUser, t]);

  const handleSaveSuccess = async () => {
    setIsAddMode(false);
    setEditingProduct(null);
    if (!currentUser) return;
    setLoading(true);
    try {
      const prodData = await apiGet<{ products: SellerProduct[] }>("/api/v1/seller/products");
      if (prodData?.products) {
        setProducts(prodData.products);
      }
      toast.success(t("Produit enregistré avec succès !"));
    } catch (err) {
      console.error(err);
      toast.error(t("Produit sauvegardé mais erreur d'actualisation"));
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateProduct = async (product: SellerProduct) => {
    if (!currentUser) return;
    try {
      toast.loading(t("Duplication en cours..."), { id: "dup" });
      await apiPost(`/api/v1/seller/products/${product.id}/duplicate`, {});
      toast.success(t("Produit dupliqué avec succès !"), { id: "dup" });
      const prodData = await apiGet<{ products: SellerProduct[] }>("/api/v1/seller/products");
      if (prodData?.products) {
        setProducts(prodData.products);
      }
    } catch (err) {
      console.error("Duplicate error:", err);
      toast.error(t("Erreur lors de la duplication"), { id: "dup" });
    }
  };

  const handleStockUpdate = async (productId: string, newStock: number) => {
    if (!currentUser) return;
    await apiPut(`/api/v1/seller/products/${productId}`, { stock: newStock });
    setProducts(prev => prev.map(item => item.id === productId ? { ...item, stock: newStock } : item));
    toast.success(t("Stock mis à jour !"));
  };

  const handleCsvImport = async (file: File) => {
    if (!currentUser) return;
    toast.loading(t("Analyse du fichier CSV en cours..."), { id: "csv" });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          if (results.errors.length > 0) {
            throw new Error("Format CSV invalide.");
          }
          const data = results.data as Record<string, string>[];
          if (!data || data.length === 0) throw new Error("Fichier vide.");

          let imported = 0;
          for (const row of data) {
            const normalizedRow: Record<string, string> = {};
            Object.keys(row).forEach(k => {
              normalizedRow[k.toLowerCase().trim()] = row[k];
            });

            const name = normalizedRow.name?.trim();
            const price = parseFloat(normalizedRow.price);
            const stock = parseInt(normalizedRow.stock, 10) || 0;
            const category = normalizedRow.category?.trim() || "Général";

            if (name && !isNaN(price)) {
              await apiPost("/api/v1/seller/products", {
                name,
                price,
                stock: isNaN(stock) ? 0 : stock,
                category,
                status: "draft",
                sellerId: currentUser.uid,
                sellerName: userProfile?.displayName || userProfile?.shopName || "",
                variants: [],
                images: [],
              });
              imported++;
            }
          }
          toast.success(`${imported} ${t("produit(s) importé(s) en brouillon !")}`, { id: "csv" });
          handleSaveSuccess();
        } catch (err: unknown) {
          console.error("CSV error:", err);
          const errorMsg = err instanceof Error ? err.message : t("Erreur CSV");
          toast.error(errorMsg, { id: "csv" });
        }
      },
      error: () => {
        toast.error(t("Impossible de parser le fichier CSV"), { id: "csv" });
      }
    });
  };

  const deferredSearchTerm = useDeferredValue(searchTerm);

  const filteredProducts = products.filter(p => {
    if (p.status === "deleted") return false;
    const matchSearch = p.name.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(deferredSearchTerm.toLowerCase());
    let matchFilter = true;
    if (activeFilter === "active") matchFilter = p.status === "active" && p.stock > 0;
    if (activeFilter === "out_of_stock") matchFilter = p.stock === 0;
    if (activeFilter === "draft") matchFilter = p.status === "draft";
    return matchSearch && matchFilter;
  });

  const isShopValidated = userProfile?.status === "ACTIVE" || userProfile?.status === "active";

  return {
    currentUser,
    userProfile,
    products,
    setProducts,
    loading,
    pendingDelete,
    setPendingDelete,
    isAddMode,
    setIsAddMode,
    editingProduct,
    setEditingProduct,
    searchTerm,
    setSearchTerm,
    activeFilter,
    setActiveFilter,
    adminTags,
    categoryHierarchy,
    categories,
    filteredProducts,
    isShopValidated,
    handleSaveSuccess,
    handleDuplicateProduct,
    handleStockUpdate,
    handleCsvImport,
  };
}
