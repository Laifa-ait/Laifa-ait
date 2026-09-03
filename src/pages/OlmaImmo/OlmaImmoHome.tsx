import React from 'react';
import { OlmaImmoNavbar } from '../../components/OlmaImmo/OlmaImmoNavbar';
import { OlmaImmoBottomNav } from '../../components/OlmaImmo/OlmaImmoBottomNav';
import { OlmaImmoHero } from '../../components/OlmaImmo/OlmaImmoHero';
import { OlmaCategoryBar } from '../../components/OlmaImmo/OlmaCategoryBar';
import { OlmaImmoPropertiesSection } from '../../components/OlmaImmo/OlmaImmoPropertiesSection';
import { PropertyType } from '../../types/realEstate';
import { useOlmaImmoProperties } from '../../hooks/useOlmaImmoProperties';

export const OlmaImmoHome: React.FC = () => {
  const {
    filters,
    setFilters,
    displayedProperties,
    mapResults,
    selectedPropertyId,
    isLoading,
    viewMode,
    setViewMode,
    cardRefs,
    fetchProperties,
    handleSelectProperty,
    setMapBounds,
    resetAllFilters,
  } = useOlmaImmoProperties();

  const handleCategorySelect = (cat: PropertyType | 'all') => {
    setFilters({
      ...filters,
      propertyType: cat === 'all' ? undefined : cat,
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans pb-20 md:pb-8 selection:bg-orange-500/20 selection:text-orange-900">
      <OlmaImmoNavbar />

      <OlmaImmoHero
        filters={filters}
        onFilterChange={(newFilters) => setFilters(newFilters)}
        onSearchSubmit={fetchProperties}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-12 flex-1 w-full">
        {/* Category Bar with golden hour pills & tactile motion */}
        <OlmaCategoryBar
          activeCategory={filters.propertyType || 'all'}
          onCategorySelect={handleCategorySelect}
        />

        {/* Properties View Container */}
        <OlmaImmoPropertiesSection
          properties={displayedProperties}
          mapResults={mapResults}
          selectedPropertyId={selectedPropertyId}
          onSelectProperty={handleSelectProperty}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isLoading={isLoading}
          cardRefs={cardRefs}
          onBoundsChange={(bbox) => setMapBounds(bbox)}
          onResetFilters={resetAllFilters}
        />
      </main>

      <OlmaImmoBottomNav />
    </div>
  );
};


