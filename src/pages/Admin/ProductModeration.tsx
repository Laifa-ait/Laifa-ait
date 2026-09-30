import React from "react";
import { AnimatePresence } from "motion/react";
import {
  Search,
  Sparkles,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useConfirm } from "../../hooks/useConfirm";
import { useProductModeration } from "../../components/Admin/ProductModeration/hooks/useProductModeration";
import { ProductRejectModal } from "../../components/Admin/ProductModeration/ProductRejectModal";
import { ProductModerationCard } from "../../components/Admin/ProductModeration/ProductModerationCard";

export const ProductModeration: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { confirm: showConfirmModal, ConfirmationDialog } = useConfirm();
  const isArabic = i18n.language === "ar" || i18n.language?.startsWith("ar");

  const {
    loading,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    lastVisible,
    rejectModalOpen,
    setRejectModalOpen,
    targetProduct,
    rejectReason,
    setRejectReason,
    customReason,
    setCustomReason,
    preconfiguredReasons,
    filteredProducts,
    loadMore,
    handleApprove,
    handleOpenRejectModal,
    handleRejectSubmit,
    handleConfirmDelete,
    handleDenyDelete,
    handleRecalculateScores,
  } = useProductModeration(showConfirmModal);

  const categories = [
    "Tous",
    "Poterie",
    "Tapis & Tissage",
    "Bijoux Traditionnels",
    "Cuir & Maroquinerie",
    "Habits Traditionnels",
    "Artisanat du Bois",
    "Cuivre & Dinanderie",
    "Vannerie & Sparterie",
  ];

  return (
    <div className="space-y-8" dir={isArabic ? "rtl" : "ltr"}>
      <ConfirmationDialog />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-sans font-bold text-zinc-900 uppercase tracking-tight rtl:tracking-normal">
            {t("Modération des Produits")}
          </h1>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mt-1">
            {t("Validez les nouveautés, contrôlez les mises à jour et appliquez la charte qualité.")}
          </p>
        </div>

        {activeTab === "active" && (
          <button
            onClick={() => void handleRecalculateScores()}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 text-white font-sans font-bold text-xs uppercase tracking-wider hover:bg-orange-700 transition-all shadow-md shadow-orange-600/10 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {t("Recalculer les Scores")}
          </button>
        )}
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-stone-200 gap-2 overflow-x-auto">
        {(["pending", "active", "rejected", "pending_deletion"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-4 px-6 font-sans font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab
                ? "border-zinc-950 text-zinc-950"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}
          >
            {tab === "pending" && t("⏳ En Attente")}
            {tab === "active" && t("✅ Actifs")}
            {tab === "rejected" && t("❌ Rejetés")}
            {tab === "pending_deletion" && t("🗑️ Demandes de Suppression")}
          </button>
        ))}
      </div>

      {/* Search & Category Filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-stone-200/60 shadow-sm">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder={t("Rechercher par nom ou vendeur...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-50 border border-stone-200 rounded-xl ps-10 pe-4 py-2 text-xs font-semibold outline-none focus:border-zinc-900 transition-colors"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute start-3.5 top-2.5" />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-3">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
            {t("Catégorie :")}
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto bg-zinc-50 border border-stone-200 rounded-xl px-4 py-2 text-xs font-bold text-zinc-700 outline-none focus:border-zinc-900 transition-colors cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main content grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-transparent border border-stone-200/40 rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-stone-200/60 rounded-2xl p-16 text-center shadow-sm">
          <ShieldAlert className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h2 className="text-sm font-sans font-bold text-zinc-800 uppercase tracking-wider rtl:tracking-normal">
            {t("Aucun produit trouvé")}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
            {t("Il n'y a aucun produit conforme aux critères de recherche dans cet onglet de modération.")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((p) => (
              <ProductModerationCard
                key={p.id}
                product={p}
                activeTab={activeTab}
                onOpenRejectModal={handleOpenRejectModal}
                onApprove={handleApprove}
                onConfirmDelete={handleConfirmDelete}
                onDenyDelete={handleDenyDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination Load More */}
      {lastVisible && !loading && (
        <div className="flex justify-center pt-8">
          <button
            onClick={() => void loadMore()}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-white border border-stone-200 text-zinc-700 font-sans font-bold text-xs uppercase tracking-wider hover:bg-stone-50 transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            {t("Charger plus de produits")}
          </button>
        </div>
      )}

      {/* Rejection reason modal */}
      <ProductRejectModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        targetProduct={targetProduct}
        rejectReason={rejectReason}
        onRejectReasonChange={setRejectReason}
        customReason={customReason}
        onCustomReasonChange={setCustomReason}
        preconfiguredReasons={preconfiguredReasons}
        onSubmit={() => void handleRejectSubmit()}
      />
    </div>
  );
};
