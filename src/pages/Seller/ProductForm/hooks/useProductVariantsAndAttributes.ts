import { useState } from "react";
import toast from "react-hot-toast";
import { PRODUCT_HIERARCHY } from "../../../../constants";
import { ProductFormData, ProductVariant, SizeTypeOption } from "../../../../types/seller";

export const SIZE_TYPES: SizeTypeOption[] = [
  { id: "adult", label: "Pointures (18-60)", items: Array.from({ length: 43 }, (_, i) => (18 + i).toString()) },
  { id: "baby", label: "Âge bébé (0-36m)", items: ["Naissance", "1 mois", "3 mois", "6 mois", "9 mois", "12 mois", "18 mois", "24 mois", "36 mois"] },
  { id: "kids", label: "Âge enfant (2-16a)", items: Array.from({ length: 15 }, (_, i) => `${i + 2} ans`) },
  { id: "clothing", label: "Vêtements (XS-5XL)", items: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"] },
];

export const safeParseFloat = (value: string | undefined | null | number): number | null => {
  if (typeof value === "number") return isNaN(value) ? null : value;
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const parsed = parseFloat(trimmed);
  if (isNaN(parsed) || !isFinite(parsed)) return null;
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return null;
  return parsed;
};

export function useProductVariantsAndAttributes(
  formData: ProductFormData,
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>,
  CATEGORY_TREE: Record<string, Record<string, string[]>>
) {
  const [tagInput, setTagInput] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [showAdminTagsList, setShowAdminTagsList] = useState(false);

  const effectiveTree = Object.keys(CATEGORY_TREE || {}).length > 0 ? CATEGORY_TREE : PRODUCT_HIERARCHY;
  const subCategories = formData.category && effectiveTree[formData.category] ? Object.keys(effectiveTree[formData.category]) : [];
  const subSubCategories =
    formData.category && formData.subcategory && effectiveTree[formData.category]?.[formData.subcategory]
      ? effectiveTree[formData.category][formData.subcategory]
      : [];

  const activeSizeList = SIZE_TYPES.find((t) => t.id === formData.sizeType)?.items || [];

  const toggleSize = (size: string) => {
    setFormData((prev) => {
      const isSelected = prev.sizes.includes(size);
      return {
        ...prev,
        sizes: isSelected ? prev.sizes.filter((s: string) => s !== size) : [...prev.sizes, size],
      };
    });
  };

  const handleGenerateSku = () => {
    const brandPrefix = formData.brand ? formData.brand.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, "") : "OLM";
    const catClean = (formData.category || "PRD").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    const catPrefix = catClean.substring(0, 3).replace(/[^A-Z0-9]/g, "");
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const newSku = `${brandPrefix || "OLM"}-${catPrefix || "GEN"}-${randomNum}`;
    setFormData((prev) => ({ ...prev, sku: newSku }));
    toast.success(`SKU généré : ${newSku} 🏷️`);
  };

  const handleGenerateVariants = () => {
    const colorList = formData.colors.map((s: string) => s.trim()).filter(Boolean);
    const sizeList = formData.sizes.map((s: string) => s.trim()).filter(Boolean);
    const combos: string[] = [];
    if (colorList.length && sizeList.length) {
      colorList.forEach((c: string) => sizeList.forEach((s: string) => combos.push(`${c.toUpperCase()} - ${s.toUpperCase()}`)));
    } else if (colorList.length) {
      combos.push(...colorList.map((c: string) => c.toUpperCase()));
    } else if (sizeList.length) {
      combos.push(...sizeList.map((s: string) => s.toUpperCase()));
    }

    setFormData((prev) => {
      const currentMap = new Map((prev.variants as ProductVariant[]).map((v) => [v.name, v]));
      const newVariants: ProductVariant[] = combos.map((c) => {
        return (
          currentMap.get(c) || {
            name: c,
            stock: "0",
            sku: prev.sku ? `${prev.sku}-${c.replace(/\s+/g, "")}` : "",
            priceDiff: "",
            priceOverride: "",
            isActive: true,
          }
        );
      });
      const allPrevVariants = prev.variants as ProductVariant[];
      const remainingPrevVariants = allPrevVariants.filter((v) => !combos.includes(v.name));
      const finalVariants = [...newVariants, ...remainingPrevVariants];

      return { ...prev, variants: finalVariants };
    });

    toast.success(`${combos.length} variante(s) générée(s)`);
  };

  const marginCalc = () => {
    const sale = safeParseFloat(formData.promoPrice) || safeParseFloat(formData.price) || 0;
    const cost = safeParseFloat(formData.costPrice) || 0;
    if (sale && cost && sale > cost) {
      return { val: (sale - cost).toFixed(2), perc: (((sale - cost) / sale) * 100).toFixed(1) };
    }
    return null;
  };

  const mg = marginCalc();

  return {
    tagInput,
    setTagInput,
    colorInput,
    setColorInput,
    showAdminTagsList,
    setShowAdminTagsList,
    effectiveTree,
    subCategories,
    subSubCategories,
    activeSizeList,
    toggleSize,
    handleGenerateSku,
    handleGenerateVariants,
    mg,
  };
}

