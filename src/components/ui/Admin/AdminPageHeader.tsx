import React from 'react';
import { motion } from 'motion/react';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h2 className="text-3xl font-sans font-bold tracking-tight text-slate-900 rtl:tracking-normal">
          {title}
        </h2>
        {subtitle && <p className="text-zinc-500 font-medium mt-1">{subtitle}</p>}
      </motion.div>
      {actions && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="flex flex-wrap items-center gap-3"
        >
          {actions}
        </motion.div>
      )}
    </div>
  );
};
