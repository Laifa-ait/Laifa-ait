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
    <div className="min-h-screen bg-[#f6f2e9] text-[#1c211e] flex flex-col font-sans pb-20 md:pb-8">
      <OlmaImmoNavbar />

      <OlmaImmoHero
        filters={filters}
        onFilterChange={(newFilters) => setFilters(newFilters)}
        onSearchSubmit={fetchProperties}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 flex-1 w-full">
        {/* 3D Green Category Buttons (Villa, Appartement, Maison, Studio...) */}
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


