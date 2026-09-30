import wilayasData from './wilayasData.json';

export interface WilayaOption {
  code: string;
  name: string;
  name_ar?: string;
  lat?: number;
  lng?: number;
}

// Map 69 Wilayas with representative central coordinates (Lightweight dataset without 1,541 communes)
export const ALGERIA_WILAYAS: WilayaOption[] = wilayasData as WilayaOption[];

