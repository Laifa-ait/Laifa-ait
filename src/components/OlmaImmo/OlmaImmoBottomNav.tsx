import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, PlusCircle, UserCheck, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const OlmaImmoBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, openAuthModal } = useAuth();

  const handlePublishClick = () => {
    if (!currentUser) {
      if (openAuthModal) openAuthModal();
      else navigate('/auth');
      return;
    }
    navigate('/immo/publish');
  };

  const isActive = (path: string) => {
    if (path === '/immo' && location.pathname === '/immo') return true;
    if (path !== '/immo' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-slate-200/90 z-50 shadow-[0_-8px_32px_rgba(0,0,0,0.06)] overflow-hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16 w-full px-3">
        {/* Explorer / Recherche */}
        <button
          onClick={() => navigate('/immo')}
          className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl active:scale-[0.92] transition-all bg-transparent border-none cursor-pointer relative"
        >
          {isActive('/immo') && !location.pathname.startsWith('/immo/owner') && !location.pathname.startsWith('/immo/publish') && (
            <div className="absolute inset-0 bg-emerald-50 rounded-2xl -z-10" />
          )}
          <Search
            className={`w-5 h-5 transition-colors ${
              isActive('/immo') && !location.pathname.startsWith('/immo/owner') && !location.pathname.startsWith('/immo/publish')
                ? 'text-emerald-700'
                : 'text-slate-500'
            }`}
            strokeWidth={isActive('/immo') && !location.pathname.startsWith('/immo/owner') ? 2.5 : 2}
          />
          <span
            className={`text-[10px] font-medium mt-1 ${
              isActive('/immo') && !location.pathname.startsWith('/immo/owner') && !location.pathname.startsWith('/immo/publish')
                ? 'text-emerald-800 font-semibold'
                : 'text-slate-500'
            }`}
          >
            Explorer
          </span>
        </button>

        {/* Publier */}
        <button
          onClick={handlePublishClick}
          className="flex flex-col items-center justify-center -mt-3 w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-500 text-white shadow-lg shadow-emerald-700/30 active:scale-[0.90] transition-all border-2 border-white cursor-pointer"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        {/* Mes Biens */}
        <button
          onClick={() => {
            if (!currentUser) {
              if (openAuthModal) openAuthModal();
              else navigate('/auth');
              return;
            }
            navigate('/immo/owner');
          }}
          className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl active:scale-[0.92] transition-all bg-transparent border-none cursor-pointer relative"
        >
          {isActive('/immo/owner') && (
            <div className="absolute inset-0 bg-emerald-50 rounded-2xl -z-10" />
          )}
          <UserCheck
            className={`w-5 h-5 transition-colors ${
              isActive('/immo/owner') ? 'text-emerald-700' : 'text-slate-500'
            }`}
            strokeWidth={isActive('/immo/owner') ? 2.5 : 2}
          />
          <span
            className={`text-[10px] font-medium mt-1 ${
              isActive('/immo/owner') ? 'text-emerald-800 font-semibold' : 'text-slate-500'
            }`}
          >
            Mes Biens
          </span>
        </button>
      </div>
    </div>
  );
};
