import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, FileText, Star, Compass, ArrowRight } from 'lucide-react';
import { getFavoriteArtisans } from '../../../services/artisanHistory';
import { fetchClientMyRequests } from '../../../services/artisan.api';

interface DrawerQuickActionsProps {
  onClose: () => void;
  isLoggedIn: boolean;
}

export const DrawerQuickActions: React.FC<DrawerQuickActionsProps> = ({
  onClose,
  isLoggedIn,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [quotesCount, setQuotesCount] = useState<number>(0);
  const [favCount, setFavCount] = useState<number>(0);

  useEffect(() => {
    setFavCount(getFavoriteArtisans().length);
    if (isLoggedIn) {
      fetchClientMyRequests()
        .then((q) => setQuotesCount(q.length))
        .catch(() => setQuotesCount(0));
    }
  }, [isLoggedIn]);

  return (
    <div className="space-y-3">
      {/* Emergency 24/7 Banner */}
      <button
        type="button"
        onClick={() => {
          onClose();
          navigate('/artisans?urgency=true');
        }}
        className="w-full p-3 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50/70 border border-rose-200/80 hover:border-rose-300 transition-all flex items-center justify-between text-left group cursor-pointer shadow-2xs"
      >
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-rose-500 text-white shadow-xs shrink-0 flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-rose-950">
                {t('artisan_drawer_emergency_title')}
              </span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
            </div>
            <p className="text-[11px] text-rose-800 font-medium">
              {t('artisan_drawer_emergency_desc')}
            </p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* 3 Quick KPIs Grid */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate('/artisans');
          }}
          className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200/70 hover:border-amber-300 transition-all flex flex-col items-center text-center cursor-pointer group"
        >
          <Compass className="w-4 h-4 text-slate-700 group-hover:text-amber-600 mb-1 transition-colors" />
          <span className="text-[11px] font-bold text-slate-800">
            {t('artisan_drawer_explorer', 'Explorer')}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            {t('artisan_drawer_58_wilayas', '69 Wilayas')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            navigate(isLoggedIn ? '/artisans/mes-demandes' : '/auth?redirect=/artisans/mes-demandes');
          }}
          className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200/70 hover:border-amber-300 transition-all flex flex-col items-center text-center cursor-pointer group relative"
        >
          <FileText className="w-4 h-4 text-slate-700 group-hover:text-amber-600 mb-1 transition-colors" />
          <span className="text-[11px] font-bold text-slate-800">
            {t('artisan_drawer_my_quotes', 'Mes Devis')}
          </span>
          <span className="text-[10px] text-amber-700 font-black">
            {quotesCount > 0
              ? `${quotesCount} ${t('artisan_drawer_active', 'actif')}${quotesCount > 1 ? 's' : ''}`
              : `0 ${t('artisan_drawer_active', 'actif')}`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            navigate('/artisans');
          }}
          className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200/70 hover:border-amber-300 transition-all flex flex-col items-center text-center cursor-pointer group"
        >
          <Star className="w-4 h-4 text-amber-500 fill-amber-500 mb-1" />
          <span className="text-[11px] font-bold text-slate-800">
            {t('artisan_drawer_favorites', 'Favoris')}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            {favCount} {t('artisan_drawer_saved', 'sauv.')}
          </span>
        </button>
      </div>
    </div>
  );
};
