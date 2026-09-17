import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Compass, Calendar, LayoutGrid, MessageSquare, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useOlmaBookingsCount } from '../../hooks/useOlmaBookingsCount';
import { UnifiedMessagingDrawer } from '../Chat/UnifiedMessagingDrawer';
import { SuperAppSwitcherModal } from '../common/SuperAppSwitcherModal';

export const OlmaImmoBottomNav: React.FC<{ activeTab?: string }> = ({ activeTab }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, openAuthModal } = useAuth();
  const { activeBookingsCount } = useOlmaBookingsCount();
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const isExplorerActive = location.pathname === '/immo' && !location.search.includes('view=map');
  const isBookingsActive = location.pathname === '/immo/my-bookings' || activeTab === 'stays';
  const isProfileActive = location.pathname === '/immo/profile' || activeTab === 'profile';
  const isEditorActive = location.pathname.includes('/editor') || location.pathname.includes('/new') || location.pathname.includes('/publish');

  if (isProfileActive || isEditorActive) {
    return null;
  }

  const handleOpenMessaging = () => {
    if (!currentUser) {
      if (openAuthModal) openAuthModal();
      else window.dispatchEvent(new CustomEvent('auth:openModal', { detail: { mode: 'login' } }));
      return;
    }
    setIsMessagingOpen(true);
  };

  const handleProfileClick = () => {
    if (!currentUser) {
      if (openAuthModal) openAuthModal();
      else window.dispatchEvent(new CustomEvent('auth:openModal', { detail: { mode: 'login' } }));
      return;
    }
    navigate('/immo/profile');
  };

  const navItems = [
    {
      id: 'explorer',
      label: 'Explorer',
      icon: Compass,
      isActive: isExplorerActive,
      onClick: () => navigate('/immo'),
    },
    {
      id: 'bookings',
      label: 'Réservations',
      icon: Calendar,
      isActive: isBookingsActive,
      badgeCount: activeBookingsCount,
      onClick: () => navigate('/immo/my-bookings'),
    },
    {
      id: 'univers',
      label: 'Applications',
      icon: LayoutGrid,
      isActive: isSwitcherOpen,
      isSpecial: true,
      onClick: () => setIsSwitcherOpen(true),
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      isActive: isMessagingOpen,
      onClick: handleOpenMessaging,
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
      isActive: isProfileActive,
      onClick: handleProfileClick,
    },
  ];

  return (
    <>
      <div
        className="md:hidden fixed bottom-0 inset-x-0 w-full z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-2px_16px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <nav className="w-full max-w-lg mx-auto flex items-center justify-between px-2 py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive;
            const badge = 'badgeCount' in item && typeof item.badgeCount === 'number' && item.badgeCount > 0 ? item.badgeCount : null;

            return (
              <motion.button
                key={item.id}
                id={`olma-immo-bottom-${item.id}`}
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={item.onClick}
                title={item.label}
                aria-label={badge ? `${item.label} (${badge} active(s))` : item.label}
                className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 cursor-pointer bg-transparent border-none focus:outline-none ${
                  active
                    ? 'text-[#1E293B]'
                    : item.isSpecial
                    ? 'text-amber-700'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div
                  className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
                    active
                      ? 'bg-slate-100 text-[#1E293B] ring-1 ring-slate-200'
                      : item.isSpecial
                      ? 'bg-amber-50 text-[#D97706] ring-1 ring-amber-200/70'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'stroke-[2.2]' : 'stroke-[1.9]'}`} />
                  {badge && (
                    <span className="absolute -top-1 -right-1.5 min-w-4 h-4 bg-[#1E293B] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center px-1 ring-1 ring-white shadow-2xs">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] mt-0.5 tracking-tight leading-none text-center ${
                    active
                      ? 'text-[#1E293B] font-bold'
                      : item.isSpecial
                      ? 'text-[#D97706] font-semibold'
                      : 'text-slate-500 font-medium'
                  }`}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Unified Messaging Drawer */}
      {isMessagingOpen && (
        <UnifiedMessagingDrawer
          isOpen={isMessagingOpen}
          onClose={() => setIsMessagingOpen(false)}
        />
      )}

      {/* Super-App Switcher Modal */}
      {isSwitcherOpen && (
        <SuperAppSwitcherModal
          isOpen={isSwitcherOpen}
          onClose={() => setIsSwitcherOpen(false)}
        />
      )}
    </>
  );
};
