import { ALGERIA_WILAYAS_DATABASE } from '../data/algerianCommunesDatabase';
import { ALGERIAN_POPULAR_LANDMARKS } from './algeriaPlacesData';

export interface AlgeriaPlaceResult {
  id: string;
  name: string;
  name_ar?: string;
  category: 'quartier' | 'commune' | 'wilaya' | 'landmark' | 'street';
  commune?: string;
  daira?: string;
  wilaya: string;
  wilayaCode?: string;
  postalCode?: string;
  lat: number;
  lng: number;
  zoom: number;
  description?: string;
}

export function normalizeGeoText(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Searches the extensive Algerian geographical database instantly (Wilayas, 1541 Communes, Quartiers, Cités, Landmarks).
 */
export function searchLocalAlgerianPlaces(query: string, preferredWilaya?: string): AlgeriaPlaceResult[] {
  const q = normalizeGeoText(query);
  if (!q || q.length < 2) return [];

  const results: AlgeriaPlaceResult[] = [];
  const seenKeys = new Set<string>();

  // 1. Search in Algerian popular Quartiers, Cités and Landmarks
  for (const item of ALGERIAN_POPULAR_LANDMARKS) {
    const normName = normalizeGeoText(item.name);
    const normNameAr = normalizeGeoText(item.name_ar || '');
    const normCommune = normalizeGeoText(item.commune);

    if (
      normName.includes(q) ||
      normNameAr.includes(q) ||
      q.includes(normName) ||
      `${normName} ${normCommune}`.includes(q)
    ) {
      const key = `${normName}-${item.wilayaCode}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        results.push({
          id: `landmark-${item.name}-${item.wilayaCode}`,
          name: item.name,
          name_ar: item.name_ar,
          category: item.category === 'landmark' ? 'landmark' : 'quartier',
          commune: item.commune,
          wilaya: item.wilaya,
          wilayaCode: item.wilayaCode,
          lat: Number(item.lat.toFixed(6)),
          lng: Number(item.lng.toFixed(6)),
          zoom: item.zoom || 16,
          description: item.description || `Quartier à ${item.commune} (${item.wilaya})`,
        });
      }
    }
  }

  // 2. Search in Algerian 1,541 Communes
  for (const w of ALGERIA_WILAYAS_DATABASE) {
    for (const c of w.communes) {
      const normCommune = normalizeGeoText(c.name);
      const normCommuneAr = normalizeGeoText(c.name_ar || '');
      const normDaira = normalizeGeoText(c.daira || '');
      const postal = c.postal_code || '';

      if (
        normCommune.startsWith(q) ||
        normCommune.includes(q) ||
        normCommuneAr.includes(q) ||
        postal === q ||
        `${normCommune} ${postal}`.includes(q) ||
        normDaira.includes(q)
      ) {
        const key = `c-${w.code}-${normCommune}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          results.push({
            id: `commune-${w.code}-${c.name}`,
            name: c.name,
            name_ar: c.name_ar,
            category: 'commune',
            commune: c.name,
            daira: c.daira,
            wilaya: w.name,
            wilayaCode: w.code,
            postalCode: c.postal_code,
            lat: Number(c.lat.toFixed(6)),
            lng: Number(c.lng.toFixed(6)),
            zoom: 15,
            description: `Commune (${c.postal_code}) · Daïra de ${c.daira} (${w.code} - ${w.name})`,
          });
        }
      }
    }
  }

  // 3. Search in Algerian 58 Wilayas
  for (const w of ALGERIA_WILAYAS_DATABASE) {
    const normW = normalizeGeoText(w.name);
    const normWAr = normalizeGeoText(w.name_ar || '');
    if (normW.startsWith(q) || normW.includes(q) || normWAr.includes(q) || w.code === q) {
      const key = `w-${w.code}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        results.push({
          id: `wilaya-${w.code}`,
          name: `${w.code} - ${w.name}`,
          name_ar: w.name_ar,
          category: 'wilaya',
          wilaya: w.name,
          wilayaCode: w.code,
          lat: Number(w.lat.toFixed(6)),
          lng: Number(w.lng.toFixed(6)),
          zoom: 13,
          description: `Wilaya d'Algérie (${w.code})`,
        });
      }
    }
  }

  // Sort results: prioritize preferred wilaya, exact prefix match, then landmarks & communes
  return results.sort((a, b) => {
    const aNorm = normalizeGeoText(a.name);
    const bNorm = normalizeGeoText(b.name);
    const aStarts = aNorm.startsWith(q) ? 1 : 0;
    const bStarts = bNorm.startsWith(q) ? 1 : 0;
    if (aStarts !== bStarts) return bStarts - aStarts;

    if (preferredWilaya) {
      const aInPref = a.wilaya.toLowerCase() === preferredWilaya.toLowerCase() ? 1 : 0;
      const bInPref = b.wilaya.toLowerCase() === preferredWilaya.toLowerCase() ? 1 : 0;
      if (aInPref !== bInPref) return bInPref - aInPref;
    }

    // Category priority: quartier/landmark > commune > wilaya
    const priority = { quartier: 3, landmark: 3, street: 2, commune: 2, wilaya: 1 };
    const pA = priority[a.category] || 0;
    const pB = priority[b.category] || 0;
    return pB - pA;
  }).slice(0, 10);
}

interface NominatimPlace {
  place_id: number;
  lat: string;
  lon: string;
  name: string;
  display_name: string;
  type?: string;
  class?: string;
}

/**
 * Online OpenStreetMap Geocoding restricted to Algeria (countrycodes=dz)
 */
export async function searchOnlineAlgerianPlaces(
  query: string,
  signal?: AbortSignal
): Promise<AlgeriaPlaceResult[]> {
  const cleanQ = query.trim();
  if (cleanQ.length < 3) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=dz&limit=5&addressdetails=1&q=${encodeURIComponent(
      cleanQ
    )}`;
    const res = await fetch(url, {
      signal,
      headers: {
        Accept: 'application/json',
      },
    });
    if (!res.ok) return [];
    const items = (await res.json()) as NominatimPlace[];
    if (!Array.isArray(items)) return [];

    return items.map((item) => {
      const parts = (item.display_name || '').split(',').map((p) => p.trim());
      const label = item.name || parts[0] || cleanQ;
      const sub = parts.slice(1, 4).join(', ');

      return {
        id: `osm-${item.place_id}`,
        name: label,
        category: item.class === 'highway' ? 'street' : 'quartier',
        wilaya: parts[parts.length - 2] || 'Algérie',
        lat: Number(parseFloat(item.lat).toFixed(6)),
        lng: Number(parseFloat(item.lon).toFixed(6)),
        zoom: 16,
        description: sub || item.display_name,
      };
    });
  } catch {
    return [];
  }
}
