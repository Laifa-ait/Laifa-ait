import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutGrid,
  Menu,
  FileText,
  LayoutDashboard,
  Clock,
  PlusCircle,
  Compass,
  AlertTriangle,
  Hammer,
  Send,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchMyArtisanProfile, fetchClientMyRequests } from '../../services/artisan.api';
import { ArtisanProfile } from '../../types/artisan';
import { ArtisanSideDrawer } from './ArtisanSideDrawer';
import { SuperAppSwitcherModal } from '../common/SuperAppSwitcherModal';
import { OlmaArtisanUserMenu } from './shell/OlmaArtisanUserMenu';
import { OlmaLanguageSelector } from '../common/OlmaLanguageSelector';

interface ArtisanNavbarProps {
  activeTab?: string;
  onFilterUrgency?: () => void;
  onFilterRenovation?: () => void;
}

export const ArtisanNavbar: React.FC<ArtisanNavbarProps> = ({
  activeTab = 'explorer',
  onFilterUrgency,
  onFilterRenovation,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [myArtisanProfile, setMyArtisanProfile] = useState<ArtisanProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [clientQuotesCount, setClientQuotesCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      setLoadingProfile(true);
      fetchMyArtisanProfile()
        .then((profile) => setMyArtisanProfile(profile))
        .finally(() => setLoadingProfile(false));

      fetchClientMyRequests()
        .then((quotes) => {
          setClientQuotesCount(quotes.length);
        })
        .catch(() => setClientQuotesCount(0));
    } else {
      setMyArtisanProfile(null);
      setClientQuotesCount(0);
    }
  }, [currentUser]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#F8FAFC]/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(30,58,138,0.03)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand + Application Switcher matching Olma Immo */}
          <div className="flex items-center gap-3">
            <Link to="/artisans" className="flex items-center gap-1.5 group">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E293B] font-['Playfair_Display',serif] select-none">
                OLMA
              </span>
              <span className="text-[11px] sm:text-xs font-bold tracking-widest text-slate-500 uppercase">
                ARTISANS
              </span>
            </Link>

            {/* Applications SuperApp Switcher Button */}
            <button
              type="button"
              onClick={() => setIsSwitcherOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100/90 text-slate-700 hover:text-slate-950 hover:bg-slate-200/80 border border-slate-200/70 transition-all cursor-pointer shadow-2xs group"
              title="Changer d'univers Olmart"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-amber-600 group-hover:scale-105 transition-transform" />
              <span>{t('nav_applications')}</span>
            </button>
          </div>

          {/* Center: Travel Pill Navigation matching Olma Immo */}
          <nav
            aria-label="Navigation principale"
            className="hidden md:flex items-center gap-1 bg-slate-100/80 rounded-full border border-slate-200/60 p-1 shadow-2xs"
          >
            <button
              type="button"
              onClick={() => navigate('/artisans')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'explorer'
                  ? 'bg-white text-[#1E293B] font-semibold shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B] hover:bg-white/50'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t('nav_explorer')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onFilterUrgency) onFilterUrgency();
                else navigate('/artisans?urgency=true');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'urgency'
                  ? 'bg-white text-rose-700 font-semibold shadow-xs'
                  : 'text-[#64748B] hover:text-rose-700 hover:bg-white/50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>{t('nav_urgency_247')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onFilterRenovation) onFilterRenovation();
                else navigate('/artisans?trade=renovation');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'renovation'
                  ? 'bg-white text-[#1E293B] font-semibold shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B] hover:bg-white/50'
              }`}
            >
              <Hammer className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('nav_renovation')}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/artisans/annonces')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'broadcasts'
                  ? 'bg-white text-[#1E293B] font-semibold shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B] hover:bg-white/50'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('nav_broadcasts')}</span>
            </button>

            {currentUser && (
              <button
                type="button"
                onClick={() => navigate('/artisans/mes-demandes')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'quotes'
                    ? 'bg-white text-[#1E293B] font-semibold shadow-xs'
                    : 'text-[#64748B] hover:text-[#1E293B] hover:bg-white/50'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('nav_my_quotes')}</span>
                {clientQuotesCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {clientQuotesCount}
                  </span>
                )}
              </button>
            )}
          </nav>

          {/* Right: Relocated Action Button & User Menu matching Olma Immo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector (FR / AR / EN) */}
            <OlmaLanguageSelector variant="compact" />

            {/* Relocated Primary Action Button */}
            {loadingProfile ? (
              <div className="h-9 w-28 bg-slate-100 animate-pulse rounded-full" />
            ) : myArtisanProfile ? (
              myArtisanProfile.status === 'approved' ? (
                <button
                  type="button"
                  onClick={() => navigate('/artisans/dashboard')}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 hover:text-slate-950 px-4 py-2 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t('nav_pro_space')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/artisans/devenir-artisan')}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('nav_under_review')}</span>
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    navigate('/auth?redirect=/artisans/devenir-artisan');
                  } else {
                    navigate('/artisans/devenir-artisan');
                  }
                }}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 hover:text-slate-950 px-4 py-2 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all shadow-2xs cursor-pointer group"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-600 group-hover:rotate-90 transition-transform duration-200" />
                <span>{t('nav_become_artisan')}</span>
              </button>
            )}

            {/* User Profile Avatar Dropdown Menu */}
            <OlmaArtisanUserMenu
              artisanProfile={myArtisanProfile}
              clientQuotesCount={clientQuotesCount}
            />

            {/* Hamburger Drawer Trigger (Barre à trois traits) */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-amber-50 active:bg-amber-100 text-slate-800 hover:text-amber-700 border border-slate-200/80 hover:border-amber-300 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              aria-label="Ouvrir le menu complet"
              title="Menu et navigation complète"
            >
              <Menu className="w-5 h-5 stroke-[2.2]" />
            </button>
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

      {/* Super App Switcher Modal */}
      <SuperAppSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />
    </>
  );
};
