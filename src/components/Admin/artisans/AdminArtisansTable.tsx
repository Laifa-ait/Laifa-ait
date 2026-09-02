import React from 'react';
import { CheckCircle, Clock, AlertTriangle, XCircle, ShieldAlert, Ban, Phone, MapPin } from 'lucide-react';
import { ArtisanProfile, ArtisanStatus } from '../../../types/artisan';

interface AdminArtisansTableProps {
  artisans: ArtisanProfile[];
  onOpenStatusModal: (artisan: ArtisanProfile, targetStatus: ArtisanStatus) => void;
}

export const AdminArtisansTable: React.FC<AdminArtisansTableProps> = ({
  artisans,
  onOpenStatusModal,
}) => {
  const getStatusBadge = (status: ArtisanStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" /> Approuvé
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" /> En attente
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <AlertTriangle className="w-3.5 h-3.5" /> En examen
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
            <XCircle className="w-3.5 h-3.5" /> Refusé
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
            <ShieldAlert className="w-3.5 h-3.5" /> Suspendu
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-white">
            <Ban className="w-3.5 h-3.5" /> Bloqué
          </span>
        );
      default:
        return null;
    }
  };

  if (!artisans || artisans.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
        <p className="text-slate-500 font-medium text-sm">Aucun artisan trouvé avec ces critères.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-black uppercase tracking-wider">
              <th className="p-4">Artisan / Nom Pro</th>
              <th className="p-4">Métier / Exp.</th>
              <th className="p-4">Localisation</th>
              <th className="p-4">Statut</th>
              <th className="p-4 text-right">Actions Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
            {artisans.map((artisan) => (
              <tr key={artisan.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-700 overflow-hidden shrink-0">
                      {artisan.avatarUrl ? (
                        <img loading="lazy" decoding="async" src={artisan.avatarUrl} alt={artisan.fullName} className="w-full h-full object-cover" />
                      ) : (
                        artisan.fullName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{artisan.fullName}</p>
                      {artisan.professionalName && (
                        <p className="text-xs text-slate-500">{artisan.professionalName}</p>
                      )}
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {artisan.phone}</span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  <span className="font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg">
                    {artisan.tradeName}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {artisan.yearsOfExperience} an(s) d'expérience
                  </p>
                </td>

                <td className="p-4">
                  <div className="flex items-center gap-1 text-slate-700 font-bold">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{artisan.wilaya}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{artisan.commune}</p>
                </td>

                <td className="p-4">
                  {getStatusBadge(artisan.status)}
                </td>

                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {artisan.status !== 'approved' && (
                      <button
                        onClick={() => onOpenStatusModal(artisan, 'approved')}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        Approuver
                      </button>
                    )}
                    {artisan.status !== 'under_review' && artisan.status === 'pending' && (
                      <button
                        onClick={() => onOpenStatusModal(artisan, 'under_review')}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        Examiner
                      </button>
                    )}
                    {artisan.status !== 'rejected' && artisan.status !== 'blocked' && (
                      <button
                        onClick={() => onOpenStatusModal(artisan, 'rejected')}
                        className="px-2.5 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Refuser
                      </button>
                    )}
                    {artisan.status === 'approved' && (
                      <button
                        onClick={() => onOpenStatusModal(artisan, 'suspended')}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Suspendre
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
