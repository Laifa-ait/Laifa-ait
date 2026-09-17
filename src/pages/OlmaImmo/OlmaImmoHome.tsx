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

      <OlmaSection spacing="none" container={false} className="pt-2 pb-12 flex-1 w-full">
        <div className="max-w-[1920px] 2xl:max-w-[2100px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 w-full space-y-2">
          {/* Category Bar with golden hour pills & tactile motion */}
          <OlmaCategoryBar
            activeCategory={filters.propertyType || 'all'}
            onCategorySelect={handleCategorySelect}
          />

          {/* Active Filter Pills Dismissible Bar */}
          <ActiveFilterPills
            filters={filters}
            onRemoveFilter={removeFilter}
            onResetAll={resetAllFilters}
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
            isSearchingMap={isSearchingMap}
            cardRefs={cardRefs}
            onBoundsChange={(bbox) => setMapBounds(bbox)}
            onResetFilters={resetAllFilters}
            filters={filters}
            onFilterChange={(newFilters) => setFilters(newFilters)}
          />
        </div>
      </OlmaSection>
    </OlmaImmoShell>
  );
};
