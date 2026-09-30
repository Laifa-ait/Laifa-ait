/**
 * Official database of Algerian Wilayas and Communes.
 * Data extracted into algerianCommunesDatabase.json to preserve bundle size.
 */

import rawWilayas from './algerianCommunesDatabase.json';

export interface CommuneInfo {
  name: string;
  name_ar: string;
  daira: string;
  postal_code: string;
  lat: number;
  lng: number;
}

export interface WilayaInfo {
  code: string;
  name: string;
  name_ar: string;
  lat: number;
  lng: number;
  communes: CommuneInfo[];
}

export interface LocationSearchResult {
  type: 'wilaya' | 'daira' | 'commune';
  label: string;
  wilaya: string;
  wilayaCode: string;
  daira?: string;
  commune?: string;
  nameAr?: string;
}

export const ALGERIA_WILAYAS_DATABASE: WilayaInfo[] = rawWilayas as unknown as WilayaInfo[];

let lazyDb: WilayaInfo[] | null = null;

export async function loadAlgerianCommunesDatabase(): Promise<WilayaInfo[]> {
  if (lazyDb) return lazyDb;
  const g = globalThis as { window?: { fetch?: (url: string) => Promise<Response> } };
  if (typeof g.window !== 'undefined' && typeof g.window.fetch === 'function') {
    try {
      const res = await g.window.fetch('/data/algerianCommunesDatabase.json');
      if (res.ok) {
        lazyDb = (await res.json()) as WilayaInfo[];
        return lazyDb;
      }
    } catch {
      // Fallback
    }
  }
  const mod = await import('./algerianCommunesDatabase.json');
  lazyDb = (mod.default || mod) as unknown as WilayaInfo[];
  return lazyDb;
}

export async function getCommunesForWilayaAsync(wilayaIdentifier: string): Promise<CommuneInfo[]> {
  await loadAlgerianCommunesDatabase();
  return getCommunesForWilaya(wilayaIdentifier);
}

export async function getDairasForWilayaAsync(wilayaIdentifier: string): Promise<string[]> {
  await loadAlgerianCommunesDatabase();
  return getDairasForWilaya(wilayaIdentifier);
}

export async function searchAlgerianLocationsAsync(query: string, limit = 8): Promise<LocationSearchResult[]> {
  await loadAlgerianCommunesDatabase();
  return searchAlgerianLocations(query, limit);
}

export function getWilayasList(): WilayaInfo[] {
  return ALGERIA_WILAYAS_DATABASE;
}

function findWilaya(wilayaIdentifier: string): WilayaInfo | undefined {
  if (!wilayaIdentifier) return undefined;
  const clean = wilayaIdentifier.trim();
  const codeMatch = clean.match(/^(\d{1,2})/);
  const codeStr = codeMatch ? codeMatch[1].padStart(2, "0") : null;
  return ALGERIA_WILAYAS_DATABASE.find(
    (w) => w.code === codeStr || w.name.toLowerCase() === clean.toLowerCase() || `${w.code} - ${w.name}`.toLowerCase() === clean.toLowerCase()
  );
}

export function getCommunesForWilaya(wilayaIdentifier: string): CommuneInfo[] {
  return findWilaya(wilayaIdentifier)?.communes || [];
}

export function findWilayaCoords(wilayaIdentifier: string): { lat: number; lng: number } | null {
  const found = findWilaya(wilayaIdentifier);
  return found ? { lat: found.lat, lng: found.lng } : null;
}

function normalizeGeoString(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '');
}

export function findCommuneCoords(wilayaIdentifier: string, communeName: string): { lat: number; lng: number } | null {
  if (!communeName) return null;
  const communes = getCommunesForWilaya(wilayaIdentifier);
  const targetRaw = communeName.trim();
  const targetNorm = normalizeGeoString(targetRaw);
  const targetConsonants = targetNorm.replace(/[aeiouy]/g, '');

  const exact = communes.find((c) => c.name.toLowerCase() === targetRaw.toLowerCase() || (c.name_ar && c.name_ar.trim() === targetRaw));
  if (exact) return { lat: exact.lat, lng: exact.lng };

  const normMatch = communes.find((c) => normalizeGeoString(c.name) === targetNorm);
  if (normMatch) return { lat: normMatch.lat, lng: normMatch.lng };

  const partial = communes.find((c) => {
    const cNorm = normalizeGeoString(c.name);
    return cNorm.includes(targetNorm) || targetNorm.includes(cNorm);
  });
  if (partial) return { lat: partial.lat, lng: partial.lng };

  if (targetConsonants.length >= 3) {
    const consMatch = communes.find((c) => {
      const cCons = normalizeGeoString(c.name).replace(/[aeiouy]/g, '');
      return cCons === targetConsonants || cCons.startsWith(targetConsonants);
    });
    if (consMatch) return { lat: consMatch.lat, lng: consMatch.lng };
  }
  return null;
}

export function getDairasForWilaya(wilayaIdentifier: string): string[] {
  const communes = getCommunesForWilaya(wilayaIdentifier);
  const dairaSet = new Set<string>();
  communes.forEach((c) => { if (c.daira?.trim()) dairaSet.add(c.daira.trim()); });
  return Array.from(dairaSet).sort((a, b) => a.localeCompare(b, 'fr'));
}

export function getCommunesForDaira(wilayaIdentifier: string, dairaName?: string): CommuneInfo[] {
  const communes = getCommunesForWilaya(wilayaIdentifier);
  if (!dairaName || dairaName === 'all') return communes;
  const target = dairaName.trim().toLowerCase();
  return communes.filter((c) => c.daira && c.daira.trim().toLowerCase() === target);
}

export function findDairaForCommune(wilayaIdentifier: string, communeName: string): string | null {
  if (!communeName) return null;
  const communes = getCommunesForWilaya(wilayaIdentifier);
  const target = communeName.trim().toLowerCase();
  const found = communes.find((c) =>
    c.name.toLowerCase() === target || (c.name_ar && c.name_ar.trim() === communeName.trim()) || normalizeGeoString(c.name) === normalizeGeoString(communeName)
  );
  return found?.daira || null;
}

export function findDairaCoords(wilayaIdentifier: string, dairaName: string): { lat: number; lng: number } | null {
  const communes = getCommunesForDaira(wilayaIdentifier, dairaName);
  if (communes.length === 0) return null;
  const sum = communes.reduce((acc, c) => ({ lat: acc.lat + c.lat, lng: acc.lng + c.lng }), { lat: 0, lng: 0 });
  return {
    lat: Number((sum.lat / communes.length).toFixed(6)),
    lng: Number((sum.lng / communes.length).toFixed(6)),
  };
}

export function findClosestLocation(lat: number, lng: number): { wilaya: string; wilayaCode: string; daira: string; commune: string; lat: number; lng: number } {
  let closestWilaya = ALGERIA_WILAYAS_DATABASE[0];
  let closestCommune: CommuneInfo = ALGERIA_WILAYAS_DATABASE[0].communes[0];
  let minDistance = Infinity;

  for (const w of ALGERIA_WILAYAS_DATABASE) {
    for (const c of w.communes) {
      const d = Math.hypot(c.lat - lat, c.lng - lng);
      if (d < minDistance) {
        minDistance = d;
        closestWilaya = w;
        closestCommune = c;
      }
    }
  }

  return {
    wilaya: closestWilaya.name,
    wilayaCode: closestWilaya.code,
    daira: closestCommune.daira || '',
    commune: closestCommune.name,
    lat: closestCommune.lat,
    lng: closestCommune.lng,
  };
}

export function searchAlgerianLocations(query: string, limit = 8): LocationSearchResult[] {
  if (!query || query.trim().length < 2) return [];
  const normalizedQuery = normalizeGeoString(query);
  const results: LocationSearchResult[] = [];
  const seen = new Set<string>();

  // 1. Wilayas
  for (const w of ALGERIA_WILAYAS_DATABASE) {
    const codeMatch = w.code === query.trim() || w.code.replace(/^0+/, '') === query.trim();
    if (normalizeGeoString(w.name).includes(normalizedQuery) || codeMatch || (w.name_ar && w.name_ar.includes(query.trim()))) {
      if (!seen.has(`w-${w.code}`)) {
        seen.add(`w-${w.code}`);
        results.push({ type: 'wilaya', label: `${w.name} (${w.code})`, wilaya: w.name, wilayaCode: w.code, nameAr: w.name_ar });
      }
    }
  }

  // 2. Daïras & Communes
  for (const w of ALGERIA_WILAYAS_DATABASE) {
    const dairas = new Set<string>();
    for (const c of w.communes) {
      if (c.daira && !dairas.has(c.daira)) {
        dairas.add(c.daira);
        if (normalizeGeoString(c.daira).includes(normalizedQuery) && !seen.has(`d-${w.code}-${c.daira}`)) {
          seen.add(`d-${w.code}-${c.daira}`);
          results.push({ type: 'daira', label: `${c.daira} (Daïra, ${w.name})`, wilaya: w.name, wilayaCode: w.code, daira: c.daira });
        }
      }
      const cNorm = normalizeGeoString(c.name);
      if ((cNorm.includes(normalizedQuery) || (c.postal_code?.startsWith(query.trim())) || (c.name_ar?.includes(query.trim()))) && !seen.has(`c-${w.code}-${c.name}`)) {
        seen.add(`c-${w.code}-${c.name}`);
        results.push({ type: 'commune', label: `${c.name} (${w.name})`, wilaya: w.name, wilayaCode: w.code, daira: c.daira, commune: c.name, nameAr: c.name_ar });
      }
      if (results.length >= limit * 2) break;
    }
    if (results.length >= limit * 2) break;
  }

  return results.slice(0, limit);
}
