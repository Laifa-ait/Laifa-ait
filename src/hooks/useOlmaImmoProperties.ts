import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Property, PropertyMapResult, ListingType } from '../types/realEstate';
import { FilterState } from '../components/OlmaImmo/SearchFilters';
import { apiGet } from '../lib/api';
import { getFavoritePropertyIds } from '../utils/realEstateFavorites';
import { safeLogger } from '../utils/logger';

export function useOlmaImmoProperties() {
  const [searchParams] = useSearchParams();

  const typeParam = searchParams.get('type') as ListingType | null;
  const favsParam = searchParams.get('favorites') === 'true';

  const [filters, setFilters] = useState<FilterState>({
    sort: 'recent',
    listingType: typeParam || undefined,
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [mapResults, setMapResults] = useState<PropertyMapResult[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'split' | 'grid' | 'list' | 'map'>('split');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(favsParam);
  const [favoritesList, setFavoritesList] = useState<string[]>(getFavoritePropertyIds());
  const [mapBounds, setMapBounds] = useState<string | null>(null);

  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const t = searchParams.get('type') as ListingType | null;
    const f = searchParams.get('favorites') === 'true';

    setFilters((prev) => (prev.listingType !== (t || undefined) ? { ...prev, listingType: t || undefined } : prev));
    setShowFavoritesOnly(f);
  }, [searchParams]);

  useEffect(() => {
    const handleFavsUpdate = () => setFavoritesList(getFavoritePropertyIds());
    window.addEventListener('olma_immo:favorites_updated', handleFavsUpdate);
    return () => window.removeEventListener('olma_immo:favorites_updated', handleFavsUpdate);
  }, []);

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.listingType) queryParams.set('listingType', filters.listingType);
      if (filters.propertyType) queryParams.set('propertyType', filters.propertyType);
      if (filters.legalPaperType) queryParams.set('legalPaperType', filters.legalPaperType);
      if (filters.hasActeNotarie) queryParams.set('hasActeNotarie', 'true');
      if (filters.hasLivretFoncier) queryParams.set('hasLivretFoncier', 'true');
      if (filters.wilaya) queryParams.set('wilaya', filters.wilaya);
      if (filters.commune) queryParams.set('commune', filters.commune);
      if (filters.minPrice !== undefined) queryParams.set('minPrice', String(filters.minPrice));
      if (filters.maxPrice !== undefined) queryParams.set('maxPrice', String(filters.maxPrice));
      if (filters.minRooms !== undefined) queryParams.set('minRooms', String(filters.minRooms));
      if (filters.minArea !== undefined) queryParams.set('minArea', String(filters.minArea));
      if (filters.sort) queryParams.set('sort', filters.sort);
      if (mapBounds) queryParams.set('bbox', mapBounds);
      queryParams.set('limit', '50');

      const [listRes, mapRes] = await Promise.all([
        apiGet<{ success: boolean; data?: Property[] }>(`/api/v1/real-estate/properties?${queryParams.toString()}`),
        apiGet<{ success: boolean; data?: PropertyMapResult[] }>(`/api/v1/real-estate/properties/map?${queryParams.toString()}`),
      ]);

      if (listRes.success && listRes.data) {
        setProperties(listRes.data);
      }
      if (mapRes.success && mapRes.data) {
        setMapResults(mapRes.data);
      }
    } catch (err) {
      safeLogger.error('Failed to fetch real estate properties', { err: err instanceof Error ? err.message : String(err) });
    } finally {
      setIsLoading(false);
    }
  }, [filters, mapBounds]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProperties();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchProperties]);

  const handleSelectProperty = (id: string) => {
    setSelectedPropertyId(id);
    if (id) {
      const element = cardRefs.current[id];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const displayedProperties = showFavoritesOnly
    ? properties.filter((p) => favoritesList.includes(p.id))
    : properties;

  const resetAllFilters = () => {
    setFilters({ sort: 'recent' });
    setShowFavoritesOnly(false);
    setMapBounds(null);
  };

  return {
    filters,
    setFilters,
    displayedProperties,
    mapResults,
    selectedPropertyId,
    setSelectedPropertyId,
    isLoading,
    viewMode,
    setViewMode,
    cardRefs,
    fetchProperties,
    handleSelectProperty,
    setMapBounds,
    resetAllFilters,
  };
}
