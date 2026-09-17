import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AccordionItemProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  isLast?: boolean;
  children: React.ReactNode;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  icon,
  isOpen,
  onToggle,
  isLast = false,
  children,
}) => {
  return (
    <div className={isLast ? '' : 'border-b border-[#EAE3D5]'}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-start font-sans font-bold text-xs uppercase tracking-wider text-[#2C2C28] hover:bg-[#FAF6F0]/50 transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
        <span
          className={`text-stone-400 font-light text-base transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          ▼
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 space-y-3 text-xs text-stone-600 bg-[#FAF6F0]/25">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
