import React from 'react';
import { LayoutGrid, User, HardHat, MessageSquare, ShieldCheck, LogIn, UserCheck, Sparkles, AlertCircle } from 'lucide-react';
import { ActiveArtisanProfile } from '../../types/bricolage';
import { useBricolageI18n } from '../../hooks/useBricolageI18n';

export type BricolageViewMode = 'marketplace' | 'client_dashboard' | 'artisan_dashboard' | 'messaging';
export type UserRoleSpace = 'demandeur' | 'artisan';

interface BricolageNavTabsProps {
  activeRole: UserRoleSpace;
  onRoleChange: (role: UserRoleSpace) => void;
  activeView?: BricolageViewMode;
  activeViewMode?: BricolageViewMode;
  onViewChange?: (view: BricolageViewMode) => void;
  onViewModeChange?: (view: BricolageViewMode) => void;
  unreadCount?: number;
  openRequestsCount?: number;
  availableLeadsCount?: number;
  activeArtisanProfile?: ActiveArtisanProfile | null;
  onOpenArtisanAuth?: (tab: 'login' | 'register') => void;
  onOpenAdminVerification?: () => void;
  olmartCustomerName?: string;
}

export const BricolageNavTabs: React.FC<BricolageNavTabsProps> = ({
  activeRole,
  onRoleChange,
  activeView,
  activeViewMode,
  onViewChange,
  onViewModeChange,
  unreadCount = 1,
  openRequestsCount = 2,
  availableLeadsCount = 4,
  activeArtisanProfile,
  onOpenArtisanAuth,
  onOpenAdminVerification,
  olmartCustomerName = 'Demandeur Olmart'
}) => {
  const { tBricolage } = useBricolageI18n();
  const currentView = activeView || activeViewMode || 'marketplace';
  const handleViewChange = (view: BricolageViewMode) => {
    if (typeof onViewChange === 'function') onViewChange(view);
    if (typeof onViewModeChange === 'function') onViewModeChange(view);
  };

  return (
    <div className="space-y-2">
      {/* Primary Role Switcher Bar */}
      <div className="bg-slate-950 p-2 rounded-2xl border-2 border-amber-500/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Role Selector Buttons */}
        <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              onRoleChange('demandeur');
              if (currentView === 'artisan_dashboard') handleViewChange('marketplace');
            }}
            className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 border ${
              activeRole === 'demandeur'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg border-amber-400 scale-[1.02]'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="truncate">{tBricolage('nav.clientSpace', 'Espace Demandeur (Clients)')}</span>
            {openRequestsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-slate-950 text-amber-400">
                {openRequestsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onRoleChange('artisan');
              if (currentView === 'marketplace' || currentView === 'client_dashboard') handleViewChange('artisan_dashboard');
            }}
            className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 border ${
              activeRole === 'artisan'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg border-amber-400 scale-[1.02]'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border-slate-800'
            }`}
          >
            <HardHat className="w-4 h-4" />
            <span className="truncate">
              {activeArtisanProfile
                ? tBricolage('nav.artisanSpace', 'Espace Pro Artisan')
                : tBricolage('nav.becomeArtisan', 'Devenir Artisan Pro')}
            </span>
            {activeArtisanProfile ? (
              availableLeadsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-slate-950 text-amber-400">
                  {availableLeadsCount}
                </span>
              )
            ) : (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {tBricolage('nav.registerBtn', 'Inscrire')}
              </span>
            )}
          </button>
        </div>

        {/* Status Indicator according to role */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {activeRole === 'demandeur' ? (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>{tBricolage('header.clientAccount', 'Compte Client :')} <strong className="text-amber-400">{olmartCustomerName}</strong></span>
            </div>
          ) : activeArtisanProfile ? (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{tBricolage('nav.artisanConnected', 'Artisan Connecté :')} <strong className="text-amber-400">{activeArtisanProfile.fullName}</strong></span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-300 font-bold hidden sm:inline flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                {tBricolage('nav.artisanInactive', 'Statut Artisan non activé')}
              </span>
              <button
                onClick={() => onOpenArtisanAuth && onOpenArtisanAuth('register')}
                className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-md"
              >
                <HardHat className="w-3.5 h-3.5" />
                <span>{tBricolage('nav.switchProBtn', 'Passer Artisan Pro')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Contextual Navigation Bar */}
      <div className="bg-slate-900 rounded-xl p-1.5 border border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1 shrink-0">
          {activeRole === 'demandeur' ? (
            <>
              {/* Demandeur Sub-tabs */}
              <button
                onClick={() => handleViewChange('marketplace')}
                className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
                  currentView === 'marketplace'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{tBricolage('nav.searchArtisansTab', 'Recherche Artisans & Tarifs')}</span>
              </button>

              <button
                onClick={() => handleViewChange('client_dashboard')}
                className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
                  currentView === 'client_dashboard'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{tBricolage('clientDashboard.myRequestsTitle', 'Mes Demandes de Devis')} ({openRequestsCount})</span>
              </button>
            </>
          ) : (
            <>
              {/* Artisan Sub-tabs */}
              <button
                onClick={() => handleViewChange('artisan_dashboard')}
                className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
                  currentView === 'artisan_dashboard'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <HardHat className="w-3.5 h-3.5" />
                <span>
                  {activeArtisanProfile
                    ? `${tBricolage('nav.dashboardPro', 'Tableau de Bord Pro')} (${availableLeadsCount})`
                    : tBricolage('nav.registrationPortal', 'Portail Inscription Artisan Pro')
                  }
                </span>
              </button>
            </>
          )}

          {/* Shared Messaging */}
          <button
            onClick={() => handleViewChange('messaging')}
            className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${
              currentView === 'messaging'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{tBricolage('nav.messagingTab', 'Messagerie')} {activeRole === 'artisan' ? 'Pro' : 'Client'}</span>
            {unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </div>

        {onOpenAdminVerification && (
          <button
            onClick={onOpenAdminVerification}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black transition-all flex items-center gap-1.5 shrink-0"
            title="Espace Modération & Validation des Diplômes Artisans"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{tBricolage('nav.moderationTab', 'Modération (Vérif Diplômes)')}</span>
          </button>
        )}

        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-bold text-amber-400">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>{tBricolage('nav.verifiedNetwork', 'Réseau Vérifié Algérie')}</span>
        </div>
      </div>
    </div>
  );
};

