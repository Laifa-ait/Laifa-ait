import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { useMegaMenu, FeaturedProduct } from "../context/MegaMenuContext";
import { useShop } from "../context/ShopContext";
import { useTranslation } from "react-i18next";
import { CATEGORY_ICONS } from "../constants";
import { Box } from "lucide-react";
import { Product } from "../domains/product/product.types";
import { OptimizedImage } from "./ui/OptimizedImage";
import { MegaMenuDropdown } from "./MegaMenuDropdown";

export interface MegaMenuProps {
  isVisible?: boolean;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ isVisible = true }) => {
  const { categoriesData } = useMegaMenu();
  const { fetchProductsByIds } = useShop();
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSectionName, setActiveSectionName] = useState<string | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<FeaturedProduct | null>(null);
  const [productCache, setProductCache] = useState<Record<string, Product>>({});
  const menuRef = useRef<HTMLDivElement>(null);

  // Close active category when menu is hidden on scroll
  useEffect(() => {
    if (!isVisible) setActiveCategory(null);
  }, [isVisible]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveCategory(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeCategoryData = categoriesData.find((c) => c.id === activeCategory);

  // Pre-fetch related products
  useEffect(() => {
    if (!activeCategoryData) return;
    const idsToFetch = new Set<string>();
    if (activeCategoryData.featuredProduct?.productId) {
      idsToFetch.add(activeCategoryData.featuredProduct.productId);
    }
    activeCategoryData.sections.forEach((sec) => {
      sec.links.forEach((link: { featuredProduct?: { productId?: string } }) => {
        if (link.featuredProduct?.productId) {
          idsToFetch.add(link.featuredProduct.productId);
        }
      });
    });

    const neededIds = Array.from(idsToFetch).filter((id) => !productCache[id]);
    if (neededIds.length > 0) {
      fetchProductsByIds(neededIds).then((prods) => {
        setProductCache((prev) => {
          const next = { ...prev };
          prods.forEach((p) => {
            next[p.id] = p;
          });
          return next;
        });
      });
    }
  }, [activeCategoryData, fetchProductsByIds, productCache]);

  useEffect(() => {
    if (activeCategoryData && activeCategoryData.sections.length > 0) {
      setActiveSectionName(activeCategoryData.sections[0].name);
    } else {
      setActiveSectionName(null);
    }
    setHoveredProduct(null);
  }, [activeCategory, activeCategoryData]);

  const toggleCategory = (id: string) => {
    setActiveCategory((prev) => (prev === id ? null : id));
  };

  return (
    <motion.div
      ref={menuRef}
      initial={false}
      animate={{
        height: isVisible ? "auto" : 0,
        opacity: isVisible ? 1 : 0,
        borderTopWidth: isVisible ? "1px" : "0px",
        borderBottomWidth: isVisible ? "1px" : "0px",
      }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`relative w-full z-40 bg-white/95 backdrop-blur-md border-zinc-200/80 text-zinc-900 font-sans hidden lg:block shadow-2xs ${
        activeCategory ? "overflow-visible" : "overflow-hidden"
      }`}
    >
      {/* Category Pills Bar */}
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8">
        <ul className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide py-2.5">
          {categoriesData.map((category) => {
            const IconComponent = CATEGORY_ICONS[category.name] || Box;
            const isActive = activeCategory === category.id;

            return (
              <li key={category.id} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`py-1.5 px-3 rounded-full transition-all duration-200 cursor-pointer border flex items-center gap-2 text-xs font-semibold ${
                    isActive
                      ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
                      : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 border-zinc-200/70"
                  }`}
                >
                  <span className="w-4 h-4 flex items-center justify-center shrink-0">
                    {category.iconUrl ? (
                      <OptimizedImage
                        src={category.iconUrl}
                        alt={category.name}
                        className="w-4 h-4 object-contain"
                      />
                    ) : (
                      <IconComponent className="w-3.5 h-3.5 stroke-[2]" />
                    )}
                  </span>
                  <span className="tracking-tight whitespace-nowrap">
                    {t(category.name) || category.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Dropdown Panel */}
      <MegaMenuDropdown
        activeCategoryData={activeCategoryData}
        activeSectionName={activeSectionName}
        setActiveSectionName={setActiveSectionName}
        hoveredProduct={hoveredProduct}
        setHoveredProduct={setHoveredProduct}
        productCache={productCache}
        onClose={() => setActiveCategory(null)}
      />
    </motion.div>
  );
};
