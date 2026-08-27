import React from 'react';
import { Store } from 'lucide-react';
import { ALGERIA_REGIONS } from '../../data/algeriaRegions';
import { PublicStoreInfo } from '../../pages/Public/StoreProfile';
import { StoreEngagementsCard } from './StoreEngagementsCard';

interface StoreAboutViewProps {
  storeInfo: PublicStoreInfo;
  isOwner: boolean;
  isEditingAbout: boolean;
  setIsEditingAbout: (editing: boolean) => void;
  savingAbout: boolean;
  editForm: {
    shopName: string;
    shopDescription: string;
    wilaya: string;
    legalStatus: string;
    avgPreparationTime: string;
    returnPolicy: string;
  };
  setEditForm: React.Dispatch<
    React.SetStateAction<{
      shopName: string;
      shopDescription: string;
      wilaya: string;
      legalStatus: string;
      avgPreparationTime: string;
      returnPolicy: string;
    }>
  >;
  saveAboutInfo: () => Promise<void>;
  totalCount: number | null;
  isRTL: boolean;
  d: (key: string) => string;
  t: (key: string, defaultValue?: string) => string;
}

export const StoreAboutView: React.FC<StoreAboutViewProps> = ({
  storeInfo,
  isOwner,
  isEditingAbout,
  setIsEditingAbout,
  savingAbout,
  editForm,
  setEditForm,
  saveAboutInfo,
  totalCount,
  isRTL,
  d,
  t,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in text-left">
      {/* Left Column: Brand Story */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white border border-zinc-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-3">
              <Store className="w-5 h-5 text-orange-500" />
              <h3 className="text-sm font-sans font-bold uppercase text-zinc-900 tracking-wider">
                {isRTL ? 'عن العلامة التجارية' : `La Boutique ${storeInfo.shopName || 'Boutique'}`}
              </h3>
            </div>
            {isOwner && (
              <button
                onClick={() => setIsEditingAbout(!isEditingAbout)}
                className="text-[10px] font-sans font-bold uppercase tracking-widest text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg transition-colors border border-orange-100"
              >
                {isEditingAbout ? (isRTL ? 'إلغاء التعديل' : 'Annuler') : isRTL ? 'تعديل' : 'Modifier'}
              </button>
            )}
          </div>

          {isEditingAbout ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-sans font-bold tracking-widest text-zinc-500">
                  {isRTL ? 'اسم المتجر' : 'Nom de la boutique'}
                </label>
                <input
                  type="text"
                  value={editForm.shopName}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, shopName: e.target.value }))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  placeholder={isRTL ? 'اسم متجرك...' : 'Nom de votre boutique...'}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-sans font-bold tracking-widest text-zinc-500">
                  {isRTL ? 'وصف المتجر' : 'Description de la boutique'}
                </label>
                <textarea
                  value={editForm.shopDescription}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, shopDescription: e.target.value }))}
                  rows={4}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                  placeholder={isRTL ? 'وصف متجرك...' : 'Décrivez votre boutique...'}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-sans font-bold tracking-widest text-zinc-500">
                  {isRTL ? 'الولاية' : 'Wilaya'}
                </label>
                <select
                  value={editForm.wilaya}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, wilaya: e.target.value }))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                >
                  <option value="">{isRTL ? 'اختر الولاية' : 'Sélectionnez votre Wilaya'}</option>
                  {Object.values(ALGERIA_REGIONS).map((w) => (
                    <option key={w.code} value={`${w.code} ${w.name}`}>
                      {w.code} {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed font-semibold">
              {storeInfo.shopDescription ||
                (isRTL
                  ? 'مرحبًا بكم في متجرنا الرسمي على Olma. لقد تم التحقق من متجرنا لتزويدك بأفضل السلع والخدمات بأمان تام.'
                  : "Bienvenue dans notre boutique officielle sur Olma. Découvrez notre rigoureuse sélection d'articles d'excellence aux meilleurs prix du marché.")}
            </p>
          )}

          <div className="space-y-3 pt-2">
            {!isEditingAbout && (
              <div className="flex justify-between items-center text-xs border-b border-zinc-50 pb-2.5">
                <span className="text-zinc-400 font-bold">{isRTL ? 'موقع البائع' : "Région d'expédition"}</span>
                <span className="text-zinc-800 font-extrabold">{storeInfo.wilaya || 'Algérie'}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-xs border-b border-zinc-50 pb-2.5">
              <span className="text-zinc-400 font-bold">{isRTL ? 'تاريخ الانضمام' : 'Partenaire depuis'}</span>
              <span className="text-zinc-800 font-extrabold">2026</span>
            </div>
            <div className="flex justify-between items-center text-xs border-b border-zinc-50 pb-2.5">
              <span className="text-zinc-400 font-bold">{isRTL ? 'إجمالي المنتجات' : "Total d'articles actifs"}</span>
              <span className="text-zinc-800 font-extrabold">{totalCount || 0}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400 font-bold">{isRTL ? 'المتابعون' : 'Abonnés vérifiés'}</span>
              <span className="text-indigo-600 font-extrabold">{storeInfo.followersCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Policies and Seals */}
      <div className="lg:col-span-7 space-y-6">
        <StoreEngagementsCard
          storeInfo={storeInfo}
          isOwner={isOwner}
          isEditingAbout={isEditingAbout}
          setIsEditingAbout={setIsEditingAbout}
          savingAbout={savingAbout}
          editForm={editForm}
          setEditForm={setEditForm}
          saveAboutInfo={saveAboutInfo}
          isRTL={isRTL}
          d={d}
          t={t}
        />
      </div>
    </div>
  );
};
