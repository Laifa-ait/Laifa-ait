import { useState } from "react";
import toast from "react-hot-toast";
import { User } from "firebase/auth";
import { apiPost, apiPut } from "../../../../lib/api";
import { ProductFormData, SellerProduct, SellerUserProfile } from "../../../../types/seller";
import { validateProductForm } from "../utils/productFormValidation";
import { buildProductPayload } from "../utils/productPayloadBuilder";

export function useProductSubmit(
  formData: ProductFormData,
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>,
  editingProduct: SellerProduct | null,
  userProfile: SellerUserProfile | null,
  currentUser: User | null,
  effectiveTree: Record<string, Record<string, string[]>>,
  uploading: Record<string, boolean>,
  showConfirmModal: (message: string, title?: string) => Promise<boolean>,
  onClose: () => void,
  onSaveSuccess: (product: SellerProduct, isEdit: boolean) => void
) {
  const [loading, setLoading] = useState(false);

  const handleSubmitProduct = async (e?: React.FormEvent, targetStatus?: string) => {
    if (e) e.preventDefault();

    if (!currentUser) {
      toast.error("Veuillez vous connecter pour soumettre un produit.");
      return;
    }

    if (Object.values(uploading).some((isUp) => isUp)) {
      toast.error("Veuillez attendre la fin des transferts de médias avant d'enregistrer.");
      return;
    }

    const isDraft = targetStatus === "draft";
    const validation = validateProductForm(formData, isDraft);
    if (!validation.isValid) {
      toast.error(validation.error || "Formulaire incomplet ou invalide.");
      return;
    }

    // Check tree subcategories
    const subs = formData.category && effectiveTree[formData.category] ? Object.keys(effectiveTree[formData.category]) : [];
    if (!isDraft && subs.length > 0 && !formData.subcategory?.trim()) {
      toast.error("Veuillez sélectionner une sous-catégorie à l'étape 1 !");
      return;
    }

    const subSubs =
      formData.category && formData.subcategory && effectiveTree[formData.category]?.[formData.subcategory]
        ? effectiveTree[formData.category][formData.subcategory]
        : [];
    if (!isDraft && subSubs.length > 0 && !formData.subSubCategory?.trim()) {
      toast.error("Veuillez sélectionner une sous-sous-catégorie à l'étape 1 !");
      return;
    }

    setLoading(true);
    try {
      let finalTranslations = formData.translations;

      if ((formData.autoTranslate || !finalTranslations?.en?.name || !finalTranslations?.ar?.name) && formData.name && formData.description) {
        try {
          const idToken = (await currentUser.getIdToken()) || "";
          if (!idToken) {
            toast.error("Session expirée, veuillez vous reconnecter");
            setLoading(false);
            return;
          }
          const response = await fetch("/api/v1/translate-product", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
            body: JSON.stringify({ name: formData.name, description: formData.description }),
          });

          if (response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const data = await response.json();
              if (data.name && data.description) {
                finalTranslations = {
                  en: { name: data.name.en, description: data.description.en },
                  ar: { name: data.name.ar, description: data.description.ar },
                };
                setFormData((prev) => ({
                  ...prev,
                  name: data.name.fr || prev.name,
                  description: data.description.fr || prev.description,
                  translations: finalTranslations,
                }));
              }
            }
          }
        } catch (e: unknown) {
          console.warn("Auto-translation notice:", e);
          const shouldContinue = await showConfirmModal("La traduction automatique a échoué. Voulez-vous continuer sans traductions ?");
          if (!shouldContinue) {
            setLoading(false);
            return;
          }
        }
      }

      const validImages = (formData.images || []).filter((img) => img && img.trim() !== "");
      const isEdit = !!editingProduct;

      // OCR check on new product uploads
      if (validImages.length > 0 && !isEdit) {
        try {
          const idToken = (await currentUser.getIdToken()) || "";
          if (idToken) {
            for (const imgUrl of validImages) {
              const ocrRes = await fetch("/api/v1/seller/analyze-image", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
                body: JSON.stringify({ imageUrl: imgUrl }),
              });
              if (ocrRes.ok) {
                const ocrData = await ocrRes.json();
                if (ocrData.safe === false) {
                  toast.error(`Avertissement Qualité: L'image contient du texte interdit (${ocrData.reason}).`);
                  setLoading(false);
                  return;
                }
              }
            }
          }
        } catch (e: unknown) {
          console.warn("OCR image analysis skipped:", e);
        }
      }

      const isVerifiedSeller = userProfile?.isVerified === true || userProfile?.role === "admin";
      let finalStatus = targetStatus || (isEdit ? editingProduct?.status || "pending" : "active");
      if (!isVerifiedSeller && finalStatus === "active") {
        finalStatus = "pending";
        toast.success("Votre produit a été soumis pour validation (Sandbox). Un administrateur l'examinera sous peu.", { duration: 6000 });
      }

      const productPayload = buildProductPayload(
        {
          ...formData,
          translations: finalTranslations,
        },
        {
          status: finalStatus,
          sellerId: currentUser.uid,
          sellerName: userProfile?.displayName || userProfile?.name || "",
          sellerStoreName: userProfile?.shopName || "",
        }
      );

      if (isEdit && editingProduct) {
        if (editingProduct.sellerId && editingProduct.sellerId !== currentUser.uid) {
          toast.error("Produit non autorisé");
          setLoading(false);
          return;
        }

        const isAdminUser = userProfile?.role === "admin";
        if (!isAdminUser && productPayload.status !== "draft") {
          productPayload.status = "pending";
          (productPayload as Record<string, unknown>).moderationType = "update";
          toast.success("Le produit a été modifié avec succès et est en attente de modération par l'administrateur.", { duration: 5000 });
        } else if (productPayload.status !== "draft") {
          productPayload.status = editingProduct.status || "active";
        }

        const cleanPayload = Object.fromEntries(
          Object.entries(productPayload).filter(([, v]) => v !== "" && v !== null && v !== undefined)
        );

        await apiPut<{ success: boolean; data?: SellerProduct }>(`/api/v1/seller/products/${editingProduct.id}`, cleanPayload);

        localStorage.removeItem("olmart_product_draft");
        onSaveSuccess({ ...editingProduct, ...cleanPayload } as SellerProduct, true);
      } else {
        (productPayload as Record<string, unknown>).status = "pending";
        (productPayload as Record<string, unknown>).moderationType = "new";

        const res = await apiPost<{ success: boolean; data: { id: string } } | { id: string }>(
          "/api/v1/seller/products",
          productPayload
        );
        const createdId = "data" in res && res.data ? res.data.id : (res as { id: string }).id;

        localStorage.removeItem("olmart_product_draft");
        onSaveSuccess({ id: createdId, ...productPayload } as SellerProduct, false);
      }

      onClose();
    } catch (err: unknown) {
      console.error("Product submit error:", err);
      const errMsg = err instanceof Error ? err.message : "Erreur lors de l'enregistrement.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    setLoading,
    handleSubmitProduct,
  };
}

