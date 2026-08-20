import React, { useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { apiPost } from "../../lib/api";
import { ProductFormModal } from "./ProductFormModal";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { SellerCatalogHeader } from "./components/SellerCatalogHeader";
import { SellerCatalogToolbar } from "./components/SellerCatalogToolbar";
import { SellerProductCard } from "./components/SellerProductCard";
import { SellerCatalogEmptyState } from "./components/SellerCatalogEmptyState";
import { useSellerCatalog } from "./hooks/useSellerCatalog";

export const Catalog: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar" || i18n.language?.startsWith("ar");
  const [searchParams] = useSearchParams();

  const {
    currentUser,
    userProfile,
    products,
    setProducts,
    loading,
    pendingDelete,
    setPendingDelete,
    isAddMode,
    setIsAddMode,
    editingProduct,
    setEditingProduct,
    searchTerm,
    setSearchTerm,
    activeFilter,
    setActiveFilter,
    adminTags,
    categoryHierarchy,
    categories,
    filteredProducts,
    isShopValidated,
    handleSaveSuccess,
    handleDuplicateProduct,
    handleStockUpdate,
    handleCsvImport,
  } = useSellerCatalog();

  useEffect(() => {
    if (searchParams.get("action") === "new" && isShopValidated) {
      setEditingProduct(null);
      setIsAddMode(true);
    }
  }, [searchParams, isShopValidated, setEditingProduct, setIsAddMode]);

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-12 max-w-6xl mx-auto" id="seller-catalog-page">
      {/* Verification Notice if not active */}
      {!isShopValidated && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl flex items-center gap-3" id="seller-unverified-banner">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">{t("Boutique en attente de vérification")}</p>
            <p className="text-amber-700/80">{t("L'ajout et la modification d'articles seront actifs après validation administrative.")}</p>
          </div>
        </div>
      )}

      {/* Seller Header */}
      <SellerCatalogHeader userProfile={userProfile} products={products} />

      {/* Toolbar (Title, Actions, Search, Filter Tabs) */}
      <SellerCatalogToolbar
        isShopValidated={isShopValidated}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        products={products}
        onAddClick={() => { setEditingProduct(null); setIsAddMode(true); }}
        onCsvImport={handleCsvImport}
      />

      {/* Product List Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden" id="seller-product-list-container">
        {loading ? (
          <div className="divide-y divide-zinc-100">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
                <div className="w-20 h-20 rounded-xl bg-zinc-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-200 rounded w-1/3" />
                  <div className="h-3 bg-zinc-200 rounded w-1/4" />
                  <div className="h-4 bg-zinc-200 rounded w-1/5" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <SellerCatalogEmptyState
            searchTerm={searchTerm}
            isShopValidated={isShopValidated}
            onAddClick={() => { setIsAddMode(true); setEditingProduct(null); }}
          />
        ) : (
          <div className="divide-y divide-zinc-100">
            {filteredProducts.map((product) => (
              <SellerProductCard
                key={product.id}
                product={product}
                currentUserId={currentUser?.uid}
                onDuplicate={handleDuplicateProduct}
                onEdit={(p) => { setEditingProduct(p); setIsAddMode(true); }}
                onDeleteRequest={(p) => setPendingDelete(p)}
                onStockUpdate={handleStockUpdate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {isAddMode && (
          <ProductFormModal
            onClose={() => { setIsAddMode(false); setEditingProduct(null); }}
            editingProduct={editingProduct}
            categories={categories}
            CATEGORY_TREE={categoryHierarchy}
            adminTags={adminTags}
            userProfile={userProfile}
            currentUser={currentUser}
            onSaveSuccess={handleSaveSuccess}
          />
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          try {
            await apiPost(`/api/v1/seller/products/${pendingDelete.id}/request-deletion`, {});
            setProducts(products.map(item => item.id === pendingDelete.id ? { ...item, status: "pending_deletion" } : item));
            toast.success(isArabic ? "تم إرسال طلب الحذف إلى مسؤول النظام." : "Demande de suppression transmise à l'administrateur.");
          } catch (err) {
            console.error(err);
            toast.error(isArabic ? "فشل طلب الحذف." : "Erreur lors de la demande de suppression.");
          } finally {
            setPendingDelete(null);
          }
        }}
        title={isArabic ? "تأكيد الحذف" : "Confirmer la suppression"}
        message={isArabic 
          ? `هل تريد حذف هذا المنتج من الكتالوج الخاص بك؟ سيتم إرسال الطلب للمسؤول وسيصبح المنتج تحت حالة "قيد الحذف".`
          : "Voulez-vous supprimer ce produit de votre catalogue ? La demande sera envoyée à l'administrateur pour validation et l'article passera en statut 'Suppression en attente'."}
      />
    </div>
  );
};
