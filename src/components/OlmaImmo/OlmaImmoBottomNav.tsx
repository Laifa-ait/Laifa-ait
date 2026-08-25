import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, MessageSquare, User, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UnifiedMessagingDrawer } from '../Chat/UnifiedMessagingDrawer';

export const OlmaImmoBottomNav: React.FC<{ activeTab?: string }> = ({ activeTab }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, openAuthModal } = useAuth();
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);

  const isExplorerActive = location.pathname === '/immo' && !location.search;
  const isBookingsActive = location.pathname === '/immo/my-bookings' || activeTab === 'stays';
  const isFavsActive = location.search.includes('favorites=true') || activeTab === 'favorites';
  const isProfileActive = location.pathname === '/immo/profile' || activeTab === 'profile';

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

  return (
    <>
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 bg-[#f6f2e9]/95 backdrop-blur-2xl border-t border-[#e5dfd2] z-50 shadow-[0_-8px_32px_rgba(0,0,0,0.06)] overflow-hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around h-16 w-full px-2">
          {/* 1. Explorer */}
          <button
            type="button"
            onClick={() => navigate('/immo')}
            className="flex flex-col items-center justify-center flex-1 h-14 rounded-xl active:scale-92 transition-all bg-transparent border-none cursor-pointer relative"
          >
            {isExplorerActive && <div className="absolute inset-x-1 inset-y-1 bg-[#f4ecd8] rounded-xl -z-10" />}
            <Search
              className={`w-5 h-5 transition-colors ${
                isExplorerActive ? 'text-[#1a3831] font-bold' : 'text-slate-500'
              }`}
            />
            <span
              className={`text-[10px] mt-0.5 ${
                isExplorerActive ? 'text-[#1a3831] font-bold' : 'text-slate-500 font-medium'
              }`}
            >
              Explorer
            </span>
          </button>

          {/* 2. Séjours */}
          <button
            type="button"
            onClick={() => navigate('/immo/my-bookings')}
            className="flex flex-col items-center justify-center flex-1 h-14 rounded-xl active:scale-92 transition-all bg-transparent border-none cursor-pointer relative"
          >
            {isBookingsActive && <div className="absolute inset-x-1 inset-y-1 bg-[#f4ecd8] rounded-xl -z-10" />}
            <Calendar
              className={`w-5 h-5 transition-colors ${
                isBookingsActive ? 'text-[#1a3831] font-bold' : 'text-slate-500'
              }`}
            />
            <span
              className={`text-[10px] mt-0.5 ${
                isBookingsActive ? 'text-[#1a3831] font-bold' : 'text-slate-500 font-medium'
              }`}
            >
              Séjours
            </span>
          </button>

          {/* 3. Favoris */}
          <button
            type="button"
            onClick={() => navigate('/immo?favorites=true')}
            className="flex flex-col items-center justify-center flex-1 h-14 rounded-xl active:scale-92 transition-all bg-transparent border-none cursor-pointer relative"
          >
            {isFavsActive && <div className="absolute inset-x-1 inset-y-1 bg-rose-50 rounded-xl -z-10" />}
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavsActive ? 'text-rose-600 fill-rose-600' : 'text-slate-500'
              }`}
            />
            <span
              className={`text-[10px] mt-0.5 ${
                isFavsActive ? 'text-rose-800 font-bold' : 'text-slate-500 font-medium'
              }`}
            >
              Favoris
            </span>
          </button>

          {/* 4. Messages */}
          <button
            type="button"
            onClick={handleOpenMessaging}
            className="flex flex-col items-center justify-center flex-1 h-14 rounded-xl active:scale-92 transition-all bg-transparent border-none cursor-pointer relative"
          >
            <MessageSquare className="w-5 h-5 text-slate-500" />
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">Messages</span>
          </button>

          {/* 5. Profil */}
          <button
            type="button"
            onClick={handleProfileClick}
            className="flex flex-col items-center justify-center flex-1 h-14 rounded-xl active:scale-92 transition-all bg-transparent border-none cursor-pointer relative"
          >
            {isProfileActive && <div className="absolute inset-x-1 inset-y-1 bg-[#f4ecd8] rounded-xl -z-10" />}
            <User
              className={`w-5 h-5 transition-colors ${
                isProfileActive ? 'text-[#1a3831] font-bold' : 'text-slate-500'
              }`}
            />
            <span
              className={`text-[10px] mt-0.5 ${
                isProfileActive ? 'text-[#1a3831] font-bold' : 'text-slate-500 font-medium'
              }`}
            >
              Profil
            </span>
          </button>
        </div>
      </div>

      {/* Unified Messaging Drawer */}
      {isMessagingOpen && (
        <UnifiedMessagingDrawer
          isOpen={isMessagingOpen}
          onClose={() => setIsMessagingOpen(false)}
        />
      )}
    </>
  );
};
