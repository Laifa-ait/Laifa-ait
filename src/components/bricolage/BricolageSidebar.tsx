import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  HardHat,
  LayoutGrid,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  ChevronRight
} from 'lucide-react';
import { BricolageViewMode, UserRoleSpace } from './BricolageNavTabs';
import { ActiveArtisanProfile } from '../../types/bricolage';
import { useAuth } from '../../context/AuthContext';
import { useBricolageI18n } from '../../hooks/useBricolageI18n';

interface BricolageSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: UserRoleSpace;
  onRoleChange: (role: UserRoleSpace) => void;
  activeView: BricolageViewMode;
  onViewChange: (view: BricolageViewMode) => void;
  activeArtisanProfile?: ActiveArtisanProfile | null;
  onOpenArtisanAuth?: () => void;
  olmartCustomerName?: string;
  onRequestQuoteClick?: () => void;
}

export const BricolageSidebar: React.FC<BricolageSidebarProps> = ({
  isOpen,
  onClose,
  activeRole,
  onRoleChange,
  activeView,
  onViewChange,
  activeArtisanProfile,
  onOpenArtisanAuth,
  olmartCustomerName = 'Demandeur Olmart',
  onRequestQuoteClick: _onRequestQuoteClick
}) => {
  const { currentUser, openAuthModal } = useAuth();
  const { tBricolage } = useBricolageI18n();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-start bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-sm h-full bg-slate-900 border-r-4 border-amber-500 text-slate-100 flex flex-col shadow-2xl overflow-y-auto"
        >
          {/* Top Header */}
          <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black flex items-center justify-center shadow-lg border border-amber-400">
                <HardHat className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">
                  Olma Bricolage
                </span>
                <h2 className="text-base font-black text-white leading-tight">
                  {tBricolage('header.menuToggle', 'Menu Principal')}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Connected User Account Box */}
          <div className="p-5 m-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Compte Unifié Olmart
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Actif
              </span>
            </div>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-xs font-black text-white block truncate">
                    {olmartCustomerName}
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold block truncate">
                    {currentUser.email}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-center pt-1">
                <p className="text-xs text-slate-300 font-medium">
                  Connectez-vous pour gérer vos demandes et vos devis.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    openAuthModal?.();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-colors"
                >
                  Se Connecter à Olmart
                </button>
              </div>
            )}
          </div>

          {/* Role Switcher Drawer Toggle */}
          <div className="px-4 mb-4">
            <span className="text-[10px] font-black uppercase text-slate-400 px-2 mb-2 block tracking-wider">
              Espace de Navigation
            </span>
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                onClick={() => {
                  onRoleChange('demandeur');
                  onViewChange('marketplace');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeRole === 'demandeur'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{tBricolage('nav.clientSpace', 'Demandeur')}</span>
              </button>

              <button
                onClick={() => {
                  onRoleChange('artisan');
                  onViewChange('artisan_dashboard');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeRole === 'artisan'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <HardHat className="w-3.5 h-3.5" />
                <span>{tBricolage('nav.artisanSpace', 'Artisan Pro')}</span>
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 px-4 space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 px-2 mb-1 block tracking-wider">
              Menu & Vues
            </span>

            <button
              onClick={() => {
                onRoleChange('demandeur');
                onViewChange('marketplace');
                onClose();
              }}
              className={`w-full p-3 rounded-xl text-xs font-black transition-all flex items-center justify-between ${
                activeView === 'marketplace'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-4 h-4 text-amber-400" />
                <span>{tBricolage('nav.searchArtisansTab', 'Accueil & Recherche Bricolage')}</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>

            <button
              onClick={() => {
                onRoleChange('demandeur');
                onViewChange('client_dashboard');
                onClose();
              }}
              className={`w-full p-3 rounded-xl text-xs font-black transition-all flex items-center justify-between ${
                activeView === 'client_dashboard'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-amber-400" />
                <span>{tBricolage('clientDashboard.myRequestsTitle', 'Dashboard Client')}</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>

            <button
              onClick={() => {
                onRoleChange('artisan');
                onViewChange('artisan_dashboard');
                onClose();
              }}
              className={`w-full p-3 rounded-xl text-xs font-black transition-all flex items-center justify-between ${
                activeView === 'artisan_dashboard'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <HardHat className="w-4 h-4 text-amber-400" />
                <span>
                  {activeArtisanProfile ? tBricolage('nav.dashboardPro', 'Dashboard Artisan Pro') : tBricolage('nav.registrationPortal', 'Espace Inscription Artisan Pro')}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>

            <button
              onClick={() => {
                onViewChange('messaging');
                onClose();
              }}
              className={`w-full p-3 rounded-xl text-xs font-black transition-all flex items-center justify-between ${
                activeView === 'messaging'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>{tBricolage('nav.messagingTab', 'Messagerie Directe')}</span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          </div>

          {/* Artisan Status Box in Drawer */}
          <div className="p-4 m-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs">
            {activeArtisanProfile ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-black">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{tBricolage('header.artisanCertified', 'Artisan Pro Certifié')}</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {activeArtisanProfile.specialty} • {activeArtisanProfile.wilaya}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{tBricolage('nav.becomeArtisan', 'Vous êtes artisan ?')}</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Ajoutez vos spécialités et recevez des demandes de chantiers dans votre Wilaya.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenArtisanAuth) onOpenArtisanAuth();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs hover:from-amber-400 hover:to-orange-400 transition-colors shadow-md"
                >
                  {tBricolage('nav.switchProBtn', 'Evoluer vers le Statut Artisan')}
                </button>
              </div>
            )}
          </div>

          {/* Hotline & Footer */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2 text-center text-[11px] text-slate-400">
            <div className="flex items-center justify-center gap-2 text-amber-400 font-black">
              <PhoneCall className="w-4 h-4" />
              <span>{tBricolage('header.hotlineTel', 'Hotline SOS : 023 00 00 00')}</span>
            </div>
            <p className="text-slate-500">
              Service garanti par Olmart Marketplace DZ
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
