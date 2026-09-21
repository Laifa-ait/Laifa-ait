import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, FileText, LayoutGrid, LayoutDashboard, UserCheck, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { fetchMyArtisanProfile, fetchClientMyRequests } from '../../services/artisan.api';
import { ArtisanProfile } from '../../types/artisan';
import { SuperAppSwitcherModal } from '../common/SuperAppSwitcherModal';

export const ArtisanMobileBottomNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, openAuthModal } = useAuth();

  const [myArtisanProfile, setMyArtisanProfile] = useState<ArtisanProfile | null>(null);
  const [quotesCount, setQuotesCount] = useState<number>(0);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchMyArtisanProfile()
        .then((profile) => setMyArtisanProfile(profile))
        .catch(() => setMyArtisanProfile(null));

      fetchClientMyRequests()
        .then((quotes) => setQuotesCount(quotes.length))
        .catch(() => setQuotesCount(0));
    } else {
      setMyArtisanProfile(null);
      setQuotesCount(0);
    }
  }, [currentUser]);

  const isExplorerActive = location.pathname === '/artisans' || location.pathname === '/bricolage';
  const isBroadcastActive = location.pathname.startsWith('/artisans/annonces');
  const isQuotesActive = location.pathname === '/artisans/mes-demandes';
  const isProActive =
    location.pathname.startsWith('/artisans/dashboard') ||
    location.pathname === '/artisans/devenir-artisan';

  const navItems = [
    {
      id: 'explorer',
      label: t('nav_explorer'),
      icon: Compass,
      isActive: isExplorerActive,
      onClick: () => navigate('/artisans'),
    },
    {
      id: 'broadcasts',
      label: t('nav_broadcasts'),
      icon: Send,
      isActive: isBroadcastActive,
      onClick: () => navigate('/artisans/annonces'),
    },
    {
      id: 'quotes',
      label: t('nav_my_quotes'),
      icon: FileText,
      isActive: isQuotesActive,
      badgeCount: quotesCount,
      onClick: () => {
        if (!currentUser) {
          if (openAuthModal) openAuthModal();
          else window.dispatchEvent(new CustomEvent('auth:openModal', { detail: { mode: 'login' } }));
          return;
        }
        navigate('/artisans/mes-demandes');
      },
    },
    {
      id: 'switcher',
      label: t('nav_applications'),
      icon: LayoutGrid,
      isActive: isSwitcherOpen,
      onClick: () => setIsSwitcherOpen(true),
    },
    {
      id: 'pro',
      label: myArtisanProfile ? t('nav_pro_space') : t('nav_become_artisan'),
      icon: myArtisanProfile ? LayoutDashboard : UserCheck,
      isActive: isProActive,
      onClick: () => {
        if (!currentUser) {
          navigate('/auth?redirect=/artisans/devenir-artisan');
        } else if (myArtisanProfile?.status === 'approved') {
          navigate('/artisans/dashboard');
        } else {
          navigate('/artisans/devenir-artisan');
        }
      },
    },
  ];

  return (
    <>
      <div
        className="md:hidden fixed bottom-0 inset-x-0 w-full z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-2px_16px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <nav className="w-full max-w-lg mx-auto flex items-center justify-around px-2 py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive;
            const badge =
              'badgeCount' in item && typeof item.badgeCount === 'number' && item.badgeCount > 0
                ? item.badgeCount
                : null;

            return (
              <motion.button
                key={item.id}
                id={`olma-artisan-bottom-${item.id}`}
                whileTap={{ scale: 0.92 }}
                onClick={item.onClick}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[60px] transition-colors relative cursor-pointer ${
                  active ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-150 ${
                      active ? 'stroke-[2.4] scale-105 text-amber-600' : 'stroke-[1.8] text-slate-500'
                    }`}
                  />
                  {badge !== null && (
                    <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[16px] text-center shadow-xs">
                      {badge}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] sm:text-[11px] mt-1 tracking-tight leading-none ${
                    active ? 'text-amber-600 font-bold' : 'text-slate-500 font-medium'
                  }`}
                >
                  {item.label}
                </span>

                {active && (
                  <motion.div
                    layoutId="olma-artisan-active-indicator"
                    className="w-1.5 h-1 rounded-full bg-amber-500 mt-1 shadow-xs"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>

      <SuperAppSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />
    </>
  );
};
