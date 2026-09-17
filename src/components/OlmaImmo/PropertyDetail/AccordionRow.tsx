import React from 'react';

interface AccordionRowProps {
  label: string;
  value: React.ReactNode;
  isMono?: boolean;
}

export const AccordionRow: React.FC<AccordionRowProps> = ({ label, value, isMono = false }) => {
  return (
    <div className="flex justify-between items-center border-b border-[#EAE3D5]/40 pb-2">
      <span className="text-stone-400 font-bold text-[9px] uppercase tracking-wider">
        {label}
      </span>
      <span className={`text-[#2C2C28] font-bold ${isMono ? 'font-mono text-xs select-all' : ''}`}>
        {value}
      </span>
    </div>
  );
};
