import React from 'react';
import { cn } from '../../../lib/utils';

export type OlmaSectionSpacing =
  | 'none'
  | 'xs'        // py-2 sm:py-3
  | 'sm'        // py-4 sm:py-6
  | 'md'        // py-6 sm:py-8 (Standard section)
  | 'lg'        // py-8 sm:py-12 (Sections majeures)
  | 'xl';       // py-12 sm:py-16

export interface OlmaSectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  spacing?: OlmaSectionSpacing;
  container?: boolean;
  containerClassName?: string;
  as?: React.ElementType;
}

const spacingStyles: Record<OlmaSectionSpacing, string> = {
  none: 'py-0',
  xs: 'py-2 sm:py-3',
  sm: 'py-4 sm:py-6',
  md: 'py-6 sm:py-8',
  lg: 'py-8 sm:py-12',
  xl: 'py-12 sm:py-16',
};

export const OlmaSection: React.FC<OlmaSectionProps> = ({
  children,
  spacing = 'md',
  container = true,
  containerClassName,
  as: Component = 'section',
  className,
  ...props
}) => {
  return (
    <Component
      className={cn('w-full', spacingStyles[spacing], className)}
      {...props}
    >
      {container ? (
        <div
          className={cn(
            'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full',
            containerClassName
          )}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </Component>
  );
};
