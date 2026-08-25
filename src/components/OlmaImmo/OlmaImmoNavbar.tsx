import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Mail, User, PlusCircle, Building2 } from 'lucide-react';
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
    <header className="hidden md:block sticky top-0 z-40 bg-[#f6f2e9]/95 backdrop-blur-md border-b border-[#e5dfd2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Brand Text "OLMA IMMO" */}
          <Link to="/immo" className="flex items-center gap-2.5 group">
            <span className="text-xl sm:text-2xl font-bold tracking-wider text-[#1a3831] font-['Playfair_Display',serif] uppercase">
              OLMA IMMO
            </span>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9">
            <Link
              to="/immo"
              className={`text-sm font-medium transition-colors ${
                isExplore ? 'text-[#1a3831] font-bold border-b-2 border-[#1a3831] pb-1' : 'text-slate-700 hover:text-[#1a3831]'
              }`}
            >
              Explorer
            </Link>

            <Link
              to="/immo?type=sale"
              className={`text-sm font-medium transition-colors ${
                isBuy ? 'text-[#1a3831] font-bold border-b-2 border-[#1a3831] pb-1' : 'text-slate-700 hover:text-[#1a3831]'
              }`}
            >
              Acheter
            </Link>

            <Link
              to="/immo?type=rent_long"
              className={`text-sm font-medium transition-colors ${
                isRent ? 'text-[#1a3831] font-bold border-b-2 border-[#1a3831] pb-1' : 'text-slate-700 hover:text-[#1a3831]'
              }`}
            >
              Louer
            </Link>

            <Link
              to="/immo?type=rent_short"
              className={`text-sm font-medium transition-colors ${
                isVacation ? 'text-[#1a3831] font-bold border-b-2 border-[#1a3831] pb-1' : 'text-slate-700 hover:text-[#1a3831]'
              }`}
            >
              Vacances & Séjours
            </Link>

            <Link
              to="/immo/owner"
              className="text-xs font-bold uppercase tracking-wider text-[#1a3831] bg-[#f4ecd8] hover:bg-[#ebdcb8] border border-[#e8e2d4] px-3.5 py-1.5 rounded-full transition"
            >
              Espace Pro & Annonceur
            </Link>
          </nav>

          {/* Right: Favorites, Messages, Profile */}
          <div className="flex items-center gap-5 sm:gap-7">
            <Link
              to="/immo?favorites=true"
              className="flex flex-col items-center gap-1 text-slate-700 hover:text-[#1a3831] transition-colors group cursor-pointer"
            >
              <Heart className="w-4 h-4 text-slate-700 group-hover:text-[#1a3831] transition-colors stroke-[1.75]" />
              <span className="text-[11px] font-medium tracking-tight">Favoris</span>
            </Link>

            <button
              type="button"
              onClick={handleOpenMessaging}
              className="flex flex-col items-center gap-1 text-slate-700 hover:text-[#1a3831] transition-colors group cursor-pointer bg-transparent border-none"
            >
              <Mail className="w-4 h-4 text-slate-700 group-hover:text-[#1a3831] transition-colors stroke-[1.75]" />
              <span className="text-[11px] font-medium tracking-tight">Messages</span>
            </button>

            <button
              type="button"
              onClick={handleProfileClick}
              className="flex flex-col items-center gap-1 text-slate-700 hover:text-[#1a3831] transition-colors group cursor-pointer bg-transparent border-none"
            >
              <User className="w-4 h-4 text-slate-700 group-hover:text-[#1a3831] transition-colors stroke-[1.75]" />
              <span className="text-[11px] font-medium tracking-tight">Profil</span>
            </button>
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
