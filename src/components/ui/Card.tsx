import React from 'react';
import { motion } from 'motion/react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, noPadding = false }) => {
  const Component = onClick ? motion.button : motion.div;
  
  return (
    <Component
      onClick={onClick}
      whileHover={onClick ? { scale: 0.99 } : {}}
      className={`bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden ${noPadding ? '' : 'p-6 sm:p-8 md:p-10'} ${onClick ? 'cursor-pointer text-left w-full hover:border-zinc-200 transition-colors' : ''} ${className}`}
    >
      {children}
    </Component>
  );
};
