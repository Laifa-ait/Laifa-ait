import React from 'react';
import { cn } from '../../../lib/utils';
import { OlmaSurface, OlmaSurfaceElevation, OlmaSurfaceRadius, OlmaSurfaceVariant } from './OlmaSurface';

export interface OlmaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: OlmaSurfaceVariant;
  elevation?: OlmaSurfaceElevation;
  radius?: OlmaSurfaceRadius;
  bordered?: boolean;
  borderVariant?: 'default' | 'subtle' | 'strong' | 'accent';
  interactive?: boolean;
  as?: React.ElementType;
}

export const OlmaCard: React.FC<OlmaCardProps> = ({
  children,
  variant = 'default',
  elevation = 'card',
  radius = 'xl',
  bordered = true,
  borderVariant = 'default',
  interactive = false,
  as = 'div',
  className,
  ...props
}) => {
  return (
    <OlmaSurface
      as={as}
      variant={variant}
      elevation={elevation}
      radius={radius}
      bordered={bordered}
      borderVariant={borderVariant}
      className={cn(
        'overflow-hidden flex flex-col',
        interactive && [
          'cursor-pointer transition-all duration-250 ease-out',
          'hover:shadow-[var(--olma-shadow-floating)] hover:-translate-y-0.5',
          'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--olma-brand-primary)] focus-visible:ring-offset-2',
        ],
        className
      )}
      {...props}
    >
      {children}
    </OlmaSurface>
  );
};
