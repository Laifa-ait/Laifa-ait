import React from 'react';
import { ArtisanNavbar } from '../ArtisanNavbar';
import { ArtisanMobileBottomNav } from '../ArtisanMobileBottomNav';
import { cn } from '../../../lib/utils';

export interface OlmaArtisanShellProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  fullWidth?: boolean;
  className?: string;
  header?: React.ReactNode;
  bottomNav?: React.ReactNode;
  activeTab?: string;
}

export const OlmaArtisanShell: React.FC<OlmaArtisanShellProps> = React.memo(
  ({
    children,
    showBottomNav = true,
    fullWidth = false,
    className,
    header,
    bottomNav,
    activeTab = 'explorer',
  }) => {
    const headerNode = header !== undefined ? header : <ArtisanNavbar activeTab={activeTab} />;
    const bottomNavNode =
      bottomNav !== undefined
        ? bottomNav
        : showBottomNav
        ? <ArtisanMobileBottomNav />
        : null;

    return (
      <div
        className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-[#1E3A8A]/20 selection:text-[#172554]"
        data-testid="olma-artisan-shell"
      >
        <a
          href="#olma-artisan-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#1E3A8A] focus:text-white focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B] text-xs font-bold uppercase tracking-wider"
        >
          Passer au contenu artisans
        </a>

        {headerNode}

        <main
          id="olma-artisan-content"
          tabIndex={-1}
          className={cn(
            'flex-1 w-full focus:outline-none',
            !fullWidth && 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
            showBottomNav && 'pb-20 md:pb-8',
            className
          )}
        >
          {children}
        </main>

        {bottomNavNode}
      </div>
    );
  }
);

OlmaArtisanShell.displayName = 'OlmaArtisanShell';
