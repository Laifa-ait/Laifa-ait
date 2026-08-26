import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, User, Sparkles, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UnifiedMessagingDrawer } from '../Chat/UnifiedMessagingDrawer';

export const OlmaImmoNavbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, openAuthModal } = useAuth();
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);

  const handleOpenMessaging = () => {
    if (!currentUser) {
      if (openAuthModal) openAuthModal();
      else window.dispatchEvent(new CustomEvent('auth:openModal', { detail: { mode: 'login' } }));
      return;
    }
    setIsMessagingOpen(true);
  };

  const handleProfileClick = () => {
    if (!currentUser) {
      if (openAuthModal) openAuthModal();
      else window.dispatchEvent(new CustomEvent('auth:openModal', { detail: { mode: 'login' } }));
      return;
    }
    navigate('/immo/profile');
  };

  const isExplore = location.pathname === '/immo' && !location.search;
  const isBuy = location.search.includes('type=sale');
  const isRent = location.search.includes('type=rent_long');
  const isVacation = location.search.includes('type=rent_short');

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-xl border-b border-stone-200/80 shadow-[0_4px_20px_-4px_rgba(28,25,23,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Brand Identity with Travel & Luxury Touch */}
          <Link to="/immo" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform duration-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-stone-900 font-['Poppins',sans-serif] block leading-none">
                OLMA <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">IMMO</span>
              </span>
              <span className="text-[10px] font-bold text-stone-400 tracking-wider uppercase mt-1 block">
                Séjours & Immobilier
              </span>
            </div>
          </Link>

          {/* Center: Travel Pill Navigation */}
          <nav className="hidden md:flex items-center p-1.5 bg-stone-200/60 rounded-full border border-stone-200/80 shadow-inner">
            <Link
              to="/immo"
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                isExplore
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-white/60'
              }`}
            >
              Explorer
            </Link>

            <Link
              to="/immo?type=rent_short"
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                isVacation
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-white/60'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isVacation ? 'text-white' : 'text-amber-500'}`} />
              <span>Séjours & Vacances</span>
            </Link>

            <Link
              to="/immo?type=sale"
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                isBuy
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-white/60'
              }`}
            >
              Acheter
            </Link>

            <Link
              to="/immo?type=rent_long"
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                isRent
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-white/60'
              }`}
            >
              Louer
            </Link>
          </nav>

          {/* Right: Quick actions and Profile */}
          <div className="flex items-center gap-4">
            <Link
              to="/immo/owner"
              className="text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200/80 px-3.5 py-2 rounded-full transition-colors hidden lg:inline-flex items-center gap-1.5 border border-stone-200/60"
            >
              Espace Propriétaire
            </Link>

            <div className="flex items-center gap-2">
              <Link
                to="/immo?favorites=true"
                className="w-10 h-10 rounded-full border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-600 hover:text-rose-500 transition-colors shadow-2xs"
                title="Favoris"
              >
                <Heart className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={handleOpenMessaging}
                className="w-10 h-10 rounded-full border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors shadow-2xs cursor-pointer"
                title="Messages"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleProfileClick}
                className="w-10 h-10 rounded-full border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors shadow-2xs cursor-pointer"
                title="Profil"
              >
                <User className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Messaging Drawer Modal */}
      {isMessagingOpen && (
        <UnifiedMessagingDrawer
          isOpen={isMessagingOpen}
          onClose={() => setIsMessagingOpen(false)}
        />
      )}
    </header>
  );
};
