import { BricolageServiceCategory, VerifiedArtisan } from '../types/bricolage';

export const BRICOLAGE_CATEGORIES: BricolageServiceCategory[] = [
  {
    id: 'plomberie',
    slug: 'plomberie-depannage',
    name: {
      fr: 'Plomberie & Sanitaire',
      ar: 'ترصيص وصيانة صحية',
      en: 'Plumbing & Sanitation'
    },
    description: {
      fr: 'Fuites d\'eau, chauffe-eau, débouchage de canalisation et installation de robinetterie.',
      ar: 'تسربات المياه، سخانات المياه، تسليك المجاري وتركيب الصنابير.',
      en: 'Water leaks, water heaters, drain unblocking, and fixture installation.'
    },
    icon: 'Wrench',
    popularServices: ['Chauffe-eau & Chaudière', 'Réparation de Fuite', 'Débouchage Express', 'Pose Sanitaire'],
    avgPriceRangeDZD: { min: 2500, max: 8500 },
    badge: 'Populaire 24/7'
  },
  {
    id: 'electricite',
    slug: 'electricite-domestique',
    name: {
      fr: 'Électricité & Tableau',
      ar: 'كهرباء منزلية وتأريض',
      en: 'Electrical & Power'
    },
    description: {
      fr: 'Pannes électriques, installation de prises, tableaux électriques et luminaires.',
      ar: 'أعطال كهربائية، تركيب المقابس، اللوحات الكهربائية والإنارة.',
      en: 'Power outages, outlet installation, circuit breakers, and lighting.'
    },
    icon: 'Zap',
    popularServices: ['Dépannage Court-circuit', 'Tableau Électrique', 'Pose Prises & Interrupteurs', 'Éclairage LED'],
    avgPriceRangeDZD: { min: 2000, max: 12000 },
    badge: 'Sécurité Certifiée'
  },
  {
    id: 'climatisation',
    slug: 'climatisation-chauffage',
    name: {
      fr: 'Climatisation & Chauffage',
      ar: 'تكييف وتدفئة',
      en: 'AC & Heating'
    },
    description: {
      fr: 'Recharge de gaz, entretien split, installation climatiseur et réparation chaudière.',
      ar: 'شحن الغاز، صيانة المكيفات، تركيب المكيف وصيانة أجهزة التدفئة.',
      en: 'Refrigerant refill, AC split maintenance, HVAC installation and heating.'
    },
    icon: 'ThermometerSnowflake',
    popularServices: ['Recharge Gaz R410/R32', 'Nettoyage & Entretien Split', 'Installation Climatiseur', 'Chaudière Murale'],
    avgPriceRangeDZD: { min: 3500, max: 15000 },
    badge: 'Saison'
  },
  {
    id: 'peinture',
    slug: 'peinture-renovation',
    name: {
      fr: 'Peinture & Décoration',
      ar: 'طلاء وديكور داخلي',
      en: 'Painting & Decor'
    },
    description: {
      fr: 'Peinture murale, plâtre, faux plafonds en BA13, enduit et papier peint.',
      ar: 'دهان الجدران، الجبس، الأسقف المستعارة BA13، والورق الجداري.',
      en: 'Wall painting, plastering, drywalls (BA13), coating, and wallpaper.'
    },
    icon: 'Paintbrush',
    popularServices: ['Peinture Intérieure Satinée', 'Faux Plafond BA13', 'Traitement Humidité', 'Ravalement Façade'],
    avgPriceRangeDZD: { min: 10000, max: 60000 }
  },
  {
    id: 'menuiserie',
    slug: 'menuiserie-aluminium',
    name: {
      fr: 'Menuiserie & Aluminium',
      ar: 'نجارة وألومنيوم',
      en: 'Carpentry & Aluminum'
    },
    description: {
      fr: 'Portes, fenêtres en aluminium/PVC, volets roulants, placards et serrures.',
      ar: 'أبواب، نوافذ ألومنيوم/PVC، ستائر ناطحة، خزانات وأقفال.',
      en: 'Doors, aluminum/PVC windows, rolling shutters, closets, and locks.'
    },
    icon: 'Hammer',
    popularServices: ['Fenêtres PVC & Aluminium', 'Remplacement Serrure', 'Volets Roulants Motorisés', 'Cuisine Sur-Mesure'],
    avgPriceRangeDZD: { min: 5000, max: 45000 }
  },
  {
    id: 'bricolage-montage',
    slug: 'montage-petit-bricolage',
    name: {
      fr: 'Petit Bricolage & Montage',
      ar: 'تركيب وتصليحات خفيفة',
      en: 'Handyman & Assembly'
    },
    description: {
      fr: 'Montage de meubles, fixation TV murale, accrochage cadres et ajustements.',
      ar: 'تركيب الأثاث، تثبيت التلفزيون، تعليق اللوحات وتعديلات منزلية.',
      en: 'Furniture assembly, TV wall mounting, hanging shelves, and repairs.'
    },
    icon: 'Drill',
    popularServices: ['Montage Meuble IKEA/Local', 'Fixation Support TV', 'Pose Rideaux & Tringles', 'Petite Serrurerie'],
    avgPriceRangeDZD: { min: 1500, max: 6000 },
    badge: 'Fast Track'
  }
];

export const TOP_VERIFIED_ARTISANS: VerifiedArtisan[] = [
  {
    id: 'art-01',
    name: 'Mourad Benali',
    specialty: 'Plombier-Chauffagiste Expert',
    wilaya: 'Alger',
    commune: 'Hydra',
    rating: 4.9,
    reviewCount: 128,
    completedJobs: 340,
    verifiedBadge: true,
    phone: '0550 12 34 56',
    isAvailable24_7: true
  },
  {
    id: 'art-02',
    name: 'Kamel Bricolage',
    specialty: 'Électricien Bâtiment & Domotique',
    wilaya: 'Blida',
    commune: 'Ouled Yaich',
    rating: 4.8,
    reviewCount: 94,
    completedJobs: 210,
    verifiedBadge: true,
    phone: '0661 98 76 54',
    isAvailable24_7: true
  },
  {
    id: 'art-03',
    name: 'Atelier Hamza Alumi',
    specialty: 'Menuisier Aluminium & PVC',
    wilaya: 'Oran',
    commune: 'Es Senia',
    rating: 4.9,
    reviewCount: 156,
    completedJobs: 410,
    verifiedBadge: true,
    phone: '0770 45 67 89',
    isAvailable24_7: false
  },
  {
    id: 'art-04',
    name: 'Sofiane Peinture Pro',
    specialty: 'Peintre & Plâtrier BA13',
    wilaya: 'Constantine',
    commune: 'Zighoud Youcef',
    rating: 4.7,
    reviewCount: 82,
    completedJobs: 175,
    verifiedBadge: true,
    phone: '0555 33 22 11',
    isAvailable24_7: false
  }
];
