import React from "react";
import { useTranslation } from "react-i18next";
import { Plus, Tag, ImageIcon } from "lucide-react";

interface BannerAdminHeaderProps {
  activeTab: string;
  setActiveTab: (tab: "banners" | "tags") => void;
  handleOpenBannerModal: () => void;
}

export const BannerAdminHeader: React.FC<BannerAdminHeaderProps> = ({
  activeTab,
  setActiveTab,
  handleOpenBannerModal,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Header section with brand accent colors */}
      <div id="banner-admin-header-card" className="bg-white p-6 sm:p-8 rounded-[2rem] border border-zinc-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-start">
        <div id="banner-admin-header-info">
          <span className="text-xs font-sans font-black text-orange-600 uppercase tracking-[0.2em] block">
            {t("OLMART PREMIER ACCUEIL")}
          </span>
          <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tight mt-1">
            {t("Gestion des Bannières & Campagnes")}
          </h2>
          <p className="text-xs text-zinc-500 max-w-xl font-medium mt-1">
            {t("Pilotez l'expérience visuelle globale : ordonnez le carrousel, configurez les campagnes par Wilaya et liez les tags de catalogue d'Algérie.")}
          </p>
        </div>

        {activeTab === "banners" && (
          <button
            id="btn-add-banner-header"
            onClick={() => handleOpenBannerModal()}
            className="h-12 px-6 bg-zinc-950 text-white rounded-2xl hover:bg-zinc-850 font-sans font-extrabold text-xs uppercase tracking-widest transition-all shadow-md select-none cursor-pointer flex items-center gap-2 border-none"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>{t("Créer une Bannière")}</span>
          </button>
        )}
      </div>

      {/* Luxury Minimalist Navigation Tabs Panel */}
      <div id="banner-admin-tabs-nav" className="flex border-b border-zinc-150 gap-2 overflow-x-auto select-none no-scrollbar">
        <button
          id="tab-btn-banners"
          onClick={() => setActiveTab("banners")}
          className={`flex items-center gap-2 px-6 py-4 border-b-2 font-sans font-extrabold text-xs uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === "banners"
              ? "border-zinc-950 text-zinc-950 font-black scale-[1.01]"
              : "border-transparent text-zinc-400 hover:text-zinc-650"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>{t("Carrousel d'Accueil")}</span>
        </button>

        <button
          id="tab-btn-tags"
          onClick={() => setActiveTab("tags")}
          className={`flex items-center gap-2 px-6 py-4 border-b-2 font-sans font-extrabold text-xs uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === "tags"
              ? "border-zinc-950 text-zinc-950 font-black scale-[1.01]"
              : "border-transparent text-zinc-400 hover:text-zinc-650"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>{t("Tags de Redirection")}</span>
        </button>
      </div>
    </>
  );
};
