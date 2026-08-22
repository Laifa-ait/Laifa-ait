import React, { useState, useEffect } from 'react';
import { OlmaImmoNavbar } from '../../components/OlmaImmo/OlmaImmoNavbar';
import { OlmaImmoBottomNav } from '../../components/OlmaImmo/OlmaImmoBottomNav';
import { PropertyCard } from '../../components/OlmaImmo/PropertyCard';
import { InteractiveMap } from '../../components/OlmaImmo/InteractiveMap';
import { SearchFilters, FilterState } from '../../components/OlmaImmo/SearchFilters';
import { Property, PropertyMapResult } from '../../types/realEstate';
import { apiGet } from '../../lib/api';
import { Building2, MapPin, Grid, List, Sparkles, Heart } from 'lucide-react';
import { getFavoritePropertyIds } from '../../utils/realEstateFavorites';

export const OlmaImmoHome: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    sort: 'recent',
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [mapResults, setMapResults] = useState<PropertyMapResult[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoritesList, setFavoritesList] = useState<string[]>(getFavoritePropertyIds());
  const [mapBounds, setMapBounds] = useState<string | null>(null);

  useEffect(() => {
    const handleFavsUpdate = () => {
      setFavoritesList(getFavoritePropertyIds());
    };
    window.addEventListener('olma_immo:favorites_updated', handleFavsUpdate);
    return () => window.removeEventListener('olma_immo:favorites_updated', handleFavsUpdate);
  }, []);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.listingType) queryParams.set('listingType', filters.listingType);
      if (filters.propertyType) queryParams.set('propertyType', filters.propertyType);
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
      console.error('Failed to fetch real estate properties:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProperties();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, mapBounds]);

  const displayedProperties = showFavoritesOnly
    ? properties.filter((p) => favoritesList.includes(p.id))
    : properties;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <OlmaImmoNavbar />

      {/* Hero Discovery Banner */}
      <div className="bg-gradient-to-b from-emerald-900 via-teal-900 to-slate-900 text-white py-8 px-4 sm:px-6 lg:px-8 shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plateforme Immobilière N°1 en Algérie</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight max-w-2xl">
            Trouvez votre futur bien immobilier en toute sérénité
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-xl">
            Achat, location longue durée et séjours courtes durées à travers les 58 wilayas d'Algérie.
          </p>
        </div>
      </div>

      {/* Main Portal Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Filters Panel */}
        <SearchFilters
          filters={filters}
          onChange={(newFilters) => setFilters(newFilters)}
          onReset={() => setFilters({ sort: 'recent' })}
          isMapExpanded={viewMode === 'map'}
          onToggleMap={() => setViewMode(viewMode === 'map' ? 'split' : 'map')}
        />

        {/* View Mode & Favorites Switcher Bar */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">
              {displayedProperties.length} bien{displayedProperties.length > 1 ? 's' : ''} trouvé{displayedProperties.length > 1 ? 's' : ''}
            </span>

            {showFavoritesOnly && (
              <span className="bg-rose-100 text-rose-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Heart className="w-3 h-3 fill-rose-600 text-rose-600" />
                Favoris
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Favorites Toggle Button */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border min-h-[44px] ${
                showFavoritesOnly
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-white' : 'text-rose-500'}`} />
              <span>Favoris ({favoritesList.length})</span>
            </button>

            {/* Layout Mode Buttons (Mobile & Desktop) */}
            <div className="hidden sm:flex items-center bg-slate-200/80 p-1 rounded-xl gap-1">
              <button
                onClick={() => setViewMode('split')}
                className={`p-2 rounded-lg text-xs font-medium transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center ${
                  viewMode === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
                title="Vue Mixte (Liste + Carte)"
              >
                <Grid className="w-4 h-4" />
              </button>

              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg text-xs font-medium transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
                title="Vue Liste Seule"
              >
                <List className="w-4 h-4" />
              </button>

              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-lg text-xs font-medium transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center ${
                  viewMode === 'map' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
                title="Vue Carte Seule"
              >
                <MapPin className="w-4 h-4 text-emerald-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Layout Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-80 border border-slate-200" />
            ))}
          </div>
        ) : displayedProperties.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4 my-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Aucune annonce ne correspond à votre recherche</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Essayez de modifier vos critères de recherche, d'élargir la wilaya ou de réinitialiser vos filtres.
            </p>
            <button
              onClick={() => {
                setFilters({ sort: 'recent' });
                setShowFavoritesOnly(false);
              }}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Split View (Grid + Map) */}
            {viewMode === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {displayedProperties.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPropertyId(p.id)}
                      className={selectedPropertyId === p.id ? 'ring-2 ring-rose-500 rounded-2xl' : ''}
                    >
                      <PropertyCard property={p} />
                    </div>
                  ))}
                </div>

                <div className="lg:col-span-5 hidden lg:block sticky top-20 h-[calc(100vh-120px)]">
                  <InteractiveMap
                    properties={mapResults}
                    selectedPropertyId={selectedPropertyId}
                    onSelectProperty={(id) => setSelectedPropertyId(id)}
                    onBoundsChange={(bbox) => setMapBounds(bbox)}
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* List View Only */}
            {viewMode === 'list' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedProperties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            )}

            {/* Map View Only */}
            {viewMode === 'map' && (
              <div className="w-full h-[650px]">
                <InteractiveMap
                  properties={mapResults}
                  selectedPropertyId={selectedPropertyId}
                  onSelectProperty={(id) => setSelectedPropertyId(id)}
                  onBoundsChange={(bbox) => setMapBounds(bbox)}
                  className="w-full h-full"
                />
              </div>
            )}
          </div>
        )}
      </main>
      <OlmaImmoBottomNav />
    </div>
  );
};
