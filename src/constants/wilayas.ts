import { ALGERIA_WILAYAS_DATABASE } from '../data/algerianCommunesDatabase';

export interface WilayaOption {
  code: string;
  name: string;
  name_ar?: string;
  lat?: number;
  lng?: number;
}

// Map 58 Wilayas with representative central coordinates
export const ALGERIA_WILAYAS: WilayaOption[] = ALGERIA_WILAYAS_DATABASE.map((w) => ({
  code: w.code,
  name: w.name,
  name_ar: w.name_ar,
  lat: w.lat,
  lng: w.lng,
}));

