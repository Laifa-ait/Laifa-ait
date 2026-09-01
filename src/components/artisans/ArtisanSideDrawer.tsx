import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  ShoppingBag,
  Building2,
  HelpCircle,
  LogOut,
  LogIn,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArtisanProfile } from '../../types/artisan';
import { DrawerClientSection } from './drawer/DrawerClientSection';
import { DrawerArtisanSection } from './drawer/DrawerArtisanSection';
import { DrawerAdminSection } from './drawer/DrawerAdminSection';

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
            className="fixed left-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col border-r border-slate-200 overflow-hidden"
          >
            {/* Drawer Header & User Identity */}
            <div className="p-5 bg-slate-900 text-white shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm">
                    OL
                  </span>
                  <span className="font-black text-sm tracking-tight text-white">
                    Menu & Espace Compte
                  </span>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Fermer le menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Account Info */}
              {currentUser ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-bold flex items-center justify-center text-sm shrink-0">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="truncate flex-1">
                    <p className="text-xs font-bold text-white truncate">
                      {user?.displayName || 'Client Olmart'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                  {isAdmin && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/30 text-purple-300 text-[10px] font-bold border border-purple-500/40">
                      Admin
                    </span>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                    <User className="w-4 h-4 text-amber-400" />
                    <span>Non connecté</span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/auth?redirect=/artisans');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Se connecter</span>
                  </button>
                </div>
              )}
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* 1. Admin Section (if admin) */}
              <DrawerAdminSection isAdmin={isAdmin} onClose={onClose} />

              {/* 2. Client Section (Quotes, Recent Searches, Saved Artisans) */}
              <DrawerClientSection onClose={onClose} isLoggedIn={!!currentUser} />

              {/* 3. Artisan Pro Section */}
              <DrawerArtisanSection
                profile={artisanProfile}
                loading={loadingProfile}
                onClose={onClose}
                isLoggedIn={!!currentUser}
              />

              {/* 4. Olmart Marketplace Ecosystem Shortcuts */}
              <div className="pt-2 border-t border-slate-200/80 space-y-1">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
                  Écosystème Olmart
                </h4>

                <button
                  onClick={() => {
                    onClose();
                    navigate('/shop');
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-slate-500" />
                    <span>Marketplace & Produits</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    navigate('/immo');
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span>Immobilier & Location</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    navigate('/support');
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-slate-500" />
                    <span>Centre d&apos;Aide & Support</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            {currentUser && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 hover:border-red-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
