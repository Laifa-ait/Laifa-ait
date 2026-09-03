import { ALGERIA_WILAYAS } from '../../../constants/wilayas';
import { findCommuneCoords, findWilayaCoords } from '../../../data/algerianCommunesDatabase';

export interface ResolvedCoords {
  lat: number;
  lng: number;
  zoom: number;
}

export const resolveLocationCoords = (wilaya?: string, commune?: string): ResolvedCoords | null => {
  if (commune && wilaya) {
    const c = findCommuneCoords(wilaya, commune);
    if (c) return { lat: Number(c.lat.toFixed(6)), lng: Number(c.lng.toFixed(6)), zoom: 16 };
  }
  if (wilaya) {
    const w = findWilayaCoords(wilaya);
    if (w) return { lat: Number(w.lat.toFixed(6)), lng: Number(w.lng.toFixed(6)), zoom: 13 };
    const found = ALGERIA_WILAYAS.find((item) => item.name.toLowerCase() === wilaya.toLowerCase());
    if (found?.lat && found?.lng) {
      return { lat: Number(found.lat.toFixed(6)), lng: Number(found.lng.toFixed(6)), zoom: 13 };
    }
  }
  return null;
};
