import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MegaMenuCategory, FeaturedProduct } from "../context/MegaMenuContext";
import { Product } from "../domains/product/product.types";
import { Language } from "../domains/home/homepage.types";
import { getTranslatedField } from "../utils/translations";
import { OptimizedImage } from "./ui/OptimizedImage";

interface MegaMenuDropdownProps {
  activeCategoryData: MegaMenuCategory | undefined;
  activeSectionName: string | null;
  setActiveSectionName: (name: string) => void;
  hoveredProduct: FeaturedProduct | null;
  setHoveredProduct: (p: FeaturedProduct | null) => void;
  productCache: Record<string, Product>;
  onClose: () => void;
}

export const MegaMenuDropdown: React.FC<MegaMenuDropdownProps> = ({
  activeCategoryData,
  activeSectionName,
  setActiveSectionName,
  hoveredProduct,
  setHoveredProduct,
  productCache,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Language;

  const displayedProductInfo =
    hoveredProduct || activeCategoryData?.featuredProduct;
  const productToDisplay = displayedProductInfo?.productId
    ? productCache[displayedProductInfo.productId]
    : null;

  return (
    <AnimatePresence>
      {activeCategoryData && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 5, scale: 0.99 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="absolute top-full start-0 w-full bg-white text-zinc-900 border-t border-zinc-200 shadow-2xl z-50 rounded-b-2xl overflow-hidden"
        >
          <div className="w-full max-w-[90rem] mx-auto px-6 sm:px-8 py-8">
            <div className="grid grid-cols-12 gap-8">
              {/* Col 1: Sections */}
              <div className="col-span-3 pe-4 border-e border-zinc-100">
                <h3 className="text-xs font-sans font-bold tracking-wider text-zinc-400 mb-4 uppercase">
                  {t("sub_categories", "Sous-catégories")}
                </h3>
                <ul className="flex flex-col gap-1">
                  {activeCategoryData.sections.map((section, idx) => {
                    const isActive = activeSectionName === section.name;
                    return (
                      <li key={idx}>
                        <button
                          type="button"
                          onMouseEnter={() => {
                            if (!isActive) setActiveSectionName(section.name);
                          }}
                          onClick={() => setActiveSectionName(section.name)}
                          className={`w-full text-start py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-between cursor-pointer border-none ${
                            isActive
                              ? "bg-zinc-950 text-white shadow-xs"
                              : "bg-transparent text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                          }`}
                        >
                          <span className="truncate">
                            {t(section.name) || section.name}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Col 2: Sub-links */}
              <div className="col-span-6 ps-2">
                <h3 className="text-xs font-sans font-bold tracking-wider text-zinc-400 mb-4 uppercase">
                  {activeSectionName
                    ? t(activeSectionName) || activeSectionName
                    : t("explore", "Explorer")}
                </h3>
                {activeCategoryData.sections
                  .filter((sec) => sec.name === activeSectionName)
                  .map((activeSection) => (
                    <div
                      key={activeSection.name}
                      className="grid grid-cols-2 gap-x-6 gap-y-1.5"
                    >
                      {activeSection.links.map((link, linkIdx) => (
                        <Link
                          key={linkIdx}
                          to={`/shop?category=${encodeURIComponent(
                            activeCategoryData.name
                          )}&subcategory=${encodeURIComponent(
                            activeSection.name.trim()
                          )}&subsubcategory=${encodeURIComponent(link.name.trim())}`}
                          onClick={onClose}
                          className="group flex items-center justify-between py-2 px-3.5 rounded-xl transition-all hover:bg-zinc-100/90 text-sm font-medium text-zinc-600 hover:text-zinc-950"
                          onMouseEnter={() => {
                            if (link.featuredProduct) {
                              setHoveredProduct(link.featuredProduct);
                            }
                          }}
                        >
                          <span className="truncate">
                            {t(link.name) || link.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ))}
              </div>

              {/* Col 3: Featured Product */}
              <div className="col-span-3 ps-4 border-s border-zinc-100">
                <h3 className="text-xs font-sans font-bold tracking-wider text-zinc-400 mb-4 uppercase">
                  {t("featured_product", "Article Vedette")}
                </h3>
                {productToDisplay ? (
                  <Link
                    to={`/product/${productToDisplay.id}`}
                    onClick={onClose}
                    className="group flex flex-col relative w-full aspect-[4/5] bg-zinc-50 overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-all"
                  >
                    <OptimizedImage
                      src={
                        productToDisplay.images?.[0] || productToDisplay.image
                      }
                      alt={getTranslatedField(productToDisplay, "name", lang)}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex flex-col">
                      <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                        {getTranslatedField(productToDisplay, "name", lang)}
                      </h4>
                      <p className="text-xs font-bold text-amber-300 mt-1">
                        {productToDisplay.price.toLocaleString("fr-DZ")}{" "}
                        {t("DA")}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div className="w-full aspect-[4/5] rounded-2xl bg-zinc-50 border border-dashed border-zinc-200 flex items-center justify-center p-4 text-center">
                    <span className="text-xs text-zinc-400 font-medium">
                      {t("home.explore_all_category", "Découvrez tous les articles de cette catégorie")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
