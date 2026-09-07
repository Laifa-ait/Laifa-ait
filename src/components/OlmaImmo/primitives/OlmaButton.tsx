import React from 'react';
import { cn } from '../../../lib/utils';

export type OlmaButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'accent'
  | 'dark'
  | 'danger';

export type OlmaButtonSize = 'sm' | 'md' | 'lg' | 'icon';
export type OlmaButtonRadius = 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface OlmaButtonBaseProps {
  variant?: OlmaButtonVariant;
  size?: OlmaButtonSize;
  radius?: OlmaButtonRadius;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export type OlmaButtonProps<E extends React.ElementType = 'button'> = OlmaButtonBaseProps & {
  as?: E;
} & Omit<React.ComponentPropsWithRef<E>, keyof OlmaButtonBaseProps | 'as'>;

const variantStyles: Record<OlmaButtonVariant, string> = {
  primary:
    'bg-[var(--olma-brand-primary)] text-[var(--olma-brand-highlight)] hover:bg-[var(--olma-brand-primary-dark)] active:bg-[var(--olma-brand-primary-dark)] border border-[var(--olma-brand-highlight)]/20 shadow-xs',
  secondary:
    'bg-[var(--olma-surface-default)] text-[var(--olma-text-primary)] hover:bg-[var(--olma-surface-muted)] active:bg-[var(--olma-surface-muted)] border border-[var(--olma-border-default)] shadow-2xs',
  outline:
    'bg-transparent text-[var(--olma-brand-primary)] border border-[var(--olma-brand-primary)] hover:bg-[var(--olma-brand-primary)]/5 active:bg-[var(--olma-brand-primary)]/10',
  ghost:
    'bg-transparent text-[var(--olma-text-secondary)] hover:text-[var(--olma-brand-primary)] hover:bg-[var(--olma-surface-muted)] active:bg-[var(--olma-surface-muted)] border border-transparent',
  accent:
    'bg-[var(--olma-brand-accent)] text-white hover:bg-[#B36934] active:bg-[#9E5A29] shadow-xs border border-transparent',
  dark:
    'bg-[var(--olma-brand-primary-dark)] text-white hover:bg-[var(--olma-brand-primary)] active:bg-[var(--olma-brand-primary)] border border-white/10 shadow-xs',
  danger:
    'bg-[var(--olma-semantic-danger-light)] text-[var(--olma-semantic-danger)] hover:bg-rose-100/90 active:bg-rose-200/80 border border-[var(--olma-semantic-danger)]/20 shadow-2xs',
};

const sizeStyles: Record<OlmaButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5 font-medium',
  md: 'text-xs sm:text-sm px-4 py-2 min-h-[42px] gap-2 font-semibold',
  lg: 'text-sm sm:text-base px-5 py-2.5 min-h-[48px] gap-2.5 font-bold',
  icon: 'p-2 min-h-[40px] min-w-[40px] justify-center items-center',
};

const radiusStyles: Record<OlmaButtonRadius, string> = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export const OlmaButton = React.forwardRef(
  <E extends React.ElementType = 'button'>(
    {
      as,
      variant = 'primary',
      size = 'md',
      radius = '2xl',
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled = false,
      className,
      children,
      type,
      ...props
    }: OlmaButtonProps<E>,
    ref: React.Ref<HTMLElement>
  ) => {
    const Component = as || 'button';
    const isButtonTag = Component === 'button';
    const isDisabled = disabled || loading;

    return (
      <Component
        ref={ref}
        type={isButtonTag ? type || 'button' : undefined}
        disabled={isButtonTag ? isDisabled : undefined}
        aria-disabled={isDisabled ? 'true' : undefined}
        aria-busy={loading ? 'true' : undefined}
        className={cn(
          'inline-flex items-center justify-center font-sans select-none tracking-tight leading-normal cursor-pointer',
          'transition-all duration-200 ease-out motion-reduce:transition-none',
          'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--olma-brand-primary)] focus-visible:ring-offset-2',
          'active:scale-[0.98]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:scale-100',
          fullWidth && 'w-full',
          variantStyles[variant],
          sizeStyles[size],
          radiusStyles[radius],
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin shrink-0 w-3.5 h-3.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {!loading && leftIcon && (
          <span className="shrink-0 flex items-center" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        {loading && loadingText ? (
          <span>{loadingText}</span>
        ) : (
          children && <span>{children}</span>
        )}

        {!loading && rightIcon && (
          <span className="shrink-0 flex items-center" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </Component>
    );
  }
) as <E extends React.ElementType = 'button'>(
  props: OlmaButtonProps<E> & { ref?: React.Ref<HTMLElement> }
) => React.ReactElement;
