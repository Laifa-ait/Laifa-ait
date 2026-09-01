import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Wrench,
  Sparkles,
  UserCheck,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  LayoutDashboard,
  PlusCircle,
  Menu,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchMyArtisanProfile, fetchClientMyRequests } from '../../services/artisan.api';
import { ArtisanProfile } from '../../types/artisan';
import { ArtisanSideDrawer } from './ArtisanSideDrawer';

export const ArtisanNavbar: React.FC<{ activeTab?: string }> = () => {
  const navigate = useNavigate();
  const { user, currentUser } = useAuth();
  const [myArtisanProfile, setMyArtisanProfile] = useState<ArtisanProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [clientQuotesCount, setClientQuotesCount] = useState(0);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    if (currentUser) {
      setLoadingProfile(true);
      fetchMyArtisanProfile()
        .then((profile) => setMyArtisanProfile(profile))
        .finally(() => setLoadingProfile(false));

      fetchClientMyRequests().then((quotes) => {
        setClientQuotesCount(quotes.length);
      });
    } else {
      setMyArtisanProfile(null);
      setClientQuotesCount(0);
    }
  }, [currentUser]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        {/* Top Banner / Breadcrumb back to Olmart */}
        <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="hover:text-white transition-colors flex items-center gap-1 font-medium"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Retour à Olmart Marketplace</span>
              </Link>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Réseau National des Artisans & Pro 58 Wilayas
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-400">
              <span>Devis 100% Gratuits</span>
              <span>•</span>
              <span>Artisans Vérifiés & Qualifiés</span>
            </div>
          </div>
        </div>

        {/* Main Artisan Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Left section: Hamburger (3 traits) + Brand */}
          <div className="flex items-center gap-3">
            {/* 3 TRAITS - HAMBURGER MENU BUTTON */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-amber-100/70 text-slate-800 hover:text-amber-900 border border-slate-200/80 transition-all flex items-center gap-2 cursor-pointer group"
              aria-label="Ouvrir le menu et espace compte"
              id="artisan-hamburger-button"
            >
              <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-xs font-black tracking-wider uppercase text-slate-900">
                Menu
              </span>
              {clientQuotesCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>

            {/* Brand identity */}
            <button
              onClick={() => navigate('/artisans')}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-slate-950 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black text-slate-900 tracking-tight">OLMART</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 uppercase tracking-wider">
                    Artisans
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Services & Bâtiment Algérie</p>
              </div>
            </button>
          </div>

          {/* Action Buttons & Identity integration */}
          <div className="flex items-center gap-2.5">
            {/* Quick access: Client Quotes if logged in */}
            {currentUser && (
              <button
                onClick={() => navigate('/artisans/mes-demandes')}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 text-xs font-bold transition-all cursor-pointer"
                title="Mes demandes de devis envoyées"
              >
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>Mes Devis</span>
                {clientQuotesCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-950 text-[10px] font-black">
                    {clientQuotesCount}
                  </span>
                )}
              </button>
            )}

            {/* Admin shortcut if logged as admin */}
            {isAdmin && (
              <button
                onClick={() => navigate('/dashboard/admin/artisans')}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200 text-xs font-bold transition-all cursor-pointer"
                title="Dashboard Organisation & Modération"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Organisation & Admin</span>
              </button>
            )}

            {/* User Status / Action Flow */}
            {loadingProfile ? (
              <div className="h-9 w-28 bg-slate-100 animate-pulse rounded-xl" />
            ) : myArtisanProfile ? (
              // User already has an artisan record
              <div className="flex items-center gap-2">
                {myArtisanProfile.status === 'approved' ? (
                  <button
                    onClick={() => navigate('/artisans/dashboard')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Mon Dashboard Pro</span>
                  </button>
                ) : myArtisanProfile.status === 'under_review' ||
                  myArtisanProfile.status === 'pending' ? (
                  <button
                    onClick={() => navigate('/artisans/devenir-artisan')}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                    <span>Dossier en Examen</span>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/artisans/devenir-artisan')}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Statut: {myArtisanProfile.status}</span>
                  </button>
                )}
              </div>
            ) : (
              // User does not have an artisan application yet
              <button
                onClick={() => {
                  if (!currentUser) {
                    navigate('/auth?redirect=/artisans/devenir-artisan');
                  } else {
                    navigate('/artisans/devenir-artisan');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-extrabold shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <PlusCircle className="w-4 h-4 text-slate-950 group-hover:rotate-90 transition-transform duration-300" />
                <span>Devenir artisan</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Side Drawer Component */}
      <ArtisanSideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        artisanProfile={myArtisanProfile}
        loadingProfile={loadingProfile}
      />
    </>
  );
};
