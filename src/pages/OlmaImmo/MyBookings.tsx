import React, { useState, useEffect } from 'react';
import { OlmaImmoNavbar } from '../../components/OlmaImmo/OlmaImmoNavbar';
import { OlmaImmoBottomNav } from '../../components/OlmaImmo/OlmaImmoBottomNav';
import { UnifiedMessagingDrawer } from '../../components/Chat/UnifiedMessagingDrawer';
import { Booking } from '../../types/realEstate';
import { apiGet, apiPut } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Palmtree, UserX, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

import { BookingCard } from '../../components/OlmaImmo/Bookings/BookingCard';
import { BookingFilterTabs } from '../../components/OlmaImmo/Bookings/BookingFilterTabs';
import { BookingEmptyState } from '../../components/OlmaImmo/Bookings/BookingEmptyState';

export const MyBookings: React.FC = () => {
  const { currentUser, authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const [activeChatContext, setActiveChatContext] = useState<{
    propertyId: string;
    propertyTitle: string;
    ownerId?: string;
  } | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    const fetchMyBookings = async () => {
      setIsLoading(true);
      try {
        const res = await apiGet<{ success: boolean; data?: Booking[] }>('/api/v1/real-estate/my-bookings');
        if (res.success && res.data) {
          setBookings(res.data);
        }
      } catch {
        toast.error('Impossible de charger vos réservations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyBookings();
  }, [currentUser, authLoading]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Voulez-vous vraiment annuler cette réservation ?')) return;

    try {
      const res = await apiPut<{ success: boolean }>(`/api/v1/real-estate/bookings/${bookingId}/status`, {
        status: 'cancelled',
      });
      if (res.success) {
        toast.success('Réservation annulée');
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b)));
      }
    } catch {
      toast.error("Erreur lors de l'annulation");
    }
  };

  const handleOpenChat = (booking: Booking) => {
    setActiveChatContext({
      propertyId: booking.propertyId,
      propertyTitle: booking.propertyTitle || 'Hébergement',
      ownerId: booking.ownerId,
    });
    setIsChatOpen(true);
  };

  if (!currentUser && !authLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col font-sans">
        <OlmaImmoNavbar />
        <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4 flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-[#f4ecd8] text-[#1a3831] flex items-center justify-center mb-2 border border-[#ebdcb8]">
            <UserX className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#1a3831] font-['Playfair_Display',serif]">
            Connexion requise
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Veuillez vous connecter à votre compte Olmart pour retrouver vos réservations de séjours et locations.
          </p>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('auth:openModal', { detail: { mode: 'login' } }))}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#1a3831] hover:bg-[#122b24] text-[#ebdcb8] font-bold text-xs rounded-xl uppercase tracking-wider transition shadow-md cursor-pointer mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Se connecter / S'inscrire</span>
          </button>
        </div>
        <OlmaImmoBottomNav />
      </div>
    );
  }

  const counts = {
    all: bookings.length,
    upcoming: bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled' || b.status === 'rejected').length,
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return b.status === 'confirmed' || b.status === 'pending';
    if (activeTab === 'completed') return b.status === 'completed';
    if (activeTab === 'cancelled') return b.status === 'cancelled' || b.status === 'rejected';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col font-sans pb-24 md:pb-12">
      <OlmaImmoNavbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a3831] uppercase tracking-wider">
            <Palmtree className="w-4 h-4" />
            <span>Séjours & Vacances</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a3831] font-['Playfair_Display',serif]">
            Mes Réservations de Séjours
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Retrouvez l'historique et le suivi de vos locations vacances à travers l'Algérie.
          </p>
        </div>

        <BookingFilterTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

        {isLoading ? (
          <div className="space-y-4 animate-pulse py-8">
            <div className="h-44 bg-slate-200/80 rounded-3xl" />
            <div className="h-44 bg-slate-200/80 rounded-3xl" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <BookingEmptyState activeTab={activeTab} />
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onOpenChat={handleOpenChat}
                onCancelBooking={handleCancelBooking}
              />
            ))}
          </div>
        )}
      </main>

      <OlmaImmoBottomNav />

      {isChatOpen && activeChatContext && (
        <UnifiedMessagingDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          initialContext={activeChatContext}
        />
      )}
    </div>
  );
};
