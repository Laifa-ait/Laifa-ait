import { useState, useRef, useEffect, useCallback } from 'react';
import { project, unproject, calculateZoomAnchorCenter, GpsCoord } from './webMercator';
import {
  clampZoom,
  formatBoundingBox,
  computePinchZoomAndCenter,
} from './mapGestureHelpers';

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

  // Pinch-to-zoom state & inertia animation
  const pinchStartDistRef = useRef(0);
  const pinchStartZoomRef = useRef(initialZoom);
  const pinchStartCenterRef = useRef<GpsCoord>({ lat: initialCenterLat, lng: initialCenterLng });
  const isPinchingRef = useRef(false);
  const lastWheelTimeRef = useRef(0);
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
    onBoundsChange(formatBoundingBox(currentCenter, zoom, width, height));
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
      isDraggingRef.current = false;
      isPinchingRef.current = true;
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      pinchStartDistRef.current = dist > 0 ? dist : 1;
      pinchStartZoomRef.current = zoom;
      pinchStartCenterRef.current = { ...currentCenter };
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
      hasMovedRef.current = true;
      setHasMovedZone(true);
      const pts = Array.from(pointersRef.current.values());
      const el = containerRef.current;
      const rect = el ? el.getBoundingClientRect() : { left: 0, top: 0 };

      const { targetZoom, newCenter } = computePinchZoomAndCenter(
        pts,
        pinchStartDistRef.current,
        pinchStartZoomRef.current,
        pinchStartCenterRef.current,
        rect,
        dimensions.width,
        dimensions.height
      );

      setZoom(targetZoom);
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
      if (isPinchingRef.current) {
        isPinchingRef.current = false;
        // Snap back to crisp integer zoom when pinch ends
        setZoom((z) => clampZoom(Math.round(z)));
      }
    } else if (pointersRef.current.size === 1) {
      const remainingPt = Array.from(pointersRef.current.values())[0];
      isDraggingRef.current = true;
      dragStartPosRef.current = { x: remainingPt.x, y: remainingPt.y };
      dragStartCenterRef.current = { ...currentCenter };
    }
  }, [currentCenter]);

  // Standard ordinary map wheel zoom: 1 integer level per notch, throttled to avoid runaway jumps
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    stopInertia();

    const now = performance.now();
    if (now - lastWheelTimeRef.current < 160) {
      return;
    }
    lastWheelTimeRef.current = now;

    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    // Ordinary discrete step: +1 level on wheel-up, -1 level on wheel-down
    const currentBase = Math.round(zoom);
    const targetZoom = clampZoom(e.deltaY < 0 ? currentBase + 1 : currentBase - 1);
    if (targetZoom === zoom) return;

    const newCenter = calculateZoomAnchorCenter(
      currentCenter.lat, currentCenter.lng, zoom, targetZoom,
      e.clientX - rect.left, e.clientY - rect.top, dimensions.width, dimensions.height
    );
    setZoom(targetZoom);
    setCurrentCenter(newCenter);
    setHasMovedZone(true);
  }, [zoom, currentCenter, dimensions, stopInertia]);

  // Standard double-click zoom (+1 level anchored on click point)
  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    stopInertia();
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const currentBase = Math.round(zoom);
    const targetZoom = clampZoom(currentBase + 1);
    if (targetZoom === zoom) return;

    const newCenter = calculateZoomAnchorCenter(
      currentCenter.lat, currentCenter.lng, zoom, targetZoom,
      e.clientX - rect.left, e.clientY - rect.top, dimensions.width, dimensions.height
    );
    setZoom(targetZoom);
    setCurrentCenter(newCenter);
    setHasMovedZone(true);
  }, [zoom, currentCenter, dimensions, stopInertia]);

  // Ordinary zoom buttons: exactly +1 or -1 discrete integer step
  const zoomIn = useCallback(() => {
    stopInertia();
    setZoom((z) => clampZoom(Math.round(z) + 1));
    setHasMovedZone(true);
  }, [stopInertia]);

  const zoomOut = useCallback(() => {
    stopInertia();
    setZoom((z) => clampZoom(Math.round(z) - 1));
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
