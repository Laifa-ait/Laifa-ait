import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { useConfirm } from "../../../../hooks/useConfirm";
import { useProductDraftAndTemplates } from "./useProductDraftAndTemplates";
import { useProductMediaUpload } from "./useProductMediaUpload";
import { useProductVariantsAndAttributes } from "./useProductVariantsAndAttributes";
import { useProductAiAndTranslate } from "./useProductAiAndTranslate";
import { useProductSubmit } from "./useProductSubmit";
import { ProductFormData, ProductVariant, SellerProduct, SellerUserProfile } from "../../../../types/seller";

export const useProductForm = (
  editingProduct: SellerProduct | null,
  userProfile: SellerUserProfile | null,
  currentUser: User | null,
  onClose: () => void,
  onSaveSuccess: (product: SellerProduct, isEdit: boolean) => void,
  CATEGORY_TREE: Record<string, Record<string, string[]>>
) => {
  const { confirm: showConfirmModal, ConfirmationDialog } = useConfirm();
  const [activeStep, setActiveStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    brand: "",
    price: "",
    promoPrice: "",
    costPrice: "",
    sku: "",
    category: "",
    subcategory: "",
    subSubCategory: "",
    gender: "",
    condition: "Neuf",
    warranty: "",
    materials: [] as string[],
    otherMaterial: "",
    season: "",
    attributes: {} as Record<string, string | number | boolean | string[]>,
    description: "",
    image: "",
    images: ["", "", "", "", "", "", "", ""],
    video: "",
    colors: [] as string[],
    sizes: [] as string[],
    sizeType: "",
    weight: "",
    dimensions: "",
    deliveryPrice: "",
    preparationTime: "",
    returnPolicy: false,
    autoTranslate: false,
    tags: [] as string[],
    isBannerFeatured: false,
    isStoreFeatured: false,
    variants: [] as ProductVariant[],
    wilaya: userProfile?.wilaya || "",
    stock: "10",
    status: "pending",
    metaTitle: "",
    metaDescription: "",
    slug: "",
    lowStockAlert: "5",
    publishAt: "",
    internalNotes: "",
    translations: {
      en: { name: "", description: "" },
      ar: { name: "", description: "" },
    },
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || "",
        brand: editingProduct.brand || "",
        price: editingProduct.price?.toString() || "",
        promoPrice: editingProduct.promoPrice?.toString() || "",
        costPrice: editingProduct.costPrice?.toString() || "",
        sku: editingProduct.sku || "",
        category: editingProduct.category || "",
        subcategory: editingProduct.subcategory || "",
        subSubCategory: editingProduct.subSubCategory || "",
        gender: editingProduct.gender || "",
        condition: editingProduct.condition || "Neuf",
        warranty: editingProduct.warranty || "",
        materials: editingProduct.materials || [],
        otherMaterial: editingProduct.otherMaterial || "",
        season: editingProduct.season || "",
        attributes: editingProduct.attributes || {},
        description: editingProduct.description || "",
        image: editingProduct.image || "",
        images: [...(editingProduct.images || []), "", "", "", "", "", "", ""].slice(0, 8),
        video: editingProduct.video || "",
        colors: editingProduct.colors || [],
        sizes: editingProduct.sizes || [],
        sizeType: editingProduct.sizeType || "",
        weight: editingProduct.weight || "",
        dimensions: editingProduct.dimensions || "",
        deliveryPrice: editingProduct.deliveryPrice?.toString() || "",
        preparationTime: editingProduct.preparationTime || "",
        returnPolicy: editingProduct.returnPolicy || false,
        autoTranslate: editingProduct.autoTranslate || false,
        tags: editingProduct.tags || [],
        isBannerFeatured: editingProduct.isBannerFeatured || false,
        isStoreFeatured: editingProduct.isStoreFeatured || false,
        variants: editingProduct.variants || [],
        wilaya: editingProduct.wilaya || userProfile?.wilaya || "",
        stock: editingProduct.stock?.toString() || "10",
        status: editingProduct.status || "pending",
        metaTitle: editingProduct.metaTitle || "",
        metaDescription: editingProduct.metaDescription || "",
        slug: editingProduct.slug || "",
        lowStockAlert: editingProduct.lowStockAlert?.toString() || "5",
        publishAt: editingProduct.publishAt || "",
        internalNotes: editingProduct.internalNotes || "",
        translations: editingProduct.translations || { en: { name: "", description: "" }, ar: { name: "", description: "" } },
      });
    }
  }, [editingProduct, userProfile]);

  const draftAndTemplates = useProductDraftAndTemplates(
    editingProduct,
    formData,
    setFormData,
    activeStep,
    setActiveStep,
    showConfirmModal
  );

  const media = useProductMediaUpload(formData, setFormData, currentUser);

  const variantsAndAttributes = useProductVariantsAndAttributes(formData, setFormData, CATEGORY_TREE);

  const aiAndTranslate = useProductAiAndTranslate(formData, setFormData, currentUser);

  const submit = useProductSubmit(
    formData,
    setFormData,
    editingProduct,
    userProfile,
    currentUser,
    variantsAndAttributes.effectiveTree,
    media.uploading,
    showConfirmModal,
    onClose,
    onSaveSuccess
  );

  return {
    activeStep,
    setActiveStep,
    showPreview,
    setShowPreview,
    formData,
    setFormData,
    loading: submit.loading,
    setLoading: submit.setLoading,
    aiGenerating: aiAndTranslate.aiGenerating,
    setAiGenerating: aiAndTranslate.setAiGenerating,
    translating: aiAndTranslate.translating,
    setTranslating: aiAndTranslate.setTranslating,
    uploading: media.uploading,
    setUploading: media.setUploading,
    uploadProgress: media.uploadProgress,
    setUploadProgress: media.setUploadProgress,
    tagInput: variantsAndAttributes.tagInput,
    setTagInput: variantsAndAttributes.setTagInput,
    colorInput: variantsAndAttributes.colorInput,
    setColorInput: variantsAndAttributes.setColorInput,
    showAdminTagsList: variantsAndAttributes.showAdminTagsList,
    setShowAdminTagsList: variantsAndAttributes.setShowAdminTagsList,
    draggedImageIdx: media.draggedImageIdx,
    setDraggedImageIdx: media.setDraggedImageIdx,
    dragOverImageIdx: media.dragOverImageIdx,
    setDragOverImageIdx: media.setDragOverImageIdx,
    showConfirmModal,
    ConfirmationDialog,
    showTemplateMenu: draftAndTemplates.showTemplateMenu,
    setShowTemplateMenu: draftAndTemplates.setShowTemplateMenu,
    savedTemplates: draftAndTemplates.savedTemplates,
    setSavedTemplates: draftAndTemplates.setSavedTemplates,
    handleSaveTemplate: draftAndTemplates.handleSaveTemplate,
    handleDragStart: media.handleDragStart,
    handleDragOver: media.handleDragOver,
    handleDrop: media.handleDrop,
    handleDragEnd: media.handleDragEnd,
    handleGenerateVariants: variantsAndAttributes.handleGenerateVariants,
    subCategories: variantsAndAttributes.subCategories,
    subSubCategories: variantsAndAttributes.subSubCategories,
    handleGenerateAiDescription: aiAndTranslate.handleGenerateAiDescription,
    handleGenerateSku: variantsAndAttributes.handleGenerateSku,
    activeSizeList: variantsAndAttributes.activeSizeList,
    toggleSize: variantsAndAttributes.toggleSize,
    handleFileUpload: media.handleFileUpload,
    updateImage: media.updateImage,
    handleSubmitProduct: submit.handleSubmitProduct,
    mg: variantsAndAttributes.mg,
  };
};
