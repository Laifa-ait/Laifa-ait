import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";
import { ProductGallery } from "../../components/Product/Details/ProductGallery";
import { ProductInfo } from "../../components/Product/Details/ProductInfo";
import { ProductBuyBox } from "../../components/Product/Details/ProductBuyBox";
import { ProductReviews } from "../../components/Product/Details/ProductReviews";
import { ProductLightbox } from "../../components/Product/ProductLightbox";
import { ProductSeoHelmet } from "../../components/Product/Details/ProductSeoHelmet";
import { ProductRecommendationsSection } from "../../components/Product/Details/ProductRecommendationsSection";
import { useProductLogic } from "../../hooks/useProductLogic";
import { useProductVariantsStock } from "../../hooks/useProductVariantsStock";
import { useProductRecommendations } from "../../hooks/useProductRecommendations";
import { useProductBreadcrumbs } from "../../hooks/useProductBreadcrumbs";
import { Breadcrumbs } from "../../components/Layout/Breadcrumbs";

export const ProductDetails: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { addToCart, wishlist, toggleWishlist } = useCart();

  const {
    product,
    shop,
    loading,
    selectedImageIndex,
    setSelectedImageIndex,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    showVideo,
    setShowVideo,
    isLightboxOpen,
    setIsLightboxOpen,
    showStickyBuyBar,
    setShowStickyBuyBar,
    images,
    currentPrice,
    reviews,
  } = useProductLogic();

  const buyBoxRef = useRef<HTMLDivElement>(null);
  const breadcrumbItems = useProductBreadcrumbs(product);
  const { recommendedProducts, loadingRecom } = useProductRecommendations(product);

  const {
    isCurrentSelectionOutOfStock,
    displayedPrice,
    isColorOutOfStock,
    isSizeOutOfStock,
  } = useProductVariantsStock(product, selectedColor, selectedSize, currentPrice ?? null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBuyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    const current = buyBoxRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
      observer.disconnect();
    };
  }, [setShowStickyBuyBar]);

  const currentLang = (i18n.language || "fr").split("-")[0].toLowerCase();
  const translatedTitle = product?.translations?.[currentLang]?.name || product?.name || "";
  const translatedDescription = product?.translations?.[currentLang]?.description || product?.description || "";

  const handleAddToCart = async (qty = 1) => {
    if (!product) return;
    if (product.colors?.length && !selectedColor) {
      toast.error(t("product.details.select_color") || "Veuillez sélectionner une couleur");
      return;
    }
    if (product.sizes?.length && !selectedSize) {
      toast.error(t("product.details.select_size") || "Veuillez sélectionner une taille");
      return;
    }
    if (isCurrentSelectionOutOfStock) {
      toast.error(t("product.details.out_of_stock") || "Ce produit est en rupture de stock");
      return;
    }

    try {
      const selectedVariantString = [selectedColor, selectedSize].filter(Boolean).join(" - ");
      await addToCart(product, {
        variant: selectedVariantString || undefined,
        quantity: qty,
        color: selectedColor || undefined,
        size: selectedSize || undefined,
      });
      toast.success(t("product.added_to_cart") || "Produit ajouté au panier !");
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    try {
      if (product) await navigator.share({ title: product.name, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t("product.link_copied") || "Lien copié !");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500 font-medium">
        {t("common.loading") || "Chargement..."}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center bg-transparent">
        <ShoppingBag className="w-16 h-16 text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">
          {t("common.not_found") || "Produit non trouvé"}
        </h1>
        <button
          onClick={() => navigate("/shop")}
          className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all cursor-pointer shadow-md"
        >
          {t("common.back_to_shop") || "Retour à la boutique"}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-emerald-600 selection:text-white relative overflow-hidden pb-32">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-8 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <ProductSeoHelmet
        product={product}
        translatedTitle={translatedTitle}
        translatedDescription={translatedDescription}
        displayedPrice={displayedPrice}
        isCurrentSelectionOutOfStock={isCurrentSelectionOutOfStock}
        images={images}
      />

      <div className="hidden sm:block pt-2 px-4 sm:px-6 max-w-7xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div className="w-full max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 sm:gap-6 lg:gap-10 xl:gap-12 pb-4 sm:pb-6">
          <div className="lg:col-span-6 h-max lg:sticky lg:top-28 px-3 sm:px-0 pt-3 sm:pt-0">
            <ProductGallery
              images={images}
              selectedIndex={selectedImageIndex}
              productName={translatedTitle || product.name}
              onSelectImage={setSelectedImageIndex}
              showVideo={showVideo}
              setShowVideo={setShowVideo}
              productVideoUrl={product.video}
              onOpenLightbox={() => setIsLightboxOpen(true)}
              isWishlisted={wishlist.includes(product.id)}
              onToggleWishlist={() => toggleWishlist(product.id)}
              onShare={handleShare}
            />
          </div>

          <div className="lg:col-span-6 space-y-6 px-3 sm:px-0 mt-4 sm:mt-0 relative z-10">
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#EFE3ED] shadow-[0_12px_40px_rgba(91,55,101,0.06)] space-y-6">
              <ProductInfo
                product={product}
                shop={shop}
                currentPrice={displayedPrice}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                onSelectColor={setSelectedColor}
                onSelectSize={setSelectedSize}
                isColorOutOfStock={isColorOutOfStock}
                isSizeOutOfStock={isSizeOutOfStock}
                buyBoxNode={
                  <ProductBuyBox
                    product={product}
                    isCurrentSelectionOutOfStock={isCurrentSelectionOutOfStock}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={() => toggleWishlist(product.id)}
                    wishlist={wishlist}
                    onShare={handleShare}
                    stickyRef={buyBoxRef}
                    isSticky={showStickyBuyBar}
                  />
                }
              />
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#EFE3ED] shadow-[0_12px_40px_rgba(91,55,101,0.06)]">
              <ProductReviews
                comments={reviews.map((r) => ({
                  id: r.id,
                  name: r.userName,
                  stars: r.rating,
                  text: r.comment,
                  createdAt: r.createdAt,
                }))}
                stats={product.stats}
                userCanReview={false}
                submittingReview={false}
                newReviewText=""
                setNewReviewText={() => {}}
                newReviewStars={5}
                setNewReviewStars={() => {}}
                onSubmit={async (e) => e.preventDefault()}
              />
            </div>
          </div>
        </div>

        <ProductLightbox
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          imageUrl={images[selectedImageIndex]}
          title={translatedTitle || product.name}
        />

        <ProductRecommendationsSection
          products={recommendedProducts}
          loading={loadingRecom}
          currentLang={currentLang}
        />
      </div>
    </div>
  );
};
