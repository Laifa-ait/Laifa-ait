import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ShortTermBookingGridProps {
  currentMonth: Date;
  today: Date;
  todayStr: string;
  startDate: string;
  endDate: string;
  hoverDate: string;
  setHoverDate: (d: string) => void;
  isDateDisabled: (d: string) => boolean;
  handleDateClick: (d: string) => void;
  prevMonth: () => void;
  nextMonth: () => void;
}

export const ShortTermBookingGrid: React.FC<ShortTermBookingGridProps> = ({
  currentMonth,
  today,
  todayStr,
  startDate,
  endDate,
  hoverDate,
  setHoverDate,
  isDateDisabled,
  handleDateClick,
  prevMonth,
  nextMonth,
}) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={prevMonth}
          disabled={currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth()}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-[#1e3835] capitalize tracking-wide">{monthName}</span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="h-9" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dayDate = new Date(year, month, dayNum);
          const y = dayDate.getFullYear();
          const m = String(dayDate.getMonth() + 1).padStart(2, '0');
          const d = String(dayDate.getDate()).padStart(2, '0');
          const dateStr = `${y}-${m}-${d}`;

          const disabled = isDateDisabled(dateStr);
          const isToday = dateStr === todayStr;
          const isStart = dateStr === startDate;
          const isEnd = dateStr === endDate;
          const inRange = startDate && endDate && dateStr > startDate && dateStr < endDate;
          const inHoverRange = startDate && !endDate && hoverDate && dateStr > startDate && dateStr <= hoverDate;

          let bgClass = 'bg-transparent text-slate-800 hover:bg-[#f0ebd8]';
          if (disabled) {
            bgClass = 'bg-slate-100 text-slate-300 line-through cursor-not-allowed';
          } else if (isStart || isEnd) {
            bgClass = 'bg-[#1e3835] text-white font-bold rounded-xl shadow-xs';
          } else if (inRange) {
            bgClass = 'bg-[#f4ecd8] text-[#1e3835] font-semibold';
          } else if (inHoverRange) {
            bgClass = 'bg-[#f7f2e4] text-[#1e3835]';
          }

          return (
            <button
              key={dateStr}
              type="button"
              disabled={disabled}
              onClick={() => handleDateClick(dateStr)}
              onMouseEnter={() => !endDate && startDate && setHoverDate(dateStr)}
              className={`h-9 text-xs rounded-lg flex items-center justify-center relative transition-all min-w-[32px] cursor-pointer ${bgClass} ${
                isToday && !isStart && !isEnd ? 'ring-2 ring-emerald-600 font-bold text-emerald-900' : ''
              }`}
            >
              <span>{dayNum}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 px-1">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1e3835]" /><span>Sélection</span></div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-200" /><span>Indisponible</span></div>
      </div>
    </div>
  );
};
