import React from "react";
import { useTranslation } from "react-i18next";
import { FileText, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { ProductFormData } from "../../../../../types/seller";

interface SpecsTechnicalSheetProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  handleGenerateSku: () => void;
}

export const SpecsTechnicalSheet: React.FC<SpecsTechnicalSheetProps> = ({
  formData,
  setFormData,
  handleGenerateSku,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 bg-white border border-[#E5DED4]/80 p-6 rounded-2xl shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
        <FileText className="w-4 h-4 text-orange-600" />
        <div>
          <h4 className="text-sm font-sans font-bold text-slate-900 uppercase tracking-wider rtl:tracking-normal">{t("Fiche Technique OLMART")}</h4>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider rtl:tracking-normal">
            {t("Configurez la référence, les matières premières et l'affichage saisonnier")}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* SKU Reference */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 font-sans">{t("Référence Unique Produit (SKU)")}</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={t("Ex: MAR-COT-748392") || "Ex: MAR-COT-748392"}
              className="flex-1 px-4 py-2.5 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] transition-all font-semibold text-slate-900 text-sm"
              value={formData.sku || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value.toUpperCase() }))}
            />
            <button
              type="button"
              onClick={handleGenerateSku}
              className="px-4 py-2.5 bg-slate-900 hover:bg-orange-600 text-white text-xs font-sans font-bold uppercase tracking-wider rtl:tracking-normal rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              {t("Générer")}
            </button>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">{t("Unique pour stock, traçabilité et livraison.")}</p>
        </div>

        {/* Season Selection */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 font-sans">{t("Saison & Collection d'affichage")}</label>
          <select
              className="w-full px-4 py-2.5 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] transition-all font-semibold text-slate-900 text-sm"
              value={formData.season || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, season: e.target.value }))}
            >
              <option value="">{t("Toutes Fêtes & Saisons (Par défaut)...")}</option>
              {[
                { id: "Toutes Saisons", label: "Toutes Saisons / كل الفصول" },
                { id: "Printemps / Été", label: "Printemps / Été (الربيع / الصيف)" },
                { id: "Automne / Hiver", label: "Automne / Hiver (الخريف / الشتاء)" },
                { id: "Collection Ramadan", label: "Collection Ramadan (مجموعة رمضان)" },
                { id: "Collection Traditionnelle", label: "Collection Traditionnelle (مجموعة تقليدية)" },
                { id: "Édition Limitée", label: "Édition Limitée (طبعة محدودة)" },
              ].map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed font-sans">
            {t("Permet un filtrage saisonnier intelligent pour les acheteurs.")}
          </p>
        </div>

        {/* Energy Class */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 font-sans">{t("Classe Énergétique (Électroménager)")}</label>
          <select
            className="w-full px-4 py-2.5 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] transition-all font-semibold text-slate-900 text-sm"
            value={formData.energyClass || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, energyClass: e.target.value }))}
          >
            <option value="">{t("Non applicable / Sélectionner...")}</option>
            {["A", "B", "C", "D", "E", "F", "G"].map((ec) => (
              <option key={ec} value={ec}>Classe {ec}</option>
            ))}
          </select>
          <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed font-sans">
            {t("S'affiche sur la fiche produit (obligatoire pour l'électroménager).")}
          </p>
        </div>
      </div>

      {/* Materials */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <label className="block text-xs font-semibold text-slate-700 font-sans">{t("Matières premières & Composition")}</label>
        <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">
          {t("Sélectionnez une ou plusieurs matières de fabrication algérienne ou noble :")}
        </p>

        <div className="flex flex-wrap gap-2">
          {[
            { id: "Coton", label: "Coton / قطن" },
            { id: "Laine", label: "Laine / صوف" },
            { id: "Cuir", label: "Cuir / جلد" },
            { id: "Argile", label: "Argile (Poterie) / طين" },
            { id: "Cuivre", label: "Cuivre / نحاس" },
            { id: "Soie", label: "Soie / حرير" },
            { id: "Lin", label: "Lin / كتan" },
            { id: "Or", label: "Or / ذهب" },
            { id: "Argent", label: "Argent / فضة" },
            { id: "Bois", label: "Bois / خشب" },
            { id: "Céramique", label: "Céramique / سيراميك" },
            { id: "Verre", label: "Verre / زجاج" },
            { id: "Fil d'Or", label: "Fil d'Or / فتلة" },
            { id: "Autre", label: "Autre / أخرى" },
          ].map((mat) => {
            const isSelected = formData.materials?.includes(mat.id);
            return (
              <button
                key={mat.id}
                type="button"
                onClick={() => {
                  const isAct = formData.materials?.includes(mat.id);
                  const newMat = isAct
                    ? (formData.materials || []).filter((m: string) => m !== mat.id)
                    : [...(formData.materials || []), mat.id];
                  setFormData((prev) => ({ ...prev, materials: newMat }));
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                    : "bg-transparent border-[#E5DED4] text-slate-700 hover:border-slate-300 hover:bg-[#FFFBF5]"
                }`}
              >
                {mat.label}
              </button>
            );
          })}
        </div>

        {formData.materials?.includes("Autre") && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
            <label className="block text-[10px] font-sans font-bold text-slate-900/60 uppercase tracking-wider rtl:tracking-normal mb-1">
              {t("Précisez l'autre matière")}
            </label>
            <input
              type="text"
              placeholder={t("Ex: Céramique fine de Kabylie, Laiton martelé...") || "Ex: Céramique fine de Kabylie, Laiton martelé..."}
              className="w-full max-w-md px-4 py-2 bg-white border border-[#E5DED4] rounded-xl outline-none focus:border-[#C75C1A] transition-all font-semibold text-slate-900 text-xs"
              value={formData.otherMaterial || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, otherMaterial: e.target.value }))}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

