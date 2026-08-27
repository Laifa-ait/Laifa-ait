import React from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { Product } from "../../domains/product/product.types";
import { NewsletterMediaTabContents } from "./NewsletterMediaTabContents";

export interface StockBanner {
  id: string;
  title: string;
  url: string;
  category: string;
}

interface NewsletterMediaModalProps {
  mediaModalOpen: boolean;
  setMediaModalOpen: (open: boolean) => void;
  mediaTab: "product_catalog" | "stock_banners" | "custom_url" | "file_upload";
  setMediaTab: (tab: "product_catalog" | "stock_banners" | "custom_url" | "file_upload") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  productsLoading: boolean;
  productsList: Product[];
  handleSelectProduct: (prod: Product) => void;
  stockBanners: StockBanner[];
  handleSelectImage: (url: string) => void;
  customImageUrl: string;
  setCustomImageUrl: (url: string) => void;
  isUploadingImage: boolean;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  t: (key: string, defaultValue?: string) => string;
}

export const NewsletterMediaModal: React.FC<NewsletterMediaModalProps> = ({
  mediaModalOpen,
  setMediaModalOpen,
  mediaTab,
  setMediaTab,
  searchQuery,
  setSearchQuery,
  productsLoading,
  productsList,
  handleSelectProduct,
  stockBanners,
  handleSelectImage,
  customImageUrl,
  setCustomImageUrl,
  isUploadingImage,
  handleFileUpload,
  t,
}) => {
  if (!mediaModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950/70 flex items-center justify-center p-4 md:p-8 z-[10000]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[3rem] border border-zinc-200 shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden text-start"
      >
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-zinc-150 flex items-center justify-between bg-zinc-50/50">
          <div>
            <h3 className="text-lg font-sans font-bold text-zinc-950">
              {t("Médiathèque & catalogue Produits")}
            </h3>
            <p className="text-zinc-400 text-xs font-semibold mt-0.5">
              {t("Choisissez les visuels à intégrer dans votre campagne.")}
            </p>
          </div>
          <button
            onClick={() => setMediaModalOpen(false)}
            className="p-3 bg-white text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-2xl transition-all border border-zinc-200 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-150 px-8 bg-white gap-8 overflow-x-auto">
          {[
            { id: "product_catalog", label: t("Catalogue Produits") },
            { id: "stock_banners", label: t("Bannières Algérie (HD)") },
            { id: "custom_url", label: t("Lien Web (URL)") },
            { id: "file_upload", label: t("Importer un fichier") },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setMediaTab(
                  tab.id as "product_catalog" | "stock_banners" | "custom_url" | "file_upload"
                )
              }
              className={`py-4 font-sans font-bold text-xs uppercase tracking-wider relative transition-all whitespace-nowrap ${
                mediaTab === tab.id ? "text-orange-600" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {tab.label}
              {mediaTab === tab.id && (
                <motion.div
                  layoutId="mediaTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        <NewsletterMediaTabContents
          mediaTab={mediaTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          productsLoading={productsLoading}
          productsList={productsList}
          handleSelectProduct={handleSelectProduct}
          stockBanners={stockBanners}
          handleSelectImage={handleSelectImage}
          customImageUrl={customImageUrl}
          setCustomImageUrl={setCustomImageUrl}
          isUploadingImage={isUploadingImage}
          handleFileUpload={handleFileUpload}
          t={t}
        />
      </motion.div>
    </div>
  );
};
