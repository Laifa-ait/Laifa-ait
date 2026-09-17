import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight, Eye, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiGet } from '../../lib/api';
import { Booking, PropertyVisit } from '../../types/realEstate';
import { ProfileStayCard, UnifiedStayItem } from './ProfileStayCard';

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

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-[#1E3A8A] font-['Playfair_Display',serif]">
            Mes Séjours & Visites
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Suivez en direct vos réservations de séjours et vos rendez-vous de visite programmés
          </p>
        </div>

        {/* Action button to full manager & Filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/immo/my-bookings"
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1E3A8A] text-white hover:bg-blue-900 transition inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Gérer mes séjours</span>
          </Link>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('stay')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filter === 'stay' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Séjours
            </button>
            <button
              type="button"
              onClick={() => setFilter('visit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filter === 'visit' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Visites
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-500 font-bold flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#1E3A8A]" />
          <span>Chargement de vos séjours et visites...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-[#1E3A8A] flex items-center justify-center mx-auto border border-slate-200">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Aucune réservation pour le moment</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Découvrez nos villas, appartements et résidences disponibles à la location ou à la vente partout en Algérie.
          </p>
          <Link
            to="/immo"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-900 shadow-xs transition mt-2"
          >
            <span>Explorer les biens</span>
            <ArrowRight className="w-4 h-4 text-[#F59E0B]" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <ProfileStayCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};
