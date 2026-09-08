import React from 'react';

export type PropertyPriceSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type PropertyPriceVariant = 'default' | 'mineral' | 'light' | 'accent' | 'muted';

export interface PropertyPriceProps {
  price: number;
  period?: 'night' | 'month' | 'day' | 'year' | 'total' | string;
  listingType?: 'sale' | 'rent_long' | 'rent_short' | string;
  isNegotiable?: boolean;
  size?: PropertyPriceSize;
  variant?: PropertyPriceVariant;
  showPeriodLabel?: boolean;
  showNegotiableBadge?: boolean;
  className?: string;
  id?: string;
}

const sizeClasses: Record<PropertyPriceSize, { amount: string; currency: string; period: string }> = {
  sm: {
    amount: 'text-sm font-bold',
    currency: 'text-xs font-semibold ml-1',
    period: 'text-[11px] font-normal ml-0.5',
  },
  md: {
    amount: 'text-base font-extrabold',
    currency: 'text-xs font-bold ml-1',
    period: 'text-xs font-medium ml-1',
  },
  lg: {
    amount: 'text-xl font-black sm:text-2xl',
    currency: 'text-xs font-bold ml-1 sm:text-sm',
    period: 'text-xs font-medium ml-1 text-stone-500',
  },
  xl: {
    amount: 'text-2xl font-black sm:text-3xl',
    currency: 'text-sm font-bold ml-1.5',
    period: 'text-xs font-medium ml-1.5',
  },
  '2xl': {
    amount: 'text-3xl font-black sm:text-4xl',
    currency: 'text-base font-bold ml-1.5',
    period: 'text-xs sm:text-sm font-medium ml-1.5',
  },
};

const variantClasses: Record<PropertyPriceVariant, { amount: string; currency: string; period: string }> = {
  default: {
    amount: 'text-[#1A3831]',
    currency: 'text-[#1A3831]',
    period: 'text-stone-500',
  },
  mineral: {
    amount: 'text-[#0D281E]',
    currency: 'text-[#2A4D45]',
    period: 'text-stone-500',
  },
  light: {
    amount: 'text-white',
    currency: 'text-[#EBDCB8]',
    period: 'text-stone-300',
  },
  accent: {
    amount: 'text-[#C97A40]',
    currency: 'text-[#C97A40]',
    period: 'text-stone-600',
  },
  muted: {
    amount: 'text-stone-700',
    currency: 'text-stone-500',
    period: 'text-stone-400',
  },
};

export const PropertyPrice: React.FC<PropertyPriceProps> = ({
  price,
  period,
  listingType,
  isNegotiable,
  size = 'md',
  variant = 'default',
  showPeriodLabel = true,
  showNegotiableBadge = false,
  className = '',
  id,
}) => {
  const formattedAmount = React.useMemo(() => {
    if (typeof price !== 'number' || isNaN(price)) return '0';
    return new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(price);
  }, [price]);

  const resolvedPeriodLabel = React.useMemo(() => {
    if (!showPeriodLabel) return '';
    if (period === 'night' || listingType === 'rent_short') return '/ nuit';
    if (period === 'month' || listingType === 'rent_long') return '/ mois';
    if (period === 'day') return '/ jour';
    if (period === 'year') return '/ an';
    return '';
  }, [period, listingType, showPeriodLabel]);

  const sz = sizeClasses[size] || sizeClasses.md;
  const vr = variantClasses[variant] || variantClasses.default;

  return (
    <div
      id={id}
      className={`inline-flex items-baseline flex-wrap tabular-nums ${className}`}
      aria-label={`${formattedAmount} Dinars Algériens${resolvedPeriodLabel ? ` ${resolvedPeriodLabel}` : ''}`}
    >
      <span className={`${sz.amount} ${vr.amount} tracking-tight`}>
        {formattedAmount}
      </span>
      <span className={`${sz.currency} ${vr.currency} uppercase`}>
        DA
      </span>
      {resolvedPeriodLabel && (
        <span className={`${sz.period} ${vr.period}`}>
          {resolvedPeriodLabel}
        </span>
      )}
      {showNegotiableBadge && isNegotiable && (
        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
          Négociable
        </span>
      )}
    </div>
  );
};
