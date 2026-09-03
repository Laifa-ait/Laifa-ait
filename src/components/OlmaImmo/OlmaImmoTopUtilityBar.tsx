import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, ShoppingBag, Wrench, Building2, Store } from 'lucide-react';

interface OlmaImmoTopUtilityBarProps {
  onOpenSwitcher: () => void;
}

export const OlmaImmoTopUtilityBar: React.FC<OlmaImmoTopUtilityBarProps> = React.memo(
  ({ onOpenSwitcher }) => {
    const location = useLocation();

    return (
      <div
        id="olma-immo-top-utility-bar"
        className="bg-stone-950 text-stone-300 text-xs font-medium px-3 sm:px-6 lg:px-8 py-1.5 border-b border-stone-800/80 sticky top-0 z-50 shadow-xs"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide py-0.5">
          {/* Universes Navigation Hub - 1-Click Direct Cross-Vertical Navigation */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              id="olma-immo-utility-univers-btn"
              onClick={onOpenSwitcher}
              className="px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-stone-950 cursor-pointer group shadow-2xs mr-1"
              title="Ouvrir le commutateur d'univers Olmart"
              aria-label="Commutateur Univers Olmart"
            >
              <LayoutGrid className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
              <span>Univers</span>
            </button>

            {/* 1-Click Direct to Marketplace */}
            <Link
              to="/"
              id="olma-immo-link-marketplace"
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                location.pathname === '/' || location.pathname.startsWith('/shop')
                  ? 'bg-amber-500 text-stone-950 shadow-xs font-bold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
              title="Aller à la Marketplace en 1 clic"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>Marketplace</span>
            </Link>

            {/* 1-Click Direct to Artisans / Bricolage */}
            <Link
              to="/artisans"
              id="olma-immo-link-artisans"
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                location.pathname.startsWith('/artisans') || location.pathname.startsWith('/bricolage')
                  ? 'bg-amber-500 text-stone-950 shadow-xs font-bold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
              title="Aller aux Artisans & Bricolage en 1 clic"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>Artisans & Bricolage</span>
            </Link>

            {/* Active Olma Immo */}
            <Link
              to="/immo"
              id="olma-immo-link-immo"
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                location.pathname.startsWith('/immo')
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
              title="Olma Immo (Actif)"
            >
              <Building2 className="w-3.5 h-3.5 text-stone-950" />
              <span>Olma Immo</span>
              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-full bg-stone-950/30 text-stone-950 font-extrabold">
                Séjours
              </span>
            </Link>

            {/* 1-Click Direct to Boutiques */}
            <Link
              to="/shops"
              id="olma-immo-link-shops"
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                location.pathname.startsWith('/shops')
                  ? 'bg-amber-500 text-stone-950 shadow-xs font-bold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
              }`}
              title="Aller aux Boutiques Pro en 1 clic"
            >
              <Store className="w-3.5 h-3.5 text-orange-400" />
              <span>Boutiques</span>
            </Link>
          </div>

          {/* Right indicator: Hub info */}
          <div className="hidden md:flex items-center gap-3 text-stone-400 text-[11px] shrink-0">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Super-App Olmart Algérie
            </span>
          </div>
        </div>
      </div>
    );
  }
);

OlmaImmoTopUtilityBar.displayName = 'OlmaImmoTopUtilityBar';
