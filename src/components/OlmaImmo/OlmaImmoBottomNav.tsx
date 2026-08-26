import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, MessageSquare, User, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
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

  const navItems = [
    {
      id: 'explorer',
      label: 'Explorer',
      icon: Search,
      isActive: isExplorerActive,
      onClick: () => navigate('/immo'),
    },
    {
      id: 'bookings',
      label: 'Séjours',
      icon: Calendar,
      isActive: isBookingsActive,
      onClick: () => navigate('/immo/my-bookings'),
    },
    {
      id: 'favorites',
      label: 'Favoris',
      icon: Heart,
      isActive: isFavsActive,
      onClick: () => navigate('/immo?favorites=true'),
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      isActive: isMessagingOpen,
      onClick: handleOpenMessaging,
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
      isActive: isProfileActive,
      onClick: handleProfileClick,
    },
  ];

  return (
    <>
      <div
        className="md:hidden fixed bottom-3 inset-x-3 max-w-md mx-auto z-50 pointer-events-none"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <nav className="pointer-events-auto bg-stone-950/92 backdrop-blur-2xl rounded-2xl px-2 py-1.5 border border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.35)] flex items-center justify-between">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={item.onClick}
                className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-200 cursor-pointer bg-transparent border-none focus:outline-none ${
                  active ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200 font-medium'
                }`}
              >
                <div
                  className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                    active ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/30' : 'text-stone-400'
                  }`}
                >
                  <Icon className={`w-4 h-4 stroke-[2] ${active && item.id === 'favorites' ? 'fill-white' : ''}`} />
                </div>
                <span className={`text-[10px] mt-0.5 tracking-tight leading-none text-center ${active ? 'text-amber-400 font-bold' : 'text-stone-400'}`}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </nav>
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
