import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Dispute } from '../../domains/dispute/dispute.types';

interface DisputeDetailsPanelProps {
  dispute: Dispute;
  showDetails: boolean;
  setShowDetails: (show: boolean) => void;
  onPhotoClick: (url: string) => void;
  t: (key: string, defaultValue?: string) => string;
}

export const DisputeDetailsPanel: React.FC<DisputeDetailsPanelProps> = ({
  dispute,
  showDetails,
  setShowDetails,
  onPhotoClick,
  t,
}) => {
  return (
    <div className="shrink-0 flex flex-col">
      {/* Accordion Toggle */}
      <div className="bg-slate-50/50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-600">
        <span className="truncate max-w-[250px]">
          {t('Motif :')} <strong className="text-slate-800">{dispute.reason}</strong>
        </span>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1 text-orange-600 hover:text-orange-700 font-bold uppercase tracking-wider cursor-pointer"
        >
          {showDetails ? t('Masquer détails') : t('Preuves & Détails')}
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Collapsible Details */}
      {showDetails && (
        <div className="p-4 bg-orange-50/40 border-b border-slate-200 max-h-40 overflow-y-auto space-y-3">
          <div className="text-xs text-slate-700 italic font-medium leading-relaxed bg-white/80 p-3 rounded-xl border border-orange-100">
            "{dispute.details}"
          </div>
          {dispute.photos && dispute.photos.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {t('Photos initiales de réclamation :')}
              </span>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {dispute.photos.map((photo, i) => (
                  <div 
                    key={i} 
                    onClick={() => onPhotoClick(photo)}
                    className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 cursor-pointer hover:border-orange-500 hover:scale-105 transition-all relative shrink-0 bg-white"
                  >
                    <img loading="lazy" decoding="async" src={photo} 
                      alt={`Evidence ${i}`} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
