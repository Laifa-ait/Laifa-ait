import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapTileGrid } from '../MapTileGrid';
import { project, unproject, TileLayerType } from '../webMercator';
import { ResidenceMapHeader, ResidenceMapOverlay } from './ResidenceMapControls';
import { resolveLocationCoords } from './locationCoordsResolver';

interface ResidenceLocationPickerMapProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number) => void;
  wilayaName?: string;
  communeName?: string;
  className?: string;
}

export const ResidenceLocationPickerMap: React.FC<ResidenceLocationPickerMapProps> = ({
  lat,
  lng,
  onLocationChange,
  wilayaName,
  communeName,
  className = 'h-72 sm:h-80 w-full',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 320 });
  const [layerType, setLayerType] = useState<TileLayerType>('satellite');
  const [zoom, setZoom] = useState(16);
  const [isLocating, setIsLocating] = useState(false);
  const [isDraggingState, setIsDraggingState] = useState(false);

  const initialLat = lat || 36.7538;
  const initialLng = lng || 3.0588;

  const [center, setCenter] = useState({ lat: initialLat, lng: initialLng });
  const currentCenterRef = useRef({ lat: initialLat, lng: initialLng });
  const lastReportedCoordRef = useRef<{ lat: number; lng: number }>({ lat: initialLat, lng: initialLng });

  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const dragStartCenterRef = useRef({ lat: initialLat, lng: initialLng });
  const hasMovedRef = useRef(false);

  // Sync with incoming external prop changes (wilaya selection, commune selection, or direct coordinate edits)
  useEffect(() => {
    if (
      lastReportedCoordRef.current &&
      Math.abs(lat - lastReportedCoordRef.current.lat) < 0.000002 &&
      Math.abs(lng - lastReportedCoordRef.current.lng) < 0.000002
    ) {
      return;
    }

    currentCenterRef.current = { lat, lng };
    lastReportedCoordRef.current = { lat, lng };
    setCenter({ lat, lng });
    if (communeName) {
      setZoom((prev) => Math.max(prev, 16));
    }
  }, [lat, lng, communeName, wilayaName]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    isDraggingRef.current = true;
    setIsDraggingState(true);
    hasMovedRef.current = false;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    dragStartCenterRef.current = { ...currentCenterRef.current };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Safe fallback
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartPosRef.current.x;
    const dy = e.clientY - dragStartPosRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMovedRef.current = true;
    }
    const startProj = project(dragStartCenterRef.current.lat, dragStartCenterRef.current.lng, zoom);
    const newCenter = unproject(startProj.x - dx, startProj.y - dy, zoom);
    currentCenterRef.current = newCenter;
    setCenter(newCenter);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDraggingState(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Safe fallback
    }
    if (hasMovedRef.current) {
      const finalLat = Number(currentCenterRef.current.lat.toFixed(6));
      const finalLng = Number(currentCenterRef.current.lng.toFixed(6));
      lastReportedCoordRef.current = { lat: finalLat, lng: finalLng };
      onLocationChange(finalLat, finalLng);
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hasMovedRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerProj = project(currentCenterRef.current.lat, currentCenterRef.current.lng, zoom);
    const clickedCoord = unproject(
      centerProj.x + (e.clientX - rect.left - dimensions.width / 2),
      centerProj.y + (e.clientY - rect.top - dimensions.height / 2),
      zoom
    );
    const roundedLat = Number(clickedCoord.lat.toFixed(6));
    const roundedLng = Number(clickedCoord.lng.toFixed(6));
    currentCenterRef.current = { lat: roundedLat, lng: roundedLng };
    lastReportedCoordRef.current = { lat: roundedLat, lng: roundedLng };
    setCenter({ lat: roundedLat, lng: roundedLng });
    onLocationChange(roundedLat, roundedLng);
  };

  const handleNudge = (dxPx: number, dyPx: number) => {
    const centerProj = project(currentCenterRef.current.lat, currentCenterRef.current.lng, zoom);
    const newCenter = unproject(centerProj.x + dxPx, centerProj.y + dyPx, zoom);
    const roundedLat = Number(newCenter.lat.toFixed(6));
    const roundedLng = Number(newCenter.lng.toFixed(6));
    currentCenterRef.current = { lat: roundedLat, lng: roundedLng };
    lastReportedCoordRef.current = { lat: roundedLat, lng: roundedLng };
    setCenter({ lat: roundedLat, lng: roundedLng });
    onLocationChange(roundedLat, roundedLng);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((z) => Math.min(z + 1, 18));
    } else if (e.deltaY > 0) {
      setZoom((z) => Math.max(z - 1, 5));
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setZoom((z) => Math.min(z + 1, 18));
  };

  const handleRecenter = useCallback(() => {
    const target = resolveLocationCoords(wilayaName, communeName);
    if (!target) return;
    currentCenterRef.current = { lat: target.lat, lng: target.lng };
    lastReportedCoordRef.current = { lat: target.lat, lng: target.lng };
    setCenter({ lat: target.lat, lng: target.lng });
    setZoom(target.zoom);
    onLocationChange(target.lat, target.lng);
  }, [communeName, wilayaName, onLocationChange]);

  const handleCurrentPosition = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const roundedLat = Number(pos.coords.latitude.toFixed(6));
        const roundedLng = Number(pos.coords.longitude.toFixed(6));
        currentCenterRef.current = { lat: roundedLat, lng: roundedLng };
        lastReportedCoordRef.current = { lat: roundedLat, lng: roundedLng };
        setCenter({ lat: roundedLat, lng: roundedLng });
        setZoom(17);
        onLocationChange(roundedLat, roundedLng);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      <ResidenceMapHeader
        layerType={layerType}
        onLayerChange={setLayerType}
        wilayaName={wilayaName}
        communeName={communeName}
        onRecenterWilaya={(communeName || wilayaName) ? handleRecenter : undefined}
        onCurrentPosition={handleCurrentPosition}
        isLocating={isLocating}
      />

      <div
        ref={containerRef}
        className={`relative rounded-2xl overflow-hidden border-2 border-stone-300 shadow-md select-none touch-none cursor-grab active:cursor-grabbing ${className}`}
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onClick={handleMapClick}
      >
        <MapTileGrid
          centerLat={center.lat}
          centerLng={center.lng}
          zoom={zoom}
          width={dimensions.width}
          height={dimensions.height}
          layerType={layerType}
        />

        <ResidenceMapOverlay
          communeName={communeName}
          wilayaName={wilayaName}
          onZoomIn={() => setZoom((z) => Math.min(z + 1, 18))}
          onZoomOut={() => setZoom((z) => Math.max(z - 1, 5))}
          onNudge={handleNudge}
          zoom={zoom}
          isDragging={isDraggingState}
        />
      </div>
    </div>
  );
};
