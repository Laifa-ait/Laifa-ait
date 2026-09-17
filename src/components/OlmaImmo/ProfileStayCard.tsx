import React from 'react';
import { MapPin, Building2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface UnifiedStayItem {
  id: string;
  propertyId: string;
  propertyTitle: string;
  wilaya: string;
  commune: string;
  type: 'stay' | 'visit';
  date: string;
  status: string;
  price?: number;
  imageUrl?: string;
}

interface ProfileStayCardProps {
  item: UnifiedStayItem;
}

export const ProfileStayCard: React.FC<ProfileStayCardProps> = ({ item }) => {
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmé</span>
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700">
            <Clock className="w-3.5 h-3.5" />
            <span>En attente</span>
          </span>
        );
      case 'cancelled':
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Annulé</span>
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold text-stone-600 capitalize">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-4 rounded-2xl border border-stone-200 hover:border-emerald-300 bg-stone-50/50 hover:bg-white transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4 group">
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.propertyTitle}
          className="w-full sm:w-28 h-24 rounded-xl object-cover shrink-0 border border-stone-200"
        />
      ) : (
        <div className="w-full sm:w-28 h-24 rounded-xl bg-stone-200 flex items-center justify-center text-stone-400 shrink-0">
          <Building2 className="w-8 h-8" />
        </div>
      )}

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
              item.type === 'stay'
                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
            }`}
          >
            {item.type === 'stay' ? 'Séjour Vacances' : 'Rendez-vous Visite'}
          </span>
          {renderStatusBadge(item.status)}
        </div>

        <Link
          to={`/immo/property/${item.propertyId}`}
          className="text-sm font-bold text-stone-900 group-hover:text-emerald-900 truncate block hover:underline"
        >
          {item.propertyTitle}
        </Link>

        <div className="flex items-center gap-3 text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>{item.commune ? `${item.commune}, ` : ''}{item.wilaya}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>{item.date}</span>
          </span>
        </div>
      </div>

      {typeof item.price === 'number' && (
        <div className="text-right sm:border-l sm:border-stone-200 sm:pl-4 self-end sm:self-center">
          <p className="text-[10px] text-stone-400 font-bold uppercase">Montant</p>
          <p className="text-sm font-bold text-[#1E3A8A]">{item.price.toLocaleString()} DZD</p>
        </div>
      )}
    </div>
  );
};
