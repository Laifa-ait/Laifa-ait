import React from "react";
import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";
import { motion } from "motion/react";
import { ProductFormData } from "../../../../types/seller";

interface StepLogisticsProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  ALGERIA_WILAYAS: string[];
}

export const StepLogistics: React.FC<StepLogisticsProps> = ({
  formData,
  setFormData,
  ALGERIA_WILAYAS,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <div className="space-y-1">
        <h4 className="text-xl font-bold text-slate-900">{t("Logistique & Visibilité")}</h4>
        <p className="text-sm text-slate-500">{t("Expédition, retours et paramètres de publication finaux.")}</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#FFFBF5] p-6 rounded-2xl border border-[#E5DED4]">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">{t("Poids du Colis (kg)")}</label>
            <input
              type="number"
              step="0.01"
              className="w-full px-4 py-3 bg-white border border-[#E5DED4] rounded-xl outline-none font-medium text-slate-900 focus:border-[#C75C1A] transition-colors"
              placeholder="0.5"
              value={formData.weight || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, weight: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">{t("Dimensions (Lx lx h cm)")}</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-white border border-[#E5DED4] rounded-xl outline-none font-medium text-slate-900 focus:border-[#C75C1A] transition-colors"
              placeholder="20x15x10"
              value={formData.dimensions || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, dimensions: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 flex justify-between">
              {t("Livraison (DA)")}
              <span className="lowercase text-[9px] font-bold text-slate-500">{t("vide=défaut")}</span>
            </label>
            <input
              type="number"
              className="w-full px-4 py-3 bg-white border border-[#E5DED4] rounded-xl outline-none font-medium text-slate-900 focus:border-[#C75C1A] transition-colors"
              placeholder={t("Tarif fixe...") || "Tarif fixe..."}
              value={formData.deliveryPrice || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, deliveryPrice: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">{t("Délai de préparation estimé")}</label>
            <select
              className="w-full px-4 py-3 bg-white border border-[#E5DED4] rounded-xl outline-none font-medium text-slate-900 focus:border-[#C75C1A] transition-colors"
              value={formData.preparationTime || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, preparationTime: e.target.value }))}
            >
              <option value="">{t("Sélectionner...")}</option>
              <option value="1">{t("1 jour ouvré (Express)")}</option>
              <option value="2">{t("2 jours ouvrés")}</option>
              <option value="3">{t("3 à 5 jours ouvrés")}</option>
              <option value="7">{t("Fabrication sur commande (7j+)")}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">{t("Wilaya d'expédition")}</label>
            <select
              className="w-full px-4 py-3 bg-white border border-[#E5DED4] rounded-xl outline-none font-medium text-slate-900 focus:border-[#C75C1A] transition-colors"
              value={formData.wilaya || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, wilaya: e.target.value }))}
            >
              <option value="">{t("Sélectionner...")}</option>
              {ALGERIA_WILAYAS.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
          <label className="p-4 border border-[#E5DED4] rounded-xl bg-white flex items-center justify-between cursor-pointer hover:border-[#C75C1A] transition-colors">
            <div>
              <span className="block font-bold text-slate-900 text-sm">{t("Politique de retour (14 jours)")}</span>
              <span className="text-xs text-slate-500 font-medium">{t("Accepter les retours/échanges sous 14 jours")}</span>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors relative flex items-center shrink-0 ${formData.returnPolicy ? "bg-[#C75C1A]" : "bg-[#E5DED4]"}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute shadow transition-transform ${formData.returnPolicy ? "translate-x-6" : "translate-x-1"}`} />
            </div>
            <input
              type="checkbox"
              className="hidden"
              checked={formData.returnPolicy}
              onChange={() => setFormData((prev) => ({ ...prev, returnPolicy: !prev.returnPolicy }))}
            />
          </label>

          <label className="p-4 border border-[#E5DED4] rounded-xl bg-white flex items-center justify-between cursor-pointer hover:border-[#C75C1A] transition-colors">
            <div>
              <span className="block font-bold text-slate-900 text-sm">{t("Mettre en avant sur la vitrine")}</span>
              <span className="text-xs text-slate-500 font-medium">{t("Affiche le produit en grand en haut de votre boutique")}</span>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors relative flex items-center shrink-0 ${formData.isStoreFeatured ? "bg-orange-500" : "bg-[#E5DED4]"}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute shadow transition-transform ${formData.isStoreFeatured ? "translate-x-6" : "translate-x-1"}`} />
            </div>
            <input
              type="checkbox"
              className="hidden"
              checked={formData.isStoreFeatured}
              onChange={() => setFormData((prev) => ({ ...prev, isStoreFeatured: !prev.isStoreFeatured }))}
            />
          </label>

          <label className="p-4 border border-[#E5DED4] rounded-xl bg-white flex items-center justify-between cursor-pointer hover:border-[#C75C1A] transition-colors">
            <div>
              <span className="block font-bold text-slate-900 text-sm">{t("Traduction automatique")}</span>
              <span className="text-xs text-slate-500 font-medium">{t("Générer les versions Arabe et Anglais à l'enregistrement")}</span>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors relative flex items-center shrink-0 ${formData.autoTranslate ? "bg-[#C75C1A]" : "bg-[#E5DED4]"}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute shadow transition-transform ${formData.autoTranslate ? "translate-x-6" : "translate-x-1"}`} />
            </div>
            <input
              type="checkbox"
              className="hidden"
              checked={formData.autoTranslate}
              onChange={() => setFormData((prev) => ({ ...prev, autoTranslate: !prev.autoTranslate }))}
            />
          </label>
        </div>

        <div className="pt-6 border-t border-[#E5DED4]">
          <h5 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#C75C1A]" /> {t("Planification & Notes internes")}
          </h5>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">{t("Date de publication programmée")}</label>
              <input
                type="datetime-local"
                className="w-full px-4 py-3 bg-white border border-[#E5DED4] rounded-xl outline-none font-medium text-slate-900 focus:border-[#C75C1A] transition-colors"
                value={formData.publishAt || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, publishAt: e.target.value }))}
              />
              <p className="text-[10px] text-slate-500 mt-1">{t("Laissez vide pour publier immédiatement après modération.")}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">{t("Notes internes (Privé)")}</label>
              <textarea
                className="w-full px-4 py-3 bg-white border border-[#E5DED4] rounded-xl outline-none font-medium text-slate-900 focus:border-[#C75C1A] transition-colors resize-none h-[88px]"
                placeholder={
                  t("Fournisseur, emplacement dans le stock, références internes...") || "Fournisseur, emplacement dans le stock, références internes..."
                }
                value={formData.internalNotes || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, internalNotes: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

