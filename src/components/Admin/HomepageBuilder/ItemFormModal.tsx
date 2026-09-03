import React, { useState } from "react";
import { X, Sparkles, Package, MapPin, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { HomepageSection } from "../../../domains/home/homepage.types";
import { Product } from "../../../domains/product/product.types";
import { SectionGeneralTab } from "./SectionGeneralTab";
import { SectionProductsTab } from "./SectionProductsTab";
import { SectionTargetingTab } from "./SectionTargetingTab";

interface ItemFormModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  editItem: HomepageSection | null;
  activeModalStep?: number;
  setActiveModalStep?: React.Dispatch<React.SetStateAction<number>>;

  // Form state for Section
  secName: string;
  setSecName: (val: string) => void;
  secType: HomepageSection["type"];
  setSecType: React.Dispatch<React.SetStateAction<HomepageSection["type"]>>;
  secLayout: HomepageSection["layout"];
  setSecLayout: React.Dispatch<React.SetStateAction<HomepageSection["layout"]>>;
  secBackgroundColor: string;
  setSecBackgroundColor: (val: string) => void;
  secLimit: number;
  setSecLimit: (val: number) => void;
  secStyle: string;
  setSecStyle: (val: string) => void;
  secThemeName: string;
  setSecThemeName: (val: string) => void;
  secThemeImage: string;
  setSecThemeImage: (val: string) => void;
  secTheme: string;
  setSecTheme: (val: string) => void;
  secCategory: string;
  setSecCategory: (val: string) => void;
  secTag: string;
  setSecTag: (val: string) => void;
  secTitle: string;
  setSecTitle: (val: string) => void;
  secSubtitle: string;
  setSecSubtitle: (val: string) => void;
  secIsActive: boolean;
  setSecIsActive: (val: boolean) => void;
  secTargetAudience: HomepageSection["targetAudience"];
  setSecTargetAudience: React.Dispatch<React.SetStateAction<HomepageSection["targetAudience"]>>;
  secTargetRegions: string[];
  setSecTargetRegions: (val: string[]) => void;
  searchSecProduct: string;
  setSearchSecProduct: (val: string) => void;
  modalSearchCategory: string;
  setModalSearchCategory: (val: string) => void;
  secManualLinks: string[];
  setSecManualLinks: (val: string[]) => void;

  // Global actions
  allProducts: Product[];
  handleFileUpload?: (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => void;
  handleSaveItem: (e: React.FormEvent) => void;
}

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  editItem,
  secName,
  setSecName,
  secType,
  setSecType,
  secLayout,
  setSecLayout,
  secBackgroundColor,
  setSecBackgroundColor,
  secLimit,
  setSecLimit,
  secStyle,
  setSecStyle,
  secThemeName,
  setSecThemeName,
  secCategory,
  setSecCategory,
  secTitle,
  setSecTitle,
  secSubtitle,
  setSecSubtitle,
  secIsActive,
  setSecIsActive,
  secTargetAudience,
  setSecTargetAudience,
  secTargetRegions,
  setSecTargetRegions,
  secManualLinks,
  setSecManualLinks,
  allProducts,
  handleSaveItem,
}) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"general" | "products" | "targeting">("general");

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-fade-in" id="item-form-modal">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                {editItem ? t("Édition de la Section d'Accueil") : t("Créer une Nouvelle Section d'Accueil")}
              </h3>
              <p className="text-xs text-zinc-500">
                {t("Configurez le contenu, l'apparence et le ciblage storefront")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="p-2 rounded-2xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-200 px-6 bg-white gap-2">
          <button
            type="button"
            onClick={() => setTab("general")}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              tab === "general"
                ? "border-amber-500 text-amber-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t("1. Contenu & Titre")}
          </button>

          <button
            type="button"
            onClick={() => setTab("products")}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              tab === "products"
                ? "border-amber-500 text-amber-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            {t("2. Catalogue & Produits")}
          </button>

          <button
            type="button"
            onClick={() => setTab("targeting")}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              tab === "targeting"
                ? "border-amber-500 text-amber-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            {t("3. Ciblage Wilayas & Audience")}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveItem} className="flex-1 overflow-y-auto p-6 space-y-6">
          {tab === "general" && (
            <SectionGeneralTab
              secName={secName}
              setSecName={setSecName}
              secTitle={secTitle}
              setSecTitle={setSecTitle}
              secSubtitle={secSubtitle}
              setSecSubtitle={setSecSubtitle}
              secType={secType}
              setSecType={setSecType}
              secLayout={secLayout}
              setSecLayout={setSecLayout}
              secStyle={secStyle}
              setSecStyle={setSecStyle}
              secIsActive={secIsActive}
              setSecIsActive={setSecIsActive}
            />
          )}

          {tab === "products" && (
            <SectionProductsTab
              secCategory={secCategory}
              setSecCategory={setSecCategory}
              secLimit={secLimit}
              setSecLimit={setSecLimit}
              secManualLinks={secManualLinks}
              setSecManualLinks={setSecManualLinks}
              allProducts={allProducts}
            />
          )}

          {tab === "targeting" && (
            <SectionTargetingTab
              secTargetAudience={secTargetAudience}
              setSecTargetAudience={setSecTargetAudience}
              secTargetRegions={secTargetRegions}
              setSecTargetRegions={setSecTargetRegions}
              secBackgroundColor={secBackgroundColor}
              setSecBackgroundColor={setSecBackgroundColor}
              secThemeName={secThemeName}
              setSecThemeName={setSecThemeName}
            />
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
            <div className="text-xs text-zinc-500">
              {tab === "general" && t("Étape 1 sur 3")}
              {tab === "products" && t("Étape 2 sur 3")}
              {tab === "targeting" && t("Étape 3 sur 3")}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-2xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                {t("Annuler")}
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-sm transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {editItem ? t("Enregistrer les modifications") : t("Publier la section")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
