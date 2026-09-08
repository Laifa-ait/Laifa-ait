import React from 'react';
import { OlmaImmoNavbar } from './OlmaImmoNavbar';
import { OlmaImmoBottomNav } from './OlmaImmoBottomNav';
import { cn } from '../../lib/utils';

export interface OlmaImmoShellProps {
  children: React.ReactNode;
  /**
   * Contrôle l'affichage de la navigation mobile inférieure.
   * Par défaut: true.
   */
  showBottomNav?: boolean;
  /**
   * Si true, le conteneur principal prend 100% de la largeur sans contrainte max-w-7xl ni padding horizontal.
   * Si false (défaut), applique un centrage contraint (max-w-7xl mx-auto px-4 sm:px-6 lg:px-8).
   */
  fullWidth?: boolean;
  /**
   * Classe CSS additionnelle injectée sur le landmark <main>.
   */
  className?: string;
  /**
   * Header personnalisé. Si non renseigné (undefined), rend OlmaImmoNavbar par défaut.
   * Passer null pour ne pas afficher de Header.
   */
  header?: React.ReactNode;
  /**
   * BottomNav personnalisée. Si non renseigné (undefined), rend OlmaImmoBottomNav lorsque showBottomNav=true.
   */
  bottomNav?: React.ReactNode;
}

/**
 * Shell structurel commun pour les pages du vertical Olma Immo.
 * Fournit l'isolation de scope CSS (.olma-immo-scope), les tokens visuels,
 * le landmark principal <main id="olma-immo-content"> et l'accueil des navigations.
 */
export const OlmaImmoShell: React.FC<OlmaImmoShellProps> = React.memo(
  ({
    children,
    showBottomNav = true,
    fullWidth = false,
    className,
    header,
    bottomNav,
  }) => {
    const headerNode = header !== undefined ? header : <OlmaImmoNavbar />;
    const bottomNavNode =
      bottomNav !== undefined
        ? bottomNav
        : showBottomNav
        ? <OlmaImmoBottomNav />
        : null;

    return (
      <div
        className="olma-immo-scope min-h-screen bg-[var(--olma-bg-base)] text-[var(--olma-text-primary)] flex flex-col font-sans selection:bg-[#1A3831]/20 selection:text-[#0D281E]"
        data-testid="olma-immo-shell"
      >
        <a
          href="#olma-immo-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#1a3831] focus:text-[#ebdcb8] focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#ebdcb8] text-xs font-bold uppercase tracking-wider"
        >
          Passer au contenu immobilier
        </a>

        {headerNode}

        <main
          id="olma-immo-content"
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

OlmaImmoShell.displayName = 'OlmaImmoShell';
