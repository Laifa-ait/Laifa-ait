import React from 'react';
import {
  // Shopping & Commerce
  ShoppingBag,
  ShoppingCart,
  Store,
  ShoppingBasket,
  Tag,
  BadgePercent,
  Gift,
  Sparkles,
  Package,
  Boxes,
  Shirt,
  Glasses,
  Footprints,
  // Flash & Deals
  Zap,
  Flame,
  TrendingUp,
  Timer,
  Percent,
  Award,
  Crown,
  Star,
  Gem,
  Rocket,
  Compass,
  Heart,
  // Tech & Electronics
  Smartphone,
  Laptop,
  Tv,
  Headphones,
  Watch,
  Camera,
  Cpu,
  Wifi,
  Radio,
  Gamepad2,
  // Services & Home
  Wrench,
  Hammer,
  Home as HomeIcon,
  Building2,
  Paintbrush,
  Key,
  ShieldCheck,
  Briefcase,
  Layers,
  UtensilsCrossed,
  Coffee,
  Apple,
  Salad,
  Pizza,
  // Auto & Mobility
  Car,
  Truck,
  Bike,
  Plane,
  Navigation,
  MapPin,
  Fuel,
  // Logistics & Global
  Globe2,
  Map,
  Flag,
  Languages,
  Coins,
  CreditCard,
  Send,
  HelpCircle
} from 'lucide-react';

export interface IconDefinition {
  name: string;
  category: string;
  keywords: string[];
  component: React.ComponentType<{ className?: string }>;
}

export const ICON_REGISTRY: Record<string, React.ComponentType<{ className?: string }>> = {
  // Commerce
  ShoppingBag,
  ShoppingCart,
  Store,
  ShoppingBasket,
  Tag,
  BadgePercent,
  Gift,
  Sparkles,
  Package,
  Boxes,
  Shirt,
  Glasses,
  Footprints,
  // Flash / Deals
  Zap,
  Flame,
  TrendingUp,
  Timer,
  Percent,
  Award,
  Crown,
  Star,
  Gem,
  Rocket,
  Compass,
  Heart,
  // Tech
  Smartphone,
  Laptop,
  Tv,
  Headphones,
  Watch,
  Camera,
  Cpu,
  Wifi,
  Radio,
  Gamepad2,
  // Services & Home
  Wrench,
  Hammer,
  Home: HomeIcon,
  Building2,
  Paintbrush,
  Key,
  ShieldCheck,
  Briefcase,
  Layers,
  UtensilsCrossed,
  Coffee,
  Apple,
  Salad,
  Pizza,
  // Mobility & Transport
  Car,
  Truck,
  Bike,
  Plane,
  Navigation,
  MapPin,
  Fuel,
  // Global & Finance
  Globe2,
  Map,
  Flag,
  Languages,
  Coins,
  CreditCard,
  Send,
  HelpCircle
};

export const ICON_CATALOG: IconDefinition[] = [
  // E-Commerce & Shopping
  { name: 'ShoppingBag', category: 'Shopping', keywords: ['shop', 'store', 'boutique', 'achat', 'produit'], component: ShoppingBag },
  { name: 'ShoppingCart', category: 'Shopping', keywords: ['panier', 'cart', 'courses', 'caddy'], component: ShoppingCart },
  { name: 'Store', category: 'Shopping', keywords: ['boutique', 'vendeur', 'marchand', 'shop'], component: Store },
  { name: 'ShoppingBasket', category: 'Shopping', keywords: ['panier', 'courses', 'supermarche', 'epicerie'], component: ShoppingBasket },
  { name: 'Tag', category: 'Shopping', keywords: ['etiquette', 'prix', 'offre', 'label'], component: Tag },
  { name: 'BadgePercent', category: 'Shopping', keywords: ['pourcentage', 'solde', 'rabais', 'remise'], component: BadgePercent },
  { name: 'Gift', category: 'Shopping', keywords: ['cadeau', 'promo', 'bonus', 'fete', 'bon plan'], component: Gift },
  { name: 'Sparkles', category: 'Shopping', keywords: ['etoile', 'magie', 'nouveau', 'premium', 'brillant'], component: Sparkles },
  { name: 'Package', category: 'Shopping', keywords: ['colis', 'livraison', 'paquet', 'box'], component: Package },
  { name: 'Boxes', category: 'Shopping', keywords: ['stock', 'grossiste', 'cartons'], component: Boxes },
  { name: 'Shirt', category: 'Shopping', keywords: ['vetement', 'mode', 'fashion', 'tshirt'], component: Shirt },
  { name: 'Glasses', category: 'Shopping', keywords: ['lunettes', 'accessoires', 'style'], component: Glasses },
  { name: 'Footprints', category: 'Shopping', keywords: ['chaussures', 'sneakers', 'pas'], component: Footprints },

  // Deals & Ventes Flash
  { name: 'Zap', category: 'Deals & Flash', keywords: ['flash', 'eclair', 'rapide', 'promo', 'vente flash'], component: Zap },
  { name: 'Flame', category: 'Deals & Flash', keywords: ['feu', 'hot', 'tendance', 'brulant', 'populaire'], component: Flame },
  { name: 'TrendingUp', category: 'Deals & Flash', keywords: ['hausse', 'top', 'tendance', 'croissance'], component: TrendingUp },
  { name: 'Timer', category: 'Deals & Flash', keywords: ['chrono', 'temps', 'limite', 'compte a rebours'], component: Timer },
  { name: 'Percent', category: 'Deals & Flash', keywords: ['reduction', 'discount', 'solde', 'remise'], component: Percent },
  { name: 'Award', category: 'Deals & Flash', keywords: ['medaille', 'gagnant', 'recompense', 'meilleur'], component: Award },
  { name: 'Crown', category: 'Deals & Flash', keywords: ['couronne', 'vip', 'roi', 'luxe', 'premium'], component: Crown },
  { name: 'Star', category: 'Deals & Flash', keywords: ['etoile', 'favori', 'avis', 'notation'], component: Star },
  { name: 'Gem', category: 'Deals & Flash', keywords: ['diamant', 'bijou', 'artisanat', 'rare', 'luxe'], component: Gem },
  { name: 'Rocket', category: 'Deals & Flash', keywords: ['fusee', 'lancement', 'boost', 'rapide'], component: Rocket },
  { name: 'Heart', category: 'Deals & Flash', keywords: ['coeur', 'coup de coeur', 'favori', 'amour'], component: Heart },

  // High-Tech & Geek
  { name: 'Smartphone', category: 'Tech & Gadgets', keywords: ['telephone', 'mobile', 'iphone', 'android', 'gsm'], component: Smartphone },
  { name: 'Laptop', category: 'Tech & Gadgets', keywords: ['ordinateur', 'pc', 'macbook', 'portable'], component: Laptop },
  { name: 'Tv', category: 'Tech & Gadgets', keywords: ['television', 'ecran', 'cinema', 'display'], component: Tv },
  { name: 'Headphones', category: 'Tech & Gadgets', keywords: ['casque', 'audio', 'musique', 'ecouteurs'], component: Headphones },
  { name: 'Watch', category: 'Tech & Gadgets', keywords: ['montre', 'smartwatch', 'heure'], component: Watch },
  { name: 'Camera', category: 'Tech & Gadgets', keywords: ['photo', 'video', 'appareil', 'objectif'], component: Camera },
  { name: 'Cpu', category: 'Tech & Gadgets', keywords: ['processeur', 'composant', 'hardware'], component: Cpu },
  { name: 'Wifi', category: 'Tech & Gadgets', keywords: ['reseau', 'internet', 'connexion', 'sans fil'], component: Wifi },
  { name: 'Gamepad2', category: 'Tech & Gadgets', keywords: ['jeux', 'gaming', 'manette', 'playstation'], component: Gamepad2 },

  // Services & Maison
  { name: 'Wrench', category: 'Services & Bricolage', keywords: ['cle', 'bricolage', 'reparation', 'plombier', 'artisan'], component: Wrench },
  { name: 'Hammer', category: 'Services & Bricolage', keywords: ['marteau', 'chantier', 'travaux', 'batiment'], component: Hammer },
  { name: 'Home', category: 'Services & Bricolage', keywords: ['maison', 'immo', 'logement', 'appartement', 'villa'], component: HomeIcon },
  { name: 'Building2', category: 'Services & Bricolage', keywords: ['immeuble', 'bureau', 'commerce', 'residence'], component: Building2 },
  { name: 'Paintbrush', category: 'Services & Bricolage', keywords: ['peinture', 'decoration', 'design', 'renovation'], component: Paintbrush },
  { name: 'Key', category: 'Services & Bricolage', keywords: ['cle', 'serrure', 'securite', 'acces'], component: Key },
  { name: 'ShieldCheck', category: 'Services & Bricolage', keywords: ['bouclier', 'garantie', 'protection', 'certifie'], component: ShieldCheck },
  { name: 'Briefcase', category: 'Services & Bricolage', keywords: ['mallette', 'pro', 'travail', 'emploi'], component: Briefcase },

  // Alimentation & Food
  { name: 'UtensilsCrossed', category: 'Alimentation & Food', keywords: ['restaurant', 'repas', 'cuisine', 'fourchette'], component: UtensilsCrossed },
  { name: 'Coffee', category: 'Alimentation & Food', keywords: ['cafe', 'boisson', 'pause', 'matin'], component: Coffee },
  { name: 'Apple', category: 'Alimentation & Food', keywords: ['pomme', 'fruit', 'bio', 'frais', 'sante'], component: Apple },
  { name: 'Salad', category: 'Alimentation & Food', keywords: ['salade', 'legumes', 'frais', 'repas'], component: Salad },
  { name: 'Pizza', category: 'Alimentation & Food', keywords: ['pizza', 'fast food', 'snack', 'livraison'], component: Pizza },

  // Auto & Mobilité
  { name: 'Car', category: 'Transport & Auto', keywords: ['voiture', 'vehicule', 'auto', 'moteur'], component: Car },
  { name: 'Truck', category: 'Transport & Auto', keywords: ['camion', 'express', 'livraison', 'transport'], component: Truck },
  { name: 'Bike', category: 'Transport & Auto', keywords: ['moto', 'velo', 'coursier', 'deux roues'], component: Bike },
  { name: 'Plane', category: 'Transport & Auto', keywords: ['avion', 'import', 'voyage', 'international'], component: Plane },
  { name: 'Fuel', category: 'Transport & Auto', keywords: ['essence', 'carburant', 'station'], component: Fuel },
  { name: 'MapPin', category: 'Transport & Auto', keywords: ['adresse', 'position', 'wilaya', 'lieu'], component: MapPin },
  { name: 'Navigation', category: 'Transport & Auto', keywords: ['gps', 'carte', 'guidage', 'itineraire'], component: Navigation },

  // Global & DZ
  { name: 'Globe2', category: 'International & DZ', keywords: ['monde', 'global', 'international', 'import'], component: Globe2 },
  { name: 'Flag', category: 'International & DZ', keywords: ['drapeau', 'pays', 'algerie', 'local'], component: Flag },
  { name: 'CreditCard', category: 'International & DZ', keywords: ['carte', 'cib', 'paiement', 'dahabia'], component: CreditCard },
  { name: 'Coins', category: 'International & DZ', keywords: ['monnaie', 'da', 'dinar', 'argent', 'cash'], component: Coins }
];

export interface GradientPreset {
  id: string;
  name: string;
  className: string;
  previewBg: string;
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  { id: 'sky-blue', name: 'Olma Sky Express', className: 'from-sky-400 via-blue-500 to-indigo-600', previewBg: 'linear-gradient(135deg, #38bdf8, #3b82f6, #4f46e5)' },
  { id: 'flash-red', name: 'Flash Fire', className: 'from-red-500 via-rose-500 to-orange-500', previewBg: 'linear-gradient(135deg, #ef4444, #f43f5e, #f97316)' },
  { id: 'amber-gold', name: 'Bons Plans Gold', className: 'from-amber-400 via-amber-500 to-orange-500', previewBg: 'linear-gradient(135deg, #fbbf24, #f59e0b, #f97316)' },
  { id: 'royal-purple', name: 'Royal Purple', className: 'from-purple-500 via-violet-600 to-indigo-600', previewBg: 'linear-gradient(135deg, #a855f7, #7c3aed, #4f46e5)' },
  { id: 'emerald-fresh', name: 'Fresh Emerald', className: 'from-emerald-400 via-teal-500 to-cyan-600', previewBg: 'linear-gradient(135deg, #34d399, #14b8a6, #0891b2)' },
  { id: 'pink-fashion', name: 'Mode & Glow', className: 'from-pink-400 via-rose-500 to-red-400', previewBg: 'linear-gradient(135deg, #f472b6, #f43f5e, #f87171)' },
  { id: 'cyan-tech', name: 'Tech Electric', className: 'from-cyan-400 via-blue-500 to-blue-600', previewBg: 'linear-gradient(135deg, #22d3ee, #3b82f6, #2563eb)' },
  { id: 'algeria-green', name: 'Artisanat DZ', className: 'from-emerald-500 via-green-600 to-teal-700', previewBg: 'linear-gradient(135deg, #10b981, #16a34a, #0f766e)' },
  { id: 'slate-titanium', name: 'Titanium Pro', className: 'from-slate-600 via-zinc-700 to-zinc-900', previewBg: 'linear-gradient(135deg, #475569, #3f3f46, #18181b)' },
  { id: 'sunset-orange', name: 'Sunset Olma', className: 'from-orange-500 via-amber-500 to-yellow-500', previewBg: 'linear-gradient(135deg, #f97316, #f59e0b, #eab308)' },
  { id: 'violet-fuchsia', name: 'VIP Luxe', className: 'from-violet-500 via-fuchsia-500 to-pink-600', previewBg: 'linear-gradient(135deg, #8b5cf6, #d946ef, #db2777)' },
  { id: 'dark-neon', name: 'Cyber Neon', className: 'from-indigo-600 via-purple-700 to-slate-950', previewBg: 'linear-gradient(135deg, #4f46e5, #6d28d9, #020617)' }
];

export interface BadgePreset {
  text: string;
  badgeColor: string;
  label: string;
}

export const BADGE_PRESETS: BadgePreset[] = [
  { text: '🔥 HOT', badgeColor: 'bg-red-500 text-white animate-pulse', label: '🔥 HOT' },
  { text: '-50%', badgeColor: 'bg-amber-500 text-white font-bold', label: '-50% Promo' },
  { text: '48H', badgeColor: 'bg-sky-500 text-white font-bold', label: '48H Express' },
  { text: 'NEW', badgeColor: 'bg-purple-600 text-white font-bold', label: 'NEW Nouveauté' },
  { text: 'TOP', badgeColor: 'bg-pink-500 text-white font-bold', label: 'TOP Tendance' },
  { text: 'FRAIS', badgeColor: 'bg-emerald-500 text-white font-bold', label: 'FRAIS Supermarché' },
  { text: 'OFFICIEL', badgeColor: 'bg-blue-600 text-white font-bold', label: 'OFFICIEL Marque' },
  { text: '100% DZ', badgeColor: 'bg-green-700 text-white font-bold', label: '100% DZ Artisanal' },
  { text: 'PRO', badgeColor: 'bg-slate-800 text-white font-bold', label: 'PRO Bricolage' },
  { text: 'VIP', badgeColor: 'bg-violet-600 text-white font-bold', label: 'VIP Exclusif' }
];

export function getAppIconComponent(iconName?: string): React.ComponentType<{ className?: string }> {
  if (!iconName) return Sparkles;
  if (ICON_REGISTRY[iconName]) {
    return ICON_REGISTRY[iconName];
  }
  // Case-insensitive match fallback
  const foundKey = Object.keys(ICON_REGISTRY).find(
    k => k.toLowerCase() === iconName.toLowerCase()
  );
  if (foundKey) {
    return ICON_REGISTRY[foundKey];
  }
  return Sparkles;
}
