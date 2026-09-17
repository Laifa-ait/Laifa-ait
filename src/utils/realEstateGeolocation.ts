import { ALGERIA_WILAYAS, WilayaOption } from '../constants/wilayas';
import { calculateHaversineDistanceKm } from '../services/realEstateGeo';
import { findClosestLocation } from '../data/algerianCommunesDatabase';

export interface GeolocationResult {
  wilaya: WilayaOption;
  lat: number;
  lng: number;
  distanceKm: number;
  accuracy?: number;
}

export interface DetailedGeolocationResult extends GeolocationResult {
  commune: string;
  daira: string;
  wilayaCode: string;
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
 * Trouve la wilaya et la commune algérienne la plus précise pour un point donné.
 */
export function findNearestAlgerianDetailedLocation(lat: number, lng: number, accuracy?: number): DetailedGeolocationResult | null {
  const wilayaResult = findNearestAlgerianWilaya(lat, lng);
  if (!wilayaResult) return null;

  const closest = findClosestLocation(lat, lng);

  return {
    ...wilayaResult,
    commune: closest.commune,
    daira: closest.daira,
    wilayaCode: closest.wilayaCode,
    accuracy,
  };
}

/**
 * Demande la position du navigateur de manière non-bloquante et résout la wilaya la plus proche.
 */
export function requestUserAlgerianWilaya(
  onSuccess: (result: DetailedGeolocationResult) => void,
  onError: (errorMessage: string) => void,
  onFinally?: () => void
): void {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    onError("La géolocalisation n'est pas prise en charge par ce navigateur.");
    if (onFinally) onFinally();
    return;
  }

  const handlePosition = (pos: GeolocationPosition) => {
    const { latitude, longitude, accuracy } = pos.coords;
    const res = findNearestAlgerianDetailedLocation(latitude, longitude, accuracy);
    if (res) {
      onSuccess(res);
    } else {
      onError("Position détectée hors du territoire algérien.");
    }
    if (onFinally) onFinally();
  };

  const handleError = (err: GeolocationPositionError) => {
    let msg = "Impossible d'accéder à votre position actuelle.";
    if (err.code === 1) {
      msg = "Accès à la géolocalisation refusé. Veuillez autoriser la localisation dans les paramètres de votre navigateur.";
    } else if (err.code === 2) {
      msg = "Position GPS ou réseau non disponible.";
    } else if (err.code === 3) {
      msg = "Délai de géolocalisation dépassé. Veuillez réessayer ou choisir votre wilaya manuellement.";
    }
    onError(msg);
    if (onFinally) onFinally();
  };

  // Try standard quick network/cached positioning first for instant responsive feel
  navigator.geolocation.getCurrentPosition(
    handlePosition,
    () => {
      // Fallback with high accuracy if quick attempt fails
      navigator.geolocation.getCurrentPosition(
        handlePosition,
        handleError,
        { timeout: 8000, maximumAge: 0, enableHighAccuracy: true }
      );
    },
    { timeout: 5000, maximumAge: 300000, enableHighAccuracy: false }
  );
}

