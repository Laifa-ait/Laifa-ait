import { useState, useRef, useEffect, useCallback } from 'react';
import { project, unproject, calculateZoomAnchorCenter, GpsCoord } from './webMercator';

interface UseMapGesturesOptions {
  initialCenterLat: number;
  initialCenterLng: number;
  initialZoom: number;
  onBoundsChange?: (bbox: string) => void;
}

export function useMapGestures({
  initialCenterLat,
  initialCenterLng,
  initialZoom,
  onBoundsChange,
}: UseMapGesturesOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [currentCenter, setCurrentCenter] = useState<GpsCoord>({ lat: initialCenterLat, lng: initialCenterLng });
  const [zoom, setZoom] = useState(initialZoom);
  const [hasMovedZone, setHasMovedZone] = useState(false);

  // Gesture refs
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const dragStartCenterRef = useRef<GpsCoord>({ lat: initialCenterLat, lng: initialCenterLng });
  const dragStartPosRef = useRef({ x: 0, y: 0 });

  // Pinch-to-zoom state
  const pinchStartDistRef = useRef(0);
  const pinchStartZoomRef = useRef(initialZoom);
  const pinchStartCenterRef = useRef<GpsCoord>({ lat: initialCenterLat, lng: initialCenterLng });
  const pinchStartMidpointRef = useRef({ x: 0, y: 0 });

  // Inertia animation
  const velocityRef = useRef({ vx: 0, vy: 0, lastTime: 0 });
  const animFrameRef = useRef<number | null>(null);

  // Measure container dimensions
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        setDimensions({
          width: Math.round(entry.contentRect.width),
          height: Math.round(entry.contentRect.height),
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stopInertia = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const notifyBoundsChange = useCallback(() => {
    if (!onBoundsChange) return;
    const { width, height } = dimensions;
    if (width <= 0 || height <= 0) return;
    const centerProj = project(currentCenter.lat, currentCenter.lng, zoom);
    const nw = unproject(centerProj.x - width / 2, centerProj.y - height / 2, zoom);
    const se = unproject(centerProj.x + width / 2, centerProj.y + height / 2, zoom);
    onBoundsChange(`${nw.lng.toFixed(4)},${se.lat.toFixed(4)},${se.lng.toFixed(4)},${nw.lat.toFixed(4)}`);
  }, [currentCenter, zoom, dimensions, onBoundsChange]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    stopInertia();

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Ignore capture failure
    }

    if (pointersRef.current.size === 1) {
      isDraggingRef.current = true;
      hasMovedRef.current = false;
      dragStartPosRef.current = { x: e.clientX, y: e.clientY };
      dragStartCenterRef.current = { ...currentCenter };
      velocityRef.current = { vx: 0, vy: 0, lastTime: performance.now() };
    } else if (pointersRef.current.size === 2) {
      // 2 fingers: prepare pinch-to-zoom
      isDraggingRef.current = false;
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      pinchStartDistRef.current = dist > 0 ? dist : 1;
      pinchStartZoomRef.current = zoom;
      pinchStartCenterRef.current = { ...currentCenter };
      pinchStartMidpointRef.current = {
        x: (pts[0].x + pts[1].x) / 2,
        y: (pts[0].y + pts[1].y) / 2,
      };
    }
  }, [currentCenter, zoom, stopInertia]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const now = performance.now();

    if (pointersRef.current.size === 1 && isDraggingRef.current) {
      const dx = e.clientX - dragStartPosRef.current.x;
      const dy = e.clientY - dragStartPosRef.current.y;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMovedRef.current = true;
        setHasMovedZone(true);
      }

      // Track velocity for inertia
      const dt = Math.max(now - velocityRef.current.lastTime, 8);
      velocityRef.current = {
        vx: (dx - (e.clientX - dragStartPosRef.current.x)) / dt || (dx * 0.1),
        vy: (dy - (e.clientY - dragStartPosRef.current.y)) / dt || (dy * 0.1),
        lastTime: now,
      };

      const startProj = project(dragStartCenterRef.current.lat, dragStartCenterRef.current.lng, zoom);
      const newCenter = unproject(startProj.x - dx, startProj.y - dy, zoom);
      setCurrentCenter(newCenter);
    } else if (pointersRef.current.size >= 2) {
      // Multi-touch pinch-to-zoom
      hasMovedRef.current = true;
      setHasMovedZone(true);
      const pts = Array.from(pointersRef.current.values());
      const currentDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const scale = currentDist / pinchStartDistRef.current;
      const targetZoom = Math.min(Math.max(pinchStartZoomRef.current + Math.log2(scale), 4), 18);

      const el = containerRef.current;
      const rect = el ? el.getBoundingClientRect() : { left: 0, top: 0 };
      const currentMid = {
        x: (pts[0].x + pts[1].x) / 2 - rect.left,
        y: (pts[0].y + pts[1].y) / 2 - rect.top,
      };

      const newCenter = calculateZoomAnchorCenter(
        pinchStartCenterRef.current.lat,
        pinchStartCenterRef.current.lng,
        pinchStartZoomRef.current,
        targetZoom,
        currentMid.x,
        currentMid.y,
        dimensions.width,
        dimensions.height
      );

      setZoom(Math.round(targetZoom * 100) / 100);
      setCurrentCenter(newCenter);
    }
  }, [zoom, dimensions]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore release error
    }

    if (pointersRef.current.size === 0) {
      isDraggingRef.current = false;
    } else if (pointersRef.current.size === 1) {
      // Reset single-finger drag baseline after releasing pinch
      const remainingPt = Array.from(pointersRef.current.values())[0];
      isDraggingRef.current = true;
      dragStartPosRef.current = { x: remainingPt.x, y: remainingPt.y };
      dragStartCenterRef.current = { ...currentCenter };
    }
  }, [currentCenter]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    stopInertia();

    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    const delta = e.deltaY < 0 ? 0.35 : -0.35;
    const targetZoom = Math.min(Math.max(zoom + delta, 4), 18);
    const roundedZoom = Math.round(targetZoom * 100) / 100;

    const newCenter = calculateZoomAnchorCenter(
      currentCenter.lat,
      currentCenter.lng,
      zoom,
      roundedZoom,
      cursorX,
      cursorY,
      dimensions.width,
      dimensions.height
    );

    setZoom(roundedZoom);
    setCurrentCenter(newCenter);
    setHasMovedZone(true);
  }, [zoom, currentCenter, dimensions, stopInertia]);

  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    stopInertia();
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    const targetZoom = Math.min(zoom + 1, 18);
    const newCenter = calculateZoomAnchorCenter(
      currentCenter.lat,
      currentCenter.lng,
      zoom,
      targetZoom,
      cursorX,
      cursorY,
      dimensions.width,
      dimensions.height
    );

    setZoom(targetZoom);
    setCurrentCenter(newCenter);
    setHasMovedZone(true);
  }, [zoom, currentCenter, dimensions, stopInertia]);

  const zoomIn = useCallback(() => {
    stopInertia();
    setZoom((z) => Math.min(Math.round((z + 0.8) * 10) / 10, 18));
    setHasMovedZone(true);
  }, [stopInertia]);

  const zoomOut = useCallback(() => {
    stopInertia();
    setZoom((z) => Math.max(Math.round((z - 0.8) * 10) / 10, 4));
    setHasMovedZone(true);
  }, [stopInertia]);

  return {
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
  };
}
