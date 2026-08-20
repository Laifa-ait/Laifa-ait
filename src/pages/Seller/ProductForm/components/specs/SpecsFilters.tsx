import React from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "lucide-react";
import { ProductFormData } from "../../../../../types/seller";
import { CategoryStructure, DynamicFilterDef, FilterOption } from "../../../../../config/dynamicFilters";

interface SpecsFiltersProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  DYNAMIC_CATEGORIES: Record<string, CategoryStructure>;
}

export const SpecsFilters: React.FC<SpecsFiltersProps> = ({
  formData,
  setFormData,
  DYNAMIC_CATEGORIES,
}) => {
  const { t } = useTranslation();

  const allowedFilters = DYNAMIC_CATEGORIES[formData.category]?.allowed_filters;

  if (!allowedFilters || allowedFilters.length === 0) return null;

  return (
    <div className="space-y-6 bg-[#FFFBF5] p-6 rounded-2xl border border-[#E5DED4]">
      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
        <Tag className="w-4 h-4 text-[#C75C1A]" />
        {t("Spécificités de la catégorie")}
      </h4>
      <div className="grid md:grid-cols-2 gap-6">
        {allowedFilters.map((filter: DynamicFilterDef) => {
          return (
            <div key={filter.id}>
              <label className="block text-xs font-bold text-slate-700 mb-2">{filter.label}</label>
              {filter.type === "select" && (
                <select
                  className="w-full px-4 py-2.5 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] transition-all font-medium text-slate-900 text-sm"
                  value={String(formData.attributes[filter.id] || "")}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      attributes: { ...prev.attributes, [filter.id]: e.target.value },
                    }))
                  }
                >
                  <option value="">{t("Sélectionner...")}</option>
                  {filter.options?.map((opt: FilterOption | string) => {
                    const val = typeof opt === "string" ? opt : opt.value;
                    const lbl = typeof opt === "string" ? opt : opt.label;
                    return <option key={val} value={val}>{lbl}</option>;
                  })}
                </select>
              )}
              {filter.type === "radio" && (
                <div className="flex flex-wrap gap-2">
                  {filter.options?.map((opt: FilterOption | string) => {
                    const val = typeof opt === "string" ? opt : opt.value;
                    const lbl = typeof opt === "string" ? opt : opt.label;
                    const isSelected = formData.attributes[filter.id] === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            attributes: { ...prev.attributes, [filter.id]: val },
                          }))
                        }
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          isSelected
                            ? "bg-[#C75C1A] border-[#C75C1A] text-white shadow-sm"
                            : "bg-white border-[#E5DED4] text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {lbl}
                      </button>
                    );
                  })}
                </div>
              )}
              {filter.type === "multiselect" && (
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2">
                  {filter.options?.map((opt: FilterOption | string) => {
                    const val = typeof opt === "string" ? opt : opt.value;
                    const lbl = typeof opt === "string" ? opt : opt.label;
                    const currentAttr = formData.attributes[filter.id];
                    const currentList: string[] = Array.isArray(currentAttr) ? currentAttr : [];
                    const isSelected = currentList.includes(val);
                    return (
                      <label
                        key={val}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected ? "bg-[#C75C1A]/5 border-[#C75C1A]/20" : "bg-white border-[#E5DED4] hover:bg-[#FFFBF5]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="accent-blue-900 w-3.5 h-3.5 cursor-pointer"
                          checked={isSelected}
                          onChange={(e) => {
                            const updatedList = e.target.checked
                              ? [...currentList, val]
                              : currentList.filter((x: string) => x !== val);
                            setFormData((prev) => ({
                              ...prev,
                              attributes: { ...prev.attributes, [filter.id]: updatedList },
                            }));
                          }}
                        />
                        <span className={`text-[12px] font-bold ${isSelected ? "text-[#C75C1A]" : "text-slate-700"}`}>{lbl}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              {(filter.type === "text" || filter.type === "number") && (
                <div className="relative">
                  <input
                    type={filter.type}
                    placeholder={filter.label}
                    className="w-full px-4 py-2.5 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] transition-all font-medium text-slate-900 text-sm"
                    value={String(formData.attributes[filter.id] || "")}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        attributes: { ...prev.attributes, [filter.id]: e.target.value },
                      }))
                    }
                  />
                  {filter.unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">{filter.unit}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
