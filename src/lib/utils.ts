import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitaire standard de composition de classes Tailwind CSS.
 * Résout les conflits de classes et gère les expressions conditionnelles.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
