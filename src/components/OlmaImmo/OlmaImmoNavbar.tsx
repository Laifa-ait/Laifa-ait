import React, { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutGrid } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOlmaBookingsCount } from '../../hooks/useOlmaBookingsCount';
import { UnifiedMessagingDrawer } from '../Chat/UnifiedMessagingDrawer';
import { SuperAppSwitcherModal } from '../common/SuperAppSwitcherModal';
import { OlmaImmoUserMenu } from './OlmaImmoUserMenu';
import { OlmaLanguageSelector } from '../common/OlmaLanguageSelector';

export const OlmaImmoNavbar: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const location = useLocation();
  const { currentUser, openAuthModal } = useAuth();
  const { activeBookingsCount } = useOlmaBookingsCount();
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const handleOpenMessaging = useCallback(() => {
    if (!currentUser) {
      if (openAuthModal) openAuthModal();
      else window.dispatchEvent(new CustomEvent('auth:openModal', { detail: { mode: 'login' } }));
      return;
    }
    setIsMessagingOpen(true);
  }, [currentUser, openAuthModal]);

  const isExplore = location.pathname === '/immo' && !location.search;
  const isBuy = location.search.includes('type=sale');
  const isRent = location.search.includes('type=rent_long');
  const isVacation = location.search.includes('type=rent_short');

  return (
    <header className="sticky top-0 z-40 bg-[#F8FAFC]/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(30,58,138,0.03)]">
      <div className="max-w-[1920px] 2xl:max-w-[2100px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Left: Minimalist OLMA Brand Text Logo & Applications Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/immo" className="flex items-center gap-1.5 group">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E293B] font-['Playfair_Display',serif] select-none">
                OLMA
              </span>
              <span className="text-[11px] sm:text-xs font-bold tracking-widest text-slate-500 uppercase">
                IMMO
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setIsSwitcherOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100/90 text-slate-700 hover:text-slate-950 hover:bg-slate-200/80 border border-slate-200/70 transition-all cursor-pointer shadow-2xs group"
              title="Ouvrir les applications Olmart"
              aria-label="Applications Olmart"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-amber-600 group-hover:scale-105 transition-transform" />
              <span>{t('nav_applications')}</span>
            </button>
          </div>

          {/* Center: Travel Pill Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center p-1 bg-slate-100/80 rounded-full border border-slate-200/60 shadow-2xs">
            <Link
              to="/immo"
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                isExplore
                  ? 'bg-[#1E293B] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              {t('nav_explorer')}
            </Link>

            <Link
              to="/immo?type=rent_short"
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5 relative ${
                isVacation
                  ? 'bg-[#1E293B] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <span>{t('nav_stays')}</span>
              {activeBookingsCount > 0 && (
                <span className="min-w-4 h-4 bg-[#059669] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center px-1 shadow-2xs">
                  {activeBookingsCount > 99 ? '99+' : activeBookingsCount}
                </span>
              )}
            </Link>

            <Link
              to="/immo?type=sale"
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                isBuy
                  ? 'bg-[#1E293B] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              {t('nav_buy')}
            </Link>

            <Link
              to="/immo?type=rent_long"
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                isRent
                  ? 'bg-[#1E293B] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              {t('nav_rent')}
            </Link>
          </nav>

          {/* Right: Language Selector + Minimalist User Profile Avatar */}
          <div className="flex items-center gap-2">
            <OlmaLanguageSelector variant="compact" />

            <Link
              to="/immo/owner"
              id="olma-immo-nav-owner-link"
              className="text-xs font-medium text-slate-700 hover:text-slate-950 px-3.5 py-2 rounded-full border border-slate-200 hover:border-slate-300 transition-all hidden xl:inline-flex items-center cursor-pointer"
            >
              <span>{t('nav_publish_property')}</span>
            </Link>

            {/* Minimalist Profile Avatar in cool grey circle */}
            <OlmaImmoUserMenu onOpenMessaging={handleOpenMessaging} />
          </div>
        </div>
      </div>

      {/* Unified Messaging Drawer Modal */}
      {isMessagingOpen && (
        <UnifiedMessagingDrawer
          isOpen={isMessagingOpen}
          onClose={() => setIsMessagingOpen(false)}
        />
      )}

      {/* Super-App Switcher Modal */}
      <SuperAppSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />
    </header>
  );
});

OlmaImmoNavbar.displayName = 'OlmaImmoNavbar';
