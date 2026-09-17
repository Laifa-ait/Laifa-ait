import React from 'react';

interface BookingFilterTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: {
    all: number;
    upcoming: number;
    completed: number;
    cancelled: number;
  };
}

export const BookingFilterTabs: React.FC<BookingFilterTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  const tabs = [
    { id: 'all', label: 'Tous mes séjours', count: counts.all },
    { id: 'upcoming', label: 'À venir & En attente', count: counts.upcoming },
    { id: 'completed', label: 'Passés', count: counts.completed },
    { id: 'cancelled', label: 'Annulés', count: counts.cancelled },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onTabChange(t.id)}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === t.id
              ? 'bg-[#1E3A8A] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <span>{t.label}</span>
          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
            activeTab === t.id ? 'bg-[#F59E0B] text-slate-900' : 'bg-slate-100 text-slate-600'
          }`}>
            {t.count}
          </span>
        </button>
      ))}
    </div>
  );
};
