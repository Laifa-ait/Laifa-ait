import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, LogOut, Calendar, ShieldCheck, Home, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const OlmaImmoUserMenu: React.FC = React.memo(() => {
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

  if (!currentUser) {
    return (
      <button
        type="button"
        id="olma-immo-login-btn"
        onClick={handleAuthAction}
        className="h-10 px-3.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
        title="Se connecter"
      >
        <User className="w-4 h-4 text-stone-500" />
        <span className="hidden sm:inline">Connexion</span>
      </button>
    );
  }

  const avatarUrl = (typeof currentUser.photoURL === 'string' && currentUser.photoURL) || (typeof userProfile?.avatar === 'string' && userProfile.avatar) || undefined;
  const displayName = (typeof userProfile?.displayName === 'string' && userProfile.displayName) || currentUser.displayName || currentUser.email?.split('@')[0] || 'Utilisateur';
  const roleName = (typeof userProfile?.role === 'string' && userProfile.role) || 'Membre';

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        id="olma-immo-user-menu-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Menu utilisateur - ${displayName}`}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 transition-all shadow-2xs cursor-pointer group"
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-bold text-xs shadow-inner">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initials || 'U'}</span>
          )}
          {/* Pulsating online indicator */}
          <span
            id="olma-immo-user-online-badge"
            className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
            title="Connecté"
          />
        </div>
        <span className="text-xs font-semibold text-stone-800 max-w-[90px] truncate hidden md:inline">
          {displayName}
        </span>
      </button>

      {isOpen && (
        <div
          id="olma-immo-user-dropdown"
          className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-stone-200 shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* User Profile Header */}
          <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-bold text-sm shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{initials || 'U'}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-stone-900 truncate">{displayName}</p>
              <p className="text-[11px] text-stone-500 truncate">{currentUser.email}</p>
              <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <UserCheck className="w-3 h-3" />
                <span className="capitalize">{roleName}</span>
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="py-1">
            <Link
              to="/immo/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-950 transition-colors"
            >
              <User className="w-4 h-4 text-stone-400" />
              <span>Mon Profil Immo</span>
            </Link>

            <Link
              to="/immo/my-bookings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-950 transition-colors"
            >
              <Calendar className="w-4 h-4 text-stone-400" />
              <span>Mes Séjours & Réservations</span>
            </Link>

            <Link
              to="/immo/owner"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-950 transition-colors"
            >
              <Home className="w-4 h-4 text-stone-400" />
              <span>Espace Propriétaire</span>
            </Link>

            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-950 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-stone-400" />
              <span>Compte Général Olmart</span>
            </Link>
          </div>

          <div className="border-t border-stone-100 pt-1 mt-1">
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
