import React from 'react';
import { TFunction } from 'i18next';
import { ShieldCheck, Building2, Truck, Undo2 } from 'lucide-react';
import { PublicStoreInfo } from '../../pages/Public/StoreProfile';

interface StoreEngagementsCardProps {
  storeInfo: PublicStoreInfo;
  isOwner: boolean;
  isEditingAbout: boolean;
  setIsEditingAbout: (editing: boolean) => void;
  savingAbout: boolean;
  editForm: {
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
  isRTL: boolean;
  d: (key: string) => string;
  t: TFunction;
}

export const StoreEngagementsCard: React.FC<StoreEngagementsCardProps> = ({
  storeInfo,
  isOwner,
  isEditingAbout,
  setIsEditingAbout,
  savingAbout,
  editForm,
  setEditForm,
  saveAboutInfo,
  isRTL,
  d,
  t,
}) => {
  return (
    <div className="bg-white border border-zinc-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <h3 className="text-sm font-sans font-bold uppercase text-zinc-900 tracking-wider">
            {isRTL ? 'التزامات المتجر وخدمة العملاء' : 'Engagements & Service Client'}
          </h3>
        </div>
        {isOwner && (
          <button
            onClick={() => setIsEditingAbout(!isEditingAbout)}
            className="text-[10px] font-sans font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors border border-emerald-100"
          >
            {isEditingAbout ? (isRTL ? 'إلغاء التعديل' : 'Annuler') : isRTL ? 'تعديل' : 'Modifier'}
          </button>
        )}
      </div>

      {isEditingAbout ? (
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-sans font-bold tracking-widest text-zinc-500">
              {isRTL ? 'الوضع القانوني (اختياري)' : 'Statut Légal (Optionnel)'}
            </label>
            <input
              type="text"
              value={editForm.legalStatus}
              onChange={(e) => setEditForm((prev) => ({ ...prev, legalStatus: e.target.value }))}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
              placeholder="SARL, EURL, Auto-entrepreneur..."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-sans font-bold tracking-widest text-zinc-500">
              {isRTL ? 'متوسط وقت التحضير' : 'Délai moyen de préparation'}
            </label>
            <input
              type="text"
              value={editForm.avgPreparationTime}
              onChange={(e) => setEditForm((prev) => ({ ...prev, avgPreparationTime: e.target.value }))}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
              placeholder="ex: 24 - 48 heures"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-sans font-bold tracking-widest text-zinc-500">
              {isRTL ? 'سياسة الإرجاع' : 'Politique de retour et garantie'}
            </label>
            <textarea
              value={editForm.returnPolicy}
              onChange={(e) => setEditForm((prev) => ({ ...prev, returnPolicy: e.target.value }))}
              rows={3}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
              placeholder={isRTL ? 'أدخل سياسة الإرجاع...' : 'Saisissez votre politique...'}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={saveAboutInfo}
              disabled={savingAbout}
              className="px-8 py-3.5 bg-zinc-950 text-white hover:bg-zinc-800 rounded-xl font-sans font-bold text-[11px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
            >
              {savingAbout
                ? isRTL
                  ? 'جاري الحفظ...'
                  : 'Enregistrement...'
                : isRTL
                ? 'حفظ التغييرات'
                : 'Enregistrer les modifications'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {storeInfo.legalStatus && (
            <div className="flex gap-4 p-4 rounded-2xl bg-zinc-50/50 border border-zinc-100">
              <div className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center shrink-0 shadow-sm">
                <Building2 className="w-4 h-4 text-zinc-500" />
              </div>
              <div>
                <h4 className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-wider">
                  {d('legalStatus')}
                </h4>
                <p className="text-xs font-sans font-bold text-zinc-800 mt-0.5">{storeInfo.legalStatus}</p>
                <p className="text-[11px] text-zinc-400 font-medium mt-1">
                  {t(
                    'store_profile.verified_desc',
                    "Vendeur certifié ayant fourni ses documents d'immatriculation officiels."
                  )}
                </p>
              </div>
            </div>
          )}

          {storeInfo.avgPreparationTime && (
            <div className="flex gap-4 p-4 rounded-2xl bg-orange-50/20 border border-orange-100/50">
              <div className="w-10 h-10 rounded-xl bg-white border border-orange-100/50 flex items-center justify-center shrink-0 shadow-sm">
                <Truck className="w-4 h-4 text-orange-500" />
              </div>
              <div className="flex-1">
                <h4 className="text-[10px] font-sans font-bold text-orange-700 uppercase tracking-wider">
                  {d('prepTime')}
                </h4>
                <p className="text-xs font-sans font-bold text-zinc-800 mt-0.5">
                  {storeInfo.avgPreparationTime}
                </p>
                <p className="text-[11px] text-zinc-500 font-semibold mt-1">
                  {t(
                    'store_profile.dispatch_desc',
                    "Délai estimé pour confier votre commande à l'agence d'expédition agréée."
                  )}
                </p>
              </div>
            </div>
          )}

          {storeInfo.returnPolicy && (
            <div className="flex gap-4 p-4 rounded-2xl bg-blue-50/20 border border-blue-100/50">
              <div className="w-10 h-10 rounded-xl bg-white border border-blue-100/50 flex items-center justify-center shrink-0 shadow-sm">
                <Undo2 className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <h4 className="text-[10px] font-sans font-bold text-blue-700 uppercase tracking-wider">
                  {d('returnPolicy')}
                </h4>
                <p className="text-xs font-sans font-bold text-zinc-800 leading-relaxed mt-1 italic">
                  "{storeInfo.returnPolicy}"
                </p>
                <p className="text-[11px] text-zinc-400 font-medium mt-2">
                  {t(
                    'store_profile.guarantee_desc',
                    "La conformité de la marchandise est garantie selon la législation algérienne sur le commerce électronique."
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
