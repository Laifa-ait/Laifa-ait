import React from 'react';
import { OlmaImmoShell } from '../../components/OlmaImmo/OlmaImmoShell';
import { OlmaImmoHero } from '../../components/OlmaImmo/OlmaImmoHero';
import { OlmaCategoryBar } from '../../components/OlmaImmo/OlmaCategoryBar';
import { OlmaImmoPropertiesSection } from '../../components/OlmaImmo/OlmaImmoPropertiesSection';
import { OlmaSection } from '../../components/OlmaImmo/primitives/OlmaSection';
import { ActiveFilterPills } from '../../components/OlmaImmo/filters/ActiveFilterPills';
import { PropertyType } from '../../types/realEstate';
import { useOlmaImmoProperties } from '../../hooks/useOlmaImmoProperties';

export const OlmaImmoHome: React.FC = () => {
  const {
    filters,
    setFilters,
    removeFilter,
    displayedProperties,
    mapResults,
    selectedPropertyId,
    isLoading,
    isSearchingMap,
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

        {/* Active Filter Pills Dismissible Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <ActiveFilterPills
            filters={filters}
            onRemoveFilter={removeFilter}
            onResetAll={resetAllFilters}
          />
        </div>

        {/* Properties View Container */}
        <OlmaImmoPropertiesSection
          properties={displayedProperties}
          mapResults={mapResults}
          selectedPropertyId={selectedPropertyId}
          onSelectProperty={handleSelectProperty}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isLoading={isLoading}
          isSearchingMap={isSearchingMap}
          cardRefs={cardRefs}
          onBoundsChange={(bbox) => setMapBounds(bbox)}
          onResetFilters={resetAllFilters}
        />
      </OlmaSection>
    </OlmaImmoShell>
  );
};
