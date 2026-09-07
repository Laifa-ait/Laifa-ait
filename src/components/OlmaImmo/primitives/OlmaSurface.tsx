import React from 'react';
import { cn } from '../../../lib/utils';

export type OlmaSurfaceVariant =
  | 'default'   // Blanc pur / surface standard
  | 'subtle'    // Fond ivoire très doux (#FAF8F5)
  | 'muted'     // Fond sable/beige feutré (#F7F4ED)
  | 'raised'    // Surface blanche avec mise en avant
  | 'dark';     // Vert forêt profond (#1A3831 / #0D281E)

export type OlmaSurfaceElevation =
  | 'none'
  | 'subtle'    // Ombre délicate
  | 'card'      // Ombre carte premium
  | 'floating';  // Ombre portée flottante

export type OlmaSurfaceRadius =
  | 'none'
  | 'sm'        // 6px
  | 'md'        // 8px
  | 'lg'        // 12px
  | 'xl'        // 16px (Standard Olma Cards)
  | '2xl'       // 20px
  | '3xl'       // 24px (Shells/Sheets)
  | 'full';     // Pill

export type OlmaSurfacePadding =
  | 'none'
  | 'xs'        // p-2 (8px)
  | 'sm'        // p-3 (12px)
  | 'md'        // p-4 (16px)
  | 'lg'        // p-6 (24px)
  | 'xl';       // p-8 (32px)

export interface OlmaSurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: OlmaSurfaceVariant;
  elevation?: OlmaSurfaceElevation;
  radius?: OlmaSurfaceRadius;
  padding?: OlmaSurfacePadding;
  bordered?: boolean;
  borderVariant?: 'default' | 'subtle' | 'strong' | 'accent';
  as?: React.ElementType;
}

const variantStyles: Record<OlmaSurfaceVariant, string> = {
  default: 'bg-[var(--olma-surface-default)] text-[var(--olma-text-primary)]',
  subtle: 'bg-[var(--olma-surface-subtle)] text-[var(--olma-text-primary)]',
  muted: 'bg-[var(--olma-surface-muted)] text-[var(--olma-text-primary)]',
  raised: 'bg-[var(--olma-surface-raised)] text-[var(--olma-text-primary)]',
  dark: 'bg-[var(--olma-surface-dark)] text-[var(--olma-text-inverse)]',
};

const elevationStyles: Record<OlmaSurfaceElevation, string> = {
  none: 'shadow-none',
  subtle: 'shadow-[var(--olma-shadow-subtle)]',
  card: 'shadow-[var(--olma-shadow-card)]',
  floating: 'shadow-[var(--olma-shadow-floating)]',
};

const radiusStyles: Record<OlmaSurfaceRadius, string> = {
  none: 'rounded-none',
  sm: 'rounded-[0.375rem]',
  md: 'rounded-[0.5rem]',
  lg: 'rounded-[0.75rem]',
  xl: 'rounded-[1rem]',
  '2xl': 'rounded-[1.25rem]',
  '3xl': 'rounded-[1.5rem]',
  full: 'rounded-full',
};

const paddingStyles: Record<OlmaSurfacePadding, string> = {
  none: 'p-0',
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5 sm:p-6',
  xl: 'p-6 sm:p-8',
};

const borderVariantStyles: Record<'default' | 'subtle' | 'strong' | 'accent', string> = {
  default: 'border-[var(--olma-border-default)]',
  subtle: 'border-[var(--olma-border-subtle)]',
  strong: 'border-[var(--olma-border-strong)]',
  accent: 'border-[var(--olma-border-accent)]',
};

export const OlmaSurface: React.FC<OlmaSurfaceProps> = ({
  variant = 'default',
  elevation = 'none',
  radius = 'xl',
  padding = 'none',
  bordered = false,
  borderVariant = 'default',
  as: Component = 'div',
  className,
  children,
  ...props
}) => {
  return (
    <Component
      className={cn(
        'transition-colors duration-200',
        variantStyles[variant],
        elevationStyles[elevation],
        radiusStyles[radius],
        paddingStyles[padding],
        bordered && ['border', borderVariantStyles[borderVariant]],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
