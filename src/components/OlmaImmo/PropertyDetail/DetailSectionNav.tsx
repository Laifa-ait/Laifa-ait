import React from 'react';
import { LayoutGrid, Home, ShieldCheck, DollarSign, MapPin } from 'lucide-react';

export type DetailTabKey = 'all' | 'overview' | 'legal' | 'finance' | 'location';

interface DetailSectionNavProps {
  activeTab: DetailTabKey;
  onTabChange: (tab: DetailTabKey) => void;
  legalCount?: number;
  featuresCount?: number;
}

export const DetailSectionNav: React.FC<DetailSectionNavProps> = ({
  activeTab,
  onTabChange,
  legalCount = 0,
  featuresCount = 0,
}) => {
  const tabs = [
    {
      key: 'all' as DetailTabKey,
      label: 'Tout voir',
      icon: LayoutGrid,
    },
    {
      key: 'overview' as DetailTabKey,
      label: 'Aperçu & Équipements',
      icon: Home,
      badge: featuresCount > 0 ? featuresCount : undefined,
    },
    {
      key: 'legal' as DetailTabKey,
      label: 'Foncier & Légal',
      icon: ShieldCheck,
      badge: legalCount > 0 ? legalCount : undefined,
    },
    {
      key: 'finance' as DetailTabKey,
      label: 'Conditions & Tarifs',
      icon: DollarSign,
    },
    {
      key: 'location' as DetailTabKey,
      label: 'Quartier & Carte',
      icon: MapPin,
    },
  ];

  return (
    <nav
      aria-label="Navigation des sections de l'annonce"
      className="sticky top-16 sm:top-20 z-30 bg-white/95 backdrop-blur-md py-2.5 px-1 sm:px-2 rounded-2xl border border-slate-200/90 shadow-xs mb-6 overflow-x-auto no-scrollbar"
    >
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F59E0B]' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
