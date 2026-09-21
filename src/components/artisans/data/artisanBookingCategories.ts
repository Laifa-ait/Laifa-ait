import React from 'react';
import {
  Wrench,
  Zap,
  Wind,
  Paintbrush,
  Hammer,
  Building2,
  Grid,
  KeyRound,
  LucideIcon,
} from 'lucide-react';
import { PlomberieChauffageArt } from '../art/PlomberieChauffageArt';

export interface BookingCategoryCard {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  icon: LucideIcon;
  image: string;
  artComponent?: React.ComponentType<{ className?: string }>;
  summary: string;
  presets: string[];
}

export const BOOKING_CATEGORIES: BookingCategoryCard[] = [
  {
    id: 'plomberie-chauffage',
    name: 'Plomberie & Chauffage',
    badge: 'Urgence 24/7',
    badgeColor: 'bg-rose-500 text-white',
    icon: Wrench,
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
    artComponent: PlomberieChauffageArt,
    summary: 'Dépannage fuite, chauffe-bain, débouchage, robinetterie & sanitaire',
    presets: [
      'Fuite d\'eau urgente',
      'Installation / Réparation chauffe-bain',
      'Débouchage canalisations & WC',
      'Rénovation salle de bain complète',
      'Chauffage central & radiateurs',
    ],
  },
  {
    id: 'electricite-batiment',
    name: 'Électricité du Bâtiment',
    badge: 'Sécurité & Normes',
    badgeColor: 'bg-amber-500 text-slate-950 font-black',
    icon: Zap,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    summary: 'Court-circuit, tableau électrique, prises, spots LED & conformité',
    presets: [
      'Panne électrique / Court-circuit',
      'Remplacement tableau électrique & disjoncteur',
      'Pose prises, interrupteurs & luminaires',
      'Mise aux normes & piquet de terre',
      'Installation interphone & caméras',
    ],
  },
  {
    id: 'climatisation-froid',
    name: 'Climatisation & Froid',
    badge: 'Confort Été / Hiver',
    badgeColor: 'bg-sky-500 text-white',
    icon: Wind,
    image: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=600&q=80',
    summary: 'Pose split, recharge gaz R410/R32, entretien & chambres froides',
    presets: [
      'Installation climatiseur split',
      'Recharge gaz & détection fuite',
      'Nettoyage & désinfection split',
      'Dépannage compresseur & bruit anormal',
      'Démontage & réinstallation',
    ],
  },
  {
    id: 'peinture-decoration',
    name: 'Peinture & Décoration',
    badge: 'Finitions Soignées',
    badgeColor: 'bg-purple-600 text-white',
    icon: Paintbrush,
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80',
    summary: 'Enduit lissé, peinture satinée, effets Stucco, Khayal & façades',
    presets: [
      'Peinture intérieure appartement complet',
      'Enduit de lissage & rebouchage',
      'Effets décoratifs (Stucco / Khayal / Sablé)',
      'Ravalement façade extérieure',
      'Traitement humidité & peinture étanche',
    ],
  },
  {
    id: 'menuiserie-aluminium',
    name: 'Menuiserie & Aluminium / PVC',
    badge: 'Sur-mesure',
    badgeColor: 'bg-emerald-600 text-white',
    icon: Hammer,
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80',
    summary: 'Fenêtres alu/PVC, placards, dressing sur-mesure & portes blindées',
    presets: [
      'Pose fenêtres & baies vitrées aluminium / PVC',
      'Placards & dressing sur-mesure',
      'Installation porte d\'entrée blindée',
      'Conception meubles de cuisine',
      'Réparation volet roulant électrique',
    ],
  },
  {
    id: 'maconnerie-gros-oeuvre',
    name: 'Maçonnerie & Gros Œuvre',
    badge: 'BTP Solide',
    badgeColor: 'bg-stone-700 text-white',
    icon: Building2,
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80',
    summary: 'Murs, dalle béton, plâtre BA13, ouverture mur porteur & démolition',
    presets: [
      'Montage cloisons & murs en briques',
      'Coulage dalle & chape béton',
      'Faux plafond plâtre BA13',
      'Ouverture mur porteur',
      'Démolition & évacuation de gravats',
    ],
  },
  {
    id: 'carrelage-faience',
    name: 'Carrelage & Faïence',
    badge: 'Design & Marbre',
    badgeColor: 'bg-teal-600 text-white',
    icon: Grid,
    image: 'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&w=600&q=80',
    summary: 'Pose dalle de sol grand format, faïence salle de bain & marbre',
    presets: [
      'Pose carrelage grand format 60x60 / 60x120',
      'Faïence salle de bain & cuisine',
      'Pose marbre & granit décoratif',
      'Terrasses extérieures antidérapantes',
      'Ragréage sol & jointoiement résine',
    ],
  },
  {
    id: 'serrurerie-securite',
    name: 'Serrurerie & Dépannage',
    badge: 'Intervention Rapide',
    badgeColor: 'bg-orange-600 text-white',
    icon: KeyRound,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80',
    summary: 'Porte claquée, serrure bloquée, blindage & rideaux métalliques',
    presets: [
      'Ouverture porte claquée / fermée à clé',
      'Remplacement canon & serrure multipoints',
      'Blindage de porte existante',
      'Dépannage rideau métallique commerce',
      'Installation verrou de sécurité',
    ],
  },
];
