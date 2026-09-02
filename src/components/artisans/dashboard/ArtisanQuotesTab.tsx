import React, { useState } from 'react';
import {
  FileText,
  Phone,
  Calendar,
  MapPin,
} from 'lucide-react';
import { ArtisanQuoteRequest } from '../../../types/artisan';
import { updateArtisanQuoteStatus } from '../../../services/artisan.api';

interface ArtisanQuotesTabProps {
  quotes: ArtisanQuoteRequest[];
  onRefreshQuotes: () => Promise<void>;
}

export const ArtisanQuotesTab: React.FC<ArtisanQuotesTabProps> = ({
  quotes,
  onRefreshQuotes,
}) => {
  const [updating, setUpdating] = useState(false);

  const handleUpdateStatus = async (
    quoteId: string,
    status: 'accepted' | 'declined' | 'completed'
  ) => {
    setUpdating(true);
    try {
      await updateArtisanQuoteStatus(quoteId, status);
      await onRefreshQuotes();
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-900">Demandes de devis & interventions</h2>
        <span className="text-xs font-bold text-slate-500">{quotes.length} demande(s)</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {quotes.length > 0 ? (
          quotes.map((q) => (
            <div
              key={q.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{q.clientName}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        q.urgency === 'urgent'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {q.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {q.commune}, {q.wilaya} {q.address ? `(${q.address})` : ''}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                    q.status === 'pending'
                      ? 'bg-amber-100 text-amber-900'
                      : q.status === 'accepted'
                      ? 'bg-blue-100 text-blue-900'
                      : q.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {q.status}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-xl">
                  {q.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <a
                    href={`tel:${q.clientPhone}`}
                    className="flex items-center gap-1 font-bold text-amber-600 hover:text-amber-700"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{q.clientPhone}</span>
                  </a>
                  {q.preferredDate && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      Date souhaitée : {q.preferredDate}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons for the Artisan */}
              {q.status === 'pending' && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 justify-end">
                  <button
                    onClick={() => handleUpdateStatus(q.id, 'declined')}
                    disabled={updating}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Refuser
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(q.id, 'accepted')}
                    disabled={updating}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    Accepter la mission
                  </button>
                </div>
              )}

              {q.status === 'accepted' && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 justify-end">
                  <button
                    onClick={() => handleUpdateStatus(q.id, 'completed')}
                    disabled={updating}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    Marquer comme terminé
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-2">
            <FileText className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-bold">Aucune demande de devis reçue pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};
