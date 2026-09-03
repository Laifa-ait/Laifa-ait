import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Box } from "lucide-react";
import { CATEGORY_ICONS } from "../../constants";
import { getCategoryTranslation } from "../../utils/translations";

interface CategorySection {
  name: string;
}

interface CategoryItem {
  id: string;
  name: string;
  sections?: CategorySection[];
}

interface MobileCategoriesAccordionProps {
  categories: CategoryItem[];
  onNavigate: (path: string) => void;
  onClose: () => void;
}

export const MobileCategoriesAccordion: React.FC<MobileCategoriesAccordionProps> = ({
  categories,
  onNavigate,
  onClose,
}) => {
  const { t } = useTranslation();
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  return (
    <div className="space-y-2.5">
      <h4 className="text-[10px] font-bold text-cyan-800/60 uppercase tracking-[0.18em] px-1">
        {t("nav.sections.categories")}
      </h4>
      <div className="flex flex-col space-y-2">
        {categories.map((cat, i) => {
          const IconComponent = CATEGORY_ICONS[cat.name] || Box;
          const isExpanded = expandedCat === cat.id;

          return (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-xs border border-[#E8F6F8] overflow-hidden"
            >
              <button
                onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
                className="w-full flex items-center justify-between p-3 bg-transparent border-none cursor-pointer hover:bg-[#F2FAFB] group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#F2FAFB] group-hover:bg-white transition-colors border border-transparent group-hover:border-[#E8F6F8] shadow-xs">
                    <IconComponent className="w-4 h-4 text-[#0088A8] stroke-[1.5]" />
                  </div>
                  <span className="font-semibold text-sm text-cyan-950 group-hover:text-[#0088A8] transition-colors">
                    {getCategoryTranslation(cat.name, t)}
                  </span>
                </div>
                {cat.sections && cat.sections.length > 0 && (
                  <ChevronRight
                    className={`w-4 h-4 transition-transform duration-300 text-cyan-800/40 ${
                      isExpanded ? "rotate-90 text-[#D92B6B]" : ""
                    }`}
                  />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && cat.sections && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-[#F2FAFB]/50 border-t border-[#E8F6F8]/50"
                  >
                    <div className="px-4 py-2 space-y-0.5">
                      {cat.sections.map((sec, j) => (
                        <button
                          key={j}
                          onClick={() => {
                            onNavigate(
                              `/shop?category=${encodeURIComponent(
                                cat.name
                              )}&subcategory=${encodeURIComponent(sec.name)}`
                            );
                            onClose();
                          }}
                          className="block w-full text-start text-xs text-cyan-900/70 hover:text-[#D92B6B] hover:bg-white font-medium border-none bg-transparent cursor-pointer transition-all p-2 rounded-lg"
                        >
                          {getCategoryTranslation(sec.name, t)}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
