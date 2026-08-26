import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  subtitle, 
  actionLabel, 
  actionHref 
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-sans font-black text-slate-900 tracking-tight uppercase rtl:tracking-normal">
          {title}
        </h2>
        {subtitle && (
          <p className="text-zinc-500 font-medium mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {actionLabel && actionHref && (
        <Link 
          to={actionHref}
          className="group inline-flex items-center gap-1 text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal hover:text-slate-900 transition-colors"
        >
          {actionLabel}
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
};
