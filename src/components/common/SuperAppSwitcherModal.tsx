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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
            className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden text-stone-100 z-10 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-800/80 bg-stone-900/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-stone-950 shadow-lg shadow-orange-500/20">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    Écosystème Olmart
                    <span className="text-[10px] uppercase font-black tracking-wider bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                      Super-App DZ
                    </span>
                  </h3>
                  <p className="text-xs text-stone-400">
                    Basculez instantanément entre vos univers avec votre compte unique
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-stone-700/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
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
            <div className="px-6 py-3.5 border-t border-stone-800/80 bg-stone-950/60 flex items-center justify-between text-[11px] text-stone-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Compte Unique & Session Unifiée
              </span>
              <span className="text-stone-300 font-medium">58 Wilayas d'Algérie</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
