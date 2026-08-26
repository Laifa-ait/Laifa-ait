import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCampaignBanner } from "../../hooks/queries/useProducts";
import { ProductCard } from "../../components/Product/ProductCard";
import { Product } from "../../types";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

export const CampaignPage: React.FC = () => {
  const { bannerId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  const { data: banner, error, isLoading } = useCampaignBanner(bannerId || '');

  const products = banner?.products || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-orange-600, #ea580c)]" />
      </div>
    );
  }

  if (error || !banner) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-transparent px-4">
        <h1 className="text-2xl font-sans font-bold text-[var(--color-slate-900, #0f172a)] mb-4 text-center">{t("Campagne introuvable")}</h1>
        <button 
          onClick={() => navigate('/shop')}
          className="px-6 py-3 bg-[var(--color-orange-600, #ea580c)] text-white rounded-xl font-bold hover:bg-[#c44e03] transition-colors cursor-pointer"
        >
          {t("Retourner à la boutique")}</button>
      </div>
    );
  }

  const getTranslatedValue = (bannerData: Record<string, unknown> | null | undefined, key: string): string => {
    if (!bannerData) return '';
    // Check nested translation object
    const translations = bannerData.translations as Record<string, Record<string, string>> | undefined;
    if (translations?.[i18n.language]?.[key]) {
      return translations[i18n.language][key];
    }
    // Check flat localized suffix keys (e.g., banner.title_ar, title_fr)
    const flatKey = `${key}_${i18n.language}`;
    if (typeof bannerData[flatKey] === 'string') {
      return bannerData[flatKey] as string;
    }
    // Fallback
    return typeof bannerData[key] === 'string' ? (bannerData[key] as string) : '';
  };

  const pageTitle = banner ? getTranslatedValue(banner, 'title') : "";
  const pageSubtitle = banner ? getTranslatedValue(banner, 'subtitle') : "";

  return (
    <div className="min-h-screen bg-transparent pb-24 font-sans selection:bg-[var(--color-orange-600, #ea580c)]/30">
      <Helmet>
        <title>{pageTitle || "Sélection Spéciale"} {t("| Olma")}</title>
        <meta name="description" content={pageSubtitle || "Découvrez la sélection des vendeurs certifiés de notre marketplace"} />
      </Helmet>

      {/* Campaign Header / Hero */}
      <div className="relative w-full h-[40vh] min-h-[300px] overflow-hidden bg-zinc-900 border-b border-[var(--color-orange-600, #ea580c)]">
        <img loading="lazy" 
          src={banner.imageUrl || banner.desktopImage} 
          alt={pageTitle}
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-slate-900, #0f172a)]/90 via-[var(--color-slate-900, #0f172a)]/50 to-transparent flex flex-col justify-end p-6 sm:p-12 md:p-16">
          <div className="max-w-[1600px] mx-auto w-full relative">
            <button 
              onClick={() => navigate(-1)}
              className="absolute -top-16 left-0 text-white/80 hover:text-white flex items-center gap-2 text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-md transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> {t("Retour")}</button>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-sans font-bold text-white mb-3 md:mb-4 tracking-tight rtl:tracking-normal drop-shadow-md">
              {pageTitle}
            </h1>
            {pageSubtitle && (
              <p className="text-white/90 text-sm md:text-xl font-medium max-w-2xl drop-shadow-sm">
                {pageSubtitle}
              </p>
            )}
            <div className="w-16 h-1.5 bg-[var(--color-orange-600, #ea580c)] mt-6 md:mt-8 rounded-full" />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-16">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--color-orange-600, #ea580c)]/60">
          <h2 className="text-xl md:text-2xl font-sans font-bold text-[var(--color-slate-900, #0f172a)] uppercase tracking-wider rtl:tracking-normal">
            {t("La Sélection")}</h2>
          <span className="text-sm font-bold text-[var(--color-slate-900, #0f172a)]/60 bg-white border border-[var(--color-orange-600, #ea580c)] px-3 py-1 rounded-full shadow-sm">
            {products.length} {products.length > 1 ? 'produits' : 'produit'}
          </span>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {(products as Product[]).map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-[var(--color-orange-600, #ea580c)] mb-6">
              <span className="text-4xl">🛍️</span>
            </div>
            <p className="text-[var(--color-slate-900, #0f172a)] font-bold text-lg mb-2">{t("Aucun produit dans cette sélection.")}</p>
            <p className="text-[var(--color-slate-900, #0f172a)]/60 text-sm max-w-sm mb-6">{t("Les articles associés à cette campagne ne sont peut-être plus disponibles.")}</p>
            <button 
              onClick={() => navigate('/shop')}
              className="px-6 py-3 bg-white border-2 border-[var(--color-orange-600, #ea580c)] text-[var(--color-slate-900, #0f172a)] rounded-xl font-bold hover:border-[var(--color-orange-600, #ea580c)] hover:text-[var(--color-orange-600, #ea580c)] transition-colors cursor-pointer"
            >
              {t("Explorer le catalogue")}</button>
          </div>
        )}
      </div>
    </div>
  );
};
