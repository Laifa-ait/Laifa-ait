import React, { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { PRODUCT_HIERARCHY } from "../../constants";
import { db } from "../../lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, limit } from "firebase/firestore";
import { Tag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const Marketing: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"categories" | "featured">("categories");

  // Real-time hierarchy state with local persistence
  const [hierarchy, setHierarchy] = useState<Record<string, Record<string, string[]>>>(PRODUCT_HIERARCHY);

  // Track expanded categories and subcategories
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({ "Maison & Déco": true });
  const [expandedSubs, setExpandedSubs] = useState<Record<string, boolean>>({});

  // Form states
  const [newCatName, setNewCatName] = useState("");
  const [newSubcatNames, setNewSubcatNames] = useState<Record<string, string>>({});
  const [newSubSubcatNames, setNewSubSubcatNames] = useState<Record<string, string>>({});

  // Category history
  const [historyLogs, setHistoryLogs] = useState<unknown[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Translations
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const translateTerms: string[] = [];
  const [proposedTranslations, setProposedTranslations] = useState<Record<string, { ar: string; en: string; isNew: boolean }>>({});
  const loadingTranslations = false;
  const translationError: string | null = null;
  const savingTranslations = false;

  useEffect(() => {
    const unsubCat = onSnapshot(doc(db, "settings", "categories"), (snap) => {
      if (snap.exists() && snap.data().hierarchy) setHierarchy(snap.data().hierarchy);
    });
    return () => { unsubCat(); };
  }, []);

  useEffect(() => {
    if (activeTab !== "categories") return;
    const unsubHistory = onSnapshot(query(collection(db, "category_history"), orderBy("createdAt", "desc"), limit(15)), (snapshot) => {
      setHistoryLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setHistoryLoading(false);
    });
    return () => unsubHistory();
  }, [activeTab]);

  const runHierarchyTransaction = async (_desc: string, _fn: unknown) => {};
  const handleAddCategory = () => {}; 
  const handleAddSubcategory = (_cat: string) => {}; 
  const handleAddSubSubcategory = (_cat: string, _sub: string) => {};
  const handleRemoveCategory = (_cat: string) => {};
  const handleRemoveSubcategory = (_cat: string, _sub: string) => {};
  const handleRemoveSubSubcategory = (_cat: string, _sub: string, _subsub: string) => {};
  const handleRollback = (_log: unknown) => {};
  const handleEditTranslation = () => {};
  const handleApplyTranslations = () => {};

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[3.5rem] border border-zinc-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-sans font-black text-zinc-950 tracking-tight">{t("Marketing & Curation")}</h2>
          <p className="text-zinc-500 font-medium text-sm mt-2">{t("Gérez vos catégories et vos sélections thématiques.")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/admin/promotions"
            className="px-5 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-sans font-bold text-xs flex items-center gap-2 border border-amber-200 transition-all shadow-sm"
          >
            <Tag className="w-4 h-4 text-amber-600" />
            <span>{t("Gestion des Codes Promo")}</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-60" />
          </Link>
          <div className="flex items-center gap-2 bg-zinc-50/80 p-2 rounded-3xl border border-zinc-100">
            {(["categories", "featured"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-zinc-950 text-white shadow-xl" : "text-zinc-400 hover:text-zinc-600"}`}
              >
                {tab === "categories" ? t("Catégories") : t("Sélections")}
              </button>
            ))}
          </div>
        </div>
      </div>
      <AnimatePresence mode="wait">
        {activeTab === "categories" && (
          <CategoriesTab
            hierarchy={hierarchy}
            setHierarchy={setHierarchy}
            expandedCats={expandedCats}
            setExpandedCats={setExpandedCats}
            expandedSubs={expandedSubs}
            setExpandedSubs={setExpandedSubs}
            newCatName={newCatName}
            setNewCatName={setNewCatName}
            newSubcatNames={newSubcatNames}
            setNewSubcatNames={setNewSubcatNames}
            newSubSubcatNames={newSubSubcatNames}
            setNewSubSubcatNames={setNewSubSubcatNames}
            handleAddCategory={handleAddCategory}
            handleAddSubcategory={handleAddSubcategory}
            handleAddSubSubcategory={handleAddSubSubcategory}
            handleRemoveCategory={handleRemoveCategory}
            handleRemoveSubcategory={handleRemoveSubcategory}
            handleRemoveSubSubcategory={handleRemoveSubSubcategory}
            runHierarchyTransaction={runHierarchyTransaction}
            historyLogs={historyLogs}
            historyLoading={historyLoading}
            handleRollback={handleRollback}
          />
        )}
        {activeTab === "featured" && (
          <FeaturedTab
            showTranslateModal={showTranslateModal}
            setShowTranslateModal={setShowTranslateModal}
            translateTerms={translateTerms}
            proposedTranslations={proposedTranslations}
            setProposedTranslations={setProposedTranslations}
            handleEditTranslation={handleEditTranslation}
            loadingTranslations={loadingTranslations}
            translationError={translationError}
            savingTranslations={savingTranslations}
            handleApplyTranslations={handleApplyTranslations}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
