import React from 'react';
import { cn } from '../../../lib/utils';

export type OlmaPillVariant =
  | 'neutral'   // Gris pierre / surface douce
  | 'brand'     // Bleu roi (#1E3A8A)
  | 'accent'    // Ambre vif (#F59E0B)
  | 'highlight' // Ambre clair / doré
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
    pill: 'bg-[var(--olma-brand-primary)] text-white border border-blue-900/30',
    dot: 'bg-[#F59E0B]',
  },
  accent: {
    pill: 'bg-[var(--olma-brand-accent)] text-slate-950 font-bold border border-[#F59E0B]/40',
    dot: 'bg-slate-950',
  },
  highlight: {
    pill: 'bg-amber-100 text-amber-900 border border-amber-300/60 font-bold',
    dot: 'bg-amber-500',
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
