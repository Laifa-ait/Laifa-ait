import React from 'react';
import { Tag } from 'lucide-react';
import { ArtisanService } from '../../../types/artisan';

interface ArtisanServicesListProps {
  services?: ArtisanService[];
  specialties?: string[];
  onRequestQuote: () => void;
}

export const ArtisanServicesList: React.FC<ArtisanServicesListProps> = ({
  services = [],
  specialties = [],
  onRequestQuote,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Tag className="w-5 h-5 text-amber-500" />
        <h2 className="text-base font-black text-slate-900">Prestations & Spécialités</h2>
      </div>

      {specialties.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase">Domaines d'expertise :</p>
          <div className="flex flex-wrap gap-2">
            {specialties.map((spec, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}

      {services.length > 0 && (
        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold text-slate-500 uppercase">Tarifs indicatifs :</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-2"
              >
                <div>
                  <h3 className="font-extrabold text-xs text-slate-900">{srv.title}</h3>
                  {srv.description && (
                    <p className="text-[11px] text-slate-500 mt-1">{srv.description}</p>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  <span className="font-black text-amber-700">
                    {srv.priceStartingFrom
                      ? `Dès ${srv.priceStartingFrom.toLocaleString('fr-DZ')} DZD`
                      : 'Sur devis'}
                  </span>
                  <button
                    onClick={onRequestQuote}
                    className="text-[11px] font-bold text-slate-700 hover:text-amber-600 underline cursor-pointer"
                  >
                    Demander ce service
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
