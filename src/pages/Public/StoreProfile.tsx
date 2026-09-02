import React from 'react';
import { Store, ChevronLeft, Package, SearchX } from 'lucide-react';
import { ProductCard } from '../../components/Product/ProductCard';
import { Spinner } from '../../components/ui/Spinner';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { ImageAdjusterModal } from '../../components/ui/ImageAdjusterModal';
import { StoreProductsFilter } from '../../components/Store/StoreProductsFilter';
import { StoreAboutView } from '../../components/Store/StoreAboutView';
import { StoreProfileHeader } from '../../components/Store/StoreProfileHeader';
import { useStoreProfile } from './hooks/useStoreProfile';

export interface PublicStoreInfo {
  id: string;
  sellerId: string;
  shopName: string;
  shopDescription?: string;
  wilaya: string;
  legalStatus?: string;
  avgPreparationTime?: string;
  returnPolicy?: string;
  followersCount?: number;
  rating?: number | null;
  status?: string;
  logoUrl?: string;
  bannerUrl?: string;
  shopSlug?: string;
  coverImage?: string;
  displayName?: string;
  description?: string;
  avatarUrl?: string;
  coverUrl?: string;
  uid?: string;
  userUid?: string;
  error?: string;
  photoURL?: string;
  photoUrl?: string;
  avatar?: string;
  banner?: string;
  storeBanner?: string;
  sellerBanner?: string;
  bannerImage?: string;
  brand?: string;
}

export const StoreProfile: React.FC = () => {
  const {
    navigate,
    t,
    isRTL,
    d,
    storeInfo,
    products,
    loading,
    isFollowing,
    followLoading,
    showConfirm,
    setShowConfirm,
    displayLimit,
    setDisplayLimit,
    totalCount,
    LOAD_MORE_LIMIT,
    isEditingAbout,
    setIsEditingAbout,
    savingAbout,
    editForm,
    setEditForm,
    uploadingLogo,
    uploadingBanner,
    isOwner,
    adjustingImage,
    setAdjustingImage,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    handleLogoFileSelect,
    handleBannerFileSelect,
    handleSaveAdjustedImage,
    handleFollowToggle,
    executeFollowAction,
    handleSaveAbout
  } = useStoreProfile();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" className="text-orange-600" />
        <span className="text-sm font-semibold text-zinc-500">{d('loading')}</span>
      </div>
    );
  }

  if (!storeInfo) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-zinc-200/60 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">{d('notExist')}</h2>
        <p className="text-sm text-zinc-500">{d('notExistDesc')}</p>
        <button
          onClick={() => navigate('/catalog')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-2xl text-xs font-bold hover:bg-black transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{d('backToCatalog')}</span>
        </button>
      </div>
    );
  }

  // Filter products by category and searchQuery
  const filteredProducts = products.filter(p => {
    const matchesQuery = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || p.category === selectedCategory;

    return matchesQuery && matchesCategory;
  });

  const visibleProducts = filteredProducts.slice(0, displayLimit);
  const hasMore = displayLimit < filteredProducts.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <StoreProfileHeader
        storeInfo={storeInfo}
        isOwner={isOwner}
        uploadingBanner={uploadingBanner}
        uploadingLogo={uploadingLogo}
        isFollowing={isFollowing}
        followLoading={followLoading}
        d={d}
        onBannerSelect={handleBannerFileSelect}
        onLogoSelect={handleLogoFileSelect}
        onFollowToggle={handleFollowToggle}
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 mb-6 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'products'
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{d('articles')}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600'
          }`}>
            {totalCount ?? products.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'about'
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>À propos</span>
        </button>
      </div>

      {activeTab === 'products' ? (
        <div className="space-y-6">
          <StoreProductsFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            storeCategories={Array.from(new Set(products.map(p => p.category).filter(Boolean)))}
            getCategoryCount={(cat) => products.filter(p => p.category === cat).length}
            filteredCount={filteredProducts.length}
            isRTL={isRTL}
          />

          {visibleProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200/60 shadow-sm space-y-3">
              <SearchX className="w-12 h-12 text-zinc-400 mx-auto" />
              <h3 className="text-lg font-bold text-zinc-800">{d('emptyStore')}</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">{d('emptyDesc')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {hasMore && (
                <div className="text-center pt-8">
                  <button
                    onClick={() => setDisplayLimit(prev => prev + LOAD_MORE_LIMIT)}
                    className="px-8 py-3 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-2xl font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer hover:scale-102"
                  >
                    {d('loadMore')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <StoreAboutView
          storeInfo={storeInfo}
          isOwner={isOwner}
          isEditingAbout={isEditingAbout}
          setIsEditingAbout={setIsEditingAbout}
          savingAbout={savingAbout}
          editForm={editForm}
          setEditForm={setEditForm}
          saveAboutInfo={handleSaveAbout}
          totalCount={totalCount ?? products.length}
          isRTL={isRTL}
          d={d}
          t={t}
        />
      )}

      {/* Modals */}
      {adjustingImage && (
        <ImageAdjusterModal
          src={adjustingImage.src}
          type={adjustingImage.type}
          isRTL={isRTL}
          onClose={() => setAdjustingImage(null)}
          onConfirm={handleSaveAdjustedImage}
        />
      )}

      {showConfirm && (
        <ConfirmModal
          isOpen={showConfirm}
          title="Ne plus suivre cette boutique ?"
          message="Vous ne recevrez plus les notifications sur les nouveautés et promotions de ce vendeur."
          confirmText="Se désabonner"
          cancelText="Annuler"
          onConfirm={() => executeFollowAction(false)}
          onClose={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};
