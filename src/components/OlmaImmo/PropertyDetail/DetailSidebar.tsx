import React from 'react';
import { Calendar, Phone, MessageSquare } from 'lucide-react';
import { Property, PublicOwnerProfile } from '../../../types/realEstate';
import { OwnerTrustCard } from '../OwnerTrustCard';
import { ShortTermBookingCalendar } from '../ShortTermBookingCalendar';
import { PropertyPrice } from '../primitives/PropertyPrice';

export interface BookingSummaryData {
  startDate: string;
  endDate: string;
  totalNights: number;
  guests: { adults: number; children: number };
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  totalPriceDZD: number;
  [key: string]: unknown;
}

interface DetailSidebarProps {
  property: Property;
  ownerProfile: PublicOwnerProfile | null;
  isOwnerLoading: boolean;
  ownerError: boolean;
  onOpenVisitModal: () => void;
  onOpenBookingModal: () => void;
  onOpenDirectChat: () => void;
  onBookingSummaryChange: (summary: BookingSummaryData) => void;
}

export const DetailSidebar: React.FC<DetailSidebarProps> = ({
  property,
  ownerProfile,
  isOwnerLoading,
  ownerError,
  onOpenVisitModal,
  onOpenBookingModal,
  onOpenDirectChat,
  onBookingSummaryChange,
}) => {
  const isShortTerm = property.listingType === 'rent_short' || (property.listingType as string) === 'short_term';

  return (
    <div className="space-y-6 sticky top-24">
      {/* Short Term Booking Widget */}
      {isShortTerm ? (
        <div className="bg-white rounded-3xl p-6 border border-[#e8e2d4] shadow-md space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#f0eae0]">
            <PropertyPrice
              price={property.price}
              period="night"
              listingType={property.listingType}
              size="lg"
              variant="mineral"
            />
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-full border border-emerald-200">
              Réservation directe
            </span>
          </div>

          <ShortTermBookingCalendar
            propertyId={property.id}
            nightlyPrice={property.price}
            cleaningFee={property.cleaningFee || 10000}
            serviceFee={property.serviceFee || 5000}
            onSelectBooking={onBookingSummaryChange}
          />

          <button
            type="button"
            onClick={onOpenBookingModal}
            className="w-full py-4 px-6 bg-[#1a3831] hover:bg-[#122b24] text-[#ebdcb8] font-bold text-xs rounded-2xl uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Calendar className="w-4 h-4 text-[#ebdcb8]" />
            <span>Demande de réservation</span>
          </button>

          <p className="text-[11px] text-stone-500 text-center font-medium">
            Règlement direct lors de l'arrivée ou selon accord avec l'hôte. Aucun prélèvement bancaire en ligne sur Olmart.
          </p>
        </div>
      ) : (
        /* Buy / Long Rent Action Card */
        <div className="bg-white rounded-3xl p-6 border border-[#e8e2d4] shadow-md space-y-4">
          <div className="space-y-1 pb-4 border-b border-[#f0eae0]">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
              Mise en relation directe
            </span>
            <div>
              <PropertyPrice
                price={property.price}
                period={property.pricePeriod}
                listingType={property.listingType}
                size="lg"
                variant="mineral"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenVisitModal}
            className="w-full py-3.5 px-5 bg-[#1a3831] hover:bg-[#122b24] text-[#ebdcb8] font-bold text-xs rounded-2xl uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Calendar className="w-4 h-4 text-[#ebdcb8]" />
            <span>Planifier une visite</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            {property.contactPhone ? (
              <a
                href={`tel:${property.contactPhone}`}
                className="py-3 px-3 bg-[#f4ecd8] hover:bg-[#ebdcb8] text-[#1a3831] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-[#e8e2d4] transition text-center"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Appeler</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={onOpenDirectChat}
                className="py-3 px-3 bg-[#f4ecd8] hover:bg-[#ebdcb8] text-[#1a3831] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-[#e8e2d4] transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenDirectChat}
              className="py-3 px-3 bg-[#faf8f5] hover:bg-[#f0eae0] text-[#1a3831] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-[#e8e2d4] transition cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Message Olmart</span>
            </button>
          </div>

          <p className="text-[11px] text-stone-500 text-center font-medium pt-1">
            Les transactions immobilières s'effectuent par acte notarié ou bail légal. Olmart ne perçoit aucun paiement de loyer ou de vente en ligne.
          </p>
        </div>
      )}

      {/* Owner / Host Profile Card */}
      <OwnerTrustCard
        owner={ownerProfile}
        isLoading={isOwnerLoading}
        error={ownerError}
      />
    </div>
  );
};
