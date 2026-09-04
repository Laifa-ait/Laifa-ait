import React, { useState, useEffect } from "react";
import {
  Star,
  Store,
  Truck,
  Sparkles,
  Layers,
  FileText,
  Check,
  UserPlus,
  UserCheck,
  Phone,
  MessageCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "../../../domains/product/product.types";
import { Shop } from "../../../domains/seller/shop.types";
import { formatPrice } from "../../../utils/format";
import { DYNAMIC_CATEGORIES } from "../../../config/dynamicFilters";
import { PRODUCT_COLORS } from "../../../constants";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-hot-toast";
import { ConfirmModal } from "../../ui/ConfirmModal";
import { apiGet, apiPost } from "../../../lib/api";
import { SellerCouponBanner } from "../../Shop/SellerCouponBanner";

const MATERIAL_TRANSLATIONS: Record<string, Record<string, string>> = {
  Coton: { fr: "Coton", en: "Cotton", ar: "قطن" },
  Laine: { fr: "Laine", en: "Wool", ar: "صوف" },
  Cuir: { fr: "Cuir", en: "Leather", ar: "جلد" },
  Argile: { fr: "Argile (Poterie)", en: "Clay (Pottery)", ar: "طين / فخار" },
  Cuivre: { fr: "Cuivre", en: "Copper", ar: "نحاس" },
  Soie: { fr: "Soie", en: "Silk", ar: "حرير" },
  Lin: { fr: "Lin", en: "Linen", ar: "كتان" },
  Or: { fr: "Or", en: "Gold", ar: "ذهب" },
  Argent: { fr: "Argent", en: "Silver", ar: "فضة" },
  Bois: { fr: "Bois", en: "Wood", ar: "خشب" },
  Céramique: { fr: "Céramique", en: "Ceramic", ar: "سيراميك" },
  Verre: { fr: "Verre", en: "Glass", ar: "زجاج" },
  "Fil d'Or": { fr: "Fil d'Or (Majboud/Fetla)", en: "Gold Thread (Fetla)", ar: "فتلة / مجبود" },
  Autre: { fr: "Autre", en: "Other", ar: "أخرى" },
};

const SEASON_TRANSLATIONS: Record<string, Record<string, string>> = {
  "Toutes Saisons": { fr: "Toutes Saisons", en: "All Seasons", ar: "كل الفصول" },
  "Printemps / Été": { fr: "Printemps / Été", en: "Spring / Summer", ar: "الربيع / الصيف" },
  "Automne / Hiver": { fr: "Automne / Hiver", en: "Autumn / Winter", ar: "الخريف / الشتاء" },
  "Collection Ramadan": { fr: "Collection Ramadan", en: "Ramadan Collection", ar: "مجموعة رمضان" },
  "Collection Traditionnelle": { fr: "Collection Traditionnelle", en: "Traditional Collection", ar: "مجموعة تقليدية" },
  "Édition Limitée": { fr: "Édition Limitée", en: "Limited Edition", ar: "طبعة محدودة" },
};

interface InfoProps {
  product: Product;
  shop: Shop | null;
  currentPrice: number;
  selectedColor: string | null;
  selectedSize: string | null;
  onSelectColor: (c: string) => void;
  onSelectSize: (s: string) => void;
  isColorOutOfStock: (c: string) => boolean;
  isSizeOutOfStock: (s: string) => boolean;
}

export const ProductInfo: React.FC<InfoProps> = ({
  product,
  shop,
  currentPrice,
  selectedColor,
  selectedSize,
  onSelectColor,
  onSelectSize,
  isColorOutOfStock,
  isSizeOutOfStock,
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t, i18n } = useTranslation();
  const [isSizeGuideOpen, setIsSizeGuideOpen] = React.useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [bilingualMode, setBilingualMode] = useState(false);

  const [openAccordion, setOpenAccordion] = useState<string | null>("description");
  const isProductFlashActive = false;

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser || !shop?.id) return;
      try {
        const res = await apiGet<{ following: boolean }>(`/api/v1/auth/following/${encodeURIComponent(shop.id)}`);
        if (res && res.following) {
          setIsFollowing(true);
        }
      } catch (err) {
        console.error("Error checking follow status:", err);
      }
    };
    checkFollowStatus();
  }, [currentUser, shop?.id]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (!shop?.id || followLoading) return;

    if (isFollowing) {
      setShowConfirm(true);
      return;
    }

    executeFollowToggle();
  };

  const executeFollowToggle = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        const res = await fetch(`/api/v1/auth/following/${encodeURIComponent(shop!.id)}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Unfollow failed");
        setIsFollowing(false);
        toast.success(t("product.details.unfollow_success") || "Désabonnement réussi.");
      } else {
        await apiPost(`/api/v1/auth/following/${encodeURIComponent(shop!.id)}`, {
          sellerId: shop!.id,
          name: shop!.shopName || "Boutique",
          logo: shop!.logoUrl || null,
          location: shop!.wilaya || "Algérie",
        });
        setIsFollowing(true);
        toast.success(t("product.details.follow_success") || "Boutique suivie !");
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
      toast.error(t("product.details.error_action") || "Erreur lors de l'action.");
    } finally {
      setFollowLoading(false);
      setShowConfirm(false);
    }
  };

  const currentLang = i18n.language || "fr";
  const isRTL = currentLang === "ar";

  const getTranslatedMaterials = () => {
    if (!product.materials || product.materials.length === 0) return null;
    return product.materials
      .map((m) => {
        if (MATERIAL_TRANSLATIONS[m]?.[currentLang]) {
          return MATERIAL_TRANSLATIONS[m][currentLang];
        }
        return m;
      })
      .join(", ");
  };

  const getTranslatedSeason = () => {
    if (!product.season) return null;
    if (SEASON_TRANSLATIONS[product.season]?.[currentLang]) {
      return SEASON_TRANSLATIONS[product.season][currentLang];
    }
    return product.season;
  };

  // Automated translation logic for user uploaded items
  const productName = product.translations?.[currentLang]?.name || product.name;
  const productDescription = product.translations?.[currentLang]?.description || product.description;

  // Extract custom attributes based on category
  const categoryDef = DYNAMIC_CATEGORIES[product.category || ""];
  const detailedAttributes: unknown[] = [];

  if (categoryDef && categoryDef.allowed_filters && product?.attributes) {
    const attrs = product.attributes;
    categoryDef.allowed_filters.forEach((filter) => {
      const val = attrs[filter.id];
      if (val) {
        detailedAttributes.push({
          label: filter.label,
          value: Array.isArray(val) ? val.join(", ") : val,
          unit: filter.unit,
        });
      }
    });
  }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={executeFollowToggle}
        title={t("product.details.unfollow_confirm_title") || "Se désabonner"}
        message={
          t("product.details.unfollow_confirm_message") || "Voulez-vous vraiment ne plus suivre cette boutique ?"
        }
      />
      
      {/* HEADER BENTO BLOCK */}
      <div className="bg-[#FAF6F0] rounded-[2rem] p-4 sm:p-6 border border-[#EAE3D5] shadow-sm space-y-3.5 relative overflow-hidden">
        {/* Decorative corner curve resembling the arch */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-[#008BB5]/5 rounded-bl-[2.5rem] border-l border-b border-[#EAE3D5]/40 pointer-events-none" />
        
        <div className="flex items-center justify-between gap-3 relative z-10">
          {product.condition && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider bg-[#FFEAEF] text-[#D81159] border border-[#FFEAEF]">
              <Sparkles className="w-3 h-3" /> {product.condition}
            </span>
          )}
          <button
            type="button"
            onClick={() => setBilingualMode(!bilingualMode)}
            className={`px-3 py-1 border text-[9px] font-bold uppercase tracking-wider transition-all rounded-full cursor-pointer flex items-center gap-1.5 ${
              bilingualMode 
                ? "bg-[#008BB5] text-white border-[#008BB5] shadow-sm" 
                : "bg-white border-[#EAE3D5] text-[#008BB5] hover:bg-[#008BB5]/5"
            }`}
          >
            🌍 {bilingualMode ? "AR / FR" : "Affichage Bilingue"}
          </button>
        </div>

        {bilingualMode ? (
          <div className="space-y-1.5 text-start relative z-10">
            <h1 className="text-xl sm:text-2xl font-sans font-extrabold text-[#2C2C28] uppercase tracking-wide leading-tight break-words">
              {product.translations?.["ar"]?.name || product.name}
            </h1>
            <h2 className="text-sm sm:text-base font-sans text-stone-500 uppercase tracking-wide leading-tight break-words border-t border-stone-200/50 pt-1.5 font-medium">
              {product.translations?.["fr"]?.name || product.name}
            </h2>
          </div>
        ) : (
          <h1 className="text-xl sm:text-2xl font-sans font-extrabold text-[#2C2C28] uppercase tracking-wide leading-tight break-words relative z-10">
            {productName}
          </h1>
        )}

        {/* PRICING & RATING ROW */}
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-[#EAE3D5]/50 relative z-10">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-sans font-black text-[#008BB5]">
              {formatPrice(currentPrice)}
            </span>
            {isProductFlashActive ? (
              <span className="text-sm text-stone-400 line-through font-sans">
                {formatPrice(product.price)}
              </span>
            ) : (
              product.onSale && (
                <span className="text-sm text-stone-400 line-through font-sans">
                  {formatPrice(currentPrice * 1.2)}
                </span>
              )
            )}
          </div>

          {/* Quick rating snippet with bougainvillea pink stars */}
          {product.stats?.averageRating && (
            <div className="flex items-center gap-1 bg-[#D81159]/5 px-2.5 py-1 rounded-full border border-[#D81159]/10">
              <Star className="w-3.5 h-3.5 fill-[#D81159] text-[#D81159]" />
              <span className="text-xs font-bold text-[#D81159]">
                {Number(product.stats.averageRating).toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {product.energyClass && (
          <div className="flex items-center pt-1">
            <div className="flex items-center border border-stone-300 rounded overflow-hidden">
               <div 
                  className="text-white font-bold text-[9px] px-2 py-0.5"
                  style={{
                    backgroundColor: (() => {
                      switch(product.energyClass) {
                        case "A": return "#00A650";
                        case "B": return "#50B848";
                        case "C": return "#C4D400";
                        case "D": return "#FFF200";
                        case "E": return "#F7B500";
                        case "F": return "#EB690B";
                        case "G": return "#E2001A";
                        default: return "#00A650";
                      }
                    })()
                  }}
               >
                  Classe {product.energyClass}
               </div>
               <div className="bg-stone-100 text-[8px] flex flex-col leading-none px-1.5 py-0.5 font-bold">
                 <span>A</span>
                 <span>↑</span>
                 <span>G</span>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* SELLER PROMINENCE - Moorish Arch Alcove Layout with Direct Contact */}
      {shop && (
        <div className="bg-white rounded-[2rem] p-4 border border-[#EAE3D5] shadow-sm flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-t-full rounded-b-xl bg-[#FAF6F0] flex items-center justify-center overflow-hidden border-2 border-[#008BB5] shrink-0">
                {shop.logoUrl ? (
                  <img loading="lazy" src={shop.logoUrl} alt={shop.shopName} className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-5 h-5 text-[#008BB5]" />
                )}
              </div>
              <div>
                <p className="text-[9px] font-bold text-[#008BB5] uppercase tracking-wider mb-0.5">
                  {t("product.details.sold_by") || "Vendu par"}
                </p>
                <Link
                  to={`/shop/${shop.id}`}
                  className="text-sm font-sans font-bold text-[#2C2C28] hover:text-[#008BB5] transition-all line-clamp-1"
                >
                  {shop.shopName}
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-wider transition-all border shadow-sm ${
                  isFollowing
                    ? "bg-transparent text-stone-600 border-stone-200 hover:bg-stone-100"
                    : "bg-[#008BB5] text-white border-[#008BB5] hover:bg-[#007CA7]"
                }`}
              >
                {isFollowing ? (
                  <span className="flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" /> {t("product.details.following") || "Abonné"}</span>
                ) : (
                  <span className="flex items-center gap-1"><UserPlus className="w-3.5 h-3.5" /> {t("product.details.follow") || "Suivre"}</span>
                )}
              </button>
              <Link
                to={`/shop/${shop.id}`}
                className="flex-1 sm:flex-none text-center px-4 py-2 bg-white text-stone-600 border border-stone-200 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors hover:bg-transparent"
              >
                {t("product.details.view_shop") || "Boutique"}
              </Link>
            </div>
          </div>

          {/* Direct Free Contact Bar */}
          <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              ⚡ Contact Direct Gratuit (0% Commission)
            </span>

            {(shop.supportPhone || shop.phone) && (
              <a
                href={`tel:${shop.supportPhone || shop.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white hover:bg-stone-800 rounded-full text-[11px] font-bold transition-all shadow-xs"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{shop.supportPhone || shop.phone}</span>
              </a>
            )}

            <a
              href={`https://wa.me/213${(shop.supportPhone || shop.phone || '0550000000').replace(/^0/, '').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[11px] font-bold transition-all shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Direct</span>
            </a>
          </div>

          {/* Discrete Seller Promo Coupon Banner */}
          <SellerCouponBanner
            sellerId={shop.id || product.sellerId}
            className="mt-1"
          />
        </div>
      )}

      {/* Discrete Seller Promo Coupon Banner (if no shop block rendered) */}
      {!shop && product.sellerId && (
        <SellerCouponBanner
          sellerId={product.sellerId}
          className="mt-2"
        />
      )}

      {/* VARIANTS (COLOR/SIZE) - BEAUTIFUL BRASS AND BLUE STUDS DESIGN */}
      {((product.colors?.length || 0) > 0 || (product.sizes?.length || 0) > 0) && (
        <div className="bg-[#FAF6F0] rounded-[2rem] p-4 sm:p-5 border border-[#EAE3D5] shadow-sm space-y-5">
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                {t("product.details.nuances") || "Couleurs"}
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c: string) => {
                  const matchingColor = PRODUCT_COLORS.find(
                    (pc) => pc.name.toLowerCase().trim() === c.toLowerCase().trim()
                  );
                  const isHex = /^#([0-9A-F]{3}){1,2}$/i.test(c);
                  const isRgb = /^rgb/i.test(c);
                  const colorHex = matchingColor ? matchingColor.hex : isHex || isRgb ? c : "#FFFFFF";
                  const isWhiteOrLight =
                    colorHex.toLowerCase() === "#ffffff" ||
                    colorHex.toLowerCase() === "#fde68a" ||
                    colorHex.toLowerCase() === "#facc15";

                  return (
                    <button
                      key={c}
                      disabled={isColorOutOfStock(c) && selectedColor !== c}
                      onClick={() => onSelectColor(c)}
                      className={`flex items-center justify-center p-0.5 rounded-full border-2 transition-all shadow-sm ${
                        selectedColor === c 
                          ? "border-[#008BB5] scale-110" 
                          : "border-transparent hover:border-stone-300"
                      } ${isColorOutOfStock(c) ? "opacity-30 cursor-not-allowed" : ""}`}
                    >
                      <div 
                        className="w-8 h-8 rounded-full border border-black/15 flex items-center justify-center relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)]"
                        style={{ background: colorHex }}
                      >
                        {selectedColor === c && (
                          <Check className={`w-3.5 h-3.5 ${isWhiteOrLight ? "text-black" : "text-white"}`} />
                        )}
                        {isColorOutOfStock(c) && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-[1.5px] bg-black rotate-45"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2.5 pt-4 border-t border-[#EAE3D5]">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  {t("product.details.sizes") || "Tailles"}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-[9px] font-bold uppercase tracking-wider text-[#008BB5] hover:underline transition-all cursor-pointer"
                >
                  {t("product.details.size_guide") || "Guide des tailles"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s: string) => (
                  <button
                    key={s}
                    disabled={isSizeOutOfStock(s) && selectedSize !== s}
                    onClick={() => onSelectSize(s)}
                    className={`px-4 py-2 rounded-xl font-sans font-bold text-[10px] uppercase tracking-wider transition-all border ${
                      selectedSize === s 
                        ? "bg-[#008BB5] text-white border-[#008BB5] shadow-md" 
                        : "bg-white border-stone-200 text-stone-700 hover:border-[#008BB5]"
                    } ${isSizeOutOfStock(s) ? "opacity-30 cursor-not-allowed" : ""}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ACCORDIONS - EXTREMELY SOPHISTICATED BENTO TABS */}
      <div className="bg-white rounded-[2rem] border border-[#EAE3D5] overflow-hidden shadow-sm">
        {/* Accordion 1: Description */}
        <div className="border-b border-[#EAE3D5]">
          <button
            onClick={() => toggleAccordion("description")}
            className="w-full flex items-center justify-between px-5 py-4 text-start font-sans font-bold text-xs uppercase tracking-wider text-[#2C2C28]"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#008BB5]" />
              {t("Description / taillant")}
            </span>
            <span className={`text-stone-400 font-light text-base transition-transform duration-300 ${openAccordion === "description" ? "rotate-180" : ""}`}>
              ▼
            </span>
          </button>
          
          <AnimatePresence initial={false}>
            {openAccordion === "description" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 pt-1 space-y-4 text-stone-600 bg-[#FAF6F0]/25">
                  {bilingualMode ? (
                    <div className="space-y-4 text-start">
                      {(product.translations?.["ar"]?.description || product.description) && (
                        <div className="space-y-1 text-right" dir="rtl">
                          <span className="text-[8px] font-bold text-[#D81159] bg-[#FFEAEF] px-2 py-0.5 rounded uppercase tracking-wider">العربية</span>
                          <p className="text-[#2C2C28]/85 text-xs whitespace-pre-wrap leading-relaxed font-medium">
                            {product.translations?.["ar"]?.description || product.description}
                          </p>
                        </div>
                      )}
                      {(product.translations?.["fr"]?.description || product.description) && (
                        <div className="space-y-1 text-left border-t border-[#EAE3D5] pt-3" dir="ltr">
                          <span className="text-[8px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded uppercase tracking-wider">Français</span>
                          <p className="text-[#2C2C28]/85 text-xs whitespace-pre-wrap leading-relaxed font-medium">
                            {product.translations?.["fr"]?.description || product.description}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[#2C2C28]/85 text-xs whitespace-pre-wrap leading-relaxed font-medium">
                      {productDescription}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-[#EAE3D5]">
                    <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider">
                      {t("Coupe standard / Regular Fit")}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="text-[9px] font-bold text-[#008BB5] hover:underline uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      {t("Guide des tailles")}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accordion 2: Composition */}
        <div className="border-b border-[#EAE3D5]">
          <button
            onClick={() => toggleAccordion("composition")}
            className="w-full flex items-center justify-between px-5 py-4 text-start font-sans font-bold text-xs uppercase tracking-wider text-[#2C2C28]"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#008BB5]" />
              {t("Composition / entretien")}
            </span>
            <span className={`text-stone-400 font-light text-base transition-transform duration-300 ${openAccordion === "composition" ? "rotate-180" : ""}`}>
              ▼
            </span>
          </button>
          
          <AnimatePresence initial={false}>
            {openAccordion === "composition" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 pt-1 space-y-3 text-xs text-stone-600 bg-[#FAF6F0]/25">
                  {product.sku && (
                    <div className="flex justify-between border-b border-[#EAE3D5]/40 pb-2">
                      <span className="text-stone-400 font-bold text-[9px] uppercase tracking-wider">{t("Référence / SKU")}</span>
                      <span className="font-mono text-xs text-[#2C2C28] font-bold select-all">{product.sku}</span>
                    </div>
                  )}
                  {product.materials && product.materials.length > 0 && (
                    <div className="flex justify-between border-b border-[#EAE3D5]/40 pb-2">
                      <span className="text-stone-400 font-bold text-[9px] uppercase tracking-wider">{t("Matière principale")}</span>
                      <span className="text-[#2C2C28] font-bold">
                        {getTranslatedMaterials()}
                        {product.otherMaterial ? ` (${product.otherMaterial})` : ""}
                      </span>
                    </div>
                  )}
                  {(product.weight || product.dimensions) && (
                    <div className="flex justify-between border-b border-[#EAE3D5]/40 pb-2">
                      <span className="text-stone-400 font-bold text-[9px] uppercase tracking-wider">{t("Dimensions & Poids")}</span>
                      <span className="text-[#2C2C28] font-bold">
                        {product.weight ? `${product.weight} kg` : ""}
                        {product.weight && product.dimensions ? " | " : ""}
                        {product.dimensions ? `${product.dimensions}` : ""}
                      </span>
                    </div>
                  )}
                  {product.brand && (
                    <div className="flex justify-between border-b border-[#EAE3D5]/40 pb-2">
                      <span className="text-stone-400 font-bold text-[9px] uppercase tracking-wider">{t("Marque")}</span>
                      <span className="text-[#2C2C28] font-bold">{product.brand}</span>
                    </div>
                  )}
                  {product.season && (
                    <div className="flex justify-between border-b border-[#EAE3D5]/40 pb-2">
                      <span className="text-stone-400 font-bold text-[9px] uppercase tracking-wider">{t("Saison")}</span>
                      <span className="text-[#2C2C28] font-bold">{getTranslatedSeason()}</span>
                    </div>
                  )}
                  <div className="pt-2 text-[10px] text-stone-500 italic">
                    {t("Conseil d'entretien : Laver sur l'envers à 30°C avec des coloris similaires. Repassage doux recommandé.")}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Accordion 3: Shipping */}
        <div>
          <button
            onClick={() => toggleAccordion("shipping")}
            className="w-full flex items-center justify-between px-5 py-4 text-start font-sans font-bold text-xs uppercase tracking-wider text-[#2C2C28]"
          >
            <span className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#008BB5]" />
              {t("Livraison / retour")}
            </span>
            <span className={`text-stone-400 font-light text-base transition-transform duration-300 ${openAccordion === "shipping" ? "rotate-180" : ""}`}>
              ▼
            </span>
          </button>
          
          <AnimatePresence initial={false}>
            {openAccordion === "shipping" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 pt-1 space-y-4 text-xs text-stone-600 bg-[#FAF6F0]/25">
                  <div className="flex gap-2.5 items-start">
                    <div className="w-5 h-5 rounded-full bg-[#008BB5]/10 flex items-center justify-center text-[#008BB5] font-bold text-[10px] shrink-0 mt-0.5">✓</div>
                    <div>
                      <p className="font-bold text-[#2C2C28]">{t("Livraison sur les 58 Wilayas d'Algérie")}</p>
                      <p className="text-[10px] text-stone-500">{t("Paiement sécurisé en espèces à la livraison.")}</p>
                    </div>
                  </div>
                  {(product.preparationTime || shop?.avgPreparationTime) && (
                    <div className="flex gap-2.5 items-start border-t border-[#EAE3D5]/40 pt-3">
                      <div className="w-5 h-5 rounded-full bg-[#008BB5]/10 flex items-center justify-center text-[#008BB5] font-bold text-[10px] shrink-0 mt-0.5">⏱</div>
                      <div>
                        <p className="font-bold text-[#2C2C28]">{t("Délai de préparation du vendeur")}</p>
                        <p className="text-[10px] text-stone-500">
                          {t("Prêt pour expédition en")} {product.preparationTime || shop?.avgPreparationTime || "24-48h"}.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2.5 items-start border-t border-[#EAE3D5]/40 pt-3">
                    <div className="w-5 h-5 rounded-full bg-[#008BB5]/10 flex items-center justify-center text-[#008BB5] font-bold text-[10px] shrink-0 mt-0.5">↺</div>
                    <div>
                      <p className="font-bold text-[#2C2C28]">{t("Politique d'échange et retour d'Olmart")}</p>
                      <p className="text-[10px] text-stone-500">
                        {product.returnPolicy
                          ? t("Retours acceptés sous 14 jours si le produit est dans son emballage d'origine.")
                          : t("Les retours et échanges dépendent des conditions générales du vendeur.")}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-[#FAF6F0] border-4 border-[#EAE3D5] rounded-[2.5rem] max-w-2xl w-full p-6 md:p-10 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsSizeGuideOpen(false)}
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
      )}
    </div>
  );
};
