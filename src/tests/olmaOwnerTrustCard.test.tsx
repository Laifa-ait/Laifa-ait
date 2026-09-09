// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OwnerTrustCard } from '../components/OlmaImmo/OwnerTrustCard';
import { PublicOwnerProfile } from '../types/realEstate';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('OwnerTrustCard — Security & Presentation Tests', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    container = null;
    root = null;
  });

  it('renders loading skeleton with accessible aria-busy attribute', () => {
    act(() => {
      root?.render(<OwnerTrustCard owner={null} isLoading={true} error={false} />);
    });

    const surface = container?.querySelector('[aria-busy="true"]');
    expect(surface).not.toBeNull();
    expect(surface?.getAttribute('aria-label')).toBe("Chargement du profil de l'annonceur");
  });

  it('renders fallback safely when owner is null or error is true without throwing', () => {
    act(() => {
      root?.render(<OwnerTrustCard owner={null} isLoading={false} error={true} />);
    });

    expect(container?.textContent).toContain('Annonceur');
    expect(container?.textContent).toContain('Informations publiques non renseignées');
  });

  it('displays "Identité vérifiée" when backend indicates verificationStatus === "approved"', () => {
    const verifiedOwner: PublicOwnerProfile = {
      displayName: 'Yacine Benali',
      role: 'property_owner',
      verificationStatus: 'approved',
      joinedAt: '2024-05-15T10:00:00Z',
    };

    act(() => {
      root?.render(<OwnerTrustCard owner={verifiedOwner} isLoading={false} error={false} />);
    });

    expect(container?.textContent).toContain('Yacine Benali');
    expect(container?.textContent).toContain('Identité vérifiée');
    expect(container?.textContent).toContain('Membre depuis 2024');
    expect(container?.textContent).toContain('Propriétaire');
    expect(container?.textContent).not.toContain('Professionnel');
  });

  it('displays neutral "Annonceur" when owner is not approved and never leaks moderation states', () => {
    const unverifiedOwner: PublicOwnerProfile = {
      displayName: 'Amine Kaci',
      role: 'buyer',
      verificationStatus: 'unverified',
      joinedAt: '2025-01-10T00:00:00Z',
    };

    act(() => {
      root?.render(<OwnerTrustCard owner={unverifiedOwner} isLoading={false} error={false} />);
    });

    expect(container?.textContent).toContain('Amine Kaci');
    expect(container?.textContent).not.toContain('Identité vérifiée');
    expect(container?.textContent).not.toContain('Dossier à compléter');
    expect(container?.textContent).not.toContain('Vérification en cours');
    expect(container?.textContent).not.toContain('Rejeté');
  });

  it('displays "Professionnel" ONLY when sellerType === "professional"', () => {
    const proOwner: PublicOwnerProfile = {
      displayName: 'Mehdi Agency',
      shopName: 'Cabinet Immobilier El Bahdja',
      role: 'seller',
      sellerType: 'professional',
      verificationStatus: 'approved',
      joinedAt: '2023-11-20T00:00:00Z',
    };

    act(() => {
      root?.render(<OwnerTrustCard owner={proOwner} isLoading={false} error={false} />);
    });

    expect(container?.textContent).toContain('Cabinet Immobilier El Bahdja');
    expect(container?.textContent).toContain('Professionnel');
    expect(container?.textContent).toContain('Identité vérifiée');
    expect(container?.textContent).toContain('Annonce professionnelle vérifiable');
  });

  it('does NOT label standard individual sellers as "Professionnel"', () => {
    const individualSeller: PublicOwnerProfile = {
      displayName: 'Samir Mansouri',
      role: 'seller',
      sellerType: 'individual',
      verificationStatus: 'unverified',
    };

    act(() => {
      root?.render(<OwnerTrustCard owner={individualSeller} isLoading={false} error={false} />);
    });

    expect(container?.textContent).toContain('Samir Mansouri');
    expect(container?.textContent).not.toContain('Professionnel');
  });

  it('handles invalid joinedAt dates gracefully without displaying NaN', () => {
    const ownerWithBadDate: PublicOwnerProfile = {
      displayName: 'Karim',
      role: 'property_owner',
      verificationStatus: 'approved',
      joinedAt: 'invalid-date-string',
    };

    act(() => {
      root?.render(<OwnerTrustCard owner={ownerWithBadDate} isLoading={false} error={false} />);
    });

    expect(container?.textContent).not.toContain('NaN');
    expect(container?.textContent).not.toContain('Membre depuis');
  });

  it('ensures NO PII (phone, email, uid) is ever exposed in rendered HTML attributes or text', () => {
    const owner: PublicOwnerProfile = {
      displayName: 'Nadia Larbi',
      role: 'property_owner',
      verificationStatus: 'approved',
    };

    act(() => {
      root?.render(<OwnerTrustCard owner={owner} isLoading={false} error={false} />);
    });

    const html = container?.innerHTML || '';
    expect(html).not.toContain('tel:');
    expect(html).not.toContain('mailto:');
    expect(html).not.toContain('owner123');
    expect(html).not.toContain('private@');
  });
});
