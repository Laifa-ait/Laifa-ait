import React from 'react';
import { Calendar, Phone, MessageSquare, ShieldCheck, Sparkles, Building } from 'lucide-react';
import { Property, PublicOwnerProfile } from '../../../types/realEstate';
import { OwnerTrustCard } from '../OwnerTrustCard';
import { ShortTermBookingCalendar } from '../ShortTermBookingCalendar';

interface DetailSidebarProps {
  property: Property;
  ownerProfile: PublicOwnerProfile | null;
  isOwnerLoading: boolean;
  ownerError: boolean;
  onOpenVisitModal: () => void;
  onOpenBookingModal: () => void;
  onOpenDirectChat: () => void;
  onBookingSummaryChange: (summary: any) => void;
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
  const isShortTerm = property.listingType === 'rent_short';

  return (
    <div className="space-y-6 sticky top-24">
      {/* Short Term Booking Widget */}
      {isShortTerm ? (
        <div className="bg-white rounded-3xl p-6 border border-[#e8e2d4] shadow-md space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#f0eae0]">
            <div>
              <span className="text-2xl font-black text-[#1a3831]">
                {new Intl.NumberFormat('fr-DZ').format(property.price)} DA
              </span>
              <span className="text-xs text-slate-500 font-medium"> / nuit</span>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-full border border-emerald-200">
              Réservation instantanée
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
            <span>Réserver ce séjour</span>
          </button>
        </div>
      ) : (
        /* Buy / Long Rent Action Card */
        <div className="bg-white rounded-3xl p-6 border border-[#e8e2d4] shadow-md space-y-4">
          <div className="space-y-1 pb-4 border-b border-[#f0eae0]">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
              Transaction sécurisée
            </span>
            <div className="text-2xl font-black text-[#1a3831]">
              {new Intl.NumberFormat('fr-DZ').format(property.price)} DA
              {property.pricePeriod === 'month' && (
                <span className="text-xs text-slate-500 font-medium"> / mois</span>
              )}
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
              <span>Contacter l'annonceur</span>
            </button>
          </div>
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
