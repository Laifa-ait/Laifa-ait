import React from 'react';
import { Users } from 'lucide-react';

interface ShortTermBookingGuestsSelectorProps {
  adults: number;
  setAdults: React.Dispatch<React.SetStateAction<number>>;
  childrenCount: number;
  setChildrenCount: React.Dispatch<React.SetStateAction<number>>;
}

export const ShortTermBookingGuestsSelector: React.FC<ShortTermBookingGuestsSelectorProps> = ({
  adults,
  setAdults,
  childrenCount,
  setChildrenCount,
}) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#1E3A8A] flex items-center gap-1.5">
          <Users className="w-4 h-4 text-[#1E3A8A]" /> Voyageurs
        </span>
        <span className="text-xs font-semibold text-slate-600">
          {adults} adulte{adults > 1 ? 's' : ''}
          {childrenCount > 0 ? ` · ${childrenCount} enfant${childrenCount > 1 ? 's' : ''}` : ''}
        </span>
      </div>

      <div className="space-y-2 pt-1 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-700 font-medium">Adultes (+13 ans)</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
              className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-sm flex items-center justify-center hover:bg-slate-50 cursor-pointer min-w-[32px] min-h-[32px]"
            >
              −
            </button>
            <span className="text-xs font-bold w-4 text-center">{adults}</span>
            <button
              type="button"
              onClick={() => setAdults((prev) => Math.min(10, prev + 1))}
              className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-sm flex items-center justify-center hover:bg-slate-50 cursor-pointer min-w-[32px] min-h-[32px]"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-700 font-medium">Enfants (2 - 12 ans)</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setChildrenCount((prev) => Math.max(0, prev - 1))}
              className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-sm flex items-center justify-center hover:bg-slate-50 cursor-pointer min-w-[32px] min-h-[32px]"
            >
              −
            </button>
            <span className="text-xs font-bold w-4 text-center">{childrenCount}</span>
            <button
              type="button"
              onClick={() => setChildrenCount((prev) => Math.min(10, prev + 1))}
              className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold text-sm flex items-center justify-center hover:bg-slate-50 cursor-pointer min-w-[32px] min-h-[32px]"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
