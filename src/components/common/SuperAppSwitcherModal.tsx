import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SUPER_APP_VERTICALS } from '../../data/superAppData';
import { QuickRoleAccess } from '../../types/superApp';
import { SuperAppBentoGrid } from './SuperAppBentoGrid';
import { SuperAppRoleShortcuts } from './SuperAppRoleShortcuts';

interface SuperAppSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuperAppSwitcherModal: React.FC<SuperAppSwitcherModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, currentUser } = useAuth();

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  const capabilities = Array.isArray(userProfile?.capabilities)
    ? (userProfile.capabilities as string[])
    : [];
  const role = userProfile?.role || 'buyer';

  const roleShortcuts: QuickRoleAccess[] = [];
  if (role === 'seller' || capabilities.includes('seller')) {
    roleShortcuts.push({
      id: 'seller',
      title: 'Mon Espace Vendeur',
      subtitle: 'Commandes & Produits Marketplace',
      route: '/dashboard/seller',
      badge: 'Boutique',
      iconName: 'Briefcase',
    });
  }
  if (role === 'property_owner' || capabilities.includes('property_owner')) {
    roleShortcuts.push({
      id: 'owner',
      title: 'Mon Espace Bailleur',
      subtitle: 'Mes Biens & Réservations',
      route: '/immo/owner',
      badge: 'Bailleur',
      iconName: 'Building2',
    });
  }
  if (role === 'artisan' || capabilities.includes('artisan')) {
    roleShortcuts.push({
      id: 'artisan',
      title: 'Mon Espace Artisan',
      subtitle: 'Devis & Interventions Pro',
      route: '/artisans/dashboard',
      badge: 'Artisan',
      iconName: 'Wrench',
    });
  }
  if (role === 'admin' || role === 'superadmin') {
    roleShortcuts.push({
      id: 'admin',
      title: 'Console Super-Admin',
      subtitle: 'Modération & Écosystème Global',
      route: '/admin',
      badge: 'Admin',
      iconName: 'ShieldCheck',
    });
  }

  const handleNavigate = (route: string) => {
    onClose();
    // Synchronisation de la navigation avec react-router-dom pour conserver l'historique
    if (route === location.pathname) {
      return;
    }
    navigate(route, {
      state: {
        from: location.pathname + location.search,
        timestamp: Date.now(),
      },
    });
  };

  const getActiveVerticalId = () => {
    if (location.pathname.startsWith('/immo')) return 'immo';
    if (location.pathname.startsWith('/artisans') || location.pathname.startsWith('/bricolage')) return 'bricolage';
    if (location.pathname.startsWith('/shops')) return 'shops';
    return 'marketplace';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-md transition-opacity"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.2)] overflow-hidden text-slate-900 z-10 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/25">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    Écosystème Olmart
                    <span className="text-[10px] uppercase font-black tracking-wider bg-amber-100/90 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300/80">
                      Super-App DZ
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Basculez instantanément entre vos univers avec votre compte unique
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer border border-slate-200/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 bg-gradient-to-b from-slate-50/40 via-white to-slate-50/20">
              <SuperAppBentoGrid
                verticals={SUPER_APP_VERTICALS}
                activeId={getActiveVerticalId()}
                onSelect={handleNavigate}
              />

              <SuperAppRoleShortcuts
                shortcuts={roleShortcuts}
                hasUser={Boolean(currentUser)}
                onSelect={handleNavigate}
              />
            </div>

            {/* Footer */}
            <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-2 font-semibold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Compte Unique & Session Unifiée
              </span>
              <span className="text-slate-800 font-extrabold">58 Wilayas d'Algérie</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
