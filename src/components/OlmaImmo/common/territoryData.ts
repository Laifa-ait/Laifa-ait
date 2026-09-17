import { Landmark, Building2, MapPin, LucideIcon } from 'lucide-react';

export interface TerritoryLevel {
  level: number;
  arabic: string;
  title: string;
  subtitle: string;
  badge: string;
  governance: string;
  color: string;
  iconBg: string;
  icon: LucideIcon;
  description: string;
  realEstateImpact: string;
}

export const TERRITORY_LEVELS: TerritoryLevel[] = [
  {
    level: 1,
    arabic: 'الولاية',
    title: 'La Wilaya',
    subtitle: 'La Province',
    badge: 'Plus grande collectivité',
    governance: 'Wali (Gouverneur nommé) + APW (Assemblée Populaire de Wilaya élue)',
    color: 'border-emerald-500/40 bg-emerald-50/50 text-emerald-900',
    iconBg: 'bg-emerald-600 text-white',
    icon: Landmark,
    description:
      "C'est la plus grande collectivité territoriale. L'Algérie compte actuellement 58 wilayas. Chaque wilaya est dirigée par un Wali (gouverneur) nommé par le président, et possède une assemblée élue (l'APW).",
    realEstateImpact:
      'Détermine la Conservation Foncière de rattachement (Livret foncier, cadastre) et la juridiction notariale.',
  },
  {
    level: 2,
    arabic: 'الدائرة',
    title: 'La Daïra',
    subtitle: 'Le District',
    badge: 'Subdivision intermédiaire',
    governance: "Chef de daïra (Extension de l'administration centrale)",
    color: 'border-blue-500/40 bg-blue-50/50 text-blue-900',
    iconBg: 'bg-blue-600 text-white',
    icon: Building2,
    description:
      "C'est une subdivision administrative intermédiaire de la wilaya. Elle regroupe plusieurs communes. La daïra n'est pas une collectivité élue, mais une extension de l'administration centrale dirigée par un Chef de daïra pour coordonner les services de l'État.",
    realEstateImpact:
      'Regroupe les services techniques de régulation, les commissions de logement et la coordination de projets.',
  },
  {
    level: 3,
    arabic: 'البلدية',
    title: 'La Baladia / Commune',
    subtitle: 'La Municipalité',
    badge: 'Cellule administrative de base',
    governance: "Maire (le P/APC) + APC (Assemblée Populaire Communale élue)",
    color: 'border-amber-500/40 bg-amber-50/50 text-amber-900',
    iconBg: 'bg-amber-600 text-white',
    icon: MapPin,
    description:
      "C'est la cellule administrative de base et la plus proche des citoyens. Chaque commune est gérée par une assemblée élue (l'APC) présidée par le Maire (le P/APC).",
    realEstateImpact:
      "Délivre les permis de construire, certificats de conformité, plans d'urbanisme (POS/PDAU) et extraits d'état civil.",
  },
];
