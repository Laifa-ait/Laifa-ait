import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PublicPropertyDTO, PropertyMapResult, PropertyListResponse } from '../types/realEstate';
import { FilterState } from '../components/OlmaImmo/SearchFilters';
import { apiGet } from '../lib/api';
import { getFavoritePropertyIds } from '../utils/realEstateFavorites';
import { safeLogger } from '../utils/logger';
import { searchParamsToFilters, filtersToSearchParams } from '../utils/realEstateUrlParams';

export function useOlmaImmoProperties() {
  const [searchParams, setSearchParams] = useSearchParams();

  const parsedInitial = searchParamsToFilters(searchParams);
  const [filters, setFiltersState] = useState<FilterState>(parsedInitial.filters);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(parsedInitial.showFavoritesOnly);

  const [properties, setProperties] = useState<PublicPropertyDTO[]>([]);
  const [mapResults, setMapResults] = useState<PropertyMapResult[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'grid' | 'list' | 'map'>('split');
  const [favoritesList, setFavoritesList] = useState<string[]>(getFavoritePropertyIds());
  const [mapBounds, setMapBounds] = useState<string | null>(null);

  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const isFirstLoadRef = useRef(true);
  const prevMapBoundsRef = useRef(mapBounds);
  const currentRequestIdRef = useRef(0);

  // Sync state when URL searchParams change (browser back/forward button)
  useEffect(() => {
    const { filters: nextFilters, showFavoritesOnly: nextFavs } = searchParamsToFilters(searchParams);
    setFiltersState((prev) => {
      const isDiff = JSON.stringify(prev) !== JSON.stringify(nextFilters);
      return isDiff ? nextFilters : prev;
    });
    setShowFavoritesOnly(nextFavs);
  }, [searchParams]);

  useEffect(() => {
    const handleFavsUpdate = () => setFavoritesList(getFavoritePropertyIds());
    window.addEventListener('olma_immo:favorites_updated', handleFavsUpdate);
    return () => window.removeEventListener('olma_immo:favorites_updated', handleFavsUpdate);
  }, []);

  const setFilters = useCallback(
    (newFilters: FilterState) => {
      setFiltersState(newFilters);
      // Auto-clear selected property when filters change to prevent stale selection
      setSelectedPropertyId(undefined);
      const nextParams = filtersToSearchParams(newFilters, showFavoritesOnly);
      setSearchParams(nextParams, { replace: true });
    },
    [setSearchParams, showFavoritesOnly]
  );

  const removeFilter = useCallback(
    (key: keyof FilterState) => {
      const nextFilters = { ...filters };
      delete nextFilters[key];
      if (key === 'wilaya') {
        delete nextFilters.commune;
      }
      setFilters(nextFilters);
    },
    [filters, setFilters]
  );

  const resetAllFilters = useCallback(() => {
    const clean: FilterState = { sort: 'recent' };
    setFiltersState(clean);
    setShowFavoritesOnly(false);
    setSelectedPropertyId(undefined);
    setMapBounds(null);
    const nextParams = filtersToSearchParams(clean, false);
    setSearchParams(nextParams, { replace: true });
  }, [setSearchParams]);

  const fetchProperties = useCallback(
    async (isMapBoundsUpdate = false) => {
      const requestId = ++currentRequestIdRef.current;
      if (isMapBoundsUpdate) {
        setIsSearchingMap(true);
      } else {
        setIsLoading(true);
      }

      try {
        const queryParams = new URLSearchParams();
        if (filters.listingType) queryParams.set('listingType', filters.listingType);
        if (filters.propertyType) queryParams.set('propertyType', filters.propertyType);
        if (filters.legalPaperType) queryParams.set('legalPaperType', filters.legalPaperType);
        if (filters.hasActeNotarie) queryParams.set('hasActeNotarie', 'true');
        if (filters.hasLivretFoncier) queryParams.set('hasLivretFoncier', 'true');
        if (filters.wilaya) queryParams.set('wilaya', filters.wilaya);
        if (filters.commune) queryParams.set('commune', filters.commune);
        if (filters.minPrice !== undefined && filters.minPrice > 0) {
          queryParams.set('minPrice', String(filters.minPrice));
        }
        if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
          queryParams.set('maxPrice', String(filters.maxPrice));
        }
        if (filters.minRooms !== undefined && filters.minRooms > 0) {
          queryParams.set('minRooms', String(filters.minRooms));
        }
        if (filters.minArea !== undefined && filters.minArea > 0) {
          queryParams.set('minArea', String(filters.minArea));
        }
        if (filters.sort) queryParams.set('sort', filters.sort);
        if (mapBounds) queryParams.set('bbox', mapBounds);
        queryParams.set('limit', '50');

        const [listRes, mapRes] = await Promise.all([
          apiGet<PropertyListResponse>(
            `/api/v1/real-estate/properties?${queryParams.toString()}`
          ),
          apiGet<{ success: boolean; data?: PropertyMapResult[] }>(
            `/api/v1/real-estate/properties/map?${queryParams.toString()}`
          ),
        ]);

        // Discard stale responses to avoid race conditions
        if (requestId !== currentRequestIdRef.current) return;

        if (listRes.success && listRes.data) {
          setProperties(listRes.data);
          // Auto-deselect if the selected property is no longer present in the updated results
          setSelectedPropertyId((current) => {
            if (!current) return undefined;
            const exists = listRes.data?.some((p) => p.id === current);
            return exists ? current : undefined;
          });
        }
        if (mapRes.success && mapRes.data) {
          setMapResults(mapRes.data);
        }
      } catch (err) {
        safeLogger.error('Failed to fetch real estate properties', {
          err: err instanceof Error ? err.message : String(err),
        });
      } finally {
        if (requestId === currentRequestIdRef.current) {
          setIsLoading(false);
          setIsSearchingMap(false);
          isFirstLoadRef.current = false;
        }
      }
    },
    [filters, mapBounds]
  );

  useEffect(() => {
    const isMapBoundsUpdate = prevMapBoundsRef.current !== mapBounds && !isFirstLoadRef.current;
    prevMapBoundsRef.current = mapBounds;

    const timer = setTimeout(
      () => {
        fetchProperties(isMapBoundsUpdate);
      },
      isMapBoundsUpdate ? 150 : 300
    );
    return () => clearTimeout(timer);
  }, [fetchProperties, mapBounds]);

  const handleSelectProperty = (id: string) => {
    if (!id) {
      setSelectedPropertyId(undefined);
      return;
    }
    setSelectedPropertyId((prev) => (prev === id ? undefined : id));
    const element = cardRefs.current[id];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const displayedProperties = showFavoritesOnly
    ? properties.filter((p) => favoritesList.includes(p.id))
    : properties;

  return {
    filters,
    setFilters,
    removeFilter,
    displayedProperties,
    mapResults,
    selectedPropertyId,
    setSelectedPropertyId,
    isLoading,
    isSearchingMap,
    viewMode,
    setViewMode,
    cardRefs,
    fetchProperties,
    handleSelectProperty,
    setMapBounds,
    resetAllFilters,
  };
}
