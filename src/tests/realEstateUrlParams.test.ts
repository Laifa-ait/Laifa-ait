import { describe, it, expect } from 'vitest';
import {
  searchParamsToFilters,
  filtersToSearchParams,
  parseNumberParam,
} from '../utils/realEstateUrlParams';
import { FilterState } from '../components/OlmaImmo/SearchFilters';

describe('realEstateUrlParams', () => {
  describe('parseNumberParam', () => {
    it('returns undefined for null, empty or invalid values', () => {
      expect(parseNumberParam(null)).toBeUndefined();
      expect(parseNumberParam('')).toBeUndefined();
      expect(parseNumberParam('abc')).toBeUndefined();
      expect(parseNumberParam('-50')).toBeUndefined();
    });

    it('returns valid positive number', () => {
      expect(parseNumberParam('15000000')).toBe(15000000);
      expect(parseNumberParam('0')).toBe(0);
    });
  });

  describe('searchParamsToFilters', () => {
    it('parses empty search params with default sort', () => {
      const params = new URLSearchParams();
      const { filters, showFavoritesOnly } = searchParamsToFilters(params);

      expect(filters.listingType).toBeUndefined();
      expect(filters.sort).toBe('recent');
      expect(showFavoritesOnly).toBe(false);
    });

    it('parses complete search params into valid FilterState', () => {
      const params = new URLSearchParams({
        transaction: 'sale',
        propertyType: 'villa',
        wilaya: 'Alger',
        commune: 'Hydra',
        minPrice: '10000000',
        maxPrice: '35000000',
        minRooms: '4',
        minArea: '150',
        legalPaper: 'acte_notarie',
        hasActeNotarie: 'true',
        hasLivretFoncier: 'true',
        sort: 'price_asc',
        favorites: 'true',
      });

      const { filters, showFavoritesOnly } = searchParamsToFilters(params);

      expect(filters.listingType).toBe('sale');
      expect(filters.propertyType).toBe('villa');
      expect(filters.wilaya).toBe('Alger');
      expect(filters.commune).toBe('Hydra');
      expect(filters.minPrice).toBe(10000000);
      expect(filters.maxPrice).toBe(35000000);
      expect(filters.minRooms).toBe(4);
      expect(filters.minArea).toBe(150);
      expect(filters.legalPaperType).toBe('acte_notarie');
      expect(filters.hasActeNotarie).toBe(true);
      expect(filters.hasLivretFoncier).toBe(true);
      expect(filters.sort).toBe('price_asc');
      expect(showFavoritesOnly).toBe(true);
    });
  });

  describe('filtersToSearchParams', () => {
    it('produces clean search params without undefined or empty values', () => {
      const filters: FilterState = {
        listingType: 'rent_long',
        wilaya: 'Oran',
        sort: 'recent', // default sort should not pollute URL
      };

      const params = filtersToSearchParams(filters, false);

      expect(params.get('transaction')).toBe('rent_long');
      expect(params.get('wilaya')).toBe('Oran');
      expect(params.get('propertyType')).toBeNull();
      expect(params.get('sort')).toBeNull();
      expect(params.get('favorites')).toBeNull();
    });

    it('serializes full state with roundtrip fidelity', () => {
      const original: FilterState = {
        listingType: 'sale',
        propertyType: 'apartment',
        wilaya: 'Constantine',
        commune: 'El Khroub',
        minPrice: 8000000,
        maxPrice: 20000000,
        minRooms: 3,
        minArea: 85,
        hasActeNotarie: true,
        hasLivretFoncier: true,
        legalPaperType: 'acte_notarie',
        sort: 'price_desc',
      };

      const params = filtersToSearchParams(original, true);
      const { filters: restored, showFavoritesOnly } = searchParamsToFilters(params);

      expect(restored).toEqual(original);
      expect(showFavoritesOnly).toBe(true);
    });
  });
});
