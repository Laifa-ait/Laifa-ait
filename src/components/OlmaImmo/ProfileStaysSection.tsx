import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Building2, Clock, CheckCircle2, ArrowRight, Eye, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiGet } from '../../lib/api';
import { Booking, PropertyVisit } from '../../types/realEstate';

interface UnifiedStayItem {
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

export const ProfileStaysSection: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'stay' | 'visit'>('all');
  const [items, setItems] = useState<UnifiedStayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStaysAndVisits = async () => {
      setIsLoading(true);
      try {
        const [bookingsRes, visitsRes] = await Promise.allSettled([
          apiGet<{ success: boolean; data?: Booking[] }>('/api/v1/real-estate/my-bookings'),
          apiGet<{ success: boolean; data?: PropertyVisit[] }>('/api/v1/real-estate/my-visits'),
        ]);

        const unified: UnifiedStayItem[] = [];

        if (bookingsRes.status === 'fulfilled' && bookingsRes.value?.success && Array.isArray(bookingsRes.value.data)) {
          bookingsRes.value.data.forEach((b) => {
            unified.push({
              id: b.id,
              propertyId: b.propertyId,
              propertyTitle: b.propertyTitle || 'Hébergement Vacances',
              wilaya: b.propertyWilaya || 'Algérie',
              commune: b.propertyCommune || '',
              type: 'stay',
              date: `${b.startDate} → ${b.endDate}`,
              status: b.status,
              price: b.totalPriceDZD,
              imageUrl: b.propertyImage,
            });
          });
        }

        if (visitsRes.status === 'fulfilled' && visitsRes.value?.success && Array.isArray(visitsRes.value.data)) {
          visitsRes.value.data.forEach((v) => {
            unified.push({
              id: v.id,
              propertyId: v.propertyId,
              propertyTitle: 'Demande de visite',
              wilaya: 'Algérie',
              commune: '',
              type: 'visit',
              date: `${v.preferredDate}${v.timeSlot ? ` (${v.timeSlot})` : ''}`,
              status: v.status,
              price: undefined,
            });
          });
        }

        if (isMounted) {
          setItems(unified);
        }
      } catch {
        if (isMounted) {
          setItems([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchStaysAndVisits();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const getStatusBadge = (status: string) => {
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
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e2d4] shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-bold text-[#1a3831] font-['Playfair_Display',serif]">
            Mes Séjours & Visites
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Suivez en direct vos réservations de séjours et vos rendez-vous de visite programmés
          </p>
        </div>

        {/* Action button to full manager & Filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/immo/my-bookings"
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1a3831] text-[#ebdcb8] hover:bg-[#122b24] transition inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Gérer mes séjours</span>
          </Link>

          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filter === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Tous ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('stay')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filter === 'stay' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Séjours
            </button>
            <button
              type="button"
              onClick={() => setFilter('visit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filter === 'visit' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Visites
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-stone-500 font-bold flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#1a3831]" />
          <span>Chargement de vos séjours et visites...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#f4ecd8] text-[#1a3831] flex items-center justify-center mx-auto border border-[#ebdcb8]">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-800">Aucune réservation pour le moment</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Découvrez nos villas, appartements et résidences disponibles à la location ou à la vente partout en Algérie.
          </p>
          <Link
            to="/immo"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a3831] text-[#ebdcb8] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#122b24] shadow-xs transition mt-2"
          >
            <span>Explorer les biens</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-stone-200 hover:border-emerald-300 bg-stone-50/50 hover:bg-white transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4 group"
            >
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
                  {getStatusBadge(item.status)}
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
                  <p className="text-sm font-bold text-[#1a3831]">{item.price.toLocaleString()} DZD</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
