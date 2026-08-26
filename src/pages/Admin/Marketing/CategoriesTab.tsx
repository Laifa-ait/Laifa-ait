import React from "react";
import { motion } from "motion/react";
import {
  Plus,
  LayoutGrid,
  Folder,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { CategoryHistorySection } from "./CategoryHistorySection";
import { CategoryItemRow } from "./CategoryItemRow";

interface CategoriesTabProps {
  hierarchy: unknown[];
  expandedCats: Record<string, boolean>;
  setExpandedCats: (cats: Record<string, boolean>) => void;
  expandedSubs: Record<string, boolean>;
  setExpandedSubs: (subs: Record<string, boolean>) => void;
  newCatName: string;
  setNewCatName: (name: string) => void;
  newSubcatNames: Record<string, string>;
  setNewSubcatNames: (names: Record<string, string>) => void;
  newSubSubcatNames: Record<string, string>;
  setNewSubSubcatNames: (names: Record<string, string>) => void;
  handleAddCategory: () => void;
  handleAddSubcategory: (catName: string) => void;
  handleAddSubSubcategory: (catName: string, subcatName: string) => void;
  handleRemoveCategory: (catName: string) => void;
  handleRemoveSubcategory: (catName: string, subcatName: string) => void;
  handleRemoveSubSubcategory: (catName: string, subcatName: string, subSubcatName: string) => void;
  startTranslateWorkflow: (catName: string, subcatName?: string, subSubcatName?: string) => void;
  handleResetToDefault: () => void;
  historyLogs: unknown[];
  historyLoading: boolean;
  handleRollback: (logId: string) => void;
}

export const CategoriesTab = ({
  hierarchy,
  expandedCats,
  setExpandedCats,
  expandedSubs,
  setExpandedSubs,
  newCatName,
  setNewCatName,
  newSubcatNames,
  setNewSubcatNames,
  newSubSubcatNames,
  setNewSubSubcatNames,
  handleAddCategory,
  handleAddSubcategory,
  handleAddSubSubcategory,
  handleRemoveCategory,
  handleRemoveSubcategory,
  handleRemoveSubSubcategory,
  startTranslateWorkflow,
  handleResetToDefault,
  historyLogs,
  historyLoading,
  handleRollback,
}: CategoriesTabProps) => {
  const { t } = useTranslation();

  const toggleCat = (catName: string) => {
    setExpandedCats({ ...expandedCats, [catName]: !expandedCats[catName] });
  };

  const toggleSub = (catName: string, subcatName: string) => {
    const key = `${catName}_${subcatName}`;
    setExpandedSubs({ ...expandedSubs, [key]: !expandedSubs[key] });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      key="cat"
      className="bg-white rounded-[3.5rem] border border-zinc-100 shadow-sm p-12 space-y-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-8">
        <h4 className="text-xl font-sans font-bold flex items-center gap-4">
          <LayoutGrid className="w-7 h-7 text-orange-500 animate-pulse" />
          {t("Arbre des Catégories Interactif")}
        </h4>
        <div className="flex items-center gap-3">
          <button
            onClick={startTranslateWorkflow}
            className="flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-3 rounded-2xl transition-all self-start disabled:opacity-50 cursor-pointer border-none"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t("AI Traduire tout le Catalogue")}
          </button>
          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-widest rtl:tracking-normal text-[#ea580c] bg-orange-50 hover:bg-orange-100 px-5 py-3 rounded-2xl transition-all self-start cursor-pointer border-none"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t("Réinitialiser par défaut")}
          </button>
        </div>
      </div>

      {/* Add Root Category input */}
      <div className="bg-zinc-50/60 p-6 rounded-[2.5rem] border border-zinc-100/80 flex flex-col md:flex-row items-center gap-4 max-w-2xl">
        <div className="p-3 bg-white rounded-2xl border border-zinc-150">
          <Folder className="w-5 h-5 text-orange-500" />
        </div>
        <div className="flex-1 w-full">
          <p className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-1">
            {t("Nouveau Niveau 1")}
          </p>
          <input
            type="text"
            placeholder={
              t("Ajouter une nouvelle catégorie principale (ex: Auto & Moto)...") ||
              "Ajouter une nouvelle catégorie principale (ex: Auto & Moto)..."
            }
            className="w-full bg-transparent outline-none font-bold text-sm text-zinc-900 border-b border-transparent focus:border-orange-500 pb-1"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
          />
        </div>
        <button
          onClick={handleAddCategory}
          className="w-full md:w-auto px-8 py-4 bg-zinc-950 text-white rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 text-xs font-sans font-bold uppercase tracking-widest rtl:tracking-normal transition-all shadow-md shrink-0 cursor-pointer border-none"
        >
          <Plus className="w-4 h-4" /> {t("Créer")}
        </button>
      </div>

      {/* Collapsible multi-level categories list */}
      <div className="space-y-6">
        {Object.entries(hierarchy || {}).length === 0 ? (
          <div className="p-16 border-2 border-dashed border-zinc-100 rounded-[2.5rem] text-center text-zinc-400 font-bold uppercase tracking-widest rtl:tracking-normal text-xs">
            {t("Aucune catégorie disponible. Veuillez en ajouter une ci-dessus.")}
          </div>
        ) : (
          Object.entries(hierarchy || {}).map(([catName, subcategories]) => (
            <CategoryItemRow
              key={catName}
              catName={catName}
              subcategories={subcategories as Record<string, string[]>}
              expandedCats={expandedCats}
              expandedSubs={expandedSubs}
              toggleCat={toggleCat}
              toggleSub={toggleSub}
              handleRemoveCat={handleRemoveCategory}
              handleRemoveSubcat={handleRemoveSubcategory}
              handleRemoveSubSubcat={handleRemoveSubSubcategory}
              handleAddSubcat={handleAddSubcategory}
              handleAddSubSubcat={handleAddSubSubcategory}
              newSubcatNames={newSubcatNames}
              setNewSubcatNames={setNewSubcatNames}
              newSubSubcatNames={newSubSubcatNames}
              setNewSubSubcatNames={setNewSubSubcatNames}
            />
          ))
        )}
      </div>

      <CategoryHistorySection
        historyLoading={historyLoading as boolean}
        historyLogs={(historyLogs as Array<Record<string, unknown>>) || []}
        handleRollback={handleRollback as (log: Record<string, unknown>) => void}
      />
    </motion.div>
  );
};
