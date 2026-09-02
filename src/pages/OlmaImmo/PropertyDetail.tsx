import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { OlmaImmoNavbar } from '../../components/OlmaImmo/OlmaImmoNavbar';
import { OlmaImmoBottomNav } from '../../components/OlmaImmo/OlmaImmoBottomNav';
import { ImageGalleryLightbox } from '../../components/OlmaImmo/ImageGalleryLightbox';
import { VisitRequestModal } from '../../components/OlmaImmo/VisitRequestModal';
import { BookingRequestModal } from '../../components/OlmaImmo/BookingRequestModal';
import { UnifiedMessagingDrawer } from '../../components/Chat/UnifiedMessagingDrawer';
import { Property, PublicOwnerProfile } from '../../types/realEstate';
import { apiGet } from '../../lib/api';
import { isFavoritePropertyId, toggleFavoritePropertyId } from '../../utils/realEstateFavorites';
import toast from 'react-hot-toast';
import { Building2, ArrowLeft } from 'lucide-react';

import { DetailHeader } from '../../components/OlmaImmo/PropertyDetail/DetailHeader';
import { DetailGallery } from '../../components/OlmaImmo/PropertyDetail/DetailGallery';
import { DetailSpecs } from '../../components/OlmaImmo/PropertyDetail/DetailSpecs';
import { DetailDescription } from '../../components/OlmaImmo/PropertyDetail/DetailDescription';
import { DetailLocation } from '../../components/OlmaImmo/PropertyDetail/DetailLocation';
import { DetailSidebar } from '../../components/OlmaImmo/PropertyDetail/DetailSidebar';
import { DetailSimilar } from '../../components/OlmaImmo/PropertyDetail/DetailSimilar';

export const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);

  // Owner State
  const [ownerProfile, setOwnerProfile] = useState<PublicOwnerProfile | null>(null);
  const [isOwnerLoading, setIsOwnerLoading] = useState(false);
  const [ownerError, setOwnerError] = useState(false);

  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Modal states
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDirectChatOpen, setIsDirectChatOpen] = useState(false);

  // Short-Term Booking selection
  const [bookingSummary, setBookingSummary] = useState({
    startDate: '',
    endDate: '',
    totalNights: 0,
    guests: { adults: 2, children: 1 },
    subtotal: 0,
    cleaningFee: 10000,
    serviceFee: 5000,
    totalPriceDZD: 0,
  });

  useEffect(() => {
    if (!id) return;

    const fetchPropertyData = async () => {
      setIsLoading(true);
      try {
        const response = await apiGet<{ success: boolean; data?: Property }>(
          `/api/v1/real-estate/properties/${id}`
        );

        if (response.success && response.data) {
          setProperty(response.data);
          setIsFav(isFavoritePropertyId(response.data.id));

          setIsOwnerLoading(true);
          setOwnerError(false);
          apiGet<{ success: boolean; data?: PublicOwnerProfile }>(
            `/api/v1/real-estate/properties/${response.data.id}/owner`
          ).then((res) => {
            if (res.success && res.data) setOwnerProfile(res.data);
            else setOwnerError(true);
          }).catch(() => setOwnerError(true))
            .finally(() => setIsOwnerLoading(false));

          try {
            const similarRes = await apiGet<{ success: boolean; data?: Property[] }>(
              `/api/v1/real-estate/properties/${response.data.id}/similar`
            );
            if (similarRes.success && similarRes.data) {
              setSimilarProperties(similarRes.data);
            }
          } catch {
            // Non-blocking fallback
          }
        } else {
          toast.error('Annonce introuvable');
        }
      } catch {
        toast.error("Erreur lors du chargement de l'annonce");
      } finally {
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    fetchPropertyData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col font-sans">
        <OlmaImmoNavbar />
        <div className="max-w-7xl mx-auto px-4 py-12 flex-1 w-full animate-pulse space-y-6">
          <div className="h-10 bg-slate-200/80 rounded-2xl w-1/4" />
          <div className="h-96 bg-slate-200/80 rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-64 bg-slate-200/80 rounded-3xl" />
            <div className="h-64 bg-slate-200/80 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col font-sans">
        <OlmaImmoNavbar />
        <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4 flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-3xl bg-[#f4ecd8] text-[#1a3831] flex items-center justify-center mb-2 border border-[#e8e2d4]">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#1a3831] font-['Playfair_Display',serif]">Annonce introuvable</h2>
          <p className="text-sm text-slate-600">Cette annonce n'existe plus ou a été retirée par son annonceur.</p>
          <Link
            to="/immo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a3831] hover:bg-[#122b24] text-[#ebdcb8] rounded-xl text-xs font-bold transition shadow-xs cursor-pointer mt-2 uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explorer les annonces</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleFavoriteClick = () => {
    const updated = toggleFavoritePropertyId(property.id);
    setIsFav(updated);
    toast.success(updated ? 'Ajouté à vos favoris' : 'Retiré des favoris');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `${property.title} - ${property.location.wilaya} sur Olma Immo`,
        url: window.location.href,
      }).catch((err: unknown) => {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.warn('[OlmaImmo Share] Share error:', err.message);
        }
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien de l'annonce copié !");
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col font-sans pb-24 md:pb-12">
      <OlmaImmoNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-8">
        <DetailHeader
          property={property}
          isFav={isFav}
          onFavoriteClick={handleFavoriteClick}
          onShare={handleShare}
        />

        <DetailGallery
          images={property.images || []}
          title={property.title}
          selectedImageIndex={selectedImageIndex}
          onSelectImage={setSelectedImageIndex}
          onOpenLightbox={() => setIsLightboxOpen(true)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <DetailSpecs property={property} />
            <DetailDescription property={property} />
            <DetailLocation
              location={property.location}
              title={property.title}
              price={property.price}
            />
          </div>

          <div className="lg:col-span-4">
            <DetailSidebar
              property={property}
              ownerProfile={ownerProfile}
              isOwnerLoading={isOwnerLoading}
              ownerError={ownerError}
              onOpenVisitModal={() => setIsVisitModalOpen(true)}
              onOpenBookingModal={() => setIsBookingModalOpen(true)}
              onOpenDirectChat={() => setIsDirectChatOpen(true)}
              onBookingSummaryChange={setBookingSummary}
            />
          </div>
        </div>

        <DetailSimilar similarProperties={similarProperties} />
      </main>

      <OlmaImmoBottomNav />

      {/* Lightbox Modal */}
      <ImageGalleryLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={property.images || []}
        currentIndex={selectedImageIndex}
        onIndexChange={setSelectedImageIndex}
        title={property.title}
      />

      {/* Visit Modal */}
      <VisitRequestModal
        propertyId={property.id}
        propertyTitle={property.title}
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
      />

      {/* Booking Modal */}
      <BookingRequestModal
        propertyId={property.id}
        propertyTitle={property.title}
        propertyLocation={`${property.location.commune}, ${property.location.wilaya}`}
        propertyImage={property.images?.[0] || ''}
        ownerId={property.ownerId}
        bookingSummary={bookingSummary}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />

      {/* Unified Messaging Drawer */}
      {isDirectChatOpen && (
        <UnifiedMessagingDrawer
          isOpen={isDirectChatOpen}
          onClose={() => setIsDirectChatOpen(false)}
          initialContext={{
            type: 'REAL_ESTATE_INQUIRY',
            recipientId: property.ownerId,
            context: {
              propertyId: property.id,
              referenceTitle: property.title,
              referenceImageUrl: property.images?.[0],
              referencePriceDZD: property.price,
            },
            initialMessage: `Bonjour, je suis intéressé par votre annonce "${property.title}".`,
          }}
        />
      )}
    </div>
  );
};
