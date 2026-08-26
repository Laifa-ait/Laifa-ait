import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, PhoneCall, ArrowLeft, HardHat, UserCheck, Menu } from 'lucide-react';
import { ActiveArtisanProfile } from '../../types/bricolage';
import { BricolageLanguageSelector } from './BricolageLanguageSelector';
import { useBricolageI18n } from '../../hooks/useBricolageI18n';

interface BricolageHeaderProps {
  onRequestQuoteClick?: () => void;
  activeArtisanProfile?: ActiveArtisanProfile | null;
  onOpenArtisanAuth?: () => void;
  onLogoutArtisan?: () => void;
  olmartCustomerName?: string;
  onOpenSidebar?: () => void;
}

export const BricolageHeader: React.FC<BricolageHeaderProps> = ({
  onRequestQuoteClick: _onRequestQuoteClick,
  activeArtisanProfile,
  onOpenArtisanAuth: _onOpenArtisanAuth,
  onLogoutArtisan: _onLogoutArtisan,
  olmartCustomerName = 'Demandeur Olmart',
  onOpenSidebar
}) => {
  const { tBricolage } = useBricolageI18n();

  return (
    <header className="w-full bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      {/* Top Industrial Hotline Bar */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-slate-950 text-xs py-2 px-4 sm:px-8 font-semibold shadow-inner">
        <div className="w-full max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 font-bold">
            <span className="inline-flex items-center gap-1.5 bg-slate-950 text-amber-400 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              {tBricolage('header.hotlineBadge', 'SOS DÉPANNAGE 24/7')}
            </span>
            <span className="hidden md:inline text-slate-950">
              {tBricolage('header.hotlineSub', 'Interventions rapides à domicile : Plomberie, Climatisation, Électricité & Serrurerie')}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            {/* Auto imported Olmart client badge */}
            <span className="hidden lg:flex items-center gap-1.5 bg-slate-950/10 px-2.5 py-1 rounded-lg text-slate-900 font-extrabold text-[11px]">
              <UserCheck className="w-3.5 h-3.5 text-slate-950" />
              <span>{tBricolage('header.clientAccount', 'Compte Client :')} {olmartCustomerName}</span>
            </span>

            <a
              href="tel:023000000"
              className="flex items-center gap-1.5 bg-slate-950/10 hover:bg-slate-950 hover:text-white px-2.5 py-1 rounded-lg transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5 text-slate-950 group-hover:text-white" />
              <span>{tBricolage('header.hotlineTel', 'Hotline : 023 00 00 00')}</span>
            </a>
            <span className="hidden sm:inline text-slate-950/40">|</span>
            <span className="hidden sm:flex items-center gap-1 text-slate-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>{tBricolage('header.guaranteeLabel', 'Garantie Travaux Olma Safe')}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Bricolage Navigation Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Industrial Brand Logo + Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {onOpenSidebar && (
            <button
              onClick={onOpenSidebar}
              className="p-2 rounded-xl bg-slate-900 text-amber-400 hover:bg-slate-800 transition-colors shadow-md border border-slate-800 flex items-center gap-1.5 font-extrabold text-xs"
              title="Ouvrir le menu latéral"
            >
              <Menu className="w-5 h-5 text-amber-400" />
              <span className="hidden sm:inline">{tBricolage('header.menuToggle', 'Menu')}</span>
            </button>
          )}

          <Link to="/bricolage" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform border border-amber-400">
              <HardHat className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  {tBricolage('header.brandTitle', 'OLMA BRICOLAGE')}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-900 text-amber-400 tracking-wider">
                  PRO DZ
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {tBricolage('header.brandSub', 'Artisans Qualifiés & Services Industriels en Algérie')}
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Actions & Unified Account Controls */}
        <div className="flex items-center gap-2.5">
          {/* Multi-Language i18n Selector (FR / AR / EN) */}
          <BricolageLanguageSelector />

          {activeArtisanProfile && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-xl p-2 px-3">
              <div className="text-left hidden md:block">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-slate-900 leading-none">
                    {activeArtisanProfile.fullName}
                  </span>
                </div>
                <span className="text-[10px] text-amber-800 font-extrabold block mt-0.5">
                  Artisan Pro • {activeArtisanProfile.specialty}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-1 rounded bg-amber-500 text-slate-950">
                {tBricolage('header.artisanCertified', 'Pro Certifié')}
              </span>
            </div>
          )}

          <Link
            to="/"
            className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold border border-slate-200 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-amber-600" />
            <span>{tBricolage('header.marketplaceReturn', 'Marketplace Olmart')}</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

