import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Layers, Trash2, ChevronDown, ChevronRight, X, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface SubcategoryCardProps {
  catName: string;
  subcatName: string;
  items: string[];
  expandedSubs: Record<string, boolean>;
  toggleSub: (catName: string, subcatName: string) => void;
  handleRemoveSubcat: (catName: string, subcatName: string) => void;
  handleRemoveSubSubcat: (catName: string, subcatName: string, item: string) => void;
  handleAddSubSubcat: (catName: string, subcatName: string) => void;
  newSubSubcatNames: Record<string, string>;
  setNewSubSubcatNames: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const SubcategoryCard: React.FC<SubcategoryCardProps> = ({
  catName,
  subcatName,
  items,
  expandedSubs,
  toggleSub,
  handleRemoveSubcat,
  handleRemoveSubSubcat,
  handleAddSubSubcat,
  newSubSubcatNames,
  setNewSubSubcatNames,
}) => {
  const { t } = useTranslation();
  const subKey = `${catName}_${subcatName}`;
  const isSubExpanded = !!expandedSubs[subKey];

  return (
    <div className="bg-white rounded-[2rem] border border-zinc-100/80 p-6 shadow-sm">
      <div
        onClick={() => toggleSub(catName, subcatName)}
        className="flex items-center justify-between gap-4 cursor-pointer hover:opacity-90 select-none"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-zinc-100 rounded-xl text-zinc-500">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h6 className="font-extrabold text-zinc-900 text-xs uppercase tracking-wider rtl:tracking-normal">
              {subcatName}
            </h6>
            <p className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mt-0.5">
              {items.length} {items.length > 1 ? "Sous-sous-catégories" : "Sous-sous-catégorie"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveSubcat(catName, subcatName);
            }}
            className="p-2 hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer border-none"
            title={t("Supprimer la sous-catégorie") || "Supprimer la sous-catégorie"}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div className="p-2 text-zinc-400">
            {isSubExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-zinc-800" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isSubExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="pt-6 border-t border-zinc-100 mt-6 space-y-4">
              <div className="flex flex-wrap gap-2.5">
                {items.length === 0 ? (
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest rtl:tracking-normal py-1">
                    {t("Aucune sous-sous-catégorie")}
                  </p>
                ) : (
                  items.map((item) => (
                    <div
                      key={item}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-50 border border-zinc-100 hover:border-orange-200 rounded-full group/pill transition-colors"
                    >
                      <span className="text-[10px] font-sans font-bold text-zinc-700 uppercase tracking-widest rtl:tracking-normal">
                        {item}
                      </span>
                      <button
                        onClick={() => handleRemoveSubSubcat(catName, subcatName, item)}
                        className="p-0.5 bg-white text-zinc-400 hover:text-red-500 hover:scale-115 rounded-full shadow-sm transition-all cursor-pointer border-none"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center gap-2 max-w-sm pt-2">
                <input
                  type="text"
                  placeholder={
                    t("Ajouter sous-sous-catégorie...") || "Ajouter sous-sous-catégorie..."
                  }
                  className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-[11px] font-bold outline-none focus:border-orange-500"
                  value={newSubSubcatNames[subKey] || ""}
                  onChange={(e) =>
                    setNewSubSubcatNames({
                      ...newSubSubcatNames,
                      [subKey]: e.target.value,
                    })
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleAddSubSubcat(catName, subcatName)
                  }
                />
                <button
                  onClick={() => handleAddSubSubcat(catName, subcatName)}
                  className="p-3 bg-zinc-950 hover:bg-orange-500 text-white rounded-xl flex items-center justify-center transition-all hover:scale-105 cursor-pointer border-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
