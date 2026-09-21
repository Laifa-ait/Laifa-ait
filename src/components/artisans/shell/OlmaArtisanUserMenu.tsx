import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, LogOut, FileText, Heart, LayoutDashboard, UserCheck, ShieldCheck, LayoutGrid } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { ArtisanProfile } from '../../../types/artisan';
import { SuperAppSwitcherModal } from '../../common/SuperAppSwitcherModal';

interface OlmaArtisanUserMenuProps {
  artisanProfile?: ArtisanProfile | null;
  clientQuotesCount?: number;
}

export const OlmaArtisanUserMenu: React.FC<OlmaArtisanUserMenuProps> = React.memo(({
  artisanProfile,
  clientQuotesCount = 0,
}) => {
  const navigate = useNavigate();
  const { user, currentUser, userProfile, logout, openAuthModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleAuthAction = useCallback(() => {
    if (openAuthModal) {
      openAuthModal();
    } else {
      window.dispatchEvent(new CustomEvent('auth:openModal', { detail: { mode: 'login' } }));
    }
  }, [openAuthModal]);

  const handleLogout = useCallback(async () => {
    setIsOpen(false);
    try {
      await logout();
      navigate('/artisans');
    } catch {
      // Handled in context
    }
  }, [logout, navigate]);

  const displayName =
    (typeof userProfile?.displayName === 'string' && userProfile.displayName) ||
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    'Invité';

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          id="olma-artisan-user-menu-btn"
          onClick={() => {
            if (!currentUser) {
              handleAuthAction();
            } else {
              setIsOpen((prev) => !prev);
            }
          }}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={`Profil utilisateur - ${displayName}`}
          className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#64748B] border border-slate-200/80 transition-all shadow-2xs cursor-pointer group"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <User className="w-4 h-4 text-[#64748B] group-hover:text-[#334155] transition-colors" />
          </div>
        </button>

        {isOpen && currentUser && (
          <div
            id="olma-artisan-user-dropdown"
            className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            {/* User Profile Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#E2E8F0] text-[#64748B] shrink-0 border border-slate-200">
                <User className="w-5 h-5 text-[#64748B]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">{displayName}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
              </div>
            </div>

            {/* Menu options */}
            <div className="py-1">
              <Link
                to="/artisans/mes-demandes"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#64748B]" />
                  <span>Mes Devis & Demandes</span>
                </div>
                {clientQuotesCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                    {clientQuotesCount}
                  </span>
                )}
              </Link>

              <Link
                to="/artisans?fav=true"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Heart className="w-4 h-4 text-[#64748B]" />
                <span>Artisans favoris</span>
              </Link>

              {artisanProfile?.status === 'approved' ? (
                <Link
                  to="/artisans/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-600" />
                  <span>Mon Espace Pro</span>
                </Link>
              ) : (
                <Link
                  to="/artisans/devenir-artisan"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-[#64748B]" />
                  <span>{artisanProfile ? 'Statut de candidature' : 'Devenir Artisan Olmart'}</span>
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/dashboard/admin/artisans"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Modération & Admin</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsSwitcherOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer text-left"
              >
                <LayoutGrid className="w-4 h-4 text-[#64748B]" />
                <span>Changer d'univers Olmart</span>
              </button>
            </div>

            <div className="border-t border-slate-100 pt-1 mt-1">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <SuperAppSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />
    </>
  );
});

OlmaArtisanUserMenu.displayName = 'OlmaArtisanUserMenu';
