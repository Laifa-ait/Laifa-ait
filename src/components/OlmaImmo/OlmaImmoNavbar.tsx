import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, PlusCircle, Search, ArrowLeft, UserCheck, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UnifiedMessagingDrawer } from '../Chat/UnifiedMessagingDrawer';

export const OlmaImmoNavbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, openAuthModal } = useAuth();
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);

  const handlePublishClick = () => {
    if (!currentUser) {
      if (openAuthModal) openAuthModal();
      else navigate('/auth');
      return;
    }
    navigate('/immo/publish');
  };

  const handleOpenMessaging = () => {
    if (!currentUser) {
      if (openAuthModal) openAuthModal();
      else navigate('/auth');
      return;
    }
    setIsMessagingOpen(true);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Back to Olmart */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center text-xs font-medium text-slate-500 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors"
              title="Retourner à Olmart Marketplace"
            >
              <ArrowLeft className="w-3.5 h-3.5 me-1" />
              Olmart
            </Link>

            <Link to="/immo" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 bg-clip-text text-transparent leading-none">
                  Olma Immo
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-emerald-600">
                  Immobilier & Location Algérie
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/immo"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === '/immo'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4 inline me-1.5 -mt-0.5 text-emerald-600" />
              Rechercher
            </Link>

            <Link
              to="/immo/owner"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                location.pathname.startsWith('/immo/owner')
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-4 h-4 inline me-1.5 -mt-0.5 text-teal-600" />
              Mes Biens
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenMessaging}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Mes messages"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Messages</span>
            </button>

            <button
              onClick={handlePublishClick}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-800 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-700/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Publier une annonce</span>
              <span className="sm:hidden">Publier</span>
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
