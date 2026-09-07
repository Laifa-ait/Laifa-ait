import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

export type OlmaInputSize = 'sm' | 'md' | 'lg';
export type OlmaInputRadius = 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface OlmaInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: OlmaInputSize;
  radius?: OlmaInputRadius;
  fullWidth?: boolean;
  containerClassName?: string;
}

const sizeStyles: Record<OlmaInputSize, { input: string; leftPadding: string; rightPadding: string }> = {
  sm: {
    input: 'text-xs min-h-[36px] px-3 py-1.5',
    leftPadding: 'ps-9',
    rightPadding: 'pe-9',
  },
  md: {
    input: 'text-xs sm:text-sm min-h-[42px] px-3.5 py-2',
    leftPadding: 'ps-10',
    rightPadding: 'pe-10',
  },
  lg: {
    input: 'text-sm sm:text-base min-h-[48px] px-4 py-2.5',
    leftPadding: 'ps-11',
    rightPadding: 'pe-11',
  },
};

const radiusStyles: Record<OlmaInputRadius, string> = {
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export const OlmaInput = React.forwardRef<HTMLInputElement, OlmaInputProps>(
  (
    {
      id,
      label,
      description,
      error,
      required = false,
      disabled = false,
      leftIcon,
      rightIcon,
      size = 'md',
      radius = 'xl',
      fullWidth = false,
      containerClassName,
      className,
      type = 'text',
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const descId = description ? `${inputId}-desc` : undefined;

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
            htmlFor={inputId}
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

          <input
            ref={ref}
            id={inputId}
            type={type}
            required={required}
            disabled={disabled}
            aria-invalid={hasError ? 'true' : undefined}
            aria-describedby={describedByIds}
            className={cn(
              'w-full bg-[var(--olma-surface-default)] text-[var(--olma-text-primary)]',
              'placeholder:text-[var(--olma-text-muted)]',
              'border border-[var(--olma-border-default)] shadow-2xs',
              'transition-all duration-150 ease-out motion-reduce:transition-none',
              'focus:outline-hidden focus:border-[var(--olma-brand-primary)] focus:ring-2 focus:ring-[var(--olma-brand-primary)]/20',
              'hover:border-[var(--olma-border-strong)]',
              'disabled:opacity-50 disabled:bg-[var(--olma-surface-muted)] disabled:cursor-not-allowed disabled:hover:border-[var(--olma-border-default)]',
              'read-only:bg-[var(--olma-surface-muted)] read-only:cursor-default',
              hasError &&
                'border-[var(--olma-semantic-danger)] bg-rose-50/25 focus:border-[var(--olma-semantic-danger)] focus:ring-2 focus:ring-[var(--olma-semantic-danger)]/20',
              sizeConfig.input,
              radiusStyles[radius],
              leftIcon && sizeConfig.leftPadding,
              rightIcon && sizeConfig.rightPadding,
              className
            )}
            {...props}
          />

          {rightIcon && (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-[var(--olma-text-muted)] pointer-events-none shrink-0"
              aria-hidden="true"
            >
              {rightIcon}
            </span>
          )}
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

OlmaInput.displayName = 'OlmaInput';
