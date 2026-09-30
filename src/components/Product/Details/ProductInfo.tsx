import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { Product } from "../../../domains/product/product.types";
import { Shop } from "../../../domains/seller/shop.types";
import { DYNAMIC_CATEGORIES } from "../../../config/dynamicFilters";
import { useAuth } from "../../../context/AuthContext";
import { ConfirmModal } from "../../ui/ConfirmModal";
import { apiGet, apiPost } from "../../../lib/api";
import { ProductHeaderBento } from "./ProductHeaderBento";
import { ProductSellerAlcove } from "./ProductSellerAlcove";
import { ProductVariantsStuds } from "./ProductVariantsStuds";
import { ProductAccordionsBento } from "./ProductAccordionsBento";
import { ProductSizeGuideModal } from "./ProductSizeGuideModal";

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
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [bilingualMode, setBilingualMode] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");

  const currentLang = (i18n.language || "fr").split("-")[0].toLowerCase();
  const isRTL = currentLang === "ar";

  const toggleAccordion = useCallback((section: string) => {
    setOpenAccordion((prev) => (prev === section ? null : section));
  }, []);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser || !shop?.id) return;
      try {
        const res = await apiGet<{ following: boolean }>(
          `/api/v1/auth/following/${encodeURIComponent(shop.id)}`
        );
        if (res && res.following) {
          setIsFollowing(true);
        }
      } catch (err) {
        console.error("Error checking follow status:", err);
      }
    };
    void checkFollowStatus();
  }, [currentUser, shop?.id]);

  const executeFollowToggle = useCallback(async () => {
    if (!shop?.id) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        const res = await fetch(`/api/v1/auth/following/${encodeURIComponent(shop.id)}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Unfollow failed");
        setIsFollowing(false);
        toast.success(t("product.details.unfollow_success") || "Désabonnement réussi.");
      } else {
        await apiPost(`/api/v1/auth/following/${encodeURIComponent(shop.id)}`, {
          sellerId: shop.id,
          name: shop.shopName || "Boutique",
          logo: shop.logoUrl || null,
          location: shop.wilaya || "Algérie",
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
  }, [isFollowing, shop, t]);

  const handleFollowToggle = useCallback(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (!shop?.id || followLoading) return;
    if (isFollowing) {
      setShowConfirm(true);
      return;
    }
    void executeFollowToggle();
  }, [currentUser, followLoading, isFollowing, navigate, shop?.id, executeFollowToggle]);

  const getTranslatedMaterials = useCallback((): string | null => {
    if (!product.materials || product.materials.length === 0) return null;
    return product.materials
      .map((m) => (MATERIAL_TRANSLATIONS[m]?.[currentLang] ? MATERIAL_TRANSLATIONS[m][currentLang] : m))
      .join(", ");
  }, [product.materials, currentLang]);

  const getTranslatedSeason = useCallback((): string | null => {
    if (!product.season) return null;
    if (SEASON_TRANSLATIONS[product.season]?.[currentLang]) {
      return SEASON_TRANSLATIONS[product.season][currentLang];
    }
    return product.season;
  }, [product.season, currentLang]);

  const isClothing = useMemo(() => {
    const cat = (product.category || "").toLowerCase();
    return (
      cat.includes("mode") ||
      cat.includes("vêtement") ||
      cat.includes("habit") ||
      cat.includes("chaussure") ||
      cat.includes("textile") ||
      Boolean(product.sizeType && product.sizeType === "clothing")
    );
  }, [product.category, product.sizeType]);

  const detailedAttributes = useMemo(() => {
    const categoryDef = DYNAMIC_CATEGORIES[product.category || ""];
    const result: Array<{ label: string; value: string; unit?: string }> = [];
    if (categoryDef?.allowed_filters && product?.attributes) {
      const attrs = product.attributes as Record<string, unknown>;
      categoryDef.allowed_filters.forEach((filter) => {
        const val = attrs[filter.id];
        if (val !== undefined && val !== null && val !== "") {
          result.push({
            label: filter.label,
            value: Array.isArray(val) ? val.join(", ") : String(val),
            unit: filter.unit,
          });
        }
      });
    }
    return result;
  }, [product.category, product.attributes]);

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={executeFollowToggle}
        title={t("product.details.unfollow_confirm_title") || "Se désabonner"}
        message={
          t("product.details.unfollow_confirm_message") ||
          "Voulez-vous vraiment ne plus suivre cette boutique ?"
        }
      />

      <ProductHeaderBento
        product={product}
        currentPrice={currentPrice}
        bilingualMode={bilingualMode}
        onToggleBilingualMode={() => setBilingualMode((prev) => !prev)}
        currentLang={currentLang}
      />

      <ProductSellerAlcove
        shop={shop}
        product={product}
        isFollowing={isFollowing}
        followLoading={followLoading}
        onFollowToggle={handleFollowToggle}
      />

      <ProductVariantsStuds
        product={product}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        onSelectColor={onSelectColor}
        onSelectSize={onSelectSize}
        isColorOutOfStock={isColorOutOfStock}
        isSizeOutOfStock={isSizeOutOfStock}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
      />

      <ProductAccordionsBento
        product={product}
        shop={shop}
        currentLang={currentLang}
        bilingualMode={bilingualMode}
        openAccordion={openAccordion}
        onToggleAccordion={toggleAccordion}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        isClothing={isClothing}
        getTranslatedMaterials={getTranslatedMaterials}
        getTranslatedSeason={getTranslatedSeason}
        detailedAttributes={detailedAttributes}
      />

      <ProductSizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />
    </div>
  );
};
