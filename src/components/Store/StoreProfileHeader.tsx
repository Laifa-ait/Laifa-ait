import React from 'react';
import { ShieldCheck, MapPin, Star, UserPlus, UserCheck, Users, Camera, Sparkles } from 'lucide-react';
import { OptimizedImage } from '../ui/OptimizedImage';
import { Spinner } from '../ui/Spinner';
import { PublicStoreInfo } from '../../pages/Public/StoreProfile';
import { getOptimizedImageUrl } from '../../utils/imageUtils';

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
  const coverUrl =
    storeInfo.bannerUrl ||
    storeInfo.coverUrl ||
    storeInfo.coverImage ||
    storeInfo.banner ||
    storeInfo.sellerBanner ||
    storeInfo.storeBanner ||
    storeInfo.bannerImage;

  const logoUrl =
    storeInfo.logoUrl ||
    storeInfo.avatarUrl ||
    storeInfo.photoURL ||
    storeInfo.photoUrl ||
    storeInfo.avatar;

  const shopName = storeInfo.shopName || storeInfo.displayName || storeInfo.brand || 'Boutique Olmart';
  const initial = (shopName || 'O').charAt(0).toUpperCase();

  return (
    <div className="relative mb-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden transition-all">
      {/* 1. Cover Banner */}
      <div className="relative h-40 sm:h-56 md:h-64 w-full bg-slate-900 group overflow-hidden">
        {coverUrl ? (
          <OptimizedImage
            src={getOptimizedImageUrl(coverUrl, 1400)}
            alt={shopName}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
            fallbackSrc="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.15),transparent_70%)]" />
            <div className="flex items-center gap-2 text-slate-400 font-extrabold text-xs sm:text-sm tracking-widest uppercase z-10">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Boutique Officielle Olmart</span>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {isOwner && (
          <label className="absolute top-3 right-3 sm:top-4 sm:right-4 cursor-pointer z-20">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onBannerSelect}
              disabled={uploadingBanner}
            />
            <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-xl text-xs font-semibold border border-white/20 transition-all flex items-center gap-1.5 shadow-md">
              {uploadingBanner ? <Spinner size="sm" className="text-white" /> : <Camera className="w-3.5 h-3.5 text-orange-400" />}
              <span className="hidden sm:inline">{uploadingBanner ? d('uploadingCover') : d('editCover')}</span>
            </div>
          </label>
        )}
      </div>

      {/* 2. Store Info Body */}
      <div className="px-4 sm:px-8 pb-6 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
          {/* Avatar & Identité */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-3.5 sm:gap-5">
            {/* Avatar Squircle */}
            <div className="relative group shrink-0 self-start">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-white p-1 shadow-lg border-2 border-white ring-1 ring-slate-200 overflow-hidden relative z-10">
                {logoUrl ? (
                  <OptimizedImage
                    src={getOptimizedImageUrl(logoUrl, 300)}
                    alt={shopName}
                    className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
                    fallbackSrc="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-2xl sm:text-4xl flex items-center justify-center rounded-xl sm:rounded-2xl shadow-inner">
                    {initial}
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
                  <div className="text-white text-center p-1">
                    {uploadingLogo ? <Spinner size="md" className="mx-auto text-white" /> : <Camera className="w-5 h-5 mx-auto mb-1 text-orange-400" />}
                    <span className="text-[10px] font-semibold block">{uploadingLogo ? '...' : d('editProfile')}</span>
                  </div>
                </label>
              )}
            </div>

            {/* Titre & Metadonnées */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {shopName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-black shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Vendeur Vérifié</span>
                </span>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium text-slate-500 flex-wrap">
                {storeInfo.wilaya && (
                  <span className="flex items-center gap-1 text-slate-700 font-semibold bg-slate-100/90 px-2 py-0.5 rounded-md">
                    <MapPin className="w-3.5 h-3.5 text-orange-600" />
                    {storeInfo.wilaya}
                  </span>
                )}
                {storeInfo.rating != null && storeInfo.rating > 0 ? (
                  <span className="flex items-center gap-1 text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {storeInfo.rating.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                    Nouveau Vendeur
                  </span>
                )}
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <strong className="text-slate-900 font-bold">{storeInfo.followersCount || 0}</strong> {d('subscribers')}
                </span>
              </div>
            </div>
          </div>

          {/* Action S'abonner */}
          <div className="flex items-center gap-2 self-start sm:self-end shrink-0 pt-1 sm:pt-0">
            {!isOwner && (
              <button
                type="button"
                onClick={onFollowToggle}
                disabled={followLoading}
                className={`px-5 py-2.5 sm:px-6 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                  isFollowing
                    ? 'bg-slate-100 text-slate-700 border border-slate-300/80 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                    : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20 shadow-md active:scale-98'
                }`}
              >
                {followLoading ? (
                  <Spinner size="sm" className={isFollowing ? 'text-slate-600' : 'text-white'} />
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

        {/* Description / Bio */}
        {(storeInfo.shopDescription || storeInfo.description) && (
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-600 max-w-4xl leading-relaxed">
            {storeInfo.shopDescription || storeInfo.description}
          </div>
        )}
      </div>
    </div>
  );
};
