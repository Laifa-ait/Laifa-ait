import React from 'react';
import { LogOut, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { OlmaLanguageSelector } from '../../common/OlmaLanguageSelector';

interface DrawerFooterProps {
  onLogout: () => void;
}

export const DrawerFooter: React.FC<DrawerFooterProps> = ({ onLogout }) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();

  return (
    <div className="p-4 bg-slate-50 border-t border-slate-200/90 shrink-0 space-y-3">
      {/* Language Selector (Drawer Segmented Control) */}
      <OlmaLanguageSelector variant="drawer" />

      {currentUser && (
        <button
          type="button"
          onClick={onLogout}
          className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200/80 hover:border-red-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
        >
          <LogOut className="w-4 h-4 text-slate-500 hover:text-red-600" />
          <span>{t('artisan_drawer_logout')}</span>
        </button>
      )}

      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1 font-medium">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-amber-500" />
          <span>58 Wilayas d&apos;Algérie</span>
        </span>
        <span>Olma Artisans v2.4</span>
      </div>
    </div>
  );
};
