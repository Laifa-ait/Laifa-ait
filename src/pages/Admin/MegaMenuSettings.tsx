import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Save } from "lucide-react";
import { useMegaMenu } from "../../context/MegaMenuContext";

export const MegaMenuSettings: React.FC = () => {
  const { t } = useTranslation();
  const { saveMegaMenuToFirestore } = useMegaMenu();
  const [activeTab, setActiveTab] = useState<"structure" | "featured">("structure");

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[3.5rem] border border-zinc-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-sans font-black text-zinc-950 tracking-tight">{t('Méga Menu Principal')}</h2>
          <p className="text-zinc-500 font-medium text-sm mt-2">{t('Gérez la structure et les produits mis en avant du catalogue.')}</p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-50/80 p-2 rounded-3xl border border-zinc-100">
          {([
            { id: 'structure' as const, label: 'Structure du Menu' },
            { id: 'featured' as const, label: 'Produits en Vedette' }
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-zinc-950 text-white shadow-xl' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              {t(tab.label)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm text-center">
         <p className="text-sm text-zinc-500 mb-4">{t("La gestion détaillée du méga menu a été simplifiée pour cette itération.")}</p>
         <button onClick={() => saveMegaMenuToFirestore()} className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 mx-auto">
           <Save className="w-5 h-5" />
           {t("Enregistrer la configuration actuelle")}
         </button>
      </div>
    </div>
  );
};
