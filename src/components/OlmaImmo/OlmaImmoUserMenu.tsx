import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, LogOut, Calendar, Home, Heart, Bell, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface OlmaImmoUserMenuProps {
  onOpenMessaging?: () => void;
}

export const OlmaImmoUserMenu: React.FC<OlmaImmoUserMenuProps> = React.memo(({ onOpenMessaging }) => {
  const navigate = useNavigate();
  const { currentUser, userProfile, logout, openAuthModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or escape key
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
      navigate('/immo');
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
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        id="olma-immo-user-menu-btn"
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
        {/* Minimalist grey silhouette avatar from image_7.png */}
        <div className="w-5 h-5 flex items-center justify-center">
          <User className="w-4 h-4 text-[#64748B] group-hover:text-[#334155] transition-colors" />
        </div>
      </button>

      {isOpen && currentUser && (
        <div
          id="olma-immo-user-dropdown"
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

          {/* Hidden features accessible via profile menu */}
          <div className="py-1">
            <Link
              to="/immo?favorites=true"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Heart className="w-4 h-4 text-[#64748B]" />
              <span>Favoris & Biens sauvegardés</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onOpenMessaging) onOpenMessaging();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer text-left"
            >
              <MessageSquare className="w-4 h-4 text-[#64748B]" />
              <span>Messages & Échanges</span>
            </button>

            <Link
              to="/immo/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Bell className="w-4 h-4 text-[#64748B]" />
              <span>Notifications</span>
            </Link>

            <Link
              to="/immo/my-bookings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Calendar className="w-4 h-4 text-[#64748B]" />
              <span>Mes Séjours & Réservations</span>
            </Link>

            <Link
              to="/immo/owner"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Home className="w-4 h-4 text-[#64748B]" />
              <span>Espace Propriétaire</span>
            </Link>
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
  );
});

OlmaImmoUserMenu.displayName = 'OlmaImmoUserMenu';
