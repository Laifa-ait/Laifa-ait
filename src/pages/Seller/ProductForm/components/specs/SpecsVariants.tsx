import React from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { ProductColor, ProductFormData, SizeTypeOption } from "../../../../../types/seller";
import { CategoryStructure } from "../../../../../config/dynamicFilters";

interface SpecsVariantsProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  DYNAMIC_CATEGORIES: Record<string, CategoryStructure>;
  SIZE_TYPES: SizeTypeOption[];
  activeSizeList: string[];
  toggleSize: (size: string) => void;
  PRODUCT_COLORS: ProductColor[];
  handleGenerateVariants: () => void;
}

export const SpecsVariants: React.FC<SpecsVariantsProps> = ({
  formData,
  setFormData,
  DYNAMIC_CATEGORIES,
  SIZE_TYPES,
  activeSizeList,
  toggleSize,
  PRODUCT_COLORS,
  handleGenerateVariants,
}) => {
  const { t } = useTranslation();

  const sizeDisabled = DYNAMIC_CATEGORIES[formData.category]?.hasSize === false;
  const colorDisabled = DYNAMIC_CATEGORIES[formData.category]?.hasColor === false;

  if (sizeDisabled && colorDisabled) return null;

  return (
    <div className="space-y-6 bg-[#FFFBF5]/50 p-6 rounded-2xl border border-[#E5DED4]">
      {!sizeDisabled && (
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-900">{t("Type de Taille")}</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SIZE_TYPES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, sizeType: s.id, sizes: [] }))}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  formData.sizeType === s.id
                    ? "bg-[#C75C1A] border-[#C75C1A] text-white shadow-md"
                    : "bg-white border-[#E5DED4] text-slate-600 hover:border-slate-300"
                }`}
              >
                <span className="text-xs font-semibold">{s.label}</span>
              </button>
            ))}
          </div>

          {activeSizeList.length > 0 && (
            <div className="bg-white p-4 rounded-xl border border-[#E5DED4] mt-4">
              <label className="block text-xs font-semibold text-slate-500 mb-3 uppercase tracking-widest rtl:tracking-normal">
                {t("Sélectionnez les tailles disponibles")}
              </label>
              <div className="flex flex-wrap gap-2">
                {activeSizeList.map((s) => {
                  const isSelected = formData.sizes.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors border cursor-pointer ${
                        isSelected ? "bg-[#C75C1A] text-white border-[#C75C1A]" : "bg-[#FFFBF5] border-[#E5DED4] text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {!colorDisabled && (
        <div className={`space-y-4 ${!sizeDisabled ? "pt-6 border-t border-[#E5DED4]" : ""}`}>
          <label className="block text-sm font-bold text-slate-900">{t("Couleurs (Optionnel)")}</label>
          <div className="flex flex-wrap gap-3">
            {PRODUCT_COLORS.map((color) => {
              const isSelected = formData.colors?.some((c: string) => c.toLowerCase().trim() === color.name.toLowerCase().trim());
              return (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      colors: isSelected
                        ? prev.colors.filter((c: string) => c.toLowerCase().trim() !== color.name.toLowerCase().trim())
                        : [...(prev.colors || []), color.name],
                    }));
                  }}
                  className={`flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected ? "scale-110" : "opacity-70 hover:opacity-100 hover:scale-105"
                  }`}
                  title={color.name}
                >
                  <div
                    className={`w-8 h-8 rounded-full shadow-sm flex items-center justify-center ${color.border ? "border border-slate-300" : ""}`}
                    style={{ background: color.hex }}
                  >
                    {isSelected && (
                      <Check
                        className={`w-4 h-4 ${color.name === "Blanc" || color.name === "Beige" || color.name === "Jaune" ? "text-slate-900" : "text-white"}`}
                      />
                    )}
                  </div>
                  <span className={`text-[10px] font-bold ${isSelected ? "text-slate-900" : "text-slate-500"}`}>{color.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="pt-6">
        <button
          type="button"
          onClick={handleGenerateVariants}
          className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg active:scale-[0.98] cursor-pointer"
        >
          {t("Générer les combinaisons (")}
          {formData.sizes.length || 1} {t("Tailles ×")}
          {formData.colors.length || 1} {t("Couleurs)")}
        </button>
      </div>
    </div>
  );
};

