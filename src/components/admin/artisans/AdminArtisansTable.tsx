import React from 'react';
import { ArtisanProfile, ArtisanStatus } from '../../../types/artisan';

interface AdminArtisansTableProps {
  artisans: ArtisanProfile[];
  onOpenStatusModal: (artisan: ArtisanProfile, targetStatus: ArtisanStatus) => void;
}

export const AdminArtisansTable: React.FC<AdminArtisansTableProps> = ({
  artisans,
  onOpenStatusModal,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Artisan</th>
              <th className="px-4 py-3">Métier</th>
              <th className="px-4 py-3">Wilaya / Commune</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Actions de Modération</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {artisans.length > 0 ? (
              artisans.map((art) => (
                <tr key={art.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          art.avatarUrl ||
                          'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=80&auto=format&fit=crop&q=80'
                        }
                        alt={art.fullName}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <p className="font-extrabold text-slate-900">{art.fullName}</p>
                        <p className="text-[11px] text-slate-400">{art.email || 'Email n/a'}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-800">{art.tradeName}</span>
                    <p className="text-[11px] text-slate-400">
                      {art.yearsOfExperience || 1} ans d'exp.
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-800">{art.wilaya}</span>
                    <p className="text-[11px] text-slate-400">{art.commune}</p>
                  </td>

                  <td className="px-4 py-3 font-semibold text-slate-700">{art.phone}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                        art.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : art.status === 'pending'
                          ? 'bg-amber-100 text-amber-900 animate-pulse'
                          : art.status === 'under_review'
                          ? 'bg-blue-100 text-blue-800'
                          : art.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {art.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {art.status !== 'approved' && (
                        <button
                          onClick={() => onOpenStatusModal(art, 'approved')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer shadow-xs"
                          title="Approuver l'artisan"
                        >
                          Approuver
                        </button>
                      )}

                      {art.status !== 'under_review' && art.status === 'pending' && (
                        <button
                          onClick={() => onOpenStatusModal(art, 'under_review')}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] cursor-pointer"
                        >
                          En Examen
                        </button>
                      )}

                      {art.status === 'approved' && (
                        <button
                          onClick={() => onOpenStatusModal(art, 'suspended')}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] cursor-pointer"
                        >
                          Suspendre
                        </button>
                      )}

                      {art.status !== 'rejected' && art.status !== 'blocked' && (
                        <button
                          onClick={() => onOpenStatusModal(art, 'rejected')}
                          className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] cursor-pointer"
                        >
                          Rejeter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400 italic">
                  Aucun artisan trouvé avec ces critères
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
