import { ALGERIA_REGIONS } from '../../../../data/algeriaRegions';

// Memory Cache for communes to prevent re-computations
const communesCache: Record<string, string[]> = {};

export const getCommunes = (wilaya: string): string[] => {
  if (communesCache[wilaya]) {
    return communesCache[wilaya];
  }

  // Try direct match from ALGERIA_REGIONS
  let wilayaData = ALGERIA_REGIONS[wilaya];
  
  if (!wilayaData) {
    // Try matching key by starting code or name
    const cleanInput = wilaya.replace(/^\d+\s*-\s*/, '').trim().replace(/^\d+\s+/, '').trim().toLowerCase();
    const matchKey = Object.keys(ALGERIA_REGIONS).find(k => {
      const cleanKey = k.replace(/^\d+\s+/, '').trim().toLowerCase();
      return cleanKey === cleanInput || k.startsWith(wilaya);
    });
    if (matchKey) {
      wilayaData = ALGERIA_REGIONS[matchKey];
    }
  }

  if (wilayaData && wilayaData.dairas) {
    const allCommunes = new Set<string>();
    Object.values(wilayaData.dairas).forEach(communes => {
      communes.forEach(c => allCommunes.add(c));
    });
    const result = Array.from(allCommunes).sort((a, b) => a.localeCompare(b));
    communesCache[wilaya] = result;
    return result;
  }
  
  const cleanWilaya = wilaya.replace(/^\d+\s*-\s*/, '').trim().replace(/^\d+\s+/, '').trim();
  const fallback = [`${cleanWilaya} Chef-lieu`];
  communesCache[wilaya] = fallback;
  return fallback;
};

export const getPickupAgencies = (wilaya: string): string[] => {
  const clean = wilaya.replace(/^\d+\s*-\s*/, '').trim().replace(/^\d+\s+/, '').trim();
  
  const customAgencies: Record<string, string[]> = {
    "Alger": [
      "Bureau de Retrait Alger Centre (Didouche Mourad)",
      "Bureau de Retrait Bab Ezzouar",
      "Bureau de Retrait Cheraga",
      "Bureau de Retrait Kouba",
      "Bureau de Retrait El Biar",
      "Bureau de Retrait Birkhadem",
      "Bureau de Retrait Rouiba"
    ],
    "Oran": [
      "Bureau de Retrait Oran Centre (Es-Senia)",
      "Bureau de Retrait Bir El Djir",
      "Bureau de Retrait Maraval",
      "Bureau de Retrait Canastel"
    ],
    "Constantine": [
      "Bureau de Retrait Constantine Centre",
      "Bureau de Retrait El Khroub",
      "Bureau de Retrait Ali Mendjeli"
    ],
    "Annaba": [
      "Bureau de Retrait Annaba Centre",
      "Bureau de Retrait El Bouni",
      "Bureau de Retrait Plaine Ouest"
    ],
    "Sétif": [
      "Bureau de Retrait Sétif Centre",
      "Bureau de Retrait El Eulma"
    ],
    "Blida": [
      "Bureau de Retrait Blida (Ouled Yaïch)",
      "Bureau de Retrait Boufarik"
    ],
    "Tizi Ouzou": [
      "Bureau de Retrait Tizi Ouzou Ville",
      "Bureau de Retrait Azazga"
    ],
    "Béjaïa": [
      "Bureau de Retrait Béjaïa Centre",
      "Bureau de Retrait Akbou",
      "Bureau de Retrait El Kseur"
    ],
    "Chlef": [
      "Bureau de Retrait Chlef Ville",
      "Bureau de Retrait Ténès"
    ],
    "Biskra": [
      "Bureau de Retrait Biskra Ville",
      "Bureau de Retrait Tolga"
    ],
    "Tlemcen": [
      "Bureau de Retrait Tlemcen Centre",
      "Bureau de Retrait Maghnia"
    ]
  };

  if (customAgencies[clean]) {
    return customAgencies[clean];
  }

  return [
    `Bureau de Retrait ${clean} Ville (Agence Principale)`,
    `Bureau de Retrait ${clean} Est (Relais)`,
    `Bureau de Retrait ${clean} Ouest`
  ];
};


