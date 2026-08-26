import React from "react";
import * as LucideIcons from "lucide-react";
import { BrandIcon, type BrandIconName } from "./BrandIcon";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number | string;
  className?: string;
  color?: string;
  strokeWidth?: number | string;
}

/**
 * Composant Icon unifié permettant d'utiliser indistinctement :
 * - Les icônes Lucide (ex: "Store", "ShoppingBag", "Check", "Sparkles", "ChevronRight")
 * - Les logos de marques via préfixe 'brand:' ou détection automatique (ex: "brand:facebook", "brand:visa", "instagram", "tiktok")
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  className = "",
  color,
  strokeWidth = 2,
  ...props
}) => {
  // 1. Vérification si c'est explicitement un Brand Icon
  const isExplicitBrand = name.startsWith("brand:");
  const cleanName = isExplicitBrand ? name.replace("brand:", "") : name;

  const brandNames: BrandIconName[] = [
    "facebook",
    "instagram",
    "tiktok",
    "youtube",
    "linkedin",
    "x",
    "twitter",
    "whatsapp",
    "telegram",
    "github",
    "google",
    "visa",
    "mastercard",
    "applepay",
    "googlepay"
  ];

  if (isExplicitBrand || brandNames.includes(cleanName.toLowerCase() as BrandIconName)) {
    return (
      <BrandIcon
        name={cleanName.toLowerCase() as BrandIconName}
        size={size}
        className={className}
        color={color}
        {...props}
      />
    );
  }

  // 2. Recherche dans le dictionnaire Lucide React
  const lucideKey = (name.charAt(0).toUpperCase() + name.slice(1)) as keyof typeof LucideIcons;
  const LucideComponent = LucideIcons[lucideKey] as React.ComponentType<{
    size?: number | string;
    className?: string;
    color?: string;
    strokeWidth?: number | string;
  }>;

  if (LucideComponent) {
    return (
      <LucideComponent
        size={size}
        className={className}
        color={color}
        strokeWidth={strokeWidth}
        {...props}
      />
    );
  }

  // Fallback si introuvable
  return null;
};
