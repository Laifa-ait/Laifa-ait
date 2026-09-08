import React, { useState, useEffect } from 'react';
import { OlmaImmoShell } from '../../components/OlmaImmo/OlmaImmoShell';
import { UnifiedMessagingDrawer } from '../../components/Chat/UnifiedMessagingDrawer';
import { Property, VisitRequest, Booking, PropertyStatus, VisitStatus, BookingStatus } from '../../types/realEstate';
import { InitiateConversationDTO } from '../../types/messaging';
import { apiGet, apiPut, apiDelete } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

import { OwnerHeaderStats } from '../../components/OlmaImmo/OwnerDashboard/OwnerHeaderStats';
import { OwnerPropertiesList } from '../../components/OlmaImmo/OwnerDashboard/OwnerPropertiesList';
import { OwnerVisitsList } from '../../components/OlmaImmo/OwnerDashboard/OwnerVisitsList';
import { OwnerBookingsList } from '../../components/OlmaImmo/OwnerDashboard/OwnerBookingsList';
import { OwnerProBadge } from '../../components/OlmaImmo/OwnerDashboard/OwnerProBadge';

export const PropertyOwnerDashboard: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'properties' | 'visits' | 'bookings'>('properties');

  const [properties, setProperties] = useState<Property[]>([]);
  const [visits, setVisits] = useState<VisitRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [chatContext, setChatContext] = useState<InitiateConversationDTO | undefined>(undefined);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (!currentUser && !authLoading) {
      setIsLoading(false);
      return;
    }

    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser, authLoading]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [propsRes, visitsRes, bookingsRes] = await Promise.allSettled([
        apiGet<{ success: boolean; data?: Property[] }>('/api/v1/real-estate/owner/properties'),
        apiGet<{ success: boolean; data?: VisitRequest[] }>('/api/v1/real-estate/owner/visits'),
        apiGet<{ success: boolean; data?: Booking[] }>('/api/v1/real-estate/bookings?role=owner'),
      ]);

      if (propsRes.status === 'fulfilled' && propsRes.value?.success && propsRes.value.data) {
        setProperties(propsRes.value.data);
      }
      if (visitsRes.status === 'fulfilled' && visitsRes.value?.success && visitsRes.value.data) {
        setVisits(visitsRes.value.data);
      }
      if (bookingsRes.status === 'fulfilled' && bookingsRes.value?.success && bookingsRes.value.data) {
        setBookings(bookingsRes.value.data);
      }
    } catch {
      toast.error('Impossible de charger les données du tableau de bord');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePropertyStatus = async (propertyId: string, status: PropertyStatus) => {
    try {
      const res = await apiPut<{ success: boolean }>(`/api/v1/real-estate/properties/${propertyId}/status`, { status });
      if (res.success) {
        toast.success(`Statut mis à jour`);
        setProperties((prev) => prev.map((p) => (p.id === propertyId ? { ...p, status } : p)));
      }
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteProperty = async (propertyId: string, title: string) => {
    if (!window.confirm(`Confirmez-vous la suppression définitive de l'annonce "${title}" ?`)) {
      return;
    }

    try {
      const res = await apiDelete<{ success: boolean; message?: string; error?: string }>(
        `/api/v1/real-estate/properties/${propertyId}`
      );
      if (res.success) {
        toast.success('Annonce supprimée avec succès');
        setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      } else {
        toast.error(res.error || 'Erreur lors de la suppression');
      }
    } catch {
      toast.error("Erreur lors de la suppression de l'annonce");
    }
  };

  const handleUpdateVisitStatus = async (visitId: string, status: VisitStatus) => {
    try {
      const res = await apiPut<{ success: boolean }>(`/api/v1/real-estate/visits/${visitId}/status`, { status });
      if (res.success) {
        toast.success(status === 'accepted' ? 'Visite acceptée' : 'Visite refusée');
        setVisits((prev) => prev.map((v) => (v.id === visitId ? { ...v, status } : v)));
      }
    } catch {
      toast.error('Erreur lors de la mise à jour de la visite');
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      const res = await apiPut<{ success: boolean }>(`/api/v1/real-estate/bookings/${bookingId}/status`, { status });
      if (res.success) {
        toast.success(status === 'confirmed' ? 'Réservation acceptée' : 'Réservation refusée');
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));
      }
    } catch {
      toast.error('Erreur lors de la mise à jour de la réservation');
    }
  };

  const totalViews = properties.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
  const totalRevenue = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((acc, b) => acc + (b.totalPriceDZD || 0), 0);

  return (
    <OlmaImmoShell className="py-8 space-y-8">
      <OwnerHeaderStats
        propertiesCount={properties.length}
        totalViews={totalViews}
        visitsCount={visits.length}
        bookingsCount={bookings.length}
        totalRevenueDZD={totalRevenue}
      />

        <OwnerProBadge />

        {/* Tab navigation */}
        <div className="flex items-center gap-2 border-b border-[#e8e2d4] pb-2">
          {[
            { id: 'properties' as const, label: `Mes Annonces (${properties.length})` },
            { id: 'visits' as const, label: `Demandes de Visite (${visits.length})` },
            { id: 'bookings' as const, label: `Réservations Séjours (${bookings.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#1a3831] text-[#ebdcb8] shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-[#e8e2d4]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Tab Content */}
        {activeTab === 'properties' && (
          <OwnerPropertiesList
            properties={properties}
            isLoading={isLoading}
            onUpdateStatus={handleUpdatePropertyStatus}
            onDeleteProperty={handleDeleteProperty}
          />
        )}

        {activeTab === 'visits' && (
          <OwnerVisitsList
            visits={visits}
            isLoading={isLoading}
            onUpdateStatus={handleUpdateVisitStatus}
            onOpenChat={(visit) => {
              if (visit.visitorId) {
                setChatContext({
                  type: 'REAL_ESTATE_INQUIRY',
                  recipientId: visit.visitorId,
                  context: {
                    propertyId: visit.propertyId,
                    referenceTitle: 'Demande de visite',
                  },
                  initialMessage: `Bonjour ${visit.visitorName}, suite à votre demande de visite pour le ${visit.preferredDate} (${visit.timeSlot})...`,
                });
                setIsChatOpen(true);
              }
            }}
          />
        )}

        {activeTab === 'bookings' && (
          <OwnerBookingsList
            bookings={bookings}
            isLoading={isLoading}
            onUpdateStatus={handleUpdateBookingStatus}
            onOpenChat={(booking) => {
              if (booking.tenantId) {
                setChatContext({
                  type: 'REAL_ESTATE_INQUIRY',
                  recipientId: booking.tenantId,
                  context: {
                    propertyId: booking.propertyId,
                    referenceTitle: booking.propertyTitle || 'Réservation',
                    referenceImageUrl: booking.propertyImage,
                    referencePriceDZD: booking.totalPriceDZD,
                  },
                  initialMessage: `Bonjour, concernant votre réservation de séjour du ${booking.startDate} au ${booking.endDate}...`,
                });
                setIsChatOpen(true);
              }
            }}
          />
        )}

        {isChatOpen && (
          <UnifiedMessagingDrawer
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            initialContext={chatContext}
          />
        )}
      </OlmaImmoShell>
    );
  };
