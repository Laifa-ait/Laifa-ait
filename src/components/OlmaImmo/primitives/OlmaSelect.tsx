import React from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '../../../lib/utils';

export type OlmaSelectSize = 'sm' | 'md' | 'lg';
export type OlmaSelectRadius = 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface OlmaSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  size?: OlmaSelectSize;
  radius?: OlmaSelectRadius;
  fullWidth?: boolean;
  containerClassName?: string;
}

const sizeStyles: Record<OlmaSelectSize, { select: string; leftPadding: string }> = {
  sm: {
    select: 'text-xs min-h-[36px] px-3 py-1.5 pe-9',
    leftPadding: 'ps-9',
  },
  md: {
    select: 'text-xs sm:text-sm min-h-[42px] px-3.5 py-2 pe-10',
    leftPadding: 'ps-10',
  },
  lg: {
    select: 'text-sm sm:text-base min-h-[48px] px-4 py-2.5 pe-11',
    leftPadding: 'ps-11',
  },
};

const radiusStyles: Record<OlmaSelectRadius, string> = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export const OlmaSelect = React.forwardRef<HTMLSelectElement, OlmaSelectProps>(
  (
    {
      id,
      label,
      description,
      error,
      placeholder,
      required = false,
      disabled = false,
      leftIcon,
      size = 'md',
      radius = 'xl',
      fullWidth = false,
      containerClassName,
      className,
      children,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const errorId = error ? `${selectId}-error` : undefined;
    const descId = description ? `${selectId}-desc` : undefined;

    const describedByIds = [errorId, descId, ariaDescribedBy]
      .filter(Boolean)
      .join(' ') || undefined;

    const hasError = Boolean(error);
    const sizeConfig = sizeStyles[size];

    return (
      <div
        className={cn(
          'flex flex-col gap-1.5 font-sans',
          fullWidth ? 'w-full' : 'w-auto',
          containerClassName
        )}
      >
        {label && (
          <label
            htmlFor={selectId}
            className="flex items-center gap-1 text-xs font-semibold text-[var(--olma-text-primary)] select-none"
          >
            <span>{label}</span>
            {required && (
              <span
                className="text-[var(--olma-semantic-danger)] font-bold"
                aria-hidden="true"
              >
                *
              </span>
            )}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-[var(--olma-text-muted)] pointer-events-none shrink-0"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          <select
            ref={ref}
            id={selectId}
            required={required}
            disabled={disabled}
            aria-invalid={hasError ? 'true' : undefined}
            aria-describedby={describedByIds}
            className={cn(
              'w-full bg-[var(--olma-surface-default)] text-[var(--olma-text-primary)]',
              'border border-[var(--olma-border-default)] shadow-2xs cursor-pointer appearance-none',
              'transition-all duration-150 ease-out motion-reduce:transition-none',
              'focus:outline-hidden focus:border-[var(--olma-brand-primary)] focus:ring-2 focus:ring-[var(--olma-brand-primary)]/20',
              'hover:border-[var(--olma-border-strong)]',
              'disabled:opacity-50 disabled:bg-[var(--olma-surface-muted)] disabled:cursor-not-allowed disabled:hover:border-[var(--olma-border-default)]',
              hasError &&
                'border-[var(--olma-semantic-danger)] bg-rose-50/25 focus:border-[var(--olma-semantic-danger)] focus:ring-2 focus:ring-[var(--olma-semantic-danger)]/20',
              sizeConfig.select,
              radiusStyles[radius],
              leftIcon && sizeConfig.leftPadding,
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled={required}>
                {placeholder}
              </option>
            )}
            {children}
          </select>

          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-[var(--olma-text-muted)] pointer-events-none shrink-0"
            aria-hidden="true"
          >
            <ChevronDown className="w-4 h-4" />
          </span>
        </div>

        {error && (
          <p
            id={errorId}
            className="text-xs font-medium text-[var(--olma-semantic-danger)] flex items-center gap-1 mt-0.5"
            role="alert"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}

        {!error && description && (
          <p id={descId} className="text-xs text-[var(--olma-text-muted)] mt-0.5">
            {description}
          </p>
        )}
      </div>
    );
  }
);

OlmaSelect.displayName = 'OlmaSelect';
