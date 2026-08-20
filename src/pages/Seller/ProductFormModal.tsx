import React from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { User } from "firebase/auth";
import { ALGERIA_WILAYAS } from "../../constants";
import { ProductCard } from "../../components/Product/ProductCard";
import { DYNAMIC_CATEGORIES } from "../../config/dynamicFilters";
import { PRODUCT_COLORS } from "../../constants";
import { useTranslation } from "react-i18next";
import { useProductForm } from "./ProductForm/hooks/useProductForm";
import { Product } from "../../domains/product/product.types";
import { AdminTag, ProductVariant, SellerProduct, SellerUserProfile } from "../../types/seller";

// Modular sub-components imports
import { StepIdentity } from "./ProductForm/components/StepIdentity";
import { StepSpecs } from "./ProductForm/components/StepSpecs";
import { StepInventory } from "./ProductForm/components/StepInventory";
import { StepMedia } from "./ProductForm/components/StepMedia";
import { StepPricing } from "./ProductForm/components/StepPricing";
import { StepLogistics } from "./ProductForm/components/StepLogistics";
import { StepSummary } from "./ProductForm/components/StepSummary";
import { StepSidebar } from "./ProductForm/components/StepSidebar";
import { BottomActionBar } from "./ProductForm/components/BottomActionBar";

interface ProductFormModalProps {
  onClose: () => void;
  editingProduct: SellerProduct | null;
  categories: string[];
  CATEGORY_TREE: Record<string, Record<string, string[]>>;
  adminTags: AdminTag[];
  userProfile: SellerUserProfile | null;
  currentUser: User | null;
  onSaveSuccess: (product: SellerProduct, isEdit: boolean) => void;
}

const STEPS = [
  { id: 0, title: "Identité", icon: null },
  { id: 1, title: "Caractéristiques", icon: null },
  { id: 2, title: "Déclinaisons", icon: null },
  { id: 3, title: "Médias", icon: null },
  { id: 4, title: "Tarification", icon: null },
  { id: 5, title: "Logistique", icon: null },
  { id: 6, title: "Récapitulatif", icon: null },
];

const SIZE_TYPES = [
  { id: "adult", label: "Pointures (18-60)", items: Array.from({ length: 43 }, (_, i) => (18 + i).toString()) },
  { id: "baby", label: "Âge bébé (0-36m)", items: ["Naissance", "1 mois", "3 mois", "6 mois", "9 mois", "12 mois", "18 mois", "24 mois", "36 mois"] },
  { id: "kids", label: "Âge enfant (2-16a)", items: Array.from({ length: 15 }, (_, i) => `${i + 2} ans`) },
  { id: "clothing", label: "Vêtements (XS-5XL)", items: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"] },
];

const safeParseFloat = (value: string | undefined | null | number): number | null => {
  if (typeof value === "number") return isNaN(value) ? null : value;
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const parsed = parseFloat(trimmed);
  if (isNaN(parsed) || !isFinite(parsed)) return null;
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return null;
  return parsed;
};

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  onClose,
  editingProduct,
  categories,
  CATEGORY_TREE,
  adminTags,
  userProfile,
  currentUser,
  onSaveSuccess,
}) => {
  const { t } = useTranslation();

  const {
    activeStep, setActiveStep, showPreview, setShowPreview, formData, setFormData,
    loading, aiGenerating, uploading, uploadProgress, tagInput, setTagInput,
    showAdminTagsList, setShowAdminTagsList, draggedImageIdx, dragOverImageIdx,
    ConfirmationDialog, showTemplateMenu, setShowTemplateMenu, savedTemplates,
    handleSaveTemplate, handleDragStart, handleDragOver, handleDrop, handleDragEnd,
    handleGenerateVariants, subCategories, subSubCategories, handleGenerateAiDescription,
    handleGenerateSku, activeSizeList, toggleSize, handleFileUpload, updateImage,
    handleSubmitProduct, mg,
  } = useProductForm(editingProduct, userProfile, currentUser, onClose, onSaveSuccess, CATEGORY_TREE);

  const previewProduct: Product = {
    id: "preview",
    name: formData.name || "Nom du produit",
    price: safeParseFloat(formData.price) || 0,
    promoPrice: formData.promoPrice ? safeParseFloat(formData.promoPrice) || undefined : undefined,
    category: formData.category || "",
    image: formData.images.find((i: string) => Boolean(i)) || "/placeholder.png",
    images: formData.images.filter(Boolean),
    sellerId: currentUser?.uid || "preview_seller",
    sellerName: userProfile?.shopName || userProfile?.name || "Votre boutique",
    wilaya: userProfile?.wilaya || "16 - Alger",
    description: formData.description || "",
    rating: 5,
    qualityScore: 100,
    status: "pending",
    stock:
      formData.variants && formData.variants.length > 0
        ? formData.variants.reduce((acc: number, curr: ProductVariant) => acc + (typeof curr.stock === "number" ? curr.stock : parseInt(curr.stock, 10) || 0), 0)
        : typeof formData.stock === "number" ? formData.stock : parseInt(formData.stock, 10) || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-[#FFFBF5] w-full h-full md:max-w-6xl md:max-h-[90vh] md:rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border-t md:border border-[#E5DED4] mt-safe-top md:mt-0 pb-safe md:pb-0"
      >
        <StepSidebar
          editingProduct={editingProduct}
          onClose={onClose}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          STEPS={STEPS}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col h-full bg-white overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-48 md:pb-32">
            {/* Visual Progress Bar */}
            <div className="tour-step-progress w-full max-w-3xl mx-auto h-1.5 bg-[#E5DED4] rounded-full overflow-hidden mb-6">
              <motion.div
                className="h-full bg-gradient-to-r from-[#C75C1A] to-[#D4A574] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            <form id="productForm" className="max-w-3xl mx-auto space-y-10" onSubmit={(e) => e.preventDefault()}>
              {activeStep === 0 && (
                <StepIdentity
                  formData={formData}
                  setFormData={setFormData}
                  categories={categories}
                  DYNAMIC_CATEGORIES={DYNAMIC_CATEGORIES}
                  subCategories={subCategories}
                  subSubCategories={subSubCategories}
                  aiGenerating={aiGenerating}
                  handleGenerateAiDescription={async () => { await handleGenerateAiDescription(); }}
                  tagInput={tagInput}
                  setTagInput={setTagInput}
                  showAdminTagsList={showAdminTagsList}
                  setShowAdminTagsList={setShowAdminTagsList}
                  adminTags={adminTags}
                />
              )}

              {activeStep === 1 && (
                <StepSpecs
                  formData={formData}
                  setFormData={setFormData}
                  DYNAMIC_CATEGORIES={DYNAMIC_CATEGORIES}
                  SIZE_TYPES={SIZE_TYPES}
                  activeSizeList={activeSizeList}
                  toggleSize={toggleSize}
                  PRODUCT_COLORS={PRODUCT_COLORS}
                  handleGenerateSku={handleGenerateSku}
                  handleGenerateVariants={handleGenerateVariants}
                />
              )}

              {activeStep === 2 && (
                <StepInventory formData={formData} setFormData={setFormData} activeStep={activeStep} setActiveStep={setActiveStep} />
              )}

              {activeStep === 3 && (
                <StepMedia
                  formData={formData}
                  uploading={uploading}
                  uploadProgress={uploadProgress}
                  dragOverImageIdx={dragOverImageIdx}
                  draggedImageIdx={draggedImageIdx}
                  handleDragStart={handleDragStart}
                  handleDragOver={handleDragOver}
                  handleDrop={handleDrop}
                  handleDragEnd={handleDragEnd}
                  handleFileUpload={handleFileUpload}
                  updateImage={updateImage}
                  setFormData={setFormData}
                />
              )}

              {activeStep === 4 && <StepPricing formData={formData} setFormData={setFormData} mg={mg} />}

              {activeStep === 5 && <StepLogistics formData={formData} setFormData={setFormData} ALGERIA_WILAYAS={ALGERIA_WILAYAS} />}

              {activeStep === 6 && (
                <StepSummary formData={formData} editingProduct={editingProduct} userProfile={userProfile} setShowPreview={setShowPreview} />
              )}
            </form>
          </div>

          <BottomActionBar
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            showTemplateMenu={showTemplateMenu}
            setShowTemplateMenu={setShowTemplateMenu}
            savedTemplates={savedTemplates}
            setFormData={setFormData}
            handleSaveTemplate={handleSaveTemplate}
            handleSubmitProduct={handleSubmitProduct}
            loading={loading}
            uploading={uploading}
            formData={formData}
            editingProduct={editingProduct}
          />
        </div>
      </motion.div>
      <ConfirmationDialog />

      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-4">
          <div className="bg-[#FFFBF5] rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-slate-700 z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <h3 className="font-serif text-lg font-bold text-[#2C2118] mb-6">{t("product.preview_title", "Aperçu pour l'acheteur")}</h3>
              <div className="pointer-events-none">
                <ProductCard product={previewProduct} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

