import { useMemo, useCallback } from 'react';
import { Property, PropertyMapResult } from '../../types/realEstate';

export const GEO_BOUNDS = {
  minLat: 34.2,
  maxLat: 37.6,
  minLng: -2.2,
  maxLng: 8.8,
};

export interface MapCluster {
  id: string;
  isCluster: boolean;
  count: number;
  lat: number;
  lng: number;
  properties: (Property | PropertyMapResult)[];
  mainProperty?: Property | PropertyMapResult;
}

export function useVectorClustering(
  properties: (Property | PropertyMapResult)[],
  zoom: number
) {
  const validProperties = useMemo(() => {
    return properties.filter((p) => {
      const lat = 'location' in p ? p.location.lat : p.lat;
      const lng = 'location' in p ? p.location.lng : p.lng;
      return typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng);
    });
  }, [properties]);

  const gpsToPercent = useCallback((lat: number, lng: number) => {
    const xPct = ((lng - GEO_BOUNDS.minLng) / (GEO_BOUNDS.maxLng - GEO_BOUNDS.minLng)) * 100;
    const yPct = ((GEO_BOUNDS.maxLat - lat) / (GEO_BOUNDS.maxLat - GEO_BOUNDS.minLat)) * 100;
    return { x: xPct, y: yPct };
  }, []);

  const clusters = useMemo<MapCluster[]>(() => {
    const clusterRadiusPct = 7 / zoom;
    const processed: boolean[] = new Array(validProperties.length).fill(false);
    const result: MapCluster[] = [];

    validProperties.forEach((p, idx) => {
      if (processed[idx]) return;

      const pLat = 'location' in p ? p.location.lat : p.lat;
      const pLng = 'location' in p ? p.location.lng : p.lng;
      const pos = gpsToPercent(pLat, pLng);

      const clusterGroup: (Property | PropertyMapResult)[] = [p];
      processed[idx] = true;

      validProperties.forEach((other, oIdx) => {
        if (processed[oIdx] || idx === oIdx) return;

        const oLat = 'location' in other ? other.location.lat : other.lat;
        const oLng = 'location' in other ? other.location.lng : other.lng;
        const oPos = gpsToPercent(oLat, oLng);

        const dx = pos.x - oPos.x;
        const dy = pos.y - oPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < clusterRadiusPct) {
          clusterGroup.push(other);
          processed[oIdx] = true;
        }
      });

      if (clusterGroup.length > 1) {
        const avgLat =
          clusterGroup.reduce(
            (sum, item) => sum + ('location' in item ? item.location.lat : item.lat),
            0
          ) / clusterGroup.length;
        const avgLng =
          clusterGroup.reduce(
            (sum, item) => sum + ('location' in item ? item.location.lng : item.lng),
            0
          ) / clusterGroup.length;

        result.push({
          id: `cluster-${idx}-${clusterGroup.length}`,
          isCluster: true,
          count: clusterGroup.length,
          lat: avgLat,
          lng: avgLng,
          properties: clusterGroup,
        });
      } else {
        result.push({
          id: p.id,
          isCluster: false,
          count: 1,
          lat: pLat,
          lng: pLng,
          properties: [p],
          mainProperty: p,
        });
      }
    });

    return result;
  }, [validProperties, zoom, gpsToPercent]);

  return {
    validProperties,
    gpsToPercent,
    clusters,
  };
}
