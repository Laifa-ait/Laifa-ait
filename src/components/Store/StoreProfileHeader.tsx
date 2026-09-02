import React from "react";
import { ShieldCheck, MapPin, Star, UserPlus, UserCheck, Users, Camera } from "lucide-react";
import { OptimizedImage } from "../ui/OptimizedImage";
import { Spinner } from "../ui/Spinner";
import { PublicStoreInfo } from "../../pages/Public/StoreProfile";
import { getOptimizedImageUrl } from "../../utils/imageUtils";

interface StoreProfileHeaderProps {
  storeInfo: PublicStoreInfo;
  isOwner: boolean;
  uploadingBanner: boolean;
  uploadingLogo: boolean;
  isFollowing: boolean;
  followLoading: boolean;
  d: (key: string) => string;
  onBannerSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFollowToggle: () => void;
}

export const StoreProfileHeader: React.FC<StoreProfileHeaderProps> = ({
  storeInfo,
  isOwner,
  uploadingBanner,
  uploadingLogo,
  isFollowing,
  followLoading,
  d,
  onBannerSelect,
  onLogoSelect,
  onFollowToggle,
}) => {
  const coverUrl = storeInfo.bannerUrl || storeInfo.coverUrl || storeInfo.coverImage || storeInfo.banner || storeInfo.sellerBanner || storeInfo.storeBanner || storeInfo.bannerImage;
  const logoUrl = storeInfo.logoUrl || storeInfo.avatarUrl || storeInfo.photoURL || storeInfo.photoUrl || storeInfo.avatar;

  return (
    <div className="relative mb-6 sm:mb-8 rounded-3xl sm:rounded-[2.5rem] bg-white border border-zinc-200/60 shadow-sm overflow-hidden transition-all duration-300">
      <div className="relative h-44 sm:h-64 lg:h-72 w-full bg-zinc-900 group overflow-hidden">
        {coverUrl ? (
          <OptimizedImage
            src={getOptimizedImageUrl(coverUrl, 1400)}
            alt={storeInfo.shopName || storeInfo.displayName || "Boutique Olmart"}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            fallbackSrc="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-850 to-zinc-950 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(234,88,12,0.15),transparent_50%)]" />
            <span className="text-zinc-600 font-bold text-sm tracking-widest uppercase z-10">Olmart Marketplace</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

        {isOwner && (
          <label className="absolute top-4 right-4 sm:top-6 sm:right-6 cursor-pointer z-20">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onBannerSelect}
              disabled={uploadingBanner}
            />
            <div className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-xl text-xs font-medium border border-white/20 transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95">
              {uploadingBanner ? <Spinner size="sm" className="text-white" /> : <Camera className="w-4 h-4 text-orange-400" />}
              <span className="hidden sm:inline">{uploadingBanner ? d('uploadingCover') : d('editCover')}</span>
            </div>
          </label>
        )}
      </div>

      <div className="px-5 sm:px-8 lg:px-10 pb-6 sm:pb-8 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 -mt-16 sm:-mt-20 mb-6">
          <div className="flex items-end gap-4 sm:gap-6">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-2xl sm:rounded-3xl bg-white p-1.5 sm:p-2 shadow-xl border border-zinc-200/80 overflow-hidden relative z-10">
                {logoUrl ? (
                  <OptimizedImage
                    src={getOptimizedImageUrl(logoUrl, 300)}
                    alt={storeInfo.shopName || storeInfo.displayName || "Boutique Olmart"}
                    className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
                    fallbackSrc="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300"
                  />
                ) : (
                  <div className="w-full h-full bg-orange-50 text-orange-600 font-black text-2xl sm:text-4xl flex items-center justify-center rounded-xl sm:rounded-2xl border border-orange-100">
                    {(storeInfo.shopName || storeInfo.displayName || 'O').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {isOwner && (
                <label className="absolute inset-0 cursor-pointer z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-2xl sm:rounded-3xl backdrop-blur-xs">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onLogoSelect}
                    disabled={uploadingLogo}
                  />
                  <div className="text-white text-center p-2">
                    {uploadingLogo ? <Spinner size="md" className="mx-auto text-white" /> : <Camera className="w-6 h-6 mx-auto mb-1 text-orange-400" />}
                    <span className="text-[10px] font-medium block">{uploadingLogo ? '...' : d('editProfile')}</span>
                  </div>
                </label>
              )}
            </div>

            <div className="mb-1 sm:mb-2 space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-3xl font-black text-zinc-900 tracking-tight leading-tight truncate">
                  {storeInfo.shopName || storeInfo.displayName || storeInfo.brand || 'Boutique Olmart'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[11px] font-bold shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Vendeur Vérifié</span>
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-zinc-500 flex-wrap pt-0.5">
                {storeInfo.wilaya && (
                  <span className="flex items-center gap-1 text-zinc-600 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-orange-600" />
                    {storeInfo.wilaya}
                  </span>
                )}
                {storeInfo.rating != null && storeInfo.rating > 0 && (
                  <span className="flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {storeInfo.rating.toFixed(1)}
                  </span>
                )}
                <span className="flex items-center gap-1 text-zinc-600 font-medium">
                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                  <strong className="text-zinc-900">{storeInfo.followersCount || 0}</strong> {d('subscribers')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:mb-2 shrink-0">
            {!isOwner && (
              <button
                onClick={onFollowToggle}
                disabled={followLoading}
                className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 shadow-sm cursor-pointer ${
                  isFollowing
                    ? 'bg-zinc-100 text-zinc-700 border border-zinc-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                    : 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20 shadow-md hover:scale-102 active:scale-98'
                }`}
              >
                {followLoading ? (
                  <Spinner size="sm" className={isFollowing ? 'text-zinc-600' : 'text-white'} />
                ) : isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Abonné</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>S'abonner</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {(storeInfo.shopDescription || storeInfo.description) && (
          <p className="text-sm text-zinc-600 max-w-4xl leading-relaxed border-t border-zinc-100 pt-4 font-normal">
            {storeInfo.shopDescription || storeInfo.description}
          </p>
        )}
      </div>
    </div>
  );
};
