import { project, unproject, calculateZoomAnchorCenter, GpsCoord } from './webMercator';

export const MIN_MAP_ZOOM = 4;
export const MAX_MAP_ZOOM = 18;

export function clampZoom(z: number): number {
  return Math.min(Math.max(z, MIN_MAP_ZOOM), MAX_MAP_ZOOM);
}

export function formatBoundingBox(
  currentCenter: GpsCoord,
  zoom: number,
  width: number,
  height: number
): string {
  const centerProj = project(currentCenter.lat, currentCenter.lng, zoom);
  const nw = unproject(centerProj.x - width / 2, centerProj.y - height / 2, zoom);
  const se = unproject(centerProj.x + width / 2, centerProj.y + height / 2, zoom);
  return `${nw.lng.toFixed(4)},${se.lat.toFixed(4)},${se.lng.toFixed(4)},${nw.lat.toFixed(4)}`;
}

export function computePinchZoomAndCenter(
  pts: { x: number; y: number }[],
  pinchStartDist: number,
  pinchStartZoom: number,
  pinchStartCenter: GpsCoord,
  containerRect: { left: number; top: number },
  width: number,
  height: number
): { targetZoom: number; newCenter: GpsCoord } {
  const currentDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
  const scale = currentDist / (pinchStartDist > 0 ? pinchStartDist : 1);
  const rawTargetZoom = clampZoom(pinchStartZoom + Math.log2(scale));
  const targetZoom = Math.round(rawTargetZoom * 100) / 100;

  const currentMid = {
    x: (pts[0].x + pts[1].x) / 2 - containerRect.left,
    y: (pts[0].y + pts[1].y) / 2 - containerRect.top,
  };

  const newCenter = calculateZoomAnchorCenter(
    pinchStartCenter.lat,
    pinchStartCenter.lng,
    pinchStartZoom,
    targetZoom,
    currentMid.x,
    currentMid.y,
    width,
    height
  );

  return { targetZoom, newCenter };
}
