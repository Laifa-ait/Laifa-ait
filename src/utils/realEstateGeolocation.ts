import { ALGERIA_WILAYAS, WilayaOption } from '../constants/wilayas';
import { calculateHaversineDistanceKm } from '../services/realEstateGeo';

export interface GeolocationResult {
  wilaya: WilayaOption;
  lat: number;
  lng: number;
  distanceKm: number;
}

/**
 * Trouve la wilaya algérienne la plus proche d'un point géographique donné (Haversine).
 */
export function findNearestAlgerianWilaya(lat: number, lng: number): GeolocationResult | null {
  if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
    return null;
  }

  let nearest: WilayaOption | null = null;
  let minDistance = Infinity;

  for (const w of ALGERIA_WILAYAS) {
    if (typeof w.lat === 'number' && typeof w.lng === 'number') {
      const dist = calculateHaversineDistanceKm(lat, lng, w.lat, w.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = w;
      }
    }
  }

  if (!nearest) return null;
  return {
    wilaya: nearest,
    lat,
    lng,
    distanceKm: minDistance,
  };
}

/**
 * Demande la position du navigateur de manière non-bloquante et résout la wilaya la plus proche.
 */
export function requestUserAlgerianWilaya(
  onSuccess: (result: GeolocationResult) => void,
  onError: (errorMessage: string) => void,
  onFinally?: () => void
): void {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    onError("La géolocalisation n'est pas prise en charge par ce navigateur.");
    if (onFinally) onFinally();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const res = findNearestAlgerianWilaya(latitude, longitude);
      if (res) {
        onSuccess(res);
      } else {
        onError("Impossible de trouver une wilaya correspondante.");
      }
      if (onFinally) onFinally();
    },
    (err) => {
      let msg = "Impossible d'accéder à votre position actuelle.";
      if (err.code === 1) {
        msg = "Accès à la géolocalisation refusé.";
      } else if (err.code === 2) {
        msg = "Position non disponible.";
      } else if (err.code === 3) {
        msg = "Délai de géolocalisation dépassé.";
      }
      onError(msg);
      if (onFinally) onFinally();
    },
    { timeout: 7000, maximumAge: 60000, enableHighAccuracy: false }
  );
}
