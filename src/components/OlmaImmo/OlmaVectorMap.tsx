import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { PublicPropertyDTO, PropertyMapResult } from '../../types/realEstate';
import { PropertyMapPreview } from './PropertyMapPreview';
import { MapCategoryFilterBar, MapFilterCategory } from './MapCategoryFilterBar';
import { MapControlsOverlay } from './MapControlsOverlay';
import { MapTileGrid } from './MapTileGrid';
import { MapZoneSearchButton } from './MapZoneSearchButton';
import { OlmaMapMarkers } from './OlmaMapMarkers';
import { filterPropertiesByCategory } from './mapFilterUtils';
import { project, TileLayerType, fitBoundsToCoordinates } from './webMercator';
import { useMapGestures } from './useMapGestures';

export type { MapFilterCategory };

interface OlmaVectorMapProps {
  properties: (PublicPropertyDTO | PropertyMapResult)[];
  selectedPropertyId?: string;
  highlightPropertyId?: string;
  onSelectProperty?: (id: string) => void;
  onBoundsChange?: (bbox: string) => void;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  className?: string;
  activeFilter?: MapFilterCategory;
  onFilterChange?: (filter: MapFilterCategory) => void;
  showFilters?: boolean;
  showPreviewCard?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  allowFullscreenToggle?: boolean;
}

const ALGIERS = { lat: 36.7538, lng: 3.0588 };

export const OlmaVectorMap: React.FC<OlmaVectorMapProps> = ({
  properties,
  selectedPropertyId,
  highlightPropertyId,
  onSelectProperty,
  onBoundsChange,
  centerLat = ALGIERS.lat,
  centerLng = ALGIERS.lng,
  zoom: initialZoom = 12,
  className = 'w-full h-full min-h-[400px]',
  activeFilter: controlledFilter,
  onFilterChange,
  showFilters = true,
  showPreviewCard = true,
  isFullscreen = false,
  onToggleFullscreen,
  allowFullscreenToggle = true,
}) => {
  const [layerType, setLayerType] = useState<TileLayerType>('voyager');
  const [internalFilter, setInternalFilter] = useState<MapFilterCategory>('all');
  const activeFilter = controlledFilter !== undefined ? controlledFilter : internalFilter;

  const {
    containerRef,
    dimensions,
    currentCenter,
    setCurrentCenter,
    zoom,
    setZoom,
    hasMovedZone,
    setHasMovedZone,
    hasMovedRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
    handleDoubleClick,
    zoomIn,
    zoomOut,
    notifyBoundsChange,
  } = useMapGestures({
    initialCenterLat: centerLat,
    initialCenterLng: centerLng,
    initialZoom,
    onBoundsChange,
  });

  const filteredProperties = useMemo(() => {
    return filterPropertiesByCategory(properties, activeFilter);
  }, [properties, activeFilter]);

  const handleRecenterAll = useCallback(() => {
    const coords = filteredProperties
      .map((p) => {
        const pLat = 'location' in p && p.location ? p.location.lat : (p as PropertyMapResult).lat;
        const pLng = 'location' in p && p.location ? p.location.lng : (p as PropertyMapResult).lng;
        return { lat: pLat, lng: pLng };
      })
      .filter((c) => typeof c.lat === 'number' && typeof c.lng === 'number' && !isNaN(c.lat) && !isNaN(c.lng));

    if (coords.length > 0) {
      const fit = fitBoundsToCoordinates(coords, dimensions.width, dimensions.height, 80);
      setCurrentCenter({ lat: fit.centerLat, lng: fit.centerLng });
      setZoom(fit.zoom);
    } else {
      setCurrentCenter({ lat: centerLat, lng: centerLng });
      setZoom(initialZoom);
    }
    setHasMovedZone(false);
  }, [filteredProperties, dimensions.width, dimensions.height, centerLat, centerLng, initialZoom, setCurrentCenter, setZoom, setHasMovedZone]);

  const prevFilterRef = useRef(activeFilter);
  const initialFitDoneRef = useRef(false);

  // Fit bounds when property filter results change initially or category tab changes
  useEffect(() => {
    const filterChanged = prevFilterRef.current !== activeFilter;
    prevFilterRef.current = activeFilter;

    if (!initialFitDoneRef.current && filteredProperties.length > 0 && dimensions.width > 0) {
      initialFitDoneRef.current = true;
      handleRecenterAll();
    } else if (filterChanged) {
      handleRecenterAll();
    }
  }, [activeFilter, filteredProperties.length, dimensions.width, handleRecenterAll]);

  // When selectedPropertyId changes, center smoothly on that item
  useEffect(() => {
    if (!selectedPropertyId) return;
    const item = filteredProperties.find((p) => p.id === selectedPropertyId);
    if (item) {
      const pLat = 'location' in item && item.location ? item.location.lat : (item as PropertyMapResult).lat;
      const pLng = 'location' in item && item.location ? item.location.lng : (item as PropertyMapResult).lng;
      if (typeof pLat === 'number' && typeof pLng === 'number' && !isNaN(pLat) && !isNaN(pLng)) {
        setCurrentCenter({ lat: pLat, lng: pLng });
      }
    }
  }, [selectedPropertyId, filteredProperties, setCurrentCenter]);

  const selectedProperty = filteredProperties.find((p) => p.id === selectedPropertyId);
  const centerProj = project(currentCenter.lat, currentCenter.lng, zoom);

  return (
    <div
      ref={containerRef}
      className={`relative rounded-3xl overflow-hidden border border-[#d8d2c4] bg-[#f2ede4] shadow-md select-none touch-none cursor-grab active:cursor-grabbing ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      onClick={() => {
        if (!hasMovedRef.current && onSelectProperty) {
          onSelectProperty('');
        }
      }}
    >
      {/* Real Slippy Map Tiles */}
      <MapTileGrid
        centerLat={currentCenter.lat}
        centerLng={currentCenter.lng}
        zoom={zoom}
        width={dimensions.width}
        height={dimensions.height}
        layerType={layerType}
      />

      {/* Top Filter Category Bar */}
      {showFilters && (
        <MapCategoryFilterBar
          activeFilter={activeFilter}
          onFilterChange={(cat) => {
            setInternalFilter(cat);
            if (onFilterChange) onFilterChange(cat);
          }}
        />
      )}

      {/* Modern Floating Map Controls */}
      <MapControlsOverlay
        mapTypeId={layerType === 'satellite' ? 'satellite' : 'roadmap'}
        onToggleMapType={() => setLayerType((prev) => (prev === 'voyager' ? 'satellite' : 'voyager'))}
        isFullscreen={Boolean(isFullscreen)}
        onToggleFullscreen={onToggleFullscreen}
        allowFullscreenToggle={allowFullscreenToggle}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onRecenter={handleRecenterAll}
        recenterTitle="Recentrer sur tous les biens"
      />

      {/* "Rechercher dans cette zone" Floating Pill */}
      {hasMovedZone && (
        <MapZoneSearchButton
          onSearchZone={() => {
            setHasMovedZone(false);
            notifyBoundsChange();
          }}
        />
      )}

      {/* Interactive Property Markers */}
      <OlmaMapMarkers
        properties={filteredProperties}
        selectedPropertyId={selectedPropertyId}
        highlightPropertyId={highlightPropertyId}
        onSelectProperty={onSelectProperty}
        centerProj={centerProj}
        zoom={zoom}
        width={dimensions.width}
        height={dimensions.height}
      />

      {/* Floating Property Preview Card */}
      {showPreviewCard && selectedProperty && selectedProperty.id !== highlightPropertyId && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-40 max-w-sm pointer-events-auto">
          <PropertyMapPreview
            property={selectedProperty}
            onClose={() => onSelectProperty && onSelectProperty('')}
          />
        </div>
      )}
    </div>
  );
};
