import React from 'react';
import {
  MapPin,
  Phone,
  MessageCircle,
  Calendar,
  DollarSign,
  User,
} from 'lucide-react';
import { ArtisanJobBroadcast } from '../../../types/artisan';

interface ArtisanBroadcastItemCardProps {
  broadcast: ArtisanJobBroadcast;
  isRegisteredTrade?: boolean;
  onStatusChange?: (id: string, newStatus: ArtisanJobBroadcast['status']) => void;
}

export const ArtisanBroadcastItemCard: React.FC<ArtisanBroadcastItemCardProps> = ({
  broadcast,
  isRegisteredTrade,
  onStatusChange: _onStatusChange,
}) => {
  const cleanPhone = broadcast.clientPhone.replace(/\D/g, '');
  const waPhone = cleanPhone.startsWith('0') ? `213${cleanPhone.slice(1)}` : cleanPhone;

  const getUrgencyConfig = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return {
          label: '🔴 Urgent (24h)',
          badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
        };
      case 'flexible':
        return {
          label: '🟢 Flexible',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      default:
        return {
          label: '🟡 Standard (48h)',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
        };
    }
  };

  const urgencyConfig = getUrgencyConfig(broadcast.urgency);

  return (
    <div className={`p-4 sm:p-5 rounded-3xl bg-white border transition-all duration-300 shadow-2xs hover:shadow-lg space-y-3.5 ${
      isRegisteredTrade ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200/90'
    }`}>
      {/* Top Meta Line */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-900 text-white">
            {broadcast.tradeName}
          </span>
          {isRegisteredTrade && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
              Votre Métier
            </span>
          )}
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${urgencyConfig.badgeClass}`}>
            {urgencyConfig.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>{new Date(broadcast.createdAt).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'short' })}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-1.5">
        <h3 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">
          {broadcast.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {broadcast.description}
        </p>
      </div>

      {/* Location & Budget Row */}
      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-xl font-medium">
          <MapPin className="w-3.5 h-3.5 text-amber-600" />
          <span>{broadcast.commune}, {broadcast.wilaya}</span>
        </div>

        {broadcast.estimatedBudget ? (
          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-xl font-black">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>Budget indicatif : {broadcast.estimatedBudget.toLocaleString()} DZD</span>
          </div>
        ) : (
          <span className="text-slate-400 italic text-[11px]">Tarif à convenir sur devis</span>
        )}
      </div>

      {/* Client Info & CTA Direct Contact */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4 text-slate-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">{broadcast.clientName}</p>
            <p className="text-[11px] text-slate-400">Client demandeur</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${broadcast.clientPhone}`}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Appeler {broadcast.clientPhone}</span>
          </a>

          <a
            href={`https://wa.me/${waPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xs transition-colors flex items-center justify-center"
            title="Contacter sur WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
