import React from 'react';
import { MessageSquare, Calendar, Phone } from 'lucide-react';
import { Property, PublicOwnerProfile } from '../../../types/realEstate';
import { formatDZD } from '../../../utils/format';

interface DetailMobileActionBarProps {
  property: Property;
  ownerProfile: PublicOwnerProfile | null;
  onOpenVisitModal: () => void;
  onOpenBookingModal: () => void;
  onOpenDirectChat: () => void;
}

export const DetailMobileActionBar: React.FC<DetailMobileActionBarProps> = ({
  property,
  ownerProfile: _ownerProfile,
  onOpenVisitModal,
  onOpenBookingModal,
  onOpenDirectChat,
}) => {
  const isShortTerm = property.listingType === 'rent_short';
  const contactPhone = property.contactPhone;

  return (
    <aside
      aria-label="Actions rapides pour cette annonce"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E2D4] px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-center justify-between gap-3 safe-bottom"
    >
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
          {property.listingType === 'sale' ? 'Prix de vente' : 'Loyer'}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-base font-extrabold text-[#1A3831] truncate">
            {formatDZD(property.price)}
          </span>
          {property.pricePeriod && (
            <span className="text-[10px] text-stone-500 font-medium">
              /{property.pricePeriod === 'month' ? 'mois' : property.pricePeriod === 'night' ? 'nuit' : property.pricePeriod}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {contactPhone && (
          <a
            href={`tel:${contactPhone}`}
            aria-label={`Appeler le contact au ${contactPhone}`}
            className="p-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 transition active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
          >
            <Phone className="w-4 h-4 text-[#1A3831]" />
          </a>
        )}

        <button
          type="button"
          onClick={onOpenDirectChat}
          aria-label="Envoyer un message au propriétaire"
          className="p-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 transition active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-[#1A3831]" />
        </button>

        {isShortTerm ? (
          <button
            type="button"
            onClick={onOpenBookingModal}
            className="px-4 py-2.5 bg-[#1A3831] hover:bg-[#122B24] text-[#EBDCB8] rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer min-h-[44px]"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Réserver</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenVisitModal}
            className="px-4 py-2.5 bg-[#1A3831] hover:bg-[#122B24] text-[#EBDCB8] rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer min-h-[44px]"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Planifier visite</span>
          </button>
        )}
      </div>
    </aside>
  );
};
