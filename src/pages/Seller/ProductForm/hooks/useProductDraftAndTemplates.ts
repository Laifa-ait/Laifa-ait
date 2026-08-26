import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { ProductFormData, ProductFormTemplate, SellerProduct } from "../../../../types/seller";

export function useProductDraftAndTemplates(
  editingProduct: SellerProduct | null,
  formData: ProductFormData,
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>,
  activeStep: number,
  setActiveStep: React.Dispatch<React.SetStateAction<number>>,
  showConfirmModal: (message: string, title?: string) => Promise<boolean>
) {
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<ProductFormTemplate[]>([]);

  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const hasRestored = useRef(false);

  // Load Templates
  useEffect(() => {
    const tpls = localStorage.getItem("olmart_product_templates");
    if (tpls) {
      try {
        setSavedTemplates(JSON.parse(tpls));
      } catch (e: unknown) {
        console.warn("Failed to parse saved templates", e);
      }
    } else {
      const defaultTemplates: ProductFormTemplate[] = [
        {
          name: "T-Shirt Standard",
          data: { ...formDataRef.current, category: "Mode Homme", subcategory: "Vêtements", name: "T-Shirt en Coton", price: "2500", stock: "50" },
        },
        {
          name: "Sneakers Basiques",
          data: { ...formDataRef.current, category: "Mode Homme", subcategory: "Chaussures", name: "Sneakers Confort", price: "4500", stock: "20", sizeType: "adult" },
        },
      ];
      setSavedTemplates(defaultTemplates);
      localStorage.setItem("olmart_product_templates", JSON.stringify(defaultTemplates));
    }
  }, [editingProduct]);

  // Save draft periodically
  useEffect(() => {
    if (editingProduct) return;
    const interval = setInterval(() => {
      const draft = { formData, activeStep, timestamp: Date.now() };
      localStorage.setItem("olmart_product_draft", JSON.stringify(draft));
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, activeStep, editingProduct]);

  // Restore draft on initial load if present
  useEffect(() => {
    if (editingProduct || hasRestored.current) return;
    hasRestored.current = true;

    const saved = localStorage.getItem("olmart_product_draft");
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        if (Date.now() - draft.timestamp < 7 * 24 * 60 * 60 * 1000) {
          showConfirmModal(
            "Vous avez un brouillon non terminé. Voulez-vous le restaurer ?",
            "Restaurer le brouillon"
          ).then((confirmed: boolean) => {
            if (confirmed) {
              setFormData(draft.formData);
              setActiveStep(draft.activeStep || 0);
            }
          });
        }
      } catch (e) {
        console.error("Erreur de parsing brouillon", e);
      }
    }
  }, [editingProduct, setActiveStep, setFormData, showConfirmModal]);

  const handleSaveTemplate = () => {
    const name = prompt("Nom du template ?");
    if (name) {
      const newTemplates = [...savedTemplates, { name, data: formData }];
      setSavedTemplates(newTemplates);
      localStorage.setItem("olmart_product_templates", JSON.stringify(newTemplates));
      toast.success("Template sauvegardé avec succès !");
    }
  };

  return {
    showTemplateMenu,
    setShowTemplateMenu,
    savedTemplates,
    setSavedTemplates,
    handleSaveTemplate,
  };
}

