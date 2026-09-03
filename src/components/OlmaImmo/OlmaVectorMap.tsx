import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Property, PropertyMapResult } from '../../types/realEstate';
import { PropertyMapPreview } from './PropertyMapPreview';
import { MapCategoryFilterBar, MapFilterCategory } from './MapCategoryFilterBar';
import { MapNavPad } from './MapNavPad';
import { MapTileGrid } from './MapTileGrid';
import { MapZoneSearchButton } from './MapZoneSearchButton';
import { OlmaMapMarkers } from './OlmaMapMarkers';
import { filterPropertiesByCategory } from './mapFilterUtils';
import { project, unproject, TileLayerType } from './webMercator';

export type { MapFilterCategory };

interface OlmaVectorMapProps {
  properties: (Property | PropertyMapResult)[];
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
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [currentCenter, setCurrentCenter] = useState({ lat: centerLat, lng: centerLng });
  const [zoom, setZoom] = useState(initialZoom);
  const [layerType, setLayerType] = useState<TileLayerType>('voyager');

  const [internalFilter, setInternalFilter] = useState<MapFilterCategory>('all');
  const activeFilter = controlledFilter !== undefined ? controlledFilter : internalFilter;

  // Dragging state
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const dragStartCenterRef = useRef({ lat: centerLat, lng: centerLng });
  const hasMovedRef = useRef(false);
  const [hasMovedZone, setHasMovedZone] = useState(false);

  // Measure container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (centerLat && centerLng) setCurrentCenter({ lat: centerLat, lng: centerLng });
  }, [centerLat, centerLng]);

  useEffect(() => {
    if (initialZoom) setZoom(initialZoom);
  }, [initialZoom]);

  const filteredProperties = useMemo(() => {
    return filterPropertiesByCategory(properties, activeFilter);
  }, [properties, activeFilter]);

  const notifyBoundsChange = useCallback(() => {
    if (!onBoundsChange) return;
    const { width, height } = dimensions;
    const centerProj = project(currentCenter.lat, currentCenter.lng, zoom);
    const nw = unproject(centerProj.x - width / 2, centerProj.y - height / 2, zoom);
    const se = unproject(centerProj.x + width / 2, centerProj.y + height / 2, zoom);
    onBoundsChange(`${nw.lng.toFixed(4)},${se.lat.toFixed(4)},${se.lng.toFixed(4)},${nw.lat.toFixed(4)}`);
  }, [currentCenter, zoom, dimensions, onBoundsChange]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    dragStartCenterRef.current = { ...currentCenter };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartPosRef.current.x;
    const dy = e.clientY - dragStartPosRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMovedRef.current = true;
      setHasMovedZone(true);
    }
    const startProj = project(dragStartCenterRef.current.lat, dragStartCenterRef.current.lng, zoom);
    const newCenter = unproject(startProj.x - dx, startProj.y - dy, zoom);
    setCurrentCenter(newCenter);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore releasePointerCapture on unmounted element
    }
    if (hasMovedRef.current) {
      notifyBoundsChange();
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.35 : -0.35;
    setZoom((prev) => {
      const next = Math.min(Math.max(prev + delta, 4), 18);
      return Math.round(next * 100) / 100;
    });
    setHasMovedZone(true);
  };

  const handleDoubleClick = () => {
    setZoom((prev) => Math.min(prev + 1, 18));
    setHasMovedZone(true);
  };

  const panByPixels = (dx: number, dy: number) => {
    const proj = project(currentCenter.lat, currentCenter.lng, zoom);
    const next = unproject(proj.x - dx, proj.y - dy, zoom);
    setCurrentCenter(next);
    setHasMovedZone(true);
  };

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
      {/* Real Slippy Map Tiles (CartoDB / OSM / Satellite) */}
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

      {/* Interactive Navigation & Zoom Pad */}
      <MapNavPad
        onPan={panByPixels}
        onZoomIn={() => {
          setZoom((z) => Math.min(z + 0.8, 18));
          setHasMovedZone(true);
        }}
        onZoomOut={() => {
          setZoom((z) => Math.max(z - 0.8, 4));
          setHasMovedZone(true);
        }}
        onReset={() => {
          setCurrentCenter({ lat: centerLat, lng: centerLng });
          setZoom(initialZoom);
          setHasMovedZone(false);
        }}
        layerType={layerType}
        onToggleLayer={() => setLayerType((prev) => (prev === 'voyager' ? 'satellite' : 'voyager'))}
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
