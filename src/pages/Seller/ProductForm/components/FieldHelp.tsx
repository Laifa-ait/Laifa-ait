import React from "react";
import { HelpCircle } from "lucide-react";

interface FieldHelpProps {
  text: string;
}

export const FieldHelp: React.FC<FieldHelpProps> = ({ text }) => {
  return (
    <div className="relative inline-flex items-center group ml-1.5 align-middle cursor-help">
      <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#C75C1A] transition-colors" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 pointer-events-none">
        <div className="bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap max-w-xs text-center border border-slate-700 leading-snug">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      </div>
    </div>
  );
};
