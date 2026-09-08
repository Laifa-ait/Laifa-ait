import React from 'react';
import { MapPin } from 'lucide-react';

export type PropertyLocationSize = 'xs' | 'sm' | 'md' | 'lg';
export type PropertyLocationVariant = 'default' | 'muted' | 'light' | 'pill';

export interface PropertyLocationProps {
  commune?: string;
  wilaya?: string;
  address?: string;
  showAddress?: boolean;
  size?: PropertyLocationSize;
  variant?: PropertyLocationVariant;
  className?: string;
  id?: string;
}

const sizeConfig: Record<PropertyLocationSize, { text: string; icon: string; gap: string }> = {
  xs: { text: 'text-[11px] font-medium', icon: 'w-3 h-3', gap: 'gap-1' },
  sm: { text: 'text-xs font-medium', icon: 'w-3.5 h-3.5', gap: 'gap-1.5' },
  md: { text: 'text-sm font-medium', icon: 'w-4 h-4', gap: 'gap-1.5' },
  lg: { text: 'text-base font-semibold', icon: 'w-4.5 h-4.5', gap: 'gap-2' },
};

export const PropertyLocation: React.FC<PropertyLocationProps> = ({
  commune,
  wilaya,
  address,
  showAddress = false,
  size = 'sm',
  variant = 'default',
  className = '',
  id,
}) => {
  const sz = sizeConfig[size] || sizeConfig.sm;

  const locationText = React.useMemo(() => {
    if (commune && wilaya) {
      return `${commune}, Wilaya de ${wilaya}`;
    }
    if (commune) return commune;
    if (wilaya) return `Wilaya de ${wilaya}`;
    return 'Algérie';
  }, [commune, wilaya]);

  let containerStyles = `inline-flex items-center ${sz.gap} ${sz.text} ${className}`;
  let iconStyles = `${sz.icon} shrink-0`;

  switch (variant) {
    case 'muted':
      containerStyles += ' text-stone-500';
      iconStyles += ' text-stone-400';
      break;
    case 'light':
      containerStyles += ' text-stone-200';
      iconStyles += ' text-[#EBDCB8]';
      break;
    case 'pill':
      containerStyles += ' px-2.5 py-1 rounded-full bg-[#FAF8F5] text-[#1A3831] border border-[#E8E2D4]';
      iconStyles += ' text-[#C97A40]';
      break;
    case 'default':
    default:
      containerStyles += ' text-stone-600';
      iconStyles += ' text-[#C97A40]';
      break;
  }

  return (
    <div id={id} className={containerStyles} title={`${locationText}${address && showAddress ? ` (${address})` : ''}`}>
      <MapPin className={iconStyles} aria-hidden="true" />
      <span className="line-clamp-1 truncate">{locationText}</span>
      {showAddress && address && (
        <span className="text-stone-400 font-normal truncate hidden sm:inline">
          ({address})
        </span>
      )}
    </div>
  );
};
