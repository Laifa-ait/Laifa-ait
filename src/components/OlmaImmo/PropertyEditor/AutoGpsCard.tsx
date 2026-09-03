import React from 'react';
import { Navigation, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
interface AutoGpsCardProps {
  isLocating: boolean;
  hasDetected: boolean;
  accuracy: number | null;
  gpsError: string | null;
  onTriggerGps: () => void;
}

export const AutoGpsCard: React.FC<AutoGpsCardProps> = ({
  isLocating,
  hasDetected,
  accuracy,
  gpsError,
  onTriggerGps,
}) => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-stone-50 border border-emerald-200/80 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h4 className="text-xs sm:text-sm font-bold text-[#0D281E] flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-emerald-600" />
            <span>Capteur GPS Haute Précision</span>
          </h4>
          <p className="text-[11px] text-stone-500 font-medium">
            Détecte instantanément vos coordonnées et sélectionne automatiquement la Wilaya et Commune.
          </p>
        </div>

        <button
          type="button"
          onClick={onTriggerGps}
          disabled={isLocating}
          className="px-4 py-2.5 rounded-xl bg-[#0D281E] hover:bg-[#163e30] text-[#EBDCB8] text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm active:scale-95 disabled:opacity-60 cursor-pointer shrink-0 min-h-[44px]"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Acquisition satellite en cours...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4 text-amber-300" />
              <span>{hasDetected ? 'Actualiser ma position GPS' : 'Activer le signal GPS'}</span>
            </>
          )}
        </button>
      </div>

      {gpsError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{gpsError}</span>
        </div>
      )}

      {hasDetected && !gpsError && (
        <div className="p-3 rounded-xl bg-white border border-emerald-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold text-[#0D281E]">
              Position GPS verrouillée avec succès
            </span>
          </div>
          {accuracy !== null && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold">
              Précision : ±{accuracy} m
            </span>
          )}
        </div>
      )}
    </div>
  );
};
