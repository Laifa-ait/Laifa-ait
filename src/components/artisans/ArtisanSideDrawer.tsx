import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArtisanProfile } from '../../types/artisan';
import { DrawerHeader } from './drawer/DrawerHeader';
import { DrawerQuickActions } from './drawer/DrawerQuickActions';
import { DrawerTradesGrid } from './drawer/DrawerTradesGrid';
import { DrawerClientSection } from './drawer/DrawerClientSection';
import { DrawerArtisanSection } from './drawer/DrawerArtisanSection';
import { DrawerAdminSection } from './drawer/DrawerAdminSection';
import { DrawerTrustAndEcosystem } from './drawer/DrawerTrustAndEcosystem';
import { DrawerFooter } from './drawer/DrawerFooter';

interface ArtisanSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  artisanProfile: ArtisanProfile | null;
  loadingProfile: boolean;
}

export const ArtisanSideDrawer: React.FC<ArtisanSideDrawerProps> = ({
  isOpen,
  onClose,
  artisanProfile,
  loadingProfile,
}) => {
  const navigate = useNavigate();
  const { user, currentUser, logout } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEscape);

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
        window.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/artisans');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 transition-opacity"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed left-0 top-0 bottom-0 w-full max-w-sm sm:max-w-md bg-white z-50 shadow-2xl flex flex-col border-r border-slate-200 overflow-hidden"
          >
            {/* 1. Header with User Identity & Status */}
            <DrawerHeader onClose={onClose} artisanProfile={artisanProfile} />

            {/* 2. Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-200">
              {/* Admin Shortcuts (if applicable) */}
              <DrawerAdminSection isAdmin={isAdmin} onClose={onClose} />

              {/* Quick Actions & KPIs */}
              <DrawerQuickActions onClose={onClose} isLoggedIn={Boolean(currentUser)} />

              {/* Trades & Specialties Grid */}
              <DrawerTradesGrid onClose={onClose} />

              {/* Client Section (Quotes, Recent Searches, Saved Artisans) */}
              <DrawerClientSection onClose={onClose} isLoggedIn={Boolean(currentUser)} />

              {/* Artisan Pro Application / Dashboard */}
              <DrawerArtisanSection
                profile={artisanProfile}
                loading={loadingProfile}
                onClose={onClose}
                isLoggedIn={Boolean(currentUser)}
              />

              {/* Trust Badges & Olmart Ecosystem */}
              <DrawerTrustAndEcosystem onClose={onClose} />
            </div>

            {/* 3. Footer with Logout & Coverage Info */}
            <DrawerFooter onLogout={handleLogout} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
