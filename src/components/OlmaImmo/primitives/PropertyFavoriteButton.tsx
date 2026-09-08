import React from 'react';
import { Heart } from 'lucide-react';

export type PropertyFavoriteButtonSize = 'sm' | 'md' | 'lg';
export type PropertyFavoriteButtonVariant = 'glass' | 'solid' | 'subtle';

export interface PropertyFavoriteButtonProps {
  isFav: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  size?: PropertyFavoriteButtonSize;
  variant?: PropertyFavoriteButtonVariant;
  stopPropagation?: boolean;
  className?: string;
  id?: string;
}

const sizeClasses: Record<PropertyFavoriteButtonSize, { button: string; icon: string }> = {
  sm: { button: 'w-8 h-8 rounded-full', icon: 'w-4 h-4' },
  md: { button: 'w-9 h-9 rounded-full sm:w-10 sm:h-10', icon: 'w-4 h-4 sm:w-4.5 sm:h-4.5' },
  lg: { button: 'w-11 h-11 rounded-2xl', icon: 'w-5 h-5' },
};

export const PropertyFavoriteButton: React.FC<PropertyFavoriteButtonProps> = ({
  isFav,
  onClick,
  size = 'md',
  variant = 'glass',
  stopPropagation = true,
  className = '',
  id,
}) => {
  const sz = sizeClasses[size] || sizeClasses.md;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      e.stopPropagation();
      e.preventDefault();
    }
    onClick(e);
  };

  let styleClasses = '';
  switch (variant) {
    case 'glass':
      styleClasses = isFav
        ? 'bg-rose-500/90 text-white shadow-md hover:bg-rose-600 border border-rose-400/50'
        : 'bg-black/35 hover:bg-black/55 text-white backdrop-blur-md border border-white/20 shadow-xs';
      break;
    case 'solid':
      styleClasses = isFav
        ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs hover:bg-rose-100'
        : 'bg-white text-stone-700 hover:bg-[#FAF8F5] border border-[#E8E2D4] shadow-xs';
      break;
    case 'subtle':
      styleClasses = isFav
        ? 'text-rose-600 hover:bg-rose-50'
        : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100';
      break;
  }

  return (
    <button
      id={id}
      type="button"
      onClick={handleClick}
      aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      aria-pressed={isFav}
      className={`inline-flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90 hover:scale-105 ${sz.button} ${styleClasses} ${className}`}
    >
      <Heart
        className={`${sz.icon} transition-transform ${isFav ? 'fill-current scale-110' : ''}`}
        aria-hidden="true"
      />
    </button>
  );
};
