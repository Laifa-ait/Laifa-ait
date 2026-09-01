import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Wrench, FileText, UserCheck, LayoutDashboard, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchMyArtisanProfile, fetchClientMyRequests } from '../../services/artisan.api';
import { ArtisanProfile } from '../../types/artisan';

export const ArtisanMobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [myArtisanProfile, setMyArtisanProfile] = useState<ArtisanProfile | null>(null);
  const [quotesCount, setQuotesCount] = useState<number>(0);

  useEffect(() => {
    if (currentUser) {
      fetchMyArtisanProfile()
        .then((profile) => setMyArtisanProfile(profile))
        .catch(() => setMyArtisanProfile(null));

      fetchClientMyRequests()
        .then((quotes) => setQuotesCount(quotes.length))
        .catch(() => setQuotesCount(0));
    } else {
      setMyArtisanProfile(null);
      setQuotesCount(0);
    }
  }, [currentUser]);

  const navItems = [
    {
      id: 'artisans-home',
      label: 'Artisans',
      icon: Wrench,
      path: '/artisans',
      isActive: location.pathname === '/artisans' || location.pathname === '/services/bricolage' || location.pathname === '/bricolage',
    },
    {
      id: 'artisans-quotes',
      label: 'Mes Devis',
      icon: FileText,
      path: '/artisans/mes-demandes',
      isActive: location.pathname === '/artisans/mes-demandes',
      badge: quotesCount > 0 ? quotesCount : undefined,
    },
    {
      id: 'artisans-pro',
      label: myArtisanProfile ? 'Espace Pro' : 'Devenir Pro',
      icon: myArtisanProfile ? LayoutDashboard : UserCheck,
      path: myArtisanProfile ? '/artisans/dashboard' : '/artisans/devenir-artisan',
      isActive: location.pathname.startsWith('/artisans/dashboard') || location.pathname === '/artisans/devenir-artisan',
    },
    {
      id: 'olmart-main',
      label: 'Olmart',
      icon: Home,
      path: '/',
      isActive: false,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 shadow-lg px-2 py-1.5 transition-all">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors relative min-w-[64px] ${
                active
                  ? 'text-amber-600 font-semibold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    active ? 'scale-110 stroke-[2.2px]' : 'stroke-[1.8px]'
                  }`}
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 ${active ? 'text-amber-600 font-semibold' : 'text-slate-600'}`}>
                {item.label}
              </span>
              {active && (
                <span className="w-1 h-1 bg-amber-500 rounded-full mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
