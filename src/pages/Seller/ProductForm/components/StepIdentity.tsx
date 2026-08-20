import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { AdminTag, ProductFormData } from "../../../../types/seller";
import { CategoryStructure } from "../../../../config/dynamicFilters";
import { FieldHelp } from "./FieldHelp";
import { StepIdentityTagsInput } from "./StepIdentityTagsInput";

interface StepIdentityProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  categories: string[];
  DYNAMIC_CATEGORIES: Record<string, CategoryStructure>;
  subCategories: string[];
  subSubCategories: string[];
  aiGenerating: boolean;
  handleGenerateAiDescription: () => Promise<void>;
  tagInput: string;
  setTagInput: (val: string) => void;
  showAdminTagsList: boolean;
  setShowAdminTagsList: (val: boolean) => void;
  adminTags: AdminTag[];
}

export const StepIdentity: React.FC<StepIdentityProps> = ({
  formData,
  setFormData,
  categories,
  DYNAMIC_CATEGORIES,
  subCategories,
  subSubCategories,
  aiGenerating,
  handleGenerateAiDescription,
  tagInput,
  setTagInput,
  showAdminTagsList,
  setShowAdminTagsList,
  adminTags,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <div className="space-y-1">
        <h4 className="text-xl font-bold text-slate-900">{t("Identité Produit")}</h4>
        <p className="text-sm text-slate-500">{t("Définissez les informations principales de votre article.")}</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">{t("Nom du Produit *")}</label>
          <input
            required
            type="text"
            className="w-full px-4 py-3 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] focus:ring-1 focus:ring-blue-900 transition-all font-medium text-slate-900 placeholder:text-slate-500"
            placeholder={t("Ex: Veste en cuir vintage...") || "Ex: Veste en cuir vintage..."}
            value={formData.name || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-xs font-semibold text-slate-600 mb-2">
              {t("Catégorie Principale *")}
              <FieldHelp text={t("product.help.category") || "Choisissez la catégorie la plus précise. Cela aide les acheteurs à trouver votre produit."} />
            </label>
            <select
              className="w-full px-4 py-3 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] transition-all font-medium text-slate-900"
              value={formData.category || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  category: e.target.value,
                  subcategory: "",
                  subSubCategory: "",
                }))
              }
            >
              <option value="">{t("Sélectionner...")}</option>
              {(categories.length > 0 ? categories : Object.keys(DYNAMIC_CATEGORIES)).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">{t("Marque")}</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] transition-all font-medium text-slate-900 placeholder:text-slate-500"
              placeholder={t("Ex: Zara, Nike...") || "Ex: Zara, Nike..."}
              value={formData.brand || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">{t("État du produit")}</label>
            <select
              className="w-full px-4 py-3 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] transition-all font-medium text-slate-900"
              value={formData.condition || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, condition: e.target.value }))}
            >
              <option value="Neuf">{t("Neuf")}</option>
              <option value="Très bon état">{t("Très bon état")}</option>
              <option value="Bon état">{t("Bon état")}</option>
              <option value="État satisfaisant">{t("État satisfaisant")}</option>
              <option value="Reconditionné">{t("Reconditionné")}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">{t("Garantie")}</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] transition-all font-medium text-slate-900 placeholder:text-slate-500"
              placeholder={t("Ex: 12 mois...") || "Ex: 12 mois..."}
              value={formData.warranty || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, warranty: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">{t("Cible (Genre)")}</label>
            <select
              className="w-full px-4 py-3 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] transition-all font-medium text-slate-900"
              value={formData.gender || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))}
            >
              <option value="">{t("Tous")}</option>
              <option value="Homme">{t("Homme")}</option>
              <option value="Femme">{t("Femme")}</option>
              <option value="Enfant">{t("Enfant")}</option>
              <option value="Bébé">{t("Bébé")}</option>
            </select>
          </div>
        </div>

        {(subCategories.length > 0 || subSubCategories.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6 bg-[#FFFBF5] p-4 rounded-2xl border border-slate-100">
            {subCategories.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">{t("Sous-catégorie *")}</label>
                <select
                  className="w-full px-4 py-3 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] transition-all font-medium text-slate-900"
                  value={formData.subcategory || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subcategory: e.target.value,
                      subSubCategory: "",
                    }))
                  }
                >
                  <option value="">{t("Choisir...")}</option>
                  {subCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {subSubCategories.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">{t("Sous-sous-catégorie *")}</label>
                <select
                  className="w-full px-4 py-3 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] transition-all font-medium text-slate-900"
                  value={formData.subSubCategory || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subSubCategory: e.target.value }))}
                >
                  <option value="">{t("Choisir...")}</option>
                  {subSubCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-600">{t("Description Détaillée")}</label>
            <button
              type="button"
              onClick={handleGenerateAiDescription}
              disabled={aiGenerating}
              className="flex items-center gap-1.5 text-[10px] font-bold text-[#C75C1A] uppercase tracking-wider rtl:tracking-normal hover:bg-[#C75C1A]/5 px-2 py-1 rounded transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${aiGenerating ? "animate-pulse" : ""}`} />
              {aiGenerating ? t("Génération...") : t("Générer (IA)")}
            </button>
          </div>
          <textarea
            rows={6}
            className="w-full px-4 py-3 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] transition-all font-medium text-slate-900 resize-none placeholder:text-slate-500"
            placeholder={t("Décrivez votre produit en détail...") || "Décrivez votre produit en détail..."}
            value={formData.description || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <StepIdentityTagsInput
          formData={formData}
          setFormData={setFormData}
          tagInput={tagInput}
          setTagInput={setTagInput}
          showAdminTagsList={showAdminTagsList}
          setShowAdminTagsList={setShowAdminTagsList}
          adminTags={adminTags}
        />
      </div>
    </motion.div>
  );
};

