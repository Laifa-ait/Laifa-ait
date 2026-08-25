import React from 'react';
import { VisitRequest, VisitStatus } from '../../../types/realEstate';
import { Calendar, Clock, User, Phone, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

interface OwnerVisitsListProps {
  visits: VisitRequest[];
  isLoading: boolean;
  onUpdateStatus: (visitId: string, status: VisitStatus) => void;
  onOpenChat: (visit: VisitRequest) => void;
}

export const OwnerVisitsList: React.FC<OwnerVisitsListProps> = ({
  visits,
  isLoading,
  onUpdateStatus,
  onOpenChat,
}) => {
  const getStatusBadge = (status: VisitStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-[11px] font-bold rounded-full border border-amber-200">En attente de confirmation</span>;
      case 'accepted':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-200">Visite confirmée</span>;
      case 'declined':
        return <span className="px-2.5 py-1 bg-rose-50 text-rose-800 text-[11px] font-bold rounded-full border border-rose-200">Refusée</span>;
      case 'completed':
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-800 text-[11px] font-bold rounded-full border border-blue-200">Visite effectuée</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-full capitalize">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e2d4] shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-[#f0eae0] pb-4">
        <div>
          <h3 className="text-xl font-bold text-[#1a3831] font-['Playfair_Display',serif]">
            Demandes de visites reçues
          </h3>
          <p className="text-xs text-slate-500">
            Validez les créneaux proposés par les acquéreurs et locataires intéressés.
          </p>
        </div>
        <span className="px-3 py-1 bg-[#f4ecd8] text-[#1a3831] font-bold text-xs rounded-full">
          {visits.length} demandes
        </span>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-500 font-bold animate-pulse">
          Chargement des visites...
        </div>
      ) : visits.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#f4ecd8] text-[#1a3831] flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-[#1a3831]">Aucune demande de visite pour le moment</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Dès qu'un client planifie une visite sur l'une de vos annonces, elle apparaîtra ici.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visits.map((visit) => (
            <div
              key={visit.id}
              className="p-5 rounded-2xl bg-[#faf8f5] border border-[#e8e2d4] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusBadge(visit.status)}
                  <span className="text-xs font-bold text-[#1a3831]">{visit.propertyTitle || 'Bien immobilier'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#1a3831]" />
                    <span>Date: {visit.preferredDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#1a3831]" />
                    <span>Créneau: {visit.timeSlot || 'Après-midi'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5 text-[#1a3831]" />
                    <span>Demandeur: {visit.visitorName}</span>
                  </div>
                </div>

                {visit.visitorNotes && (
                  <p className="text-xs text-slate-500 italic bg-white p-2.5 rounded-xl border border-[#f0eae0]">
                    "{visit.visitorNotes}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#e8e2d4]">
                <button
                  type="button"
                  onClick={() => onOpenChat(visit)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-[#e8e2d4] text-[#1a3831] rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Messagerie</span>
                </button>

                {visit.visitorPhone && (
                  <a
                    href={`tel:${visit.visitorPhone}`}
                    className="p-2 bg-[#f4ecd8] border border-[#ebdcb8] text-[#1a3831] rounded-xl hover:bg-[#ebdcb8] transition flex items-center justify-center"
                    title="Appeler le visiteur"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}

                {visit.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(visit.id, 'accepted')}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Accepter</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(visit.id, 'declined')}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Refuser</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
