import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { FolderOpen, Trash2, ChevronRight, ChevronDown, Plus, CornerDownRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SubcategoryCard } from "./SubcategoryCard";

export interface CategoryItemRowProps {
  catName: string;
  subcategories: Record<string, string[]>;
  expandedCats: Record<string, boolean>;
  expandedSubs: Record<string, boolean>;
  toggleCat: (catName: string) => void;
  toggleSub: (catName: string, subcatName: string) => void;
  handleRemoveCat: (catName: string) => void;
  handleRemoveSubcat: (catName: string, subcatName: string) => void;
  handleRemoveSubSubcat: (catName: string, subcatName: string, item: string) => void;
  handleAddSubcat: (catName: string) => void;
  handleAddSubSubcat: (catName: string, subcatName: string) => void;
  newSubcatNames: Record<string, string>;
  setNewSubcatNames: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  newSubSubcatNames: Record<string, string>;
  setNewSubSubcatNames: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const CategoryItemRow: React.FC<CategoryItemRowProps> = ({
  catName,
  subcategories,
  expandedCats,
  expandedSubs,
  toggleCat,
  toggleSub,
  handleRemoveCat,
  handleRemoveSubcat,
  handleRemoveSubSubcat,
  handleAddSubcat,
  handleAddSubSubcat,
  newSubcatNames,
  setNewSubcatNames,
  newSubSubcatNames,
  setNewSubSubcatNames,
}) => {
  const { t } = useTranslation();
  const isCatExpanded = !!expandedCats[catName];
  const subcatCount = Object.keys(subcategories || {}).length;
  const subSubcatCount = Object.values(subcategories || {}).reduce(
    (acc, curr) => acc + curr.length,
    0
  );

  return (
    <div className="border border-zinc-100/80 bg-zinc-50/30 rounded-[2.5rem] overflow-hidden transition-all hover:shadow-md/5">
      <div
        onClick={() => toggleCat(catName)}
        className="p-6 md:p-8 bg-white border-b border-zinc-100/60 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50/40 select-none transition-colors"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div
            className={`p-3 rounded-2xl transition-colors ${
              isCatExpanded ? "bg-orange-500 text-white" : "bg-zinc-100 text-zinc-500"
            }`}
          >
            <FolderOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h5 className="font-sans font-bold text-zinc-950 text-sm tracking-tight rtl:tracking-normal uppercase">
              {catName}
            </h5>
            <p className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mt-1">
              {subcatCount} {subcatCount > 1 ? "Sous-catégories" : "Sous-catégorie"} •{" "}
              {subSubcatCount} {subSubcatCount > 1 ? "Éléments" : "Élément"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveCat(catName);
            }}
            className="p-3 bg-zinc-50 hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded-xl transition-colors cursor-pointer border-none"
            title={t("Supprimer la catégorie principale") || "Supprimer la catégorie principale"}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="p-3 bg-zinc-50 rounded-xl text-zinc-400">
            {isCatExpanded ? (
              <ChevronDown className="w-4 h-4 text-zinc-900" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isCatExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-[#fafafc]/50"
          >
            <div className="p-6 md:p-8 gap-6 space-y-6">
              <div className="space-y-4">
                {Object.entries(subcategories || {}).map(([subcatName, items]) => (
                  <SubcategoryCard
                    key={subcatName}
                    catName={catName}
                    subcatName={subcatName}
                    items={items}
                    expandedSubs={expandedSubs}
                    toggleSub={toggleSub}
                    handleRemoveSubcat={handleRemoveSubcat}
                    handleRemoveSubSubcat={handleRemoveSubSubcat}
                    handleAddSubSubcat={handleAddSubSubcat}
                    newSubSubcatNames={newSubSubcatNames}
                    setNewSubSubcatNames={setNewSubSubcatNames}
                  />
                ))}
              </div>

              <div className="bg-white p-5 rounded-[2rem] border border-dashed border-zinc-200 flex items-center gap-3">
                <div className="text-zinc-400 ps-1">
                  <CornerDownRight className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder={`Ajouter sous-catégorie à "${catName}"...`}
                  className="flex-1 bg-transparent px-2 outline-none font-bold text-xs"
                  value={newSubcatNames[catName] || ""}
                  onChange={(e) =>
                    setNewSubcatNames({ ...newSubcatNames, [catName]: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleAddSubcat(catName)}
                />
                <button
                  onClick={() => handleAddSubcat(catName)}
                  className="px-5 py-2.5 bg-zinc-900 hover:bg-orange-500 text-white rounded-xl text-[10px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal transition-all cursor-pointer border-none"
                >
                  <Plus className="w-3 h-3 inline me-1" /> {t("Ajouter")}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
