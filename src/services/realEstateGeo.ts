/**
 * Olma Immo & Location — Moteur Géospatial
 * Encodeur/Décodeur Geohash, Calcul de distance Haversine, Bounding Box et requêtes par zones.
 */

const BASE32_CHARS = '0123456789bcdefghjkmnpqrstuvwxyz';
const BITS = [16, 8, 4, 2, 1];

// Bounding Box approximative de l'Algérie (Latitude: 18.9 à 38.5 °N, Longitude: -8.7 à 12.0 °E)
export const ALGERIA_BOUNDS = {
  minLat: 18.5,
  maxLat: 38.8,
  minLng: -9.0,
  maxLng: 12.5,
};

/**
 * Vérifie si les coordonnées fournies sont dans le périmètre géographique étendu de l'Algérie.
 */
export function isWithinAlgeriaBounds(lat: number, lng: number): boolean {
  return (
    lat >= ALGERIA_BOUNDS.minLat &&
    lat <= ALGERIA_BOUNDS.maxLat &&
    lng >= ALGERIA_BOUNDS.minLng &&
    lng <= ALGERIA_BOUNDS.maxLng
  );
}

/**
 * Calcule le Geohash d'une paire (lat, lng) avec une précision donnée (par défaut 7 caractères ~ 150m).
 */
export function encodeGeohash(lat: number, lng: number, precision = 7): string {
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new Error('Coordonnées géographiques invalides pour l\'encodage Geohash.');
  }

  const safePrecision = Math.max(1, Math.min(Math.floor(precision || 7), 12));
  let isEven = true;
  let latMin = -90;
  let latMax = 90;
  let lngMin = -180;
  let lngMax = 180;
  let bit = 0;
  let ch = 0;
  let geohash = '';
  let steps = 0;
  const MAX_STEPS = 120;

  while (geohash.length < safePrecision && steps < MAX_STEPS) {
    steps++;
    if (isEven) {
      const mid = (lngMin + lngMax) / 2;
      if (lng >= mid) {
        ch |= BITS[bit];
        lngMin = mid;
      } else {
        lngMax = mid;
      }
    } else {
      const mid = (latMin + latMax) / 2;
      if (lat >= mid) {
        ch |= BITS[bit];
        latMin = mid;
      } else {
        latMax = mid;
      }
    }

    isEven = !isEven;
    if (bit < 4) {
      bit++;
    } else {
      geohash += BASE32_CHARS[ch];
      bit = 0;
      ch = 0;
    }
  }

  return geohash;
}

/**
 * Calcule la distance orthodromique entre deux points GPS en kilomètres (Formule de Haversine).
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (
    isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2) ||
    !isFinite(lat1) || !isFinite(lon1) || !isFinite(lat2) || !isFinite(lon2)
  ) {
    return Infinity;
  }

  const R = 6371; // Rayon moyen de la Terre en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Arrondi à 2 décimales (10 mètres)
}

/**
 * Détermine si un point (lat, lng) se situe à l'intérieur d'une Bounding Box [minLng, minLat, maxLng, maxLat].
 */
export function isWithinBoundingBox(
  lat: number,
  lng: number,
  bbox: [number, number, number, number]
): boolean {
  const [minLng, minLat, maxLng, maxLat] = bbox;
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

/**
 * Calcule la longueur approchée d'un degré de latitude / longitude en km.
 */
export function getBoundingBoxForRadius(
  centerLat: number,
  centerLng: number,
  radiusKm: number
): [number, number, number, number] {
  const latDelta = radiusKm / 111.0; // 1 degré de lat ~ 111km
  const lngDelta = radiusKm / (111.0 * Math.cos(centerLat * (Math.PI / 180)));

  const minLat = Math.max(-90, centerLat - latDelta);
  const maxLat = Math.min(90, centerLat + latDelta);
  const minLng = Math.max(-180, centerLng - Math.abs(lngDelta));
  const maxLng = Math.min(180, centerLng + Math.abs(lngDelta));

  return [minLng, minLat, maxLng, maxLat];
}

/**
 * Détermine la longueur de préfixe Geohash optimale pour un rayon de recherche donné.
 */
export function getGeohashPrecisionForRadius(radiusKm: number): number {
  if (radiusKm <= 1) return 6;    // ~1.2km x 0.6km
  if (radiusKm <= 5) return 5;    // ~4.9km x 4.9km
  if (radiusKm <= 35) return 4;   // ~39km x 19km
  if (radiusKm <= 150) return 3;  // ~156km x 156km
  return 2;                       // ~1250km x 625km
}

/**
 * Retourne la taille en degrés (hauteur lat, largeur lng) d'une cellule Geohash pour une précision donnée.
 */
export function getGeohashCellDimensions(precision: number): { latHeight: number; lngWidth: number } {
  const bitsLat = Math.floor((precision * 5) / 2);
  const bitsLng = Math.ceil((precision * 5) / 2);
  return {
    latHeight: 180 / Math.pow(2, bitsLat),
    lngWidth: 360 / Math.pow(2, bitsLng),
  };
}

/**
 * Calcule les plages de requêtes Geohash (start/end) pour une Bounding Box [minLng, minLat, maxLng, maxLat].
 * Couvre exhaustivement 100% des cellules Geohash intersectant la boîte (centre, coins, bords, frontières et cellules intermédiaires).
 */
export function getGeohashRangesForBoundingBox(
  bbox: [number, number, number, number]
): Array<{ start: string; end: string; prefix: string }> {
  const [minLng, minLat, maxLng, maxLat] = bbox;
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  const heightKm = calculateHaversineDistanceKm(minLat, centerLng, maxLat, centerLng);
  const widthKm = calculateHaversineDistanceKm(centerLat, minLng, centerLat, maxLng);
  const maxSpanKm = Math.max(heightKm, widthKm, 1);
  let precision = getGeohashPrecisionForRadius(maxSpanKm / 2);

  const getPrefixesForPrecision = (prec: number): string[] => {
    const { latHeight, lngWidth } = getGeohashCellDimensions(prec);
    const latStep = Math.max(latHeight * 0.5, 0.0001);
    const lngStep = Math.max(lngWidth * 0.5, 0.0001);

    const prefixes = new Set<string>();

    // Générer les points de test latitudinaux incluant minLat, maxLat et centre
    const lats: number[] = [];
    for (let lat = minLat; lat <= maxLat; lat += latStep) {
      lats.push(lat);
    }
    if (!lats.includes(maxLat)) lats.push(maxLat);
    if (!lats.includes(centerLat)) lats.push(centerLat);

    // Générer les points de test longitudinaux incluant minLng, maxLng et centre
    const lngs: number[] = [];
    for (let lng = minLng; lng <= maxLng; lng += lngStep) {
      lngs.push(lng);
    }
    if (!lngs.includes(maxLng)) lngs.push(maxLng);
    if (!lngs.includes(centerLng)) lngs.push(centerLng);

    // Echantillonner l'intégralité de la grille 2D
    for (const lat of lats) {
      for (const lng of lngs) {
        const hash = encodeGeohash(lat, lng, prec);
        prefixes.add(hash.substring(0, prec));
      }
    }

    return Array.from(prefixes);
  };

  let prefixes = getPrefixesForPrecision(precision);

  // Si le nombre de préfixes dépasse 16 (limite optimale Firestore), on regroupe à la précision inférieure
  let reductions = 0;
  while (prefixes.length > 16 && precision > 2 && reductions < 10) {
    reductions++;
    precision -= 1;
    prefixes = Array.from(new Set(prefixes.map((p) => p.substring(0, precision))));
  }

  return prefixes.map((prefix) => ({
    prefix,
    start: prefix,
    end: prefix + '~',
  }));
}

/**
 * Calcule les plages de requêtes Geohash (start/end) pour un centre et un rayon de recherche.
 * Couvre exhaustivement l'intégralité du cercle via sa boîte englobante.
 */
export function getGeohashRangesForRadius(
  centerLat: number,
  centerLng: number,
  radiusKm: number
): Array<{ start: string; end: string; prefix: string }> {
  const bbox = getBoundingBoxForRadius(centerLat, centerLng, radiusKm);
  return getGeohashRangesForBoundingBox(bbox);
}
