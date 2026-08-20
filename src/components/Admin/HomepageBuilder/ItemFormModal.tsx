import React from "react";
import { Check, Search, Image as ImageIcon, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ALGERIA_WILAYAS } from "../../../constants";
import { formatPrice } from "../../../utils/format";
import { Product } from "../../../domains/product/product.types";
import { HomepageSection } from "../../../domains/home/homepage.types";

interface ItemFormModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  editItem: unknown;
  activeModalStep: number;
  setActiveModalStep: React.Dispatch<React.SetStateAction<number>>;

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
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => void;
  handleSaveItem: (e: React.FormEvent) => void;
}

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  editItem,
  activeModalStep,
  setActiveModalStep,
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
  secThemeImage,
  setSecThemeImage,
  secTheme,
  setSecTheme,
  secCategory,
  setSecCategory,
  secTag,
  setSecTag,
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
  searchSecProduct,
  setSearchSecProduct,
  modalSearchCategory,
  setModalSearchCategory,
  secManualLinks,
  setSecManualLinks,
  allProducts,
  handleFileUpload,
  handleSaveItem,
}) => {
  const { t } = useTranslation();

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/40 flex items-center justify-center z-[9999] p-2 sm:p-4" id="item-form-modal">
      <div className="bg-white rounded-[2rem] border border-zinc-200/85 shadow-2xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden">
        <div className="p-4 px-5 border-b border-zinc-200/60 flex items-center justify-between bg-zinc-50/40 shrink-0">
          <div>
            <span className="text-[9px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal text-orange-600">
              {editItem ? t("Modification") : t("Nouvelle Section")}
            </span>
            <h3 className="font-extrabold text-[12px] text-zinc-950 uppercase tracking-wide">
              {t("Configuration Section")}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="p-1 px-2.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-500 hover:text-stone-850 font-bold border-none cursor-pointer transition-all active:scale-95 text-xs"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSaveItem} className="p-4 px-5 space-y-3.5 flex-1 overflow-y-auto max-h-[75vh]">
          <div className="space-y-3">
            {/* Stepper Header */}
            <div className="flex bg-zinc-50/60 rounded-xl p-0.5 border border-zinc-200/50 shrink-0">
              {["Mise en page", "En-tête", "Produits"].map((label, idx) => {
                const step = idx + 1;
                return (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setActiveModalStep(step)}
                    className={`flex-1 py-1 text-[9px] font-black uppercase tracking-wider rtl:tracking-normal rounded-lg transition-all text-center border-none cursor-pointer ${
                      activeModalStep === step
                        ? "bg-zinc-950 text-white shadow-md shadow-zinc-950/15"
                        : "bg-transparent text-zinc-950/60 hover:text-zinc-950"
                    }`}
                  >
                    {step}. {t(label)}
                  </button>
                );
              })}
            </div>

            {activeModalStep === 1 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-end-4 duration-300">
                <div>
                  <label className="block text-[9px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-zinc-950/60 mb-1">
                    {t("Nom technique interne (Admin)")}
                  </label>
                  <input
                    type="text"
                    required
                    value={secName}
                    onChange={(e) => setSecName(e.target.value)}
                    placeholder={t("Ex: Section Nouveautés")}
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-orange-600 font-bold text-[11px] bg-transparent/20"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-zinc-950/60 mb-1">
                    {t("Type de composant")}
                  </label>
                  <select
                    value={secType}
                    onChange={(e) => setSecType(e.target.value as HomepageSection["type"])}
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-orange-600 font-bold text-[11px] bg-white text-stone-800"
                  >
                    <option value="top_picks">{t("Top Picks (Sélection Vedette)")}</option>
                    <option value="flash_sale">{t("Flash Sale (Offres Flash style Jumia)")}</option>
                    <option value="new_arrivals">{t("New Arrivals (Nouveautés)")}</option>
                    <option value="trending">{t("Trending (Tendances du moment)")}</option>
                    <option value="recommended">{t("Recommended (Sélection Personnalisée)")}</option>
                    <option value="brands">{t("Sellers (Nos Vendeurs Officiels)")}</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-zinc-950/60 mb-1">
                      {t("Agencement (Coupe)")}
                    </label>
                    <select
                      value={secLayout}
                      onChange={(e) => setSecLayout(e.target.value as HomepageSection["layout"])}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-orange-600 font-bold text-[11px] bg-white"
                    >
                      <option value="standard">{t("Grille Standard (4 col)")}</option>
                      <option value="small">{t("Grille Petite (6 col)")}</option>
                      <option value="compact">{t("Défilement Horizontal")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-zinc-950/60 mb-1">
                      {t("Couleur fond (Optionnelle)")}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={secBackgroundColor || "#ffffff"}
                        onChange={(e) => setSecBackgroundColor(e.target.value)}
                        className="w-8 h-7 p-0.5 rounded-md border border-zinc-200 cursor-pointer bg-white"
                      />
                      <span className="text-[10px] font-mono font-bold text-stone-500 uppercase">
                        {secBackgroundColor || "#none"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-zinc-950/60 mb-1">
                      {t("Style Visuel")}
                    </label>
                    <select
                      value={secStyle}
                      onChange={(e) => setSecStyle(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-orange-600 font-bold text-[11px] bg-white"
                    >
                      <option value="premium">{t("Premium (Cartes + Ombre)")}</option>
                      <option value="immersive">{t("Immersif (Contenu/Image)")}</option>
                      <option value="glass">{t("Glassmorphism")}</option>
                      <option value="minimal">{t("Minimal (Flat border)")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-zinc-950/60 mb-1">
                      {t("Limite d'Affichage")}
                    </label>
                    <input
                      type="number"
                      min="4"
                      max="30"
                      value={secLimit}
                      onChange={(e) => setSecLimit(parseInt(e.target.value) || 8)}
                      className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-orange-600 font-bold text-[11px]"
                    />
                  </div>

                  {/* Seasonal design */}
                  <div className="col-span-2 p-2.5 bg-transparent/70 border border-stone-200/50 rounded-xl space-y-2 mt-0.5">
                    <span className="text-[9px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-zinc-950 flex items-center gap-1 shrink-0">
                      <Sparkles className="w-3 h-3 text-orange-600" />
                      {t("Design Saisonnier (Optionnel)")}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="text"
                          value={secThemeName}
                          onChange={(e) => {
                            setSecThemeName(e.target.value);
                            if (e.target.value.trim() && secTheme === "none") {
                              setSecTheme("custom");
                            } else if (!e.target.value.trim() && !secThemeImage) {
                              setSecTheme("none");
                            }
                          }}
                          placeholder={t("Nom: Ramadan, Été...")}
                          className="w-full px-2 py-1 rounded-lg border border-zinc-200 focus:outline-none focus:border-orange-600 font-bold text-[10px] bg-white placeholder-stone-300"
                        />
                      </div>
                      <div>
                        {!secThemeImage ? (
                          <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 w-full bg-zinc-50 border border-dashed border-zinc-200 hover:border-orange-600/80 rounded-lg cursor-pointer transition-all active:scale-95 shadow-sm">
                            <ImageIcon className="w-3.5 h-3.5 text-orange-600/80" />
                            <span className="text-[9px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-stone-700">
                              {t("Téléverser Image")}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                handleFileUpload(e, (url) => {
                                  setSecThemeImage(url);
                                  setSecTheme("custom");
                                });
                              }}
                            />
                          </label>
                        ) : (
                          <div className="flex items-center justify-between bg-white border border-stone-200/50 p-1.5 rounded-lg shadow-sm">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div className="w-6 h-5 rounded overflow-hidden shrink-0 border border-stone-100 bg-transparent">
                                <img
                                  loading="lazy"
                                  src={secThemeImage}
                                  className="w-full h-full object-cover"
                                  alt=""
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <span className="text-[8px] font-sans font-bold text-zinc-950 truncate max-w-[50px]">
                                {secThemeName || t("Ambiance")}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSecThemeImage("");
                                if (!secThemeName.trim()) {
                                  setSecTheme("none");
                                }
                              }}
                              className="p-0.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all border-none cursor-pointer bg-transparent"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Target Category Selector */}
                  <div className="col-span-2 bg-transparent/70 p-2.5 border border-stone-200/50 rounded-xl space-y-1">
                    <label className="block text-[9px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-zinc-950/80 flex items-center gap-1 shrink-0">
                      {t("Catégorie ciblée (Mode, Auto & Moto...)")}
                    </label>
                    <select
                      value={secCategory}
                      onChange={(e) => setSecCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300/60 focus:outline-none focus:border-orange-600 font-bold text-[10px] bg-white text-zinc-950"
                    >
                      <option value="">{t("-- Aucune (Tous les produits ou par Tag) --")}</option>
                      <option value="Mode">{t("Mode (Malhabiss - ملابس)")}</option>
                      <option value="Auto & Moto">{t("Auto & Moto (سيارات و دراجات)")}</option>
                      <option value="Maison & Déco">{t("Maison & Déco (أثاث و ديكور)")}</option>
                      <option value="Électronique">{t("Électronique (إلكترونيات)")}</option>
                      <option value="Alimentation">{t("Alimentation (مواد غذائية)")}</option>
                      <option value="Cosmétiques">{t("Cosmétiques (مستحضرات تجمil)")}</option>
                      <option value="Électroménager">{t("Électroménager (أجهزة كهرومنزلية)")}</option>
                      <option value="Bébés & Enfants">{t("Bébés & Enfants (أطفال و رضع)")}</option>
                      <option value="Sports & Loisirs">{t("Sports & Loisirs (رياضة و ترفيه)")}</option>
                    </select>
                    <p className="text-[8px] text-stone-500 font-bold leading-normal">
                      {t(
                        "Sélectionnez une catégorie cible pour filtrer automatiquement cette section sur la page d'accueil."
                      )}
                    </p>
                  </div>

                  {/* Tag */}
                  <div className="col-span-2 bg-transparent/70 p-2.5 border border-stone-200/50 rounded-xl space-y-1">
                    <label className="block text-[9px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-zinc-950/80 flex items-center gap-1 shrink-0">
                      {t("L'Élément Tag (Lien dynamique des produits)")}
                    </label>
                    <input
                      type="text"
                      value={secTag}
                      onChange={(e) => setSecTag(e.target.value)}
                      placeholder={t("Ex: promotion, ete2024")}
                      className="w-full px-2.5 py-1 rounded-lg border border-stone-300/60 focus:outline-none focus:border-orange-600 font-bold text-[10px] bg-white"
                    />
                    <p className="text-[8px] text-stone-500 font-bold leading-normal">
                      {t("Utilisez ce tag pour rattacher automatiquement les articles dotés de ce tag.")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeModalStep === 2 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-end-4 duration-300">
                <div>
                  <label className="block text-[9px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-zinc-950/60 mb-1">
                    {t("Titre d'affichage (Optionnel)")}
                  </label>
                  <input
                    type="text"
                    value={secTitle}
                    onChange={(e) => setSecTitle(e.target.value)}
                    placeholder={t("Ex: Nouveautés du moment")}
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-orange-600 font-bold text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-zinc-950/60 mb-1">
                    {t("Sous-titre d'affichage (Optionnel)")}
                  </label>
                  <input
                    type="text"
                    value={secSubtitle}
                    onChange={(e) => setSecSubtitle(e.target.value)}
                    placeholder={t("Ex: Explorez nos créations fraîches")}
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-orange-600 font-bold text-[11px]"
                  />
                </div>

                <div className="flex items-center gap-2.5 py-2 px-3 bg-transparent rounded-xl border border-stone-200/50 mt-2">
                  <input
                    type="checkbox"
                    id="secIsActive"
                    checked={secIsActive}
                    onChange={(e) => setSecIsActive(e.target.checked)}
                    className="w-3.5 h-3.5 text-orange-600 focus:ring-[var(--color-orange-600, #ea580c)] border-stone-300 rounded"
                  />
                  <label
                    htmlFor="secIsActive"
                    className="text-[10px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-zinc-950 select-none cursor-pointer"
                  >
                    {t("Activer immédiatement la section sur l'accueil")}
                  </label>
                </div>

                {/* Ciblage */}
                <div className="border-t border-stone-100 pt-3 mt-3 space-y-3">
                  <h4 className="text-[10px] font-sans font-bold text-zinc-950 uppercase tracking-[0.1em] flex items-center gap-1.5">
                    {t("🎯 Ciblage d'Audience & d'Audimat (58 Wilayas)")}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-start">
                    <div>
                      <label className="block text-[9px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-zinc-950/60 mb-1">
                        {t("Audience Cible")}
                      </label>
                      <select
                        value={secTargetAudience}
                        onChange={(e) => setSecTargetAudience(e.target.value as HomepageSection["targetAudience"])}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-orange-600 font-bold text-[10px] bg-white text-zinc-950"
                      >
                        <option value="all">{t("Tout le monde (Tous)")}</option>
                        <option value="new">{t("Nouveaux Visiteurs uniquement")}</option>
                        <option value="logged_in">{t("Utilisateurs Connectés uniquement")}</option>
                        <option value="vip">{t("Clients VIP uniquement")}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-zinc-950/60 mb-1">
                        {t("Wilayas Cibles (")}
                        {secTargetRegions.length})
                      </label>
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val && !secTargetRegions.includes(val)) {
                            setSecTargetRegions([...secTargetRegions, val]);
                          }
                          e.target.value = "";
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-orange-600 font-bold text-[10px] bg-white text-zinc-950"
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
                  {secTargetRegions.length > 0 && (
                    <div className="flex flex-wrap gap-1 p-2 bg-transparent border border-stone-200/50 rounded-xl max-h-[70px] overflow-y-auto">
                      {secTargetRegions.map((w) => (
                        <span
                          key={w}
                          className="inline-flex items-center gap-1 bg-zinc-950/5 text-zinc-950 border border-zinc-950/15 px-2 py-0.5 rounded-md text-[8px] font-sans font-bold"
                        >
                          {w}
                          <button
                            type="button"
                            onClick={() => setSecTargetRegions(secTargetRegions.filter((item) => item !== w))}
                            className="hover:text-red-600 text-[8px] font-sans font-bold leading-none ms-1 bg-transparent border-none p-0 cursor-pointer"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                      <button
                        type="button"
                        onClick={() => setSecTargetRegions([])}
                        className="text-red-500 hover:text-red-700 text-[8px] font-bold underline bg-transparent border-none p-0 cursor-pointer ms-auto"
                      >
                        {t("Vider tout")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeModalStep === 3 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-end-4 duration-300">
                <div>
                  {/* Search Area */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 bg-zinc-50/80 p-2 rounded-xl border border-zinc-200/60">
                    <div>
                      <label className="block text-[9.5px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-zinc-950">
                        {t("Sélection manuelle (")}
                        {secManualLinks.filter((l) => l).length}/18)
                      </label>
                      <span className="text-[7.5px] font-bold text-stone-400">
                        {t("Cliquez sur un produit pour l'ajouter ou le retirer")}
                      </span>
                    </div>
                    <div className="relative w-full sm:w-44">
                      <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-600" />
                      <input
                        type="text"
                        value={searchSecProduct}
                        onChange={(e) => setSearchSecProduct(e.target.value)}
                        placeholder={t("Nom, ID, vendeur...")}
                        className="w-full ps-7.5 pe-2 py-1 rounded-lg border border-zinc-200 text-[9.5px] font-bold focus:outline-none focus:border-orange-600 bg-white placeholder-stone-400"
                      />
                    </div>
                  </div>

                  {/* Quick Category Tab Filters */}
                  <div className="flex gap-1 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                    {[
                      { id: "", el: "Tout (الكل)" },
                      { id: "Mode", el: "Mode (ملابس)" },
                      { id: "Auto & Moto", el: "Auto & Moto" },
                      { id: "Maison & Déco", el: "Maison & Déco" },
                      { id: "Électronique", el: "Électronique" },
                      { id: "Alimentation", el: "Alimentation" },
                      { id: "Cosmétiques", el: "Cosmétiques" },
                      { id: "Électroménager", el: "Électroménager" },
                      { id: "Bébés & Enfants", el: "Bébés" },
                      { id: "Sports & Loisirs", el: "Sports" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setModalSearchCategory(cat.id)}
                        className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider rtl:tracking-normal whitespace-nowrap border cursor-pointer transition-all duration-200 select-none ${
                          modalSearchCategory === cat.id
                            ? "bg-zinc-950 text-white border-zinc-950 shadow-md scale-[1.02]"
                            : "bg-white text-stone-600 border-stone-200 hover:bg-transparent hover:text-zinc-950"
                        }`}
                      >
                        {t(cat.el)}
                      </button>
                    ))}
                  </div>

                  {/* Products Grid list */}
                  <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pe-1 border-t border-stone-100 pt-2">
                    {allProducts
                      .filter((p) => !modalSearchCategory || p.category === modalSearchCategory)
                      .filter((p) => {
                        if (!searchSecProduct) return true;
                        const q = searchSecProduct.toLowerCase();
                        return (
                          p.name?.toLowerCase().includes(q) ||
                          p.category?.toLowerCase().includes(q) ||
                          p.tags?.some((t: string) => t.toLowerCase().includes(q)) ||
                          p.id?.toLowerCase().includes(q) ||
                          p.sellerName?.toLowerCase().includes(q)
                        );
                      })
                      .map((prod) => {
                        const isSelected = secManualLinks.includes(prod.id);
                        return (
                          <div
                            key={prod.id}
                            onClick={() => {
                              const currentSelected = secManualLinks.filter((l) => l);
                              if (isSelected) {
                                setSecManualLinks(secManualLinks.filter((id) => id !== prod.id));
                              } else if (currentSelected.length < 18) {
                                setSecManualLinks([...currentSelected, prod.id]);
                              }
                            }}
                            className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all cursor-pointer select-none ${
                              isSelected
                                ? "bg-orange-50/70 border-orange-200 shadow-sm"
                                : "bg-white hover:bg-transparent border-stone-200/60"
                            }`}
                          >
                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0 border border-stone-100">
                              <img
                                loading="lazy"
                                src={prod.image}
                                className="w-full h-full object-cover"
                                alt=""
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[7px] font-sans font-bold text-orange-600 uppercase tracking-wide bg-orange-100/60 px-1 rounded">
                                {prod.category}
                              </span>
                              <h5 className="text-[9px] font-bold text-zinc-950 truncate leading-tight">
                                {prod.name}
                              </h5>
                              <p className="text-[8px] font-extrabold text-orange-600">
                                {formatPrice(prod.price)}
                              </p>
                            </div>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${isSelected ? "bg-orange-600 border-orange-600 text-white" : "border-stone-300 bg-white"}`}
                            >
                              {isSelected ? (
                                <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-stone-200" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {secManualLinks.filter((l) => l).length > 0 && (
                    <div className="mt-2.5 p-2 bg-zinc-50/60 rounded-xl border border-zinc-200/60">
                      <span className="block text-[8px] font-sans font-bold uppercase tracking-wider rtl:tracking-normal text-zinc-950/60 mb-1">
                        {t("Produits Sélectionnés (")}
                        {secManualLinks.filter((l) => l).length})
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-[70px] overflow-y-auto">
                        {secManualLinks
                          .filter((l) => l)
                          .map((id, idx) => {
                            const p = allProducts.find((prod) => prod.id === id);
                            return (
                              <div
                                key={id}
                                className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-stone-200 text-[8px] font-bold text-zinc-950"
                              >
                                <span className="text-stone-400">{idx + 1}.</span>
                                <span className="truncate max-w-[65px]">{p?.name || id}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSecManualLinks(secManualLinks.filter((i) => i !== id));
                                  }}
                                  className="text-red-400 hover:text-red-600 ms-0.5 bg-transparent border-none p-0 cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-2.5 px-3 bg-transparent/70 rounded-xl border border-stone-200/40 text-[9px] font-bold text-stone-500 leading-normal select-none">
            {t("💡 Les modifications s'appliquent instantanément sur la page d'accueil d'Olma Marketplace.")}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-200/60 shrink-0">
            {activeModalStep > 1 && (
              <button
                type="button"
                onClick={() => setActiveModalStep((p) => p - 1)}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg font-sans font-bold text-[9px] uppercase tracking-wider rtl:tracking-normal border-none cursor-pointer transition-all active:scale-95"
              >
                {t("Précédent")}
              </button>
            )}
            {activeModalStep < 3 ? (
              <button
                type="button"
                onClick={() => setActiveModalStep((p) => p + 1)}
                className="px-5 py-2 bg-zinc-950 hover:bg-slate-800 text-white rounded-lg font-sans font-bold text-[9px] uppercase tracking-widest rtl:tracking-normal shadow-md border-none cursor-pointer transition-all active:scale-95"
              >
                {t("Suivant")}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-zinc-950 rounded-lg font-sans font-bold text-[9px] uppercase border-none cursor-pointer transition-all active:scale-95 ms-auto"
                >
                  {t("Annuler")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-sans font-bold text-[9px] uppercase tracking-widest rtl:tracking-normal shadow-md border-none cursor-pointer transition-all active:scale-95"
                >
                  {t("Sauvegarder")}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
