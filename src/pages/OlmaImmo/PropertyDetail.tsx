import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { OlmaImmoNavbar } from '../../components/OlmaImmo/OlmaImmoNavbar';
import { OlmaImmoBottomNav } from '../../components/OlmaImmo/OlmaImmoBottomNav';
import { Property } from '../../types/realEstate';
import { apiGet } from '../../lib/api';
import { VisitRequestModal } from '../../components/OlmaImmo/VisitRequestModal';
import { BookingRequestModal } from '../../components/OlmaImmo/BookingRequestModal';
import { InteractiveMap } from '../../components/OlmaImmo/InteractiveMap';
import { UnifiedMessagingDrawer } from '../../components/Chat/UnifiedMessagingDrawer';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Phone,
  MessageSquare,
  Calendar,
  Eye,
  CheckCircle,
  Building2,
  Share2,
  Heart
} from 'lucide-react';
import { isFavoritePropertyId, toggleFavoritePropertyId } from '../../utils/realEstateFavorites';
import toast from 'react-hot-toast';

export const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, openAuthModal } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDirectChatOpen, setIsDirectChatOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchPropertyDetail = async () => {
      setIsLoading(true);
      try {
        const response = await apiGet<{ success: boolean; data?: Property }>(
          `/api/v1/real-estate/properties/${id}`
        );
        if (response.success && response.data) {
          setProperty(response.data);
          setIsFav(isFavoritePropertyId(response.data.id));
        } else {
          toast.error('Annonce introuvable ou indisponible');
        }
      } catch (err) {
        console.error('Error fetching property detail:', err);
        toast.error('Erreur lors du chargement de l\'annonce');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertyDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <OlmaImmoNavbar />
        <div className="max-w-5xl mx-auto px-4 py-12 flex-1 w-full animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded-xl w-1/3" />
          <div className="h-96 bg-slate-200 rounded-3xl" />
          <div className="h-24 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <OlmaImmoNavbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Annonce introuvable</h2>
          <p className="text-xs text-slate-500">Cette annonce n'existe plus ou a été retirée par son propriétaire.</p>
          <Link
            to="/immo"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Retourner aux recherches
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
        text: `${property.title} - ${property.location.wilaya}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papier !');
    }
  };

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'];

  const formatPrice = (price: number, period?: string) => {
    const formatted = new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(price);
    let suffix = '';
    if (period === 'night') suffix = ' / nuit';
    else if (period === 'month') suffix = ' / mois';
    return `${formatted} DA${suffix}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-16">
      <OlmaImmoNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/immo"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-800 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-2xs transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux annonces
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Partager"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleFavoriteClick}
              className="p-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Favoris"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Header Title & Pricing Banner */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-3 py-1 bg-emerald-700 text-white font-bold text-xs rounded-full uppercase tracking-wider">
                {property.listingType === 'sale' ? 'Vente' : property.listingType === 'rent_long' ? 'Location' : 'Séjour'}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-800 font-semibold text-xs rounded-full">
                {property.propertyType}
              </span>
              <span className="px-2.5 py-1 bg-slate-50 text-slate-500 text-xs rounded-full flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {property.viewsCount || 1} vues
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900">{property.title}</h1>

            <div className="flex items-center text-slate-600 text-xs sm:text-sm mt-2">
              <MapPin className="w-4 h-4 me-1 text-emerald-600 shrink-0" />
              <span>
                {property.location.address}, {property.location.commune}, Wilaya de {property.location.wilaya}
              </span>
            </div>
          </div>

          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-lg shrink-0 text-center md:text-end">
            <span className="block text-[11px] text-slate-400 uppercase font-bold tracking-wider">Prix demandé</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {formatPrice(property.price, property.pricePeriod)}
            </span>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="space-y-3">
          <div className="aspect-[16/9] sm:aspect-[21/9] bg-slate-900 rounded-3xl overflow-hidden shadow-md relative">
            <img
              src={images[selectedImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover transition-all duration-300"
            />
          </div>

          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    selectedImageIndex === idx ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Main Information Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Key Specs Bar */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <Bed className="w-5 h-5 text-emerald-600 mx-auto" />
                <span className="block text-xs text-slate-500">Pièces</span>
                <span className="font-extrabold text-slate-900 text-base">F{property.rooms}</span>
              </div>

              <div className="space-y-1 border-x border-slate-100">
                <Maximize className="w-5 h-5 text-emerald-600 mx-auto" />
                <span className="block text-xs text-slate-500">Superficie</span>
                <span className="font-extrabold text-slate-900 text-base">{property.areaSquareMeters} m²</span>
              </div>

              <div className="space-y-1">
                <Bath className="w-5 h-5 text-emerald-600 mx-auto" />
                <span className="block text-xs text-slate-500">Salles de bain</span>
                <span className="font-extrabold text-slate-900 text-base">{property.bathrooms || 1}</span>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-3">
              <h2 className="text-lg font-bold text-slate-900">Description du bien</h2>
              <p className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Features / Amenities */}
            {property.features && property.features.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-3">
                <h2 className="text-lg font-bold text-slate-900">Équipements & Atouts</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Map Container */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-3">
              <h2 className="text-lg font-bold text-slate-900">Localisation</h2>
              <InteractiveMap
                properties={[
                  {
                    id: property.id,
                    title: property.title,
                    lat: property.location.lat,
                    lng: property.location.lng,
                    price: property.price,
                    pricePeriod: property.pricePeriod,
                    listingType: property.listingType,
                    propertyType: property.propertyType,
                    commune: property.location.commune,
                    wilaya: property.location.wilaya,
                    mainImage: property.images?.[0] || '',
                    rooms: property.rooms,
                    areaSquareMeters: property.areaSquareMeters,
                  },
                ]}
                centerLat={property.location.lat}
                centerLng={property.location.lng}
                zoom={14}
                className="w-full h-80"
              />
            </div>
          </div>

          {/* Right Action Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-md space-y-4 sticky top-20">
              <h3 className="font-bold text-slate-900 text-base">Contact & Action</h3>

              {/* Visit Request Modal Trigger */}
              <button
                onClick={() => setIsVisitModalOpen(true)}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-800 hover:to-teal-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <Calendar className="w-4 h-4" />
                <span>Demander une visite</span>
              </button>

              {/* Direct Messaging & Negotiation Trigger */}
              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    if (openAuthModal) openAuthModal();
                    else navigate('/auth');
                    return;
                  }
                  setIsDirectChatOpen(true);
                }}
                className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-800/20 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <MessageSquare className="w-4 h-4 text-emerald-300" />
                <span>Messagerie & Négocier le prix</span>
              </button>

              {/* Short Term Booking Trigger */}
              {property.listingType === 'rent_short' && (
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Réserver un séjour</span>
                </button>
              )}

              <hr className="border-slate-100" />

              <div className="space-y-2">
                <a
                  href={`tel:0550000000`}
                  className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Phone className="w-4 h-4 text-emerald-700" />
                  <span>Appeler le propriétaire</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Action Modals */}
      <VisitRequestModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        propertyId={property.id}
        propertyTitle={property.title}
      />

      <BookingRequestModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        propertyId={property.id}
        propertyTitle={property.title}
        pricePerNight={property.price}
      />

      {/* Unified Messaging Drawer with initial context */}
      {isDirectChatOpen && property && (
        <UnifiedMessagingDrawer
          isOpen={isDirectChatOpen}
          onClose={() => setIsDirectChatOpen(false)}
          initialContext={{
            type: 'REAL_ESTATE_INQUIRY',
            recipientId: property.ownerId || '',
            context: {
              propertyId: property.id
            },
            initialMessage: ''
          }}
        />
      )}

      <OlmaImmoBottomNav />
    </div>
  );
};
