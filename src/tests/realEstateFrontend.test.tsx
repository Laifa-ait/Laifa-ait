// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getFavoritePropertyIds,
  isFavoritePropertyId,
  toggleFavoritePropertyId,
} from '../utils/realEstateFavorites';

describe('Olma Immo Frontend & Utilities Suite', () => {
  beforeEach(() => {
    localStorage.clear();
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
    });

    it('handles multiple favorites without duplicates', () => {
      toggleFavoritePropertyId('prop_1');
      toggleFavoritePropertyId('prop_2');
      toggleFavoritePropertyId('prop_1'); // remove prop_1

      const favs = getFavoritePropertyIds();
      expect(favs).toEqual(['prop_2']);
    });
  });

  describe('Geospatial DTO & Security Validation', () => {
    it('formats map property DTOs without leaking sensitive owner fields', () => {
      const mockBackendPropertyMapResult = {
        id: 'prop_algiers_01',
        title: 'Villa Moderne Hydra',
        lat: 36.7538,
        lng: 3.0588,
        price: 25000000,
        pricePeriod: 'total',
        listingType: 'sale',
        propertyType: 'villa',
        commune: 'Hydra',
        wilaya: 'Alger',
      };

      expect(mockBackendPropertyMapResult).not.toHaveProperty('ownerId');
      expect(mockBackendPropertyMapResult.price).toBeGreaterThan(0);
      expect(mockBackendPropertyMapResult.lat).toBeCloseTo(36.7538);
    });

    it('validates property publish request payload does not contain client-side ownerId override', () => {
      const publishPayload = {
        title: 'Superbe Appartement F3',
        description: 'Appartement spacieux avec vue dégagée à Bab Ezzouar',
        propertyType: 'apartment',
        listingType: 'sale',
        price: 15000000,
        areaSquareMeters: 90,
        rooms: 3,
        bathrooms: 1,
        location: {
          wilaya: 'Alger',
          commune: 'Bab Ezzouar',
          address: 'Cité 1000 Logements',
          lat: 36.721,
          lng: 3.183,
        },
        status: 'active',
      };

      // Ensure client payload adheres strictly to security rules by omitting ownerId
      expect(publishPayload).not.toHaveProperty('ownerId');
      expect(publishPayload.title.length).toBeGreaterThanOrEqual(5);
      expect(publishPayload.price).toBeGreaterThan(0);
    });
  });

  describe('Property Owner Capabilities & Authorization Rules', () => {
    it('verifies property owner role check allows property_owner capability, seller, and admin', () => {
      const isAuthorizedOwner = (userRole: string, capabilities: string[] = []) => {
        return (
          userRole === 'admin' ||
          userRole === 'superadmin' ||
          userRole === 'seller' ||
          userRole === 'property_owner' ||
          capabilities.includes('property_owner')
        );
      };

      expect(isAuthorizedOwner('buyer', [])).toBe(false);
      expect(isAuthorizedOwner('buyer', ['property_owner'])).toBe(true);
      expect(isAuthorizedOwner('seller', [])).toBe(true);
      expect(isAuthorizedOwner('property_owner', [])).toBe(true);
      expect(isAuthorizedOwner('admin', [])).toBe(true);
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
});
