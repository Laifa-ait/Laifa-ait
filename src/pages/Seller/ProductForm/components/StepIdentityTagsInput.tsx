import React from "react";
import { useTranslation } from "react-i18next";
import { X, Sparkles } from "lucide-react";
import { AdminTag, ProductFormData } from "../../../../types/seller";
import { FieldHelp } from "./FieldHelp";

interface StepIdentityTagsInputProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  tagInput: string;
  setTagInput: (tag: string) => void;
  showAdminTagsList: boolean;
  setShowAdminTagsList: (show: boolean) => void;
  adminTags: AdminTag[];
}

export const StepIdentityTagsInput: React.FC<StepIdentityTagsInputProps> = ({
  formData,
  setFormData,
  tagInput,
  setTagInput,
  showAdminTagsList,
  setShowAdminTagsList,
  adminTags,
}) => {
  const { t } = useTranslation();

  const handleAddTag = (tagToAdd?: string) => {
    const targetTag = (tagToAdd || tagInput).trim();
    if (!targetTag) return;
    if (formData.tags.includes(targetTag)) {
      setTagInput("");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, targetTag],
    }));
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700">
        {t("product.tags_label", "Mots-clés & Tags de recherche")}
        <FieldHelp text="Ajoutez des mots-clés séparés par Entrée pour booster votre visibilité." />
      </label>
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2 p-2.5 bg-white border border-[#E5DED4] rounded-xl focus-within:border-[#C75C1A] transition-all min-h-[46px]">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFFBF5] text-[#C75C1A] border border-[#E5DED4] rounded-lg text-xs font-semibold"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-[#C75C1A] hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder={
              formData.tags.length === 0
                ? t("product.tags_placeholder", "Ex: été, promo, tendance (Appuyez sur Entrée)")
                : ""
            }
            className="flex-1 min-w-[120px] bg-transparent outline-none text-slate-900 text-sm placeholder:text-slate-400"
            value={tagInput}
            onChange={(e) => {
              setTagInput(e.target.value);
              setShowAdminTagsList(true);
            }}
            onFocus={() => setShowAdminTagsList(true)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {showAdminTagsList && adminTags && adminTags.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5DED4] rounded-xl shadow-lg p-2 z-20 max-h-40 overflow-y-auto">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C75C1A]" />
              {t("Tags populaires suggérés")}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {adminTags
                .filter(
                  (t) =>
                    !formData.tags.includes(t.name) &&
                    (!tagInput || t.name.toLowerCase().includes(tagInput.toLowerCase()))
                )
                .slice(0, 8)
                .map((tag) => (
                  <button
                    key={tag.id || tag.name}
                    type="button"
                    onClick={() => {
                      handleAddTag(tag.name);
                      setShowAdminTagsList(false);
                    }}
                    className="px-2.5 py-1 bg-[#FFFBF5] hover:bg-[#C75C1A] text-slate-600 hover:text-white border border-[#E5DED4] rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    +{tag.name}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
