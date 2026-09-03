import React from "react";
import { TFunction } from "i18next";
import { Search, Link2, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { formatPrice } from "../../utils/format";
import { Product } from "../../domains/product/product.types";
import { StockBanner } from "./NewsletterMediaModal";

interface NewsletterMediaTabContentsProps {
  mediaTab: "product_catalog" | "stock_banners" | "custom_url" | "file_upload";
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
  t: TFunction;
}

export const NewsletterMediaTabContents: React.FC<NewsletterMediaTabContentsProps> = ({
  mediaTab,
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
  return (
    <>
      {/* Modal Search Bar */}
      {(mediaTab === "product_catalog" || mediaTab === "stock_banners") && (
        <div className="p-6 pb-2 border-b border-zinc-100 bg-zinc-50/30">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder={
                mediaTab === "product_catalog"
                  ? t("Rechercher un produit...")
                  : t("Filtrer les bannières...")
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl text-xs font-bold text-zinc-900 placeholder-zinc-400 outline-none focus:border-orange-500 shadow-sm"
            />
          </div>
        </div>
      )}

      {/* Modal Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-zinc-50/30">
        {mediaTab === "product_catalog" && (
          <div>
            {productsLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
                <p className="text-zinc-400 text-xs font-semibold">
                  {t("Chargement des produits...")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {productsList
                  .filter((p) => {
                    if (!searchQuery) return true;
                    return p.name.toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map((prod) => {
                    const mainImage = prod.images?.[0] || "/images/placeholders/product.svg";
                    return (
                      <div
                        key={prod.id}
                        onClick={() => handleSelectProduct(prod)}
                        className="bg-white rounded-2xl border border-zinc-200 hover:border-orange-500 hover:shadow-xl p-3 transition-all cursor-pointer group"
                      >
                        <div className="aspect-square rounded-2xl bg-zinc-100 overflow-hidden relative border border-zinc-100">
                          <img
                            loading="lazy"
                            src={mainImage}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-2 start-2 bg-zinc-900/80 text-white text-[8px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal px-2 py-1 rounded">
                            {prod.category}
                          </span>
                        </div>
                        <div className="mt-3 space-y-1">
                          <h4 className="text-zinc-950 text-xs font-sans font-bold tracking-tight rtl:tracking-normal line-clamp-1 group-hover:text-orange-600 transition-colors">
                            {prod.name}
                          </h4>
                          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 font-sans font-bold">
                            <span>{formatPrice(prod.price)}</span>
                            <span className="text-[8px] uppercase font-sans font-extrabold bg-zinc-100 text-zinc-650 px-2 py-0.5 rounded-full">
                              {t("Sélectionner")}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {mediaTab === "stock_banners" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stockBanners
              .filter((b) => {
                if (!searchQuery) return true;
                const title = b.title.toLowerCase();
                const cat = b.category.toLowerCase();
                const searchLow = searchQuery.toLowerCase();
                return title.includes(searchLow) || cat.includes(searchLow);
              })
              .map((banner) => {
                return (
                  <div
                    key={banner.id}
                    onClick={() => handleSelectImage(banner.url)}
                    className="bg-white rounded-2xl border border-zinc-200 hover:border-orange-500 overflow-hidden hover:shadow-xl transition-all cursor-pointer group flex flex-col"
                  >
                    <div className="aspect-video bg-zinc-100 overflow-hidden relative">
                      <img
                        loading="lazy"
                        src={banner.url}
                        alt={banner.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 start-3 bg-orange-600 text-white text-[8px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal px-2.5 py-1 rounded-full shadow-md">
                        {banner.category}
                      </span>
                    </div>
                    <div className="p-4 flex items-center justify-between bg-zinc-50/40">
                      <div>
                        <h4 className="text-zinc-950 text-xs font-sans font-bold tracking-tight rtl:tracking-normal">
                          {banner.title}
                        </h4>
                        <p className="text-[8px] font-sans font-bold text-zinc-400 uppercase tracking-wider rtl:tracking-normal mt-1">
                          {t("Haute Définition (HD)")}
                        </p>
                      </div>
                      <span className="text-[9px] font-sans font-bold uppercase text-orange-600 bg-orange-50 px-3 py-1.5 rounded-2xl border border-orange-100 group-hover:bg-orange-600 group-hover:text-white transition-all shrink-0">
                        {t("Choisir")}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {mediaTab === "custom_url" && (
          <div className="max-w-xl mx-auto bg-white border border-zinc-205 p-8 rounded-[2.5rem] space-y-6 shadow-sm">
            <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-center text-zinc-500">
              <Link2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-sans font-bold text-zinc-900 uppercase tracking-wider rtl:tracking-normal">
                {t("Importer depuis un lien direct")}
              </h4>
              <p className="text-zinc-400 text-xs font-semibold">
                {t(
                  "Collez l'adresse URL de n'importe quel hébergeur d'images (Imgur, Cloudinary, etc.)"
                )}
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal block font-mono">
                {t("Lien Web de l'Image (URL)")}
              </label>
              <input
                type="url"
                required
                className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none font-bold text-xs"
                placeholder="https://example.com/image.jpg"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                if (customImageUrl.trim()) {
                  handleSelectImage(customImageUrl.trim());
                  setCustomImageUrl("");
                }
              }}
              disabled={!customImageUrl.trim()}
              className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal rounded-2xl disabled:opacity-50 transition-colors shadow-lg shadow-orange-500/10"
            >
              {t("Valider et appliquer l'image")}
            </button>
          </div>
        )}

        {mediaTab === "file_upload" && (
          <div className="max-w-xl mx-auto bg-white border border-zinc-205 p-8 rounded-[2.5rem] space-y-6 shadow-sm text-center">
            <div className="w-16 h-16 bg-orange-50 border border-orange-100 rounded-[1.5rem] flex items-center justify-center text-orange-500 mx-auto mb-4">
              <Upload className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-sans font-bold text-zinc-900 uppercase tracking-wider rtl:tracking-normal">
                {t("Téléverser une image de votre appareil")}
              </h4>
              <p className="text-zinc-400 text-xs font-semibold">
                {t("Formats supportés : JPG, PNG, WEBP, GIF (Max 5MB)")}
              </p>
            </div>

            <label
              className={`block w-full py-5 rounded-2xl border-2 border-dashed border-zinc-200 hover:border-orange-500 hover:bg-orange-50/50 cursor-pointer transition-all ${
                isUploadingImage ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <input
                type="file"
                className="hidden"
                accept="image/jpeg, image/png, image/webp, image/gif"
                onChange={handleFileUpload}
                disabled={isUploadingImage}
              />
              <div className="flex flex-col items-center gap-3">
                {isUploadingImage ? (
                  <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-zinc-400" />
                )}
                <span className="text-xs font-sans font-bold uppercase tracking-widest rtl:tracking-normal text-zinc-500">
                  {isUploadingImage ? "Téléchargement..." : "Cliquer pour sélectionner"}
                </span>
              </div>
            </label>
          </div>
        )}
      </div>
    </>
  );
};
