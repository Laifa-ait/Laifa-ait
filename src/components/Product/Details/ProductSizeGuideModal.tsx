import React from "react";
import { useTranslation } from "react-i18next";

export interface ProductSizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductSizeGuideModal: React.FC<ProductSizeGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-[#FAF6F0] border-4 border-[#EAE3D5] rounded-[2.5rem] max-w-2xl w-full p-6 md:p-10 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-stone-400 hover:text-stone-800 font-bold p-2 text-sm cursor-pointer transition-colors"
        >
          {t("common.close") || "✕ Fermer"}
        </button>
        <h3 className="text-xl font-sans font-extrabold text-[#2C2C28] mb-3">
          {t("product.details.size_guide_title") || "📐 Guide des Correspondances de Tailles"}
        </h3>
        <p className="text-xs text-stone-500 mb-4 leading-relaxed font-medium">
          {t("product.details.size_guide_desc") ||
            "En Algérie, les articles d'importation (Chine vs. Turquie/EUR) ou de fabrication locale ont des coupes différentes. Référez-vous à ce tableau pour éviter les erreurs de taille :"}
        </p>
        <div className="overflow-x-auto rounded-2xl border border-[#EAE3D5] mb-4 bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-transparent border-b border-[#EAE3D5] font-sans font-bold text-stone-700">
                <th className="p-3">{t("Taille EUR/Turquie")}</th>
                <th className="p-3">{t("Équivalence Chine")}</th>
                <th className="p-3">{t("Coupe Algérie")}</th>
                <th className="p-3">{t("Recommandation Olma")}</th>
              </tr>
            </thead>
            <tbody className="font-medium text-stone-600">
              <tr className="border-b border-[#EAE3D5]/40">
                <td className="p-3 font-bold text-stone-900">{t("size_s_36", "S (36)")}</td>
                <td className="p-3">{t("M (Chinois)")}</td>
                <td className="p-3">{t("Ajusté")}</td>
                <td className="p-3 text-[#D81159] font-bold">{t("Prendre M si étiquette Chine")}</td>
              </tr>
              <tr className="border-b border-[#EAE3D5]/40">
                <td className="p-3 font-bold text-stone-900">{t("size_m_38", "M (38)")}</td>
                <td className="p-3">{t("L (Chinois)")}</td>
                <td className="p-3">{t("Standard")}</td>
                <td className="p-3 text-[#D81159] font-bold">{t("Prendre L si étiquette Chine")}</td>
              </tr>
              <tr className="border-b border-[#EAE3D5]/40">
                <td className="p-3 font-bold text-stone-900">{t("size_l_40", "L (40)")}</td>
                <td className="p-3">{t("XL (Chinois)")}</td>
                <td className="p-3">{t("Standard")}</td>
                <td className="p-3 text-[#D81159] font-bold">{t("Prendre XL si étiquette Chine")}</td>
              </tr>
              <tr className="border-b border-[#EAE3D5]/40">
                <td className="p-3 font-bold text-stone-900">{t("XL (42)")}</td>
                <td className="p-3">{t("XXL (Chinois)")}</td>
                <td className="p-3">{t("Ample")}</td>
                <td className="p-3 text-[#D81159] font-bold">{t("Prendre XXL si étiquette Chine")}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="bg-[#FFEAEF] border border-[#D81159]/10 p-3.5 rounded-xl text-[10px] text-[#2C2C28] leading-relaxed font-bold">
          💡 <strong>{t("product.details.size_guide_tip_title") || "Astuce :"}</strong>{" "}
          {t("product.details.size_guide_tip_content") ||
            "Le standard Turquie correspond parfaitement aux tailles européennes classiques. Pour la Chine, commandez systématiquement une taille au-dessus."}
        </div>
      </div>
    </div>
  );
};
