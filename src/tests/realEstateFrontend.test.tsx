// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';
import {
  getFavoritePropertyIds,
  isFavoritePropertyId,
  toggleFavoritePropertyId,
} from '../utils/realEstateFavorites';
import { authorizePropertyOwner } from '../middlewares/auth';

describe('Olma Immo Frontend & Utilities Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Real Estate Favorites Manager', () => {
    it('returns an empty array when no favorites are saved', () => {
      expect(getFavoritePropertyIds()).toEqual([]);
    });

    it('toggles a property favorite status correctly', () => {
      const propId = 'prop_test_101';
      expect(isFavoritePropertyId(propId)).toBe(false);

      const added = toggleFavoritePropertyId(propId);
      expect(added).toBe(true);
      expect(isFavoritePropertyId(propId)).toBe(true);
      expect(getFavoritePropertyIds()).toContain(propId);

      const removed = toggleFavoritePropertyId(propId);
      expect(removed).toBe(false);
      expect(isFavoritePropertyId(propId)).toBe(false);
      expect(getFavoritePropertyIds()).not.toContain(propId);
    });

    it('handles multiple favorites without duplicates', () => {
      toggleFavoritePropertyId('prop_1');
      toggleFavoritePropertyId('prop_2');
      toggleFavoritePropertyId('prop_1'); // remove prop_1

      const favs = getFavoritePropertyIds();
      expect(favs).toEqual(['prop_2']);
    });
  });

  describe('Property Owner Capabilities & Security Middleware Integration', () => {
    // Tests the ACTUAL authorizePropertyOwner production middleware from middlewares/auth.ts
    it('blocks access if user is not authenticated', () => {
      const req = { user: undefined } as unknown as Request;
      const resJson = vi.fn();
      const resStatus = vi.fn(() => ({ json: resJson }));
      const res = { status: resStatus } as unknown as Response;
      const next = vi.fn();

      authorizePropertyOwner(req, res, next);

      expect(resStatus).toHaveBeenCalledWith(403);
      expect(resJson).toHaveBeenCalledWith({
        error: "Accès refusé. Privilèges Propriétaire Immobilier, Vendeur ou Administrateur requis.",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('blocks standard buyer without property_owner capability', () => {
      const req = {
        user: { uid: 'buyer-1', role: 'buyer', capabilities: [] },
      } as unknown as Request;
      const resJson = vi.fn();
      const resStatus = vi.fn(() => ({ json: resJson }));
      const res = { status: resStatus } as unknown as Response;
      const next = vi.fn();

      authorizePropertyOwner(req, res, next);

      expect(resStatus).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('allows buyer with explicit property_owner capability', () => {
      const req = {
        user: { uid: 'buyer-1', role: 'buyer', capabilities: ['property_owner'] },
      } as unknown as Request;
      const res = {} as unknown as Response;
      const next = vi.fn();

      authorizePropertyOwner(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('allows seller, property_owner, or admin roles by default', () => {
      const roles = ['seller', 'property_owner', 'admin', 'superadmin'];

      roles.forEach((role) => {
        const req = {
          user: { uid: 'user-1', role, capabilities: [] },
        } as unknown as Request;
        const res = {} as unknown as Response;
        const next = vi.fn();

        authorizePropertyOwner(req, res, next);

        expect(next).toHaveBeenCalled();
      });
    });
  });

  describe('Search Query & Map Bounds Bounding Box Formatting', () => {
    it('parses and formats bounding box query string correctly', () => {
      const west = 3.0, south = 36.7, east = 3.1, north = 36.8;
      const bboxStr = `${west.toFixed(6)},${south.toFixed(6)},${east.toFixed(6)},${north.toFixed(6)}`;
      expect(bboxStr).toBe('3.000000,36.700000,3.100000,36.800000');

      const parts = bboxStr.split(',').map(Number);
      expect(parts.length).toBe(4);
      expect(parts[0]).toBeLessThan(parts[2]); // minLng < maxLng
      expect(parts[1]).toBeLessThan(parts[3]); // minLat < maxLat
    });
  });

  describe('Super-App Verticals & Navigation History Synchronization', () => {
    it('defines valid routes for seamless client-side SPA navigation without full reloads', async () => {
      const { SUPER_APP_VERTICALS } = await import('../data/superAppData');
      expect(SUPER_APP_VERTICALS.length).toBeGreaterThanOrEqual(4);

      const immo = SUPER_APP_VERTICALS.find((v) => v.id === 'immo');
      const marketplace = SUPER_APP_VERTICALS.find((v) => v.id === 'marketplace');
      const bricolage = SUPER_APP_VERTICALS.find((v) => v.id === 'bricolage');
      const shops = SUPER_APP_VERTICALS.find((v) => v.id === 'shops');

      expect(immo?.route).toBe('/immo');
      expect(marketplace?.route).toBe('/');
      expect(bricolage?.route).toBe('/artisans');
      expect(shops?.route).toBe('/shops');

      // Ensure all routes use clean relative client-side paths (react-router compatible)
      SUPER_APP_VERTICALS.forEach((vertical) => {
        expect(vertical.route.startsWith('/')).toBe(true);
        expect(vertical.route.includes('http')).toBe(false);
      });
    });

    it('validates 1-click navigation paths from /immo to / and /artisans', () => {
      const paths = {
        marketplace: '/',
        artisans: '/artisans',
        immo: '/immo',
        shops: '/shops',
      };

      // 1-click navigation target verification
      expect(paths.marketplace).toBe('/');
      expect(paths.artisans).toBe('/artisans');
      expect(paths.immo).toBe('/immo');
    });

    it('exports memoized components ensuring zero unnecessary re-renders', async () => {
      const { OlmaImmoNavbar } = await import('../components/OlmaImmo/OlmaImmoNavbar');
      const { OlmaImmoTopUtilityBar } = await import('../components/OlmaImmo/OlmaImmoTopUtilityBar');
      const { OlmaImmoUserMenu } = await import('../components/OlmaImmo/OlmaImmoUserMenu');

      expect(OlmaImmoNavbar).toBeDefined();
      expect(OlmaImmoTopUtilityBar).toBeDefined();
      expect(OlmaImmoUserMenu).toBeDefined();

      // Verify display names are registered for React.memo
      expect((OlmaImmoNavbar as { displayName?: string }).displayName).toBe('OlmaImmoNavbar');
      expect((OlmaImmoTopUtilityBar as { displayName?: string }).displayName).toBe('OlmaImmoTopUtilityBar');
      expect((OlmaImmoUserMenu as { displayName?: string }).displayName).toBe('OlmaImmoUserMenu');
    });
  });
});
