import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Property, PropertyMapResult } from '../../types/realEstate';
import { MapPin } from 'lucide-react';
import { PropertyMapPreview } from './PropertyMapPreview';
import { useVectorClustering, MapCluster, GEO_BOUNDS } from './useVectorClustering';
import { OlmaMapCanvas } from './OlmaMapCanvas';
import { MapCategoryFilterBar, MapFilterCategory } from './MapCategoryFilterBar';
import { MapZoomControls } from './MapZoomControls';

export type { MapFilterCategory };

interface OlmaVectorMapProps {
  properties: (Property | PropertyMapResult)[];
  selectedPropertyId?: string;
  onSelectProperty?: (id: string) => void;
  onBoundsChange?: (bbox: string) => void;
  className?: string;
  activeFilter?: MapFilterCategory;
  onFilterChange?: (filter: MapFilterCategory) => void;
}

export const OlmaVectorMap: React.FC<OlmaVectorMapProps> = ({
  properties,
  selectedPropertyId,
  onSelectProperty,
  onBoundsChange,
  className = 'w-full h-full min-h-[400px]',
  activeFilter: controlledFilter,
  onFilterChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [internalFilter, setInternalFilter] = useState<MapFilterCategory>('all');
  const activeFilter = controlledFilter !== undefined ? controlledFilter : internalFilter;

  const handleFilterClick = (cat: MapFilterCategory) => {
    setInternalFilter(cat);
    if (onFilterChange) onFilterChange(cat);
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'sale') return p.listingType === 'sale';
      if (activeFilter === 'rent') return p.listingType === 'rent_long' || p.listingType === 'rent_short';
      if (activeFilter === 'house') return p.propertyType === 'villa' || p.propertyType === 'house';
      if (activeFilter === 'commercial') return p.propertyType === 'commercial' || p.propertyType === 'office';
      return true;
    });
  }, [properties, activeFilter]);

  const [zoom, setZoom] = useState(1.8);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMovedZone, setHasMovedZone] = useState(false);

  const { validProperties, gpsToPercent, clusters } = useVectorClustering(filteredProperties, zoom);

  const formatPriceShort = (price: number, period?: string) => {
    let suffix = '';
    if (period === 'night') suffix = '/n';
    else if (period === 'month') suffix = '/m';

    if (price >= 1_000_000) {
      const m = price / 1_000_000;
      return `${m.toFixed(m % 1 === 0 ? 0 : 1)} M DZD${suffix}`;
    }
    if (price >= 1_000) {
      return `${Math.round(price / 1_000)} k DZD${suffix}`;
    }
    return `${price} DZD${suffix}`;
  };

  useEffect(() => {
    if (selectedPropertyId) {
      const selected = validProperties.find((p) => p.id === selectedPropertyId);
      if (selected) {
        const sLat = 'location' in selected ? selected.location.lat : selected.lat;
        const sLng = 'location' in selected ? selected.location.lng : selected.lng;
        const pos = gpsToPercent(sLat, sLng);
        setOffset({ x: (50 - pos.x) * 4 * zoom, y: (50 - pos.y) * 4 * zoom });
      }
    }
  }, [selectedPropertyId, validProperties, gpsToPercent, zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    setHasMovedZone(true);
  };

  const handleClusterClick = (cluster: MapCluster) => {
    const pos = gpsToPercent(cluster.lat, cluster.lng);
    setZoom((z) => Math.min(z + 1.2, 5.5));
    setOffset({ x: (50 - pos.x) * 4 * (zoom + 1.2), y: (50 - pos.y) * 4 * (zoom + 1.2) });
  };

  const handleSearchThisArea = () => {
    setHasMovedZone(false);
    if (onBoundsChange) {
      const deltaLng = (GEO_BOUNDS.maxLng - GEO_BOUNDS.minLng) / zoom;
      const deltaLat = (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat) / zoom;
      const centerLg = (GEO_BOUNDS.minLng + GEO_BOUNDS.maxLng) / 2 - offset.x / (100 * zoom);
      const centerLt = (GEO_BOUNDS.minLat + GEO_BOUNDS.maxLat) / 2 + offset.y / (100 * zoom);

      const west = Math.max(-2.5, centerLg - deltaLng / 2);
      const east = Math.min(9.0, centerLg + deltaLng / 2);
      const south = Math.max(34.0, centerLt - deltaLat / 2);
      const north = Math.min(38.0, centerLt + deltaLat / 2);

      onBoundsChange(`${west.toFixed(4)},${south.toFixed(4)},${east.toFixed(4)},${north.toFixed(4)}`);
    }
  };

  const selectedProperty = validProperties.find((p) => p.id === selectedPropertyId);

  return (
    <div
      ref={containerRef}
      className={`relative rounded-3xl overflow-hidden border border-[#d8d2c4] bg-[#f4efe4] shadow-md select-none ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onTouchStart={(e) => {
        if (e.touches.length === 1) {
          setIsDragging(true);
          setDragStart({ x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y });
        }
      }}
      onTouchMove={(e) => {
        if (!isDragging || e.touches.length !== 1) return;
        setOffset({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
        setHasMovedZone(true);
      }}
      onTouchEnd={() => setIsDragging(false)}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <MapCategoryFilterBar activeFilter={activeFilter} onFilterChange={handleFilterClick} />

      {hasMovedZone && (
        <button
          onClick={handleSearchThisArea}
          className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center bg-[#1e3835] text-white px-4 py-2 rounded-full border border-white/20 text-xs font-bold shadow-2xl hover:bg-[#152725] transition-all cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-400 me-1.5" />
          <span>Rechercher dans cette zone</span>
        </button>
      )}

      <MapZoomControls
        onZoomIn={() => {
          setZoom((z) => Math.min(z + 0.5, 6.0));
          setHasMovedZone(true);
        }}
        onZoomOut={() => {
          setZoom((z) => Math.max(z - 0.5, 1.0));
          setHasMovedZone(true);
        }}
        onReset={() => {
          setZoom(1.8);
          setOffset({ x: 0, y: 0 });
          setHasMovedZone(false);
        }}
      />

      <div
        className="w-full h-full relative transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <OlmaMapCanvas />

        <div className="absolute inset-0 pointer-events-auto">
          {clusters.map((item) => {
            const pos = gpsToPercent(item.lat, item.lng);

            if (item.isCluster) {
              return (
                <div
                  key={item.id}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClusterClick(item);
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group hover:scale-110 transition-transform"
                >
                  <div className="w-9 h-9 rounded-full bg-[#1e3835] text-white border-2 border-[#f7f4ed] shadow-xl flex items-center justify-center font-bold text-xs">
                    {item.count}
                  </div>
                </div>
              );
            }

            const p = item.mainProperty!;
            const isSelected = p.id === selectedPropertyId;

            return (
              <div
                key={p.id}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectProperty) onSelectProperty(p.id);
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-10 group ${
                  isSelected ? 'z-40 scale-110' : 'hover:scale-105'
                }`}
              >
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg transition-all border flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#1e3835] text-white border-white ring-4 ring-[#1e3835]/30'
                      : 'bg-white text-[#1c211e] border-[#d8d2c4] hover:bg-[#1e3835] hover:text-white'
                  }`}
                >
                  <span>{formatPriceShort(p.price, p.pricePeriod)}</span>
                </div>

                <div
                  className={`w-2 h-2 mx-auto -mt-1 rotate-45 border-r border-b ${
                    isSelected
                      ? 'bg-[#1e3835] border-white'
                      : 'bg-white border-[#d8d2c4] group-hover:bg-[#1e3835] group-hover:border-[#1e3835]'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-40 max-w-sm pointer-events-auto">
          <PropertyMapPreview
            property={selectedProperty}
            onClose={() => {
              if (onSelectProperty) onSelectProperty('');
            }}
          />
        </div>
      )}
    </div>
  );
};
