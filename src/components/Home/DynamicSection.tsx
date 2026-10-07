import React from "react";
import { useTranslation } from "react-i18next";
import { HomepageSection } from "../../domains/home/homepage.types";
import { useSectionProducts } from "../../hooks/useSectionProducts";
import { SectionHeader } from "./SectionHeader";
import { CarouselLayout, StandardGridLayout, BentoHeroLayout } from "./SectionLayouts";

interface DynamicSectionProps {
  section: HomepageSection;
  isFramed?: boolean;
}

/**
 * Checks if hex color is visually dark for contrast calculation
 */
function isColorDark(hexColor?: string): boolean {
  if (!hexColor || !hexColor.startsWith("#") || hexColor.length < 7) return false;
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

export const DynamicSection: React.FC<DynamicSectionProps> = ({ section, isFramed = false }) => {
  const { t } = useTranslation();
  const { products, isLoading, hasMore, loadMore } = useSectionProducts(section);

  if (!section.isActive) return null;

  const styleVariant = section.style || "clean";

  // Section card accent classes
  const getCardStyle = () => {
    switch (styleVariant) {
      case "premium":
        return "border-emerald-500/80";
      case "immersive":
        return "border-slate-800";
      case "glass":
        return "border-white/70";
      case "elevated":
        return "border-slate-200 shadow-md";
      case "dark":
        return "border-slate-800 bg-slate-900";
      case "clean":
      default:
        return "border-slate-200";
    }
  };

  const isDarkBg = isColorDark(section.backgroundColor);
  const customBgStyle = section.backgroundColor
    ? { backgroundColor: section.backgroundColor }
    : undefined;

  const renderContentByLayout = () => {
    const layout = section.layout || "compact";

    switch (layout) {
      case "standard":
        return (
          <StandardGridLayout
            products={products}
            isLoading={isLoading}
            hasMore={hasMore}
            loadMore={loadMore}
            cardStyle={getCardStyle()}
            styleVariant={styleVariant}
            limit={section.limit || 8}
          />
        );
      case "large":
        return (
          <BentoHeroLayout
            products={products}
            isLoading={isLoading}
            hasMore={hasMore}
            loadMore={loadMore}
            cardStyle={getCardStyle()}
            styleVariant={styleVariant}
            limit={section.limit || 6}
          />
        );
      case "minimal":
        return (
          <StandardGridLayout
            products={products}
            isLoading={isLoading}
            hasMore={hasMore}
            loadMore={loadMore}
            cardStyle={getCardStyle()}
            styleVariant={styleVariant}
            limit={6}
          />
        );
      case "compact":
      default:
        return (
          <CarouselLayout
            products={products}
            isLoading={isLoading}
            hasMore={hasMore}
            loadMore={loadMore}
            cardStyle={getCardStyle()}
            styleVariant={styleVariant}
            limit={section.limit || 8}
          />
        );
    }
  };

  if (isFramed) {
    return (
      <div className="w-full relative z-10 animate-fade-in" style={customBgStyle}>
        <SectionHeader section={section} isDarkBg={isDarkBg} />
        {products.length === 0 && !isLoading ? (
          <p className="text-zinc-400 font-medium text-center py-8 text-xs">
            {t("Aucun produit trouvé pour cette section.")}
          </p>
        ) : (
          renderContentByLayout()
        )}
      </div>
    );
  }

  const containerClasses = section.backgroundColor
    ? "rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200/80 relative animate-fade-in transition-all duration-300"
    : "bg-white rounded-3xl p-5 sm:p-7 shadow-[0_1px_3px_rgba(15,23,42,0.04)] border border-slate-200/80 relative animate-fade-in transition-all duration-300";

  return (
    <section className="py-3 sm:py-5 relative mb-4 sm:mb-6">
      <div className="w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className={containerClasses} style={customBgStyle}>
          <SectionHeader section={section} isDarkBg={isDarkBg} />

          {products.length === 0 && !isLoading ? (
            <p className={`font-medium text-center py-8 text-xs ${isDarkBg ? "text-zinc-300" : "text-zinc-400"}`}>
              {t("Aucun produit trouvé pour cette section.")}
            </p>
          ) : (
            renderContentByLayout()
          )}
        </div>
      </div>
    </section>
  );
};
