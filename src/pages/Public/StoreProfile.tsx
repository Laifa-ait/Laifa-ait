import React from 'react';
import { Store, Package, SearchX, AlertTriangle } from 'lucide-react';
import { ProductCard } from '../../components/Product/ProductCard';
import { StoreProductsFilter } from '../../components/Store/StoreProductsFilter';
import { StoreAboutView } from '../../components/Store/StoreAboutView';
import { StoreProfileHeader } from '../../components/Store/StoreProfileHeader';
import { StoreBoutiqueNavbar } from '../../components/Store/StoreBoutiqueNavbar';
import { StoreTrustBadges } from '../../components/Store/StoreTrustBadges';
import { StoreProfileModals } from '../../components/Store/StoreProfileModals';
import { StoreLoadingState, StoreErrorState } from '../../components/Store/StoreProfileStates';
import { SellerCouponBanner } from '../../components/Shop/SellerCouponBanner';
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
    handleSaveAbout,
    errorType,
    productsError,
    reloadStore
  } = useStoreProfile();

  if (loading) {
    return <StoreLoadingState message={d('loading')} />;
  }

  if (!storeInfo) {
    return (
      <StoreErrorState
        errorType={errorType}
        d={d}
        onRetry={reloadStore}
        onBack={() => navigate('/shop')}
      />
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
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* 1. Dedicated Boutique Top Navigation (Replaces Global Bars) */}
      <StoreBoutiqueNavbar storeInfo={storeInfo} />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* 2. Store Header Hero */}
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

        {/* 3. Trust Highlights row */}
        <StoreTrustBadges storeInfo={storeInfo} />

        {/* 4. Discrete Seller Promo Coupon Banner */}
        <SellerCouponBanner
          sellerId={storeInfo.sellerId || storeInfo.id || storeInfo.uid}
          className="my-4"
        />

        {/* 5. Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6 pb-2.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-4 sm:px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'products'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{d('articles')}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'products' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {totalCount ?? products.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`px-4 sm:px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'about'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>À propos</span>
          </button>
        </div>

        {/* 6. Active Tab Content */}
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

            {productsError ? (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-red-200/60 shadow-xs space-y-3">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800">{d('productsError')}</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">{d('productsErrorDesc')}</p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={reloadStore}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-all cursor-pointer"
                  >
                    <span>{d('retry')}</span>
                  </button>
                </div>
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/60 shadow-xs space-y-3">
                <SearchX className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800">{d('emptyStore')}</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">{d('emptyDesc')}</p>
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
                      type="button"
                      onClick={() => setDisplayLimit(prev => prev + LOAD_MORE_LIMIT)}
                      className="px-8 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer hover:scale-102"
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
      </div>

      {/* Modals */}
      <StoreProfileModals
        adjustingImage={adjustingImage}
        setAdjustingImage={setAdjustingImage}
        showConfirm={showConfirm}
        setShowConfirm={setShowConfirm}
        isRTL={isRTL}
        onSaveAdjustedImage={handleSaveAdjustedImage}
        onExecuteFollowAction={executeFollowAction}
      />
    </div>
  );
};
