import React from 'react';
import { Truck, ShieldCheck, Clock, RotateCcw } from 'lucide-react';
import { PublicStoreInfo } from '../../pages/Public/StoreProfile';

interface StoreTrustBadgesProps {
  storeInfo: PublicStoreInfo;
}

export const StoreTrustBadges: React.FC<StoreTrustBadgesProps> = ({ storeInfo }) => {
  const prepTime = storeInfo.avgPreparationTime || 'Expédition sous 24h';
  const returnPolicy = storeInfo.returnPolicy || 'Retours sous 7 jours';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 py-3 sm:py-4">
      <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
          <Truck className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black text-slate-900 leading-tight">69 Wilayas</p>
          <p className="text-[10px] text-slate-500 truncate">Livraison à domicile</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black text-slate-900 leading-tight">Vendeur Vérifié</p>
          <p className="text-[10px] text-slate-500 truncate">Paiement à la livraison</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black text-slate-900 leading-tight">Préparation Rapide</p>
          <p className="text-[10px] text-slate-500 truncate">{prepTime}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <RotateCcw className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black text-slate-900 leading-tight">Garantie & Retour</p>
          <p className="text-[10px] text-slate-500 truncate">{returnPolicy}</p>
        </div>
      </div>
    </div>
  );
};
