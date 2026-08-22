import { ALGERIA_REGIONS } from '../data/algeriaRegions';

export interface WilayaOption {
  code: string;
  name: string;
  lat?: number;
  lng?: number;
}

// Map 58 Wilayas with representative central coordinates
export const ALGERIA_WILAYAS: WilayaOption[] = Object.values(ALGERIA_REGIONS).map((w) => {
  let lat = 36.7538;
  let lng = 3.0588;

  if (w.code === '16') { lat = 36.7538; lng = 3.0588; } // Alger
  else if (w.code === '31') { lat = 35.6971; lng = -0.6308; } // Oran
  else if (w.code === '25') { lat = 36.3650; lng = 6.6147; } // Constantine
  else if (w.code === '23') { lat = 36.9000; lng = 7.7667; } // Annaba
  else if (w.code === '06') { lat = 36.7558; lng = 5.0843; } // Bejaia
  else if (w.code === '15') { lat = 36.7118; lng = 4.0459; } // Tizi Ouzou
  else if (w.code === '09') { lat = 36.4700; lng = 2.8300; } // Blida
  else if (w.code === '19') { lat = 36.1900; lng = 5.4100; } // Setif
  else if (w.code === '13') { lat = 34.8783; lng = -1.3150; } // Tlemcen
  else if (w.code === '30') { lat = 31.9500; lng = 5.3167; } // Ouargla

  return {
    code: w.code,
    name: w.name,
    lat,
    lng,
  };
});
