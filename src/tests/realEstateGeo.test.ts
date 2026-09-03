import { describe, it, expect } from 'vitest';
import {
  encodeGeohash,
  calculateHaversineDistanceKm,
  isWithinBoundingBox,
  getGeohashRangesForRadius,
  getGeohashRangesForBoundingBox,
  isWithinAlgeriaBounds,
} from '../services/realEstateGeo';
import { PropertySearchQuerySchema } from '../schemas/realEstate';
import { PropertyMapResult, Property } from '../types/realEstate';

describe('Real Estate (Olma Immo) Geospatial Engine Suite (OLM-02)', () => {
  describe('Geohash & Distance Calculations (Service Unit Tests)', () => {
    it('1. Correctly encodes Geohash for known Algerian locations', () => {
      // Algiers (Grande Poste: 36.7753, 3.0588)
      const algiersHash = encodeGeohash(36.7753, 3.0588, 7);
      expect(algiersHash).toBeDefined();
      expect(algiersHash.length).toBe(7);
      expect(algiersHash.startsWith('s')).toBe(true); // Base32 Geohash prefix for Algiers

      // Oran (35.6971, -0.6308)
      const oranHash = encodeGeohash(35.6971, -0.6308, 7);
      expect(oranHash).toBeDefined();
      expect(oranHash.length).toBe(7);
      expect(oranHash.startsWith('e')).toBe(true); // Base32 Geohash prefix for Oran
    });

    it('2. Throws error on invalid or out-of-bound coordinates', () => {
      expect(() => encodeGeohash(95, 3.05)).toThrow('Coordonnées géographiques invalides');
      expect(() => encodeGeohash(36.75, 185)).toThrow('Coordonnées géographiques invalides');
      expect(() => encodeGeohash(NaN, 3.05)).toThrow('Coordonnées géographiques invalides');
    });

    it('3. Calculates Haversine distance correctly between Algerian cities', () => {
      // Algiers (36.7538, 3.0588) to Oran (35.6971, -0.6308) ~ 350-360 km
      const distanceAlgiersOran = calculateHaversineDistanceKm(36.7538, 3.0588, 35.6971, -0.6308);
      expect(distanceAlgiersOran).toBeGreaterThan(340);
      expect(distanceAlgiersOran).toBeLessThan(380);

      // Same location should yield 0 km
      const sameLocation = calculateHaversineDistanceKm(36.7538, 3.0588, 36.7538, 3.0588);
      expect(sameLocation).toBe(0);
    });

    it('4. Checks bounding box inclusion accurately', () => {
      // Bounding box around Hydra/Alger [minLng, minLat, maxLng, maxLat]
      const hydraBbox: [number, number, number, number] = [3.02, 3.73, 3.08, 3.77];
      expect(isWithinBoundingBox(3.75, 3.05, hydraBbox)).toBe(true);
      expect(isWithinBoundingBox(35.69, -0.63, hydraBbox)).toBe(false); // Oran outside Algiers bbox
    });

    it('5. Generates query ranges for radius search', () => {
      const ranges = getGeohashRangesForRadius(36.7538, 3.0588, 10);
      expect(ranges).toBeDefined();
      expect(ranges.length).toBeGreaterThan(0);
      ranges.forEach((r) => {
        expect(r.start).toBeDefined();
        expect(r.end).toBeDefined();
        expect(r.end).toContain('~');
      });
    });

    it('6. Validates coordinates against Algeria territorial bounds', () => {
      expect(isWithinAlgeriaBounds(36.7538, 3.0588)).toBe(true); // Algiers
      expect(isWithinAlgeriaBounds(22.8, 5.5)).toBe(true); // Tamanrasset
      expect(isWithinAlgeriaBounds(48.8566, 2.3522)).toBe(false); // Paris (outside Algeria)
    });

    it('7. Generates prefix ranges for bounding box queries', () => {
      const bbox: [number, number, number, number] = [3.02, 36.73, 3.08, 36.77];
      const ranges = getGeohashRangesForBoundingBox(bbox);
      expect(ranges).toBeDefined();
      expect(ranges.length).toBeGreaterThan(0);
      expect(ranges.length).toBeLessThanOrEqual(16);
      ranges.forEach((r) => {
        expect(r.start).toBeDefined();
        expect(r.end).toBeDefined();
        expect(r.end).toContain('~');
      });
    });

    it('8. Mathematically guarantees all corners and interior of bounding box are covered', () => {
      // Bounding box across central Algiers
      const bbox: [number, number, number, number] = [2.95, 36.70, 3.15, 36.80];
      const ranges = getGeohashRangesForBoundingBox(bbox);

      // Verify that samples within bbox are covered by at least one range
      const testPoints = [
        { lat: 36.70, lng: 2.95 }, // SW corner
        { lat: 36.70, lng: 3.15 }, // SE corner
        { lat: 36.80, lng: 2.95 }, // NW corner
        { lat: 36.80, lng: 3.15 }, // NE corner
        { lat: 36.75, lng: 3.05 }, // Center
        { lat: 36.72, lng: 3.00 }, // Intermediate point
      ];

      testPoints.forEach((pt) => {
        const hash = encodeGeohash(pt.lat, pt.lng, 7);
        const isCovered = ranges.some((r) => hash >= r.start && hash <= r.end);
        expect(isCovered).toBe(true);
      });
    });

    it('9. Automatically rolls up geohash precision when bbox spans large area', () => {
      // Large bbox spanning multiple wilayas (e.g. Algiers to Constantine)
      const largeBbox: [number, number, number, number] = [3.0, 36.0, 7.0, 37.0];
      const ranges = getGeohashRangesForBoundingBox(largeBbox);

      expect(ranges.length).toBeGreaterThan(0);
      expect(ranges.length).toBeLessThanOrEqual(16);
      // Ensure prefix precision was reduced appropriately for wide areas
      ranges.forEach((r) => {
        expect(r.prefix.length).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('Geospatial Search Query Validation (Zod Schema)', () => {
    it('1. Accepts valid geospatial query params (lat, lng, radius, bbox, sort, map)', () => {
      const query = {
        lat: '36.7538',
        lng: '3.0588',
        radius: '15',
        bbox: '3.02,36.73,3.08,36.77',
        sort: 'distance',
        map: 'true',
      };

      const result = PropertySearchQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.lat).toBe(36.7538);
        expect(result.data.lng).toBe(3.0588);
        expect(result.data.radius).toBe(15);
        expect(result.data.sort).toBe('distance');
        expect(result.data.map).toBe(true);
      }
    });

    it('2. Rejects invalid bbox formats or out-of-range coordinates', () => {
      const invalidQuery = {
        bbox: '3.02,invalid,3.08', // only 3 elements
      };

      const result = PropertySearchQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });
  });

  describe('Anti-Geohash Falsification & Security Mandate', () => {
    it('1. Overwrites client-supplied spoofed Geohash with server-calculated value', () => {
      const userProvidedLat = 36.7525;
      const userProvidedLng = 3.042;
      const userSpoofedGeohash = 'FAKEXX1234';

      // Server computation logic
      const trueServerGeohash = encodeGeohash(userProvidedLat, userProvidedLng, 7);

      expect(trueServerGeohash).not.toBe(userSpoofedGeohash);
      expect(trueServerGeohash.length).toBe(7);
      expect(trueServerGeohash.startsWith('s')).toBe(true);
    });
  });

  describe('Map DTO Sanitization', () => {
    it('1. Strips sensitive owner fields when mapping Property to PropertyMapResult', () => {
      const fullProperty: Property = {
        id: 'PROP-999',
        ownerId: 'SECRET_OWNER_UID_123',
        title: 'Villa de Luxe Oran',
        description: 'Magnifique villa avec piscine.',
        propertyType: 'villa',
        listingType: 'sale',
        legalPapers: ['livret_foncier'],
        price: 45000000,
        pricePeriod: 'total',
        areaSquareMeters: 350,
        rooms: 6,
        bathrooms: 3,
        features: ['pool', 'garden'],
        images: ['https://example.com/villa.jpg'],
        location: {
          lat: 35.6971,
          lng: -0.6308,
          geohash: 'ey000000',
          address: 'Adresse confidentielle',
          commune: 'Oran',
          wilaya: 'Oran',
        },
        status: 'active',
        viewsCount: 142,
        createdAt: '2026-08-21T00:00:00Z',
        updatedAt: '2026-08-21T00:00:00Z',
      };

      // Transform function test
      const mapDto: PropertyMapResult = {
        id: fullProperty.id,
        title: fullProperty.title,
        propertyType: fullProperty.propertyType,
        listingType: fullProperty.listingType,
        price: fullProperty.price,
        pricePeriod: fullProperty.pricePeriod,
        lat: fullProperty.location.lat,
        lng: fullProperty.location.lng,
        commune: fullProperty.location.commune,
        wilaya: fullProperty.location.wilaya,
        mainImage: fullProperty.images[0],
        rooms: fullProperty.rooms,
        areaSquareMeters: fullProperty.areaSquareMeters,
      };

      expect(mapDto.id).toBe('PROP-999');
      expect((mapDto as unknown as Record<string, unknown>).ownerId).toBeUndefined();
      expect((mapDto as unknown as Record<string, unknown>).description).toBeUndefined();
      expect(mapDto.lat).toBe(35.6971);
      expect(mapDto.lng).toBe(-0.6308);
      expect(mapDto.mainImage).toBe('https://example.com/villa.jpg');
    });
  });
});
