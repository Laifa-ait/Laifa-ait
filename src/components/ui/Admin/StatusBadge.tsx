import React from 'react';

interface StatusBadgeProps {
  status: string;
  label?: string;
  colors?: Record<string, string>;
  defaultColor?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  label, 
  colors = {},
  defaultColor = "bg-zinc-100 text-zinc-700 border-zinc-200"
}) => {
  const colorClass = colors[status] || defaultColor;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest border ${colorClass}`}>
      {label || status}
    </span>
  );
};
