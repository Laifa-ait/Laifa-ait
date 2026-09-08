// Web Mercator projection mathematics for smooth, high-precision map navigation

export interface ScreenCoord {
  x: number;
  y: number;
}

export interface GpsCoord {
  lat: number;
  lng: number;
}

export interface TileInfo {
  key: string;
  x: number;
  y: number;
  z: number;
  screenX: number;
  screenY: number;
}

export type TileLayerType = 'osm' | 'satellite' | 'voyager' | 'roadmap' | 'hybrid';

export const TILE_LAYERS: Record<
  TileLayerType,
  { name: string; getUrl: (x: number, y: number, z: number) => string; attribution: string }
> = {
  roadmap: {
    name: 'Plan Rues & Quartiers HD',
    getUrl: (x, y, z) =>
      `https://mt${(x + y) % 4}.google.com/vt/lyrs=m&hl=fr&gl=DZ&x=${x}&y=${y}&z=${z}`,
    attribution: 'Cartographie Rues & Quartiers Algérie',
  },
  voyager: {
    name: 'Plan Rues & Quartiers HD',
    getUrl: (x, y, z) =>
      `https://mt${(x + y) % 4}.google.com/vt/lyrs=m&hl=fr&gl=DZ&x=${x}&y=${y}&z=${z}`,
    attribution: 'Cartographie Rues & Quartiers Algérie',
  },
  satellite: {
    name: 'Satellite HD + Noms des Rues',
    getUrl: (x, y, z) =>
      `https://mt${(x + y) % 4}.google.com/vt/lyrs=y&hl=fr&gl=DZ&x=${x}&y=${y}&z=${z}`,
    attribution: 'Imagerie Satellite HD & Voies Routières',
  },
  hybrid: {
    name: 'Satellite HD + Noms des Rues',
    getUrl: (x, y, z) =>
      `https://mt${(x + y) % 4}.google.com/vt/lyrs=y&hl=fr&gl=DZ&x=${x}&y=${y}&z=${z}`,
    attribution: 'Imagerie Satellite HD & Voies Routières',
  },
  osm: {
    name: 'OpenStreetMap Algérie Rues',
    getUrl: (x, y, z) => `https://tile.openstreetmap.fr/osmfr/${z}/${x}/${y}.png`,
    attribution: '© Contributeurs OpenStreetMap France / DZ',
  },
};

/**
 * Projects GPS lat/lng into Mercator pixel coordinates at a given zoom level (tile size 256).
 */
export function project(lat: number, lng: number, zoom: number): ScreenCoord {
  const siny = Math.min(Math.max(Math.sin((lat * Math.PI) / 180), -0.9999), 0.9999);
  const scale = 256 * Math.pow(2, zoom);
  return {
    x: scale * (0.5 + lng / 360),
    y: scale * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI)),
  };
}

/**
 * Unprojects Mercator pixel coordinates back to GPS lat/lng.
 */
export function unproject(x: number, y: number, zoom: number): GpsCoord {
  const scale = 256 * Math.pow(2, zoom);
  const lng = (x / scale - 0.5) * 360;
  const latRadians = (0.5 - y / scale) * 2 * Math.PI;
  const lat = (Math.atan(Math.sinh(latRadians)) * 180) / Math.PI;
  return { lat, lng };
}

/**
 * Calculates all tiles visible within the container viewport.
 */
export function getVisibleTiles(
  centerLat: number,
  centerLng: number,
  zoom: number,
  width: number,
  height: number
): TileInfo[] {
  const intZoom = Math.floor(zoom);
  const maxTile = Math.pow(2, intZoom);
  const centerProj = project(centerLat, centerLng, intZoom);

  // Offset due to fractional zoom
  const zoomFactor = Math.pow(2, zoom - intZoom);

  const halfW = width / (2 * zoomFactor);
  const halfH = height / (2 * zoomFactor);

  const minX = Math.floor((centerProj.x - halfW) / 256);
  const maxX = Math.floor((centerProj.x + halfW) / 256);
  const minY = Math.floor((centerProj.y - halfH) / 256);
  const maxY = Math.floor((centerProj.y + halfH) / 256);

  const tiles: TileInfo[] = [];

  for (let ty = minY; ty <= maxY; ty++) {
    if (ty < 0 || ty >= maxTile) continue;
    for (let tx = minX; tx <= maxX; tx++) {
      const wrappedX = ((tx % maxTile) + maxTile) % maxTile;
      const tileWorldX = tx * 256;
      const tileWorldY = ty * 256;

      const screenX = (tileWorldX - centerProj.x) * zoomFactor + width / 2;
      const screenY = (tileWorldY - centerProj.y) * zoomFactor + height / 2;

      tiles.push({
        key: `${intZoom}-${wrappedX}-${ty}`,
        x: wrappedX,
        y: ty,
        z: intZoom,
        screenX,
        screenY,
      });
    }
  }

  return tiles;
}

export function formatPriceShort(price: number, period?: string): string {
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
}

/**
 * Calculates new center GPS when zooming around a specific screen coordinate (e.g. mouse cursor or pinch center).
 */
export function calculateZoomAnchorCenter(
  centerLat: number,
  centerLng: number,
  currentZoom: number,
  targetZoom: number,
  screenX: number,
  screenY: number,
  containerWidth: number,
  containerHeight: number
): GpsCoord {
  if (containerWidth <= 0 || containerHeight <= 0) {
    return { lat: centerLat, lng: centerLng };
  }

  const offsetX = screenX - containerWidth / 2;
  const offsetY = screenY - containerHeight / 2;

  const currentCenterProj = project(centerLat, centerLng, currentZoom);
  const anchorWorldX = currentCenterProj.x + offsetX;
  const anchorWorldY = currentCenterProj.y + offsetY;
  const anchorGps = unproject(anchorWorldX, anchorWorldY, currentZoom);

  const newAnchorProj = project(anchorGps.lat, anchorGps.lng, targetZoom);
  const newCenterWorldX = newAnchorProj.x - offsetX;
  const newCenterWorldY = newAnchorProj.y - offsetY;

  return unproject(newCenterWorldX, newCenterWorldY, targetZoom);
}

/**
 * Automatically fits map center and zoom level to encompass all provided GPS coordinates.
 */
export function fitBoundsToCoordinates(
  coords: Array<{ lat: number; lng: number }>,
  width: number,
  height: number,
  padding: number = 70
): { centerLat: number; centerLng: number; zoom: number } {
  const validCoords = coords.filter(
    (c) => typeof c.lat === 'number' && typeof c.lng === 'number' && !isNaN(c.lat) && !isNaN(c.lng) && (c.lat !== 0 || c.lng !== 0)
  );

  if (validCoords.length === 0) {
    return { centerLat: 36.7538, centerLng: 3.0588, zoom: 12 };
  }
  if (validCoords.length === 1) {
    return { centerLat: validCoords[0].lat, centerLng: validCoords[0].lng, zoom: 14 };
  }

  let minLat = 90;
  let maxLat = -90;
  let minLng = 180;
  let maxLng = -180;

  for (const c of validCoords) {
    if (c.lat < minLat) minLat = c.lat;
    if (c.lat > maxLat) maxLat = c.lat;
    if (c.lng < minLng) minLng = c.lng;
    if (c.lng > maxLng) maxLng = c.lng;
  }

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  const availW = Math.max(80, width - padding * 2);
  const availH = Math.max(80, height - padding * 2);

  const pMin = project(minLat, minLng, 0);
  const pMax = project(maxLat, maxLng, 0);

  const deltaX = Math.max(Math.abs(pMax.x - pMin.x), 0.001);
  const deltaY = Math.max(Math.abs(pMax.y - pMin.y), 0.001);

  const zoomX = Math.log2(availW / deltaX);
  const zoomY = Math.log2(availH / deltaY);

  const calculatedZoom = Math.min(zoomX, zoomY);
  const clampedZoom = Math.max(5, Math.min(15, Math.floor(calculatedZoom * 10) / 10));

  return {
    centerLat,
    centerLng,
    zoom: clampedZoom,
  };
}

