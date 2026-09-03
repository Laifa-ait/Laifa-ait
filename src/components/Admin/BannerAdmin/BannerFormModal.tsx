import React from "react";
import { useTranslation } from "react-i18next";
import { X, Upload, Check, Plus, Image as ImageIcon } from "lucide-react";
import { DbBanner, TagType } from "../../../hooks/useBannerAdmin";
import { Product } from "../../../domains/product/product.types";

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBanner: DbBanner | null;
  tags: TagType[];
  allProducts: Product[];
  
  // States and mutators from hook
  bannerTitle: string;
  setBannerTitle: (v: string) => void;
  bannerTitleColor: string;
  setBannerTitleColor: (v: string) => void;
  bannerSubtitle: string;
  setBannerSubtitle: (v: string) => void;
  bannerSubtitleColor: string;
  setBannerSubtitleColor: (v: string) => void;
  bannerButtonText: string;
  setBannerButtonText: (v: string) => void;
  bannerBtnBgColor: string;
  setBannerBtnBgColor: (v: string) => void;
  bannerBtnTextColor: string;
  setBannerBtnTextColor: (v: string) => void;
  bannerDesktopImage: string;
  setBannerDesktopImage: (v: string) => void;
  bannerMobileImage: string;
  setBannerMobileImage: (v: string) => void;
  bannerTagId: string;
  setBannerTagId: (v: string) => void;
  bannerIsActive: boolean;
  setBannerIsActive: (v: boolean) => void;
  bannerFeaturedProducts: string[];
  setBannerFeaturedProducts: React.Dispatch<React.SetStateAction<string[]>>;
  bannerTargetUserType: "all" | "new" | "logged_in";
  setBannerTargetUserType: (v: "all" | "new" | "logged_in") => void;
  bannerTargetRegions: string[];
  setBannerTargetRegions: (v: string[]) => void;
  bannerStartDate: string;
  setBannerStartDate: (v: string) => void;
  bannerEndDate: string;
  setBannerEndDate: (v: string) => void;
  bannerAbGroup: "all" | "A" | "B";
  setBannerAbGroup: (v: "all" | "A" | "B") => void;
  bannerZone: "carousel_main" | "grid_top" | "grid_bottom" | "sidebar";
  setBannerZone: (v: "carousel_main" | "grid_top" | "grid_bottom" | "sidebar") => void;
  
  productSearchTerm: string;
  setProductSearchTerm: (v: string) => void;
  isUploadingDesktop: boolean;
  uploadProgressDesktop: number;
  isUploadingMobile: boolean;
  uploadProgressMobile: number;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, type: "desktop" | "mobile") => Promise<void>;
  handleSaveBanner: (e: React.FormEvent) => Promise<void>;
}

const ALGERIA_WILAYAS = [
  "01 Adrar", "02 Chlef", "03 Laghouat", "04 Oum El Bouaghi", "05 Batna", "06 Béjaïa",
  "07 Biskra", "08 Béchar", "09 Blida", "10 Bouira", "11 Tamanrasset", "12 Tébessa",
  "13 Tlemcen", "14 Tiaret", "15 Tizi Ouzou", "16 Alger", "17 Djelfa", "18 Jijel",
  "19 Sétif", "20 Saïda", "21 Skikda", "22 Sidi Bel Abbès", "23 Annaba", "24 Guelma",
  "25 Constantine", "26 Médéa", "27 Mostaganem", "28 M'Sila", "29 Mascara", "30 Ouargla",
  "31 Oran", "32 El Bayadh", "33 Illizi", "34 Bordj Bou Arréridj", "35 Boumerdès",
  "36 El Tarf", "37 Tindouf", "38 Tissemsilt", "39 El Oued", "40 Khenchela", "41 Souk Ahras",
  "42 Tipaza", "43 Mila", "44 Aïn Defla", "45 Naâma", "46 Aïn Témouchent", "47 Ghardaïa",
  "48 Relizane", "49 El M'Ghair", "50 Touggourt", "51 Ouled Djellal", "52 Béni Abbès",
  "53 In Salah", "54 In Guezzam", "55 Djanet", "56 El Bayadh 2", "57 Bab El Oued", "58 Ouled Fayet"
];

export const BannerFormModal: React.FC<BannerFormModalProps> = ({
  isOpen,
  onClose,
  selectedBanner,
  tags,
  allProducts,
  bannerTitle,
  setBannerTitle,
  bannerTitleColor,
  setBannerTitleColor,
  bannerSubtitle,
  setBannerSubtitle,
  bannerSubtitleColor,
  setBannerSubtitleColor,
  bannerButtonText,
  setBannerButtonText,
  bannerBtnBgColor,
  setBannerBtnBgColor,
  bannerBtnTextColor,
  setBannerBtnTextColor,
  bannerDesktopImage,
  setBannerDesktopImage,
  bannerMobileImage,
  setBannerMobileImage,
  bannerTagId,
  setBannerTagId,
  bannerIsActive,
  setBannerIsActive,
  bannerFeaturedProducts,
  setBannerFeaturedProducts,
  bannerTargetUserType,
  setBannerTargetUserType,
  bannerTargetRegions,
  setBannerTargetRegions,
  bannerStartDate,
  setBannerStartDate,
  bannerEndDate,
  setBannerEndDate,
  bannerAbGroup,
  setBannerAbGroup,
  bannerZone,
  setBannerZone,
  productSearchTerm,
  setProductSearchTerm,
  isUploadingDesktop,
  uploadProgressDesktop,
  isUploadingMobile,
  uploadProgressMobile,
  handleImageUpload,
  handleSaveBanner,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transition-transform scale-100 border border-zinc-100 flex flex-col">
        {/* Modal Header */}
        <div className="p-6 sm:p-8 border-b border-zinc-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-sans font-bold text-zinc-900 uppercase tracking-tight">
              {selectedBanner ? t("Modifier la Bannière") : t("Créer une Bannière d'Accueil")}
            </h3>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
              {t("Remplissez et validez soigneusement les dimensions requises")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-2xl text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Grid content */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto flex-1">
          {/* Form parameters */}
          <form onSubmit={handleSaveBanner} className="space-y-5">
            {/* Title and Title Color */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500">
                  {t("Titre de la Bannière *")}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t("ex: Sélection Premium") || "ex: Sélection Premium"}
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl border border-zinc-200 text-sm focus:outline-none focus:border-orange-350 bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500">
                  {t("Couleur Titre")}
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="color"
                    value={bannerTitleColor}
                    onChange={(e) => setBannerTitleColor(e.target.value)}
                    className="w-11 h-11 rounded-2xl cursor-pointer border border-zinc-200 shrink-0 select-none bg-transparent"
                  />
                  <input
                    type="text"
                    placeholder="#FFFFFF"
                    value={bannerTitleColor}
                    onChange={(e) => setBannerTitleColor(e.target.value)}
                    className="w-full h-11 px-2.5 border border-zinc-200 rounded-2xl text-xs uppercase font-mono font-bold focus:outline-none focus:border-orange-300 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Subtitle and Subtitle Color */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-100 pt-3">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500">
                  {t("Sous-titre de la Bannière")}
                </label>
                <input
                  type="text"
                  placeholder={
                    t("ex: Découvrez notre nouvelle collection en exclusivité") ||
                    "ex: Découvrez notre nouvelle collection en exclusivité"
                  }
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl border border-zinc-200 text-sm focus:outline-none focus:border-orange-500 bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500">
                  {t("Couleur Sous-titre")}
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="color"
                    value={bannerSubtitleColor}
                    onChange={(e) => setBannerSubtitleColor(e.target.value)}
                    className="w-11 h-11 rounded-2xl cursor-pointer border border-zinc-200 shrink-0 select-none bg-transparent"
                  />
                  <input
                    type="text"
                    placeholder="#FFFFFF"
                    value={bannerSubtitleColor}
                    onChange={(e) => setBannerSubtitleColor(e.target.value)}
                    className="w-full h-11 px-2.5 border border-zinc-200 rounded-2xl text-xs uppercase font-mono font-bold focus:outline-none focus:border-orange-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Button CTA text and styling */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-100 pt-3">
              <div className="space-y-1.5">
                <label className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500">
                  {t("Texte du Bouton *")}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t("ex: Découvrir") || "ex: Découvrir"}
                  value={bannerButtonText}
                  onChange={(e) => setBannerButtonText(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl border border-zinc-200 text-sm focus:outline-none focus:border-orange-500 bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500">
                  {t("Fond du Bouton")}
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="color"
                    value={bannerBtnBgColor}
                    onChange={(e) => setBannerBtnBgColor(e.target.value)}
                    className="w-11 h-11 rounded-2xl cursor-pointer border border-zinc-200 shrink-0 select-none bg-transparent"
                  />
                  <input
                    type="text"
                    placeholder="#FFFFFF"
                    value={bannerBtnBgColor}
                    onChange={(e) => setBannerBtnBgColor(e.target.value)}
                    className="w-full h-11 px-2.5 border border-zinc-200 rounded-2xl text-xs uppercase font-mono font-bold focus:outline-none focus:border-orange-500 bg-white"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500">
                  {t("Écriture Bouton")}
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="color"
                    value={bannerBtnTextColor}
                    onChange={(e) => setBannerBtnTextColor(e.target.value)}
                    className="w-11 h-11 rounded-2xl cursor-pointer border border-zinc-200 shrink-0 select-none bg-transparent"
                  />
                  <input
                    type="text"
                    placeholder="#18181B"
                    value={bannerBtnTextColor}
                    onChange={(e) => setBannerBtnTextColor(e.target.value)}
                    className="w-full h-11 px-2.5 border border-zinc-200 rounded-2xl text-xs uppercase font-mono font-bold focus:outline-none focus:border-orange-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Desktop and Mobile Images Upload controls */}
            <div className="space-y-4 pt-1 border-t border-zinc-100">
              {/* Desktop configuration */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <label className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500">
                    {t("Image Bureau * (1920x800 px)")}
                  </label>
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 rounded">
                    {t("Obligatoire")}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {bannerDesktopImage && (
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-2xl p-3 text-xs font-semibold">
                      <Check className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="truncate flex-1">{t("Image bureau sélectionnée avec succès !")}</span>
                      <button
                        type="button"
                        onClick={() => setBannerDesktopImage("")}
                        className="text-xs text-zinc-500 hover:text-red-500 border border-zinc-200 hover:border-red-200 bg-white px-2 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        {t("Effacer")}
                      </button>
                    </div>
                  )}

                  <label
                    className={`w-full h-11 px-4 rounded-2xl border-2 border-dashed flex items-center justify-between cursor-pointer transition-all select-none group ${
                      bannerDesktopImage
                        ? "border-zinc-200 hover:border-orange-300 hover:bg-zinc-50/50"
                        : "border-orange-500 hover:border-orange-600 bg-orange-50/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-zinc-700 font-bold text-xs uppercase tracking-wider">
                      <Upload className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
                      <span>{bannerDesktopImage ? t("Remplacer l'image") : t("Importer une photo de bureau")}</span>
                    </div>
                    <span className="text-xs text-zinc-400 font-medium">{t("PNG, JPG, WEBP")}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, "desktop")}
                      disabled={isUploadingDesktop}
                    />
                  </label>
                </div>
                {isUploadingDesktop && (
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="text-xs text-orange-600 font-bold uppercase transition flex items-center justify-between">
                      <span>{t("Chargement...")}</span>
                      <span>{uploadProgressDesktop}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-orange-500 h-full transition-all duration-300"
                        style={{ width: `${uploadProgressDesktop}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile configuration */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <label className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500">
                    {t("Image Mobile (800x1000 px)")}
                  </label>
                  <span className="text-xs font-bold text-zinc-400 uppercase">{t("Optionnel")}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {bannerMobileImage && (
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-2xl p-3 text-xs font-semibold">
                      <Check className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="truncate flex-1">{t("Image mobile sélectionnée avec succès !")}</span>
                      <button
                        type="button"
                        onClick={() => setBannerMobileImage("")}
                        className="text-xs text-zinc-500 hover:text-red-500 border border-zinc-200 hover:border-red-200 bg-white px-2 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        {t("Effacer")}
                      </button>
                    </div>
                  )}

                  <label
                    className={`w-full h-11 px-4 rounded-2xl border-2 border-dashed flex items-center justify-between cursor-pointer transition-all select-none group ${
                      bannerMobileImage
                        ? "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"
                        : "border-zinc-300 hover:border-zinc-500 bg-zinc-50/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-zinc-700 font-bold text-xs uppercase tracking-wider">
                      <Upload className="w-4 h-4 text-zinc-500 group-hover:scale-110 transition-transform" />
                      <span>
                        {bannerMobileImage ? t("Remplacer l'image") : t("Importer une photo mobile (Optionnelle)")}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400 font-medium font-semibold">{t("Optionnel")}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, "mobile")}
                      disabled={isUploadingMobile}
                    />
                  </label>
                </div>
                {isUploadingMobile && (
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="text-xs text-zinc-600 font-bold uppercase transition flex items-center justify-between">
                      <span>{t("Chargement...")}</span>
                      <span>{uploadProgressMobile}%</span>
                    </div>
                    <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-zinc-500 h-full transition-all duration-300"
                        style={{ width: `${uploadProgressMobile}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tag ID selection (required) */}
            <div className="space-y-1.5 pt-1 border-t border-zinc-100">
              <div className="flex justify-between items-baseline">
                <label className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500">
                  {t("Tag de Redirection d'Accueil *")}
                </label>
                <span className="text-xs font-bold text-zinc-400">{t("Clic → Filtre Catalogue")}</span>
              </div>
              {tags.length === 0 ? (
                <div className="p-3 bg-red-50 text-red-500 rounded-2xl text-xs font-bold font-mono">
                  {t("Veuillez d'abord créer au moins un Tag dans l'onglet tags avant d'ajouter une bannière !")}
                </div>
              ) : (
                <select
                  required
                  value={bannerTagId}
                  onChange={(e) => setBannerTagId(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl border border-zinc-200 text-sm focus:outline-none focus:border-orange-500 bg-white cursor-pointer"
                >
                  <option value="">{t("Sélectionnez un tag...")}</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name} (/{tag.slug})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Featured Products Selection */}
            <div className="space-y-3 pt-3 border-t border-zinc-100">
              <div className="flex justify-between items-baseline">
                <label className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500">
                  {t("Produits Mis en Avant (VIP)")}
                </label>
                <span className="text-xs font-bold text-zinc-400">{t("Seront affichés en premier")}</span>
              </div>

              {/* Selected products visualization */}
              {bannerFeaturedProducts.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2 p-3 bg-orange-50 rounded-2xl border border-orange-100">
                  {bannerFeaturedProducts.map((prodId) => {
                    const p = allProducts.find((x) => x.id === prodId);
                    return p ? (
                      <div
                        key={prodId}
                        className="flex items-center gap-1.5 bg-white border border-orange-200 ps-2 pe-1 py-1 rounded-lg shadow-sm text-xs group animate-fade-in"
                      >
                        <img loading="lazy" src={p.image} className="w-5 h-5 rounded-lg object-cover" alt="" referrerPolicy="no-referrer" />
                        <span className="font-semibold text-zinc-800 max-w-[120px] truncate">{p.name}</span>
                        <button
                          type="button"
                          onClick={() => setBannerFeaturedProducts((prev) => prev.filter((id) => id !== prodId))}
                          className="p-0.5 text-zinc-400 hover:text-red-500 bg-zinc-50 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}

              {/* Add Product Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={
                    t("Rechercher un produit à mettre en avant...") || "Rechercher un produit à mettre en avant..."
                  }
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="w-full h-10 px-3 rounded-2xl border border-zinc-200 text-xs focus:outline-none focus:border-zinc-500 bg-zinc-50"
                />
                {productSearchTerm.length > 1 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                    {allProducts
                      .filter((p) => !bannerFeaturedProducts.includes(p.id))
                      .filter((p) => p.name.toLowerCase().includes(productSearchTerm.toLowerCase()))
                      .map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setBannerFeaturedProducts((prev) => [...prev, p.id]);
                            setProductSearchTerm("");
                          }}
                          className="flex items-center gap-3 p-2 hover:bg-zinc-50 cursor-pointer border-b border-zinc-100 last:border-b-0"
                        >
                          <img loading="lazy" src={p.image} className="w-8 h-8 rounded-lg object-cover" alt="" referrerPolicy="no-referrer" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-zinc-900 truncate">{p.name}</p>
                            <p className="text-xs text-zinc-500">
                              {p.price} {t("DA")}
                            </p>
                          </div>
                          <Plus className="w-4 h-4 text-orange-500 shrink-0" />
                        </div>
                      ))}
                    {allProducts.filter(
                      (p) =>
                        !bannerFeaturedProducts.includes(p.id) &&
                        p.name.toLowerCase().includes(productSearchTerm.toLowerCase())
                    ).length === 0 && (
                      <div className="p-3 text-center text-xs text-zinc-500 font-bold uppercase">
                        {t("Aucun résultat")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Published Draft slider */}
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="space-y-0.5">
                <label className="text-xs font-extrabold text-zinc-950 uppercase">
                  {t("Statut de la publication")}
                </label>
                <p className="text-xs font-bold text-zinc-500 uppercase">
                  {t("Visible en page d'accueil si coché")}
                </p>
              </div>
              <input
                type="checkbox"
                checked={bannerIsActive}
                onChange={(e) => setBannerIsActive(e.target.checked)}
                className="w-6 h-6 text-orange-500 border-zinc-300 rounded focus:ring-orange-500 accent-orange-600 shrink-0 cursor-pointer"
              />
            </div>

            {/* Ciblage d'Audience & de Wilayas pour la Bannière */}
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-3">
              <div className="space-y-0.5">
                <label className="text-xs font-extrabold text-zinc-950 uppercase flex items-center gap-1.5">
                  <span>{t("🎯 Ciblage Fin & Personnalisation")}</span>
                </label>
                <p className="text-xs font-bold text-zinc-500 uppercase">
                  {t("Ajustez l'affichage de la bannière sur l'accueil")}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-start">
                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    {t("Audience Cible")}
                  </label>
                  <select
                    value={bannerTargetUserType}
                    onChange={(e) => setBannerTargetUserType(e.target.value as "all" | "new" | "logged_in")}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-800 font-bold text-xs bg-white text-zinc-850 cursor-pointer"
                  >
                    <option value="all">{t("Tout le monde (Tous)")}</option>
                    <option value="new">{t("Nouveaux Visiteurs uniquement")}</option>
                    <option value="logged_in">{t("Utilisateurs Connectés uniquement")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    {t("Wilayas Cibles (")}
                    {bannerTargetRegions.length})
                  </label>
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && !bannerTargetRegions.includes(val)) {
                        setBannerTargetRegions([...bannerTargetRegions, val]);
                      }
                      e.target.value = "";
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-800 font-bold text-xs bg-white text-zinc-850 cursor-pointer"
                  >
                    <option value="">{t("+ Ajouter une Wilaya")}</option>
                    {ALGERIA_WILAYAS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {bannerTargetRegions.length > 0 && (
                <div className="flex flex-wrap gap-1 p-2 bg-white border border-zinc-200 rounded-2xl max-h-[70px] overflow-y-auto">
                  {bannerTargetRegions.map((w) => (
                    <span
                      key={w}
                      className="inline-flex items-center gap-1 bg-zinc-900/5 text-zinc-900 border border-zinc-900/10 px-2 py-0.5 rounded-lg text-xs font-sans font-bold"
                    >
                      {w}
                      <button
                        type="button"
                        onClick={() => setBannerTargetRegions(bannerTargetRegions.filter((item) => item !== w))}
                        className="hover:text-red-600 text-xs font-sans font-bold leading-none ms-1 bg-transparent border-none p-0 cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setBannerTargetRegions([])}
                    className="text-red-500 hover:text-red-700 text-xs font-bold underline bg-transparent border-none p-0 cursor-pointer ms-auto"
                  >
                    {t("Vider tout")}
                  </button>
                </div>
              )}
            </div>

            {/* Programmation de la publication */}
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-3">
              <div className="space-y-0.5">
                <label className="text-xs font-extrabold text-zinc-950 uppercase flex items-center gap-1.5">
                  <span>{t("📅 Programmation temporelle")}</span>
                </label>
                <p className="text-xs font-bold text-zinc-500 uppercase">
                  {t("Configurez la période d'activité de la bannière")}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-start">
                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    {t("Date de début")}
                  </label>
                  <input
                    type="datetime-local"
                    value={bannerStartDate}
                    onChange={(e) => setBannerStartDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-800 font-bold text-xs bg-white text-zinc-850"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    {t("Date de fin")}
                  </label>
                  <input
                    type="datetime-local"
                    value={bannerEndDate}
                    onChange={(e) => setBannerEndDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-800 font-bold text-xs bg-white text-zinc-850"
                  />
                </div>
              </div>
            </div>

            {/* A/B Testing & Zone de Bannière */}
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-3">
              <div className="space-y-0.5">
                <label className="text-xs font-extrabold text-zinc-950 uppercase flex items-center gap-1.5">
                  <span>{t("📊 Zone d'affichage & Test A/B")}</span>
                </label>
                <p className="text-xs font-bold text-zinc-500 uppercase">
                  {t("Associez la bannière à une zone et un groupe de test")}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-start">
                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    {t("Zone d'affichage")}
                  </label>
                  <select
                    value={bannerZone}
                    onChange={(e) => setBannerZone(e.target.value as "carousel_main" | "grid_top" | "grid_bottom" | "sidebar")}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-800 font-bold text-xs bg-white text-zinc-850 cursor-pointer"
                  >
                    <option value="carousel_main">{t("Carrousel Principal")}</option>
                    <option value="grid_top">{t("Grille Haute")}</option>
                    <option value="grid_bottom">{t("Grille Basse")}</option>
                    <option value="sidebar">{t("Bannière Latérale")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    {t("Groupe de Test A/B")}
                  </label>
                  <select
                    value={bannerAbGroup}
                    onChange={(e) => setBannerAbGroup(e.target.value as "all" | "A" | "B")}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-800 font-bold text-xs bg-white text-zinc-850 cursor-pointer"
                  >
                    <option value="all">{t("Tous (Pas d'A/B test)")}</option>
                    <option value="A">{t("Groupe de test A")}</option>
                    <option value="B">{t("Groupe de test B")}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Confirm saving */}
            <button
              type="submit"
              disabled={isUploadingDesktop || isUploadingMobile}
              className="w-full h-12 bg-zinc-950 text-white hover:bg-zinc-850 rounded-2xl font-sans font-bold text-xs uppercase tracking-widest transition-colors select-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{t("Enregistrer la Bannière")}</span>
            </button>
          </form>

          {/* REAL-TIME PREVIEW PANEL (Desktop & Mobile) */}
          <div className="space-y-6">
            <div className="sticky top-0 space-y-5">
              <h4 className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-orange-600 animate-pulse" />
                {t("Aperçu en Temps Réel")}
              </h4>

              {/* Desktop Preview Card (Ratio 21:9) */}
              <div className="space-y-1.5">
                <span className="text-xs font-sans font-bold text-zinc-400 uppercase tracking-widest block">
                  {t("Format Bureau (Aperçu)")}
                </span>
                <div className="w-full aspect-[2.4/1] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-200 relative shadow-md">
                  {bannerDesktopImage ? (
                    <img
                      loading="lazy"
                      src={bannerDesktopImage}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-zinc-400 text-center uppercase gap-1 text-xs font-mono">
                      <ImageIcon className="w-8 h-8 opacity-40 shrink-0" />
                      <span>{t("Pas d'image desktop")}</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute inset-y-0 start-0 w-2/3 bg-gradient-to-r from-black/60 via-black/10 to-transparent" />

                  {/* Marketing data overlays */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 text-white text-start">
                    {tags.find((t) => t.id === bannerTagId) && (
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-white/15 tracking-widest uppercase font-sans font-bold text-xs w-fit mb-1">
                        {tags.find((t) => t.id === bannerTagId)?.name}
                      </span>
                    )}
                    <h3
                      className="text-sm font-sans font-bold tracking-tight leading-none mb-0.5 shadow-sm uppercase shrink-0"
                      style={{ color: bannerTitleColor }}
                    >
                      {bannerTitle || "Titre de la Bannière"}
                    </h3>
                    {bannerSubtitle && (
                      <p
                        className="text-xs font-semibold leading-normal mb-1 tracking-wide select-none drop-shadow-sm"
                        style={{ color: bannerSubtitleColor }}
                      >
                        {bannerSubtitle}
                      </p>
                    )}
                    <button
                      type="button"
                      style={{ backgroundColor: bannerBtnBgColor, color: bannerBtnTextColor }}
                      className="rounded-lg py-1 px-3 text-xs uppercase tracking-widest font-sans font-bold shrink-0 w-fit pointer-events-none mt-1 shadow-sm"
                    >
                      {bannerButtonText}
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Preview Frame Phone Mockup (Ratio 4:5) */}
              <div className="space-y-1.5">
                <span className="text-xs font-sans font-bold text-zinc-400 uppercase tracking-widest block">
                  {t("Format Téléphone (Aperçu)")}
                </span>
                <div className="w-44 aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-200 relative mx-auto shadow-md">
                  {bannerMobileImage ? (
                    <img
                      loading="lazy"
                      src={bannerMobileImage}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : bannerDesktopImage ? (
                    <div className="w-full h-full relative">
                      <img
                        loading="lazy"
                        src={bannerDesktopImage}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-1.5 start-1.5 px-1.5 py-0.5 bg-orange-600/90 rounded text-xs font-sans font-bold text-white uppercase tracking-wider select-none leading-none">
                        {t("Desktop Fallback")}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-zinc-400 text-center uppercase gap-1 text-xs font-mono">
                      <ImageIcon className="w-6 h-6 opacity-40 shrink-0" />
                      <span>{t("Pas d'image")}</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

                  {/* Mobile mockup detail */}
                  <div className="absolute inset-x-0 bottom-0 p-3 text-white text-start">
                    {tags.find((t) => t.id === bannerTagId) && (
                      <span className="inline-block tracking-widest uppercase font-sans font-bold text-xs text-zinc-300 drop-shadow mb-0.5">
                        {tags.find((t) => t.id === bannerTagId)?.name}
                      </span>
                    )}
                    <h4
                      className="text-xs font-sans font-bold leading-tight mb-0.5 uppercase select-none tracking-tight drop-shadow truncate"
                      style={{ color: bannerTitleColor }}
                    >
                      {bannerTitle || "Titre de la Bannière"}
                    </h4>
                    {bannerSubtitle && (
                      <p
                        className="text-xs font-semibold leading-tight mb-1 opacity-95 truncate"
                        style={{ color: bannerSubtitleColor }}
                      >
                        {bannerSubtitle}
                      </p>
                    )}
                    <button
                      type="button"
                      style={{ backgroundColor: bannerBtnBgColor, color: bannerBtnTextColor }}
                      className="rounded py-1 px-2.5 text-xs uppercase tracking-widest font-sans font-bold shrink-0 w-fit pointer-events-none block shadow-sm mt-0.5"
                    >
                      {bannerButtonText}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
