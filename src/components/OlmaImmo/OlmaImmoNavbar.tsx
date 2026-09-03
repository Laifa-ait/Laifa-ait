import React, { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, MessageSquare, Sparkles, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UnifiedMessagingDrawer } from '../Chat/UnifiedMessagingDrawer';
import { SuperAppSwitcherModal } from '../common/SuperAppSwitcherModal';
import { NotificationCenter } from '../NotificationCenter';
import { OlmaImmoTopUtilityBar } from './OlmaImmoTopUtilityBar';
import { OlmaImmoUserMenu } from './OlmaImmoUserMenu';

export const OlmaImmoNavbar: React.FC = React.memo(() => {
  const location = useLocation();
  const { currentUser, openAuthModal } = useAuth();
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
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-xl border-b border-stone-200/80 shadow-[0_4px_20px_-4px_rgba(28,25,23,0.03)]">
      {/* 1-Click Cross-Vertical Super-App Bar (Desktop + Mobile) */}
      <OlmaImmoTopUtilityBar onOpenSwitcher={() => setIsSwitcherOpen(true)} />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Left: Brand Identity with Algerian Architectural Heritage */}
          <Link to="/immo" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-[#0D281E] text-[#EBDCB8] flex items-center justify-center shadow-md border border-[#EBDCB8]/30 group-hover:scale-105 transition-transform duration-300">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#0D281E] font-['Playfair_Display',serif] block leading-none">
                OLMA <span className="text-amber-700">IMMO</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-stone-500 tracking-wider uppercase mt-0.5 sm:mt-1 block">
                Algérie · Immobilier & Séjours
              </span>
            </div>
          </Link>

          {/* Center: Travel Pill Navigation (Desktop & Tablet) */}
          <nav className="hidden lg:flex items-center p-1.5 bg-stone-100/90 rounded-full border border-stone-200/80 shadow-2xs">
            <Link
              to="/immo"
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-200 ${
                isExplore
                  ? 'bg-[#0D281E] text-[#EBDCB8] shadow-xs'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-white/80'
              }`}
            >
              Explorer
            </Link>

            <Link
              to="/immo?type=rent_short"
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                isVacation
                  ? 'bg-[#0D281E] text-[#EBDCB8] shadow-xs'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-white/80'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isVacation ? 'text-amber-400' : 'text-amber-600'}`} />
              <span>Séjours & Vacances</span>
            </Link>

            <Link
              to="/immo?type=sale"
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-200 ${
                isBuy
                  ? 'bg-[#0D281E] text-[#EBDCB8] shadow-xs'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-white/80'
              }`}
            >
              Acheter
            </Link>

            <Link
              to="/immo?type=rent_long"
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all duration-200 ${
                isRent
                  ? 'bg-[#0D281E] text-[#EBDCB8] shadow-xs'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-white/80'
              }`}
            >
              Louer
            </Link>
          </nav>

          {/* Right: Quick actions, Synchronized Session, Notifications and Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <Link
              to="/immo/owner"
              id="olma-immo-nav-owner-link"
              className="text-xs font-bold text-[#EBDCB8] bg-[#0D281E] hover:bg-[#153e31] px-4 py-2.5 rounded-full transition-all duration-200 hidden xl:inline-flex items-center gap-2 border border-[#EBDCB8]/30 shadow-sm active:scale-95 cursor-pointer"
            >
              <span>+ Publier une annonce</span>
            </Link>

            <div className="flex items-center gap-1 sm:gap-2">
              {/* Favoris */}
              <Link
                to="/immo?favorites=true"
                id="olma-immo-desktop-favorites-link"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-600 hover:text-rose-500 transition-colors shadow-2xs"
                title="Favoris"
                aria-label="Favoris"
              >
                <Heart className="w-4 h-4" />
              </Link>

              {/* Real-Time Synced Notifications Center */}
              <div id="olma-immo-notification-wrapper" className="flex items-center">
                <NotificationCenter />
              </div>

              {/* Messages Drawer Trigger */}
              <button
                type="button"
                id="olma-immo-desktop-messages-btn"
                onClick={handleOpenMessaging}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors shadow-2xs cursor-pointer"
                title="Messagerie en temps réel"
                aria-label="Messagerie"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              {/* Synchronized User Session Menu & Avatar */}
              <OlmaImmoUserMenu />
            </div>
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
