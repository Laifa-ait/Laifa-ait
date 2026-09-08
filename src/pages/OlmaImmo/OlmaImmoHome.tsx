import React from 'react';
import { OlmaImmoShell } from '../../components/OlmaImmo/OlmaImmoShell';
import { OlmaImmoHero } from '../../components/OlmaImmo/OlmaImmoHero';
import { OlmaCategoryBar } from '../../components/OlmaImmo/OlmaCategoryBar';
import { OlmaImmoPropertiesSection } from '../../components/OlmaImmo/OlmaImmoPropertiesSection';
import { OlmaSection } from '../../components/OlmaImmo/primitives/OlmaSection';
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
    <OlmaImmoShell fullWidth>
      <OlmaImmoHero
        filters={filters}
        onFilterChange={(newFilters) => setFilters(newFilters)}
        onSearchSubmit={fetchProperties}
      />

      <OlmaSection spacing="none" className="pt-2 pb-12 flex-1 w-full">
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
      </OlmaSection>
    </OlmaImmoShell>
  );
};


