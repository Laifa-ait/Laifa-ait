import React, { useState } from 'react';
import { Landmark, ChevronRight, CheckCircle2, HelpCircle } from 'lucide-react';
import { TERRITORY_LEVELS } from './territoryData';
import { AlgerianTerritoryExplainerModal } from './AlgerianTerritoryExplainerModal';

export { TERRITORY_LEVELS } from './territoryData';
export type { TerritoryLevel } from './territoryData';
export { AlgerianTerritoryExplainerModal } from './AlgerianTerritoryExplainerModal';
export type { AlgerianTerritoryExplainerModalProps } from './AlgerianTerritoryExplainerModal';

export const AlgerianTerritoryInfoButton: React.FC<{
  variant?: 'button' | 'link' | 'badge';
  className?: string;
  label?: string;
}> = ({ variant = 'button', className = '', label = 'Comprendre Wilaya / Daïra / Baladia' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {variant === 'link' ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`text-[11px] text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1 cursor-pointer hover:underline ${className}`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{label}</span>
        </button>
      ) : variant === 'badge' ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition cursor-pointer ${className}`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
          <span>{label}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${className}`}
        >
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>{label}</span>
        </button>
      )}

      <AlgerianTerritoryExplainerModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export const AlgerianTerritoryExplainerCard: React.FC<{
  compact?: boolean;
  className?: string;
  onOpenModal?: () => void;
}> = ({ compact = false, className = '', onOpenModal }) => {
  const [internalModalOpen, setInternalModalOpen] = useState(false);

  const handleOpen = onOpenModal || (() => setInternalModalOpen(true));

  return (
    <>
      <div
        className={`rounded-2xl border border-slate-200 bg-linear-to-br from-slate-50 via-white to-blue-50/30 p-4 shadow-xs ${className}`}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Landmark className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-[#1E3A8A] tracking-tight">
                Organisation Territoriale de l'Algérie
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                3 niveaux administratifs officiels : Wilaya • Daïra • Baladia
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpen}
            className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Guide complet</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div
          className={
            compact
              ? 'grid grid-cols-1 sm:grid-cols-3 gap-2.5'
              : 'grid grid-cols-1 md:grid-cols-3 gap-3'
          }
        >
          {TERRITORY_LEVELS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.level}
                className={`rounded-xl border p-3 flex flex-col justify-between transition-all hover:shadow-xs ${item.color}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-lg ${item.iconBg} flex items-center justify-center text-xs font-bold shrink-0`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-black block leading-tight">
                          {item.title}
                        </span>
                        <span className="text-[10px] opacity-75 font-semibold block">
                          {item.subtitle} • {item.arabic}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-white/80 backdrop-blur-xs border border-current/20 shrink-0">
                      Niv. {item.level}
                    </span>
                  </div>

                  <p className="text-[11px] leading-relaxed line-clamp-3 font-normal opacity-90 mb-2">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-current/15 text-[10px] font-medium opacity-80 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span className="truncate">{item.governance}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!onOpenModal && (
        <AlgerianTerritoryExplainerModal
          isOpen={internalModalOpen}
          onClose={() => setInternalModalOpen(false)}
        />
      )}
    </>
  );
};
