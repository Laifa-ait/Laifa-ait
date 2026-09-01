import { ALGERIA_REGIONS } from './algeriaRegions';

export interface WilayaOption {
  code: string;
  name: string;
  fullName: string; // e.g. "16 Alger"
}

// Generate full sorted list of 58 Wilayas
export const ALGERIA_WILAYAS_58: WilayaOption[] = Object.entries(ALGERIA_REGIONS)
  .map(([fullName, data]) => ({
    code: data.code,
    name: data.name,
    fullName: fullName
  }))
  .sort((a, b) => parseInt(a.code, 10) - parseInt(b.code, 10));

/**
 * Returns all unique communes belonging to a specific wilaya (by code or name)
 */
export function getCommunesForWilaya(wilayaKey: string): string[] {
  if (!wilayaKey) return [];
  
  // Try exact match in ALGERIA_REGIONS keys first
  let regionData = ALGERIA_REGIONS[wilayaKey];

  // Try matching by code (e.g. "16" or "01")
  if (!regionData) {
    const foundEntry = Object.values(ALGERIA_REGIONS).find(
      (r) => r.code === wilayaKey || r.name.toLowerCase() === wilayaKey.toLowerCase()
    );
    if (foundEntry) {
      regionData = foundEntry;
    }
  }

  // Try matching by partial string (e.g. "Alger" -> "16 Alger")
  if (!regionData) {
    const key = Object.keys(ALGERIA_REGIONS).find((k) =>
      k.toLowerCase().includes(wilayaKey.toLowerCase())
    );
    if (key) {
      regionData = ALGERIA_REGIONS[key];
    }
  }

  if (!regionData || !regionData.dairas) return [];

  const communesSet = new Set<string>();
  Object.values(regionData.dairas).forEach((communesList) => {
    if (Array.isArray(communesList)) {
      communesList.forEach((c) => communesSet.add(c));
    }
  });

  return Array.from(communesSet).sort((a, b) => a.localeCompare(b, 'fr'));
}

/**
 * Returns the Wilaya data by code or name
 */
export function getWilayaByCode(code: string): WilayaOption | undefined {
  const normalized = code.padStart(2, '0');
  return ALGERIA_WILAYAS_58.find((w) => w.code === normalized || w.code === code);
}
