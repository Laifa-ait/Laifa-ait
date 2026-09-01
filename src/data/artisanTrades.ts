import { ArtisanTrade } from '../types/artisan';

export const DEFAULT_ARTISAN_TRADES: ArtisanTrade[] = [
  {
    id: 'plomberie-chauffage',
    name: 'Plomberie & Chauffage',
    slug: 'plomberie-chauffage',
    icon: 'Droplets',
    description: 'Dépannage fuites, installation sanitaire, chauffe-eau, chaudières et tuyauterie.',
    specialties: [
      'Dépannage fuite d\'eau',
      'Installation chauffe-eau / chaudière',
      'Rénovation salle de bain',
      'Débouchage canalisations',
      'Installation robinetterie & sanitaires',
      'Chauffage central & radiateurs'
    ],
    popular: true,
    active: true
  },
  {
    id: 'electricite-batiment',
    name: 'Électricité du Bâtiment',
    slug: 'electricite-batiment',
    icon: 'Zap',
    description: 'Mise aux normes électriques, câblage, tableaux, éclairage et dépannage urgent.',
    specialties: [
      'Dépannage court-circuit',
      'Installation tableau électrique',
      'Mise aux normes & terre',
      'Pose prises, interrupteurs & spots',
      'Éclairage LED intérieur & extérieur',
      'Interphones & caméras de surveillance'
    ],
    popular: true,
    active: true
  },
  {
    id: 'climatisation-froid',
    name: 'Climatisation & Froid',
    slug: 'climatisation-froid',
    icon: 'Wind',
    description: 'Pose, entretien, recharge gaz et réparation de climatiseurs split et multi-split.',
    specialties: [
      'Installation climatiseur split',
      'Recharge gaz R410A / R32',
      'Nettoyage & désinfection split',
      'Dépannage compresseur & fuites',
      'Chambres froides & froid commercial',
      'Démontage et réinstallation'
    ],
    popular: true,
    active: true
  },
  {
    id: 'peinture-decoration',
    name: 'Peinture & Décoration',
    slug: 'peinture-decoration',
    icon: 'Paintbrush',
    description: 'Peinture intérieure, extérieure, enduit lissé, papier peint et finitions soignées.',
    specialties: [
      'Peinture satinée / mate / vinyle',
      'Enduit de lissage & rebouchage',
      'Effets décoratifs (Stucco, Khayal, Sablé)',
      'Ravalement façade extérieure',
      'Pose papier peint & fresques',
      'Traitement anti-humidité'
    ],
    popular: true,
    active: true
  },
  {
    id: 'maconnerie-gros-oeuvre',
    name: 'Maçonnerie & Gros Œuvre',
    slug: 'maconnerie-gros-oeuvre',
    icon: 'Hammer',
    description: 'Murs, cloisons, dalles, rénovations structurelles et petites maçonneries.',
    specialties: [
      'Montage murs en briques / parpaings',
      'Coulage dalle béton & chape',
      'Ouverture mur porteur & IPN',
      'Crépissage & enduit ciment',
      'Clôtures & murets extérieurs',
      'Démolition & évacuation gravats'
    ],
    popular: true,
    active: true
  },
  {
    id: 'carrelage-faience',
    name: 'Carrelage & Faïence',
    slug: 'carrelage-faience',
    icon: 'Grid',
    description: 'Pose de dalles sol, faïence murale, mosaïque, marbre et compact.',
    specialties: [
      'Pose carrelage grand format',
      'Faïence cuisine & salle de bain',
      'Pose marbre & granit',
      'Jointoiement & ragréage',
      'Terrasses extérieures & escaliers',
      'Plinthes & seuils de portes'
    ],
    popular: true,
    active: true
  },
  {
    id: 'platerie-faux-plafonds',
    name: 'Plâtrerie & Faux Plafonds (BA13)',
    slug: 'platerie-faux-plafonds',
    icon: 'Layers',
    description: 'Faux plafonds décoratifs en BA13, cloisons amovibles, caissons LED et isolation phonique.',
    specialties: [
      'Faux plafond placo BA13 moderne',
      'Gorges lumineuses & caissons LED',
      'Cloisons de séparation BA13',
      'Plâtre projeté & moulures classiques',
      'Isolation acoustique & thermique',
      'Habillage mural & niches TV'
    ],
    popular: true,
    active: true
  },
  {
    id: 'menuiserie-bois-alu-pvc',
    name: 'Menuiserie Bois, Alu & PVC',
    slug: 'menuiserie-bois-alu-pvc',
    icon: 'Square',
    description: 'Fenêtres, portes, rideaux roulants, cuisines sur mesure et dressings.',
    specialties: [
      'Fenêtres & baies vitrées Alu/PVC',
      'Fabrication portes bois massif & blindées',
      'Cuisine équipée sur mesure',
      'Dressings & placards intégrés',
      'Rideaux roulants électriques / manuels',
      'Réparation serrures & charnières'
    ],
    popular: true,
    active: true
  },
  {
    id: 'ferronnerie-serrurerie',
    name: 'Ferronnerie & Serrurerie',
    slug: 'ferronnerie-serrurerie',
    icon: 'Key',
    description: 'Barreaudages, portails fer forgé, garde-corps et ouverture de portes bloquées.',
    specialties: [
      'Portails fer forgé & coulissants',
      'Barreaudage de fenêtres de sécurité',
      'Garde-corps escaliers & balcons',
      'Ouverture de porte urgente & blindage',
      'Changement de cylindre & serrure',
      'Structures métalliques & hangars'
    ],
    popular: false,
    active: true
  },
  {
    id: 'reparation-electromenager',
    name: 'Réparation Électroménager',
    slug: 'reparation-electromenager',
    icon: 'Tv',
    description: 'Dépannage à domicile de machines à laver, réfrigérateurs, fours et lave-vaisselle.',
    specialties: [
      'Réparation lave-linge & sèche-linge',
      'Dépannage réfrigérateur & congélateur',
      'Réparation four électrique / cuisinière',
      'Diagnostic carte électronique',
      'Réparation lave-vaisselle',
      'Changement de pièces d\'origine'
    ],
    popular: false,
    active: true
  },
  {
    id: 'etancheite-isolation',
    name: 'Étanchéité & Isolation',
    slug: 'etancheite-isolation',
    icon: 'Shield',
    description: 'Étanchéité terrasse bitumineuse/liquide, toitures et traitement infiltrations.',
    specialties: [
      'Étanchéité terrasse paxaluminium / bitume',
      'Résine polyuréthane liquide',
      'Traitement infiltrations de toiture',
      'Isolation thermique sous toiture',
      'Cuvelage sous-sol & caves',
      'Pente & évacuation des eaux pluviales'
    ],
    popular: false,
    active: true
  },
  {
    id: 'jardinage-espaces-verts',
    name: 'Jardinage & Nettoyage Extérieur',
    slug: 'jardinage-espaces-verts',
    icon: 'Trees',
    description: 'Élagage, tonte de pelouse, arrosage automatique et aménagement paysager.',
    specialties: [
      'Tonte pelouse & désherbage',
      'Taille de haies & élagage arbres',
      'Installation arrosage automatique',
      'Plantation arbustes, fleurs & gazon',
      'Nettoyage haute pression terrasses',
      'Entretien périodique résidences'
    ],
    popular: false,
    active: true
  }
];
