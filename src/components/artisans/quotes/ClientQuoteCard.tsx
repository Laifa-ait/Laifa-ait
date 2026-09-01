import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  MessageSquare,
  DollarSign,
  ExternalLink,
} from 'lucide-react';
import { ArtisanQuoteRequest } from '../../../types/artisan';

interface ClientQuoteCardProps {
  quote: ArtisanQuoteRequest;
}

export const ClientQuoteCard: React.FC<ClientQuoteCardProps> = ({ quote }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: ArtisanQuoteRequest['status']) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Accepté par l&apos;artisan
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3.5 h-3.5" />
            Décliné
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Prestation Réalisée
          </span>
        );
      case 'responded':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <MessageSquare className="w-3.5 h-3.5" />
            Réponse Reçue
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            En attente de réponse
          </span>
        );
    }
  };

  const formattedDate = new Date(quote.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-all p-5 space-y-4">
      {/* Header with Title and Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-900">
              {quote.serviceTitle || quote.title || 'Demande de devis'}
            </h3>
            {quote.urgency === 'urgent' && (
              <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[10px] font-black uppercase tracking-wider">
                Urgent
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Envoyée le {formattedDate}
          </p>
        </div>

        <div>{getStatusBadge(quote.status)}</div>
      </div>

      {/* Target Artisan & Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Artisan Destinataire
          </span>
          <p className="font-bold text-slate-900 flex items-center justify-between">
            <span>{quote.artisanName || 'Artisan Olmart'}</span>
            <button
              onClick={() => navigate(`/artisans/profile/${quote.artisanId}`)}
              className="text-amber-600 hover:text-amber-700 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>Voir profil</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </p>
          <p className="text-slate-500 text-[11px]">{quote.tradeName || 'Bâtiment & Services'}</p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Lieu de l&apos;intervention
          </span>
          <p className="font-bold text-slate-900 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>{quote.commune}, {quote.wilaya}</span>
          </p>
          {quote.preferredDate && (
            <p className="text-slate-500 text-[11px] flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Date souhaitée : {quote.preferredDate}</span>
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Description des travaux
        </span>
        <p className="text-xs text-slate-700 bg-slate-50/70 p-3 rounded-xl border border-slate-100 leading-relaxed">
          {quote.description}
        </p>
      </div>

      {/* Artisan Response / Budget if exists */}
      {(quote.artisanResponse || quote.estimatedBudget) && (
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5">
          {quote.estimatedBudget && (
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <DollarSign className="w-4 h-4 text-amber-600" />
              <span>Budget estimé : {quote.estimatedBudget.toLocaleString('fr-DZ')} DZD</span>
            </div>
          )}
          {quote.artisanResponse && (
            <div className="text-slate-700 text-[11px]">
              <span className="font-bold text-slate-900">Message de l&apos;artisan : </span>
              <span>{quote.artisanResponse}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
