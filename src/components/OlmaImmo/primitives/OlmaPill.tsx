import React from 'react';
import { cn } from '../../../lib/utils';

export type OlmaPillVariant =
  | 'neutral'   // Gris pierre / surface douce
  | 'brand'     // Vert forêt (#1A3831) avec texte doré/ivoire
  | 'accent'    // Terracotta (#C97A40)
  | 'highlight' // Sable doré (#EBDCB8)
  | 'success'   // Vert émeraude
  | 'warning'   // Ambre
  | 'danger'    // Rose/Rouge
  | 'info'      // Bleu méditerranéen
  | 'dark';     // Fond sombre profond

export type OlmaPillSize = 'sm' | 'md';

export interface OlmaPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: OlmaPillVariant;
  size?: OlmaPillSize;
  dot?: boolean;
  as?: React.ElementType;
}

const variantStyles: Record<OlmaPillVariant, { pill: string; dot: string }> = {
  neutral: {
    pill: 'bg-[var(--olma-surface-muted)] text-[var(--olma-text-secondary)] border border-[var(--olma-border-default)]',
    dot: 'bg-[var(--olma-text-muted)]',
  },
  brand: {
    pill: 'bg-[var(--olma-brand-primary)] text-[var(--olma-brand-highlight)] border border-[var(--olma-brand-highlight)]/30',
    dot: 'bg-[var(--olma-brand-highlight)]',
  },
  accent: {
    pill: 'bg-[var(--olma-brand-accent)] text-white border border-[var(--olma-brand-accent-soft)]/30',
    dot: 'bg-white',
  },
  highlight: {
    pill: 'bg-[var(--olma-brand-highlight)] text-[var(--olma-brand-primary-dark)] border border-[var(--olma-brand-primary)]/20 font-bold',
    dot: 'bg-[var(--olma-brand-primary-dark)]',
  },
  success: {
    pill: 'bg-[var(--olma-semantic-success-light)] text-[var(--olma-semantic-success)] border border-[var(--olma-semantic-success)]/20',
    dot: 'bg-[var(--olma-semantic-success)]',
  },
  warning: {
    pill: 'bg-[var(--olma-semantic-warning-light)] text-[var(--olma-semantic-warning)] border border-[var(--olma-semantic-warning)]/20',
    dot: 'bg-[var(--olma-semantic-warning)]',
  },
  danger: {
    pill: 'bg-[var(--olma-semantic-danger-light)] text-[var(--olma-semantic-danger)] border border-[var(--olma-semantic-danger)]/20',
    dot: 'bg-[var(--olma-semantic-danger)]',
  },
  info: {
    pill: 'bg-[var(--olma-semantic-info-light)] text-[var(--olma-semantic-info)] border border-[var(--olma-semantic-info)]/20',
    dot: 'bg-[var(--olma-semantic-info)]',
  },
  dark: {
    pill: 'bg-[var(--olma-brand-primary-dark)] text-white border border-white/20',
    dot: 'bg-[var(--olma-brand-highlight)]',
  },
};

const sizeStyles: Record<OlmaPillSize, string> = {
  sm: 'text-[11px] px-2.5 py-0.5 gap-1.5 font-medium leading-tight',
  md: 'text-xs px-3 py-1 gap-2 font-semibold leading-normal',
};

export const OlmaPill: React.FC<OlmaPillProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  as: Component = 'span',
  className,
  ...props
}) => {
  const currentVariant = variantStyles[variant];

  return (
    <Component
      className={cn(
        'inline-flex items-center rounded-full tracking-tight transition-colors select-none whitespace-nowrap shadow-2xs',
        currentVariant.pill,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0 animate-pulse', currentVariant.dot)}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </Component>
  );
};
