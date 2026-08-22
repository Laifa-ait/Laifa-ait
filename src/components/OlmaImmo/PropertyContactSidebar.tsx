import React from 'react';
import { Calendar, CheckCircle2, MessageSquare, Phone, ShieldCheck, User } from 'lucide-react';
import { RealEstateProperty } from '../../types/realEstate';

interface PropertyContactSidebarProps {
  property: RealEstateProperty;
  formatPriceDisplay: (price: number, period?: string, listingType?: string) => string;
  onOpenBooking: () => void;
  onOpenVisit: () => void;
  onOpenContact: () => void;
}

export const PropertyContactSidebar: React.FC<PropertyContactSidebarProps> = ({
  property,
  formatPriceDisplay,
  onOpenBooking,
  onOpenVisit,
  onOpenContact,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6 sticky top-24">
      {/* Price Header */}
      <div className="border-b border-slate-100 pb-4">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
          Tarif proposé
        </span>
        <div className="text-2xl font-black text-emerald-800">
          {formatPriceDisplay(property.price, property.pricePeriod, property.listingType)}
        </div>
        {property.deposit && property.deposit > 0 && (
          <p className="text-xs text-slate-500 mt-1">
            Caution demandée : <span className="font-semibold text-slate-700">{property.deposit.toLocaleString('fr-FR')} DZD</span>
          </p>
        )}
      </div>

      {/* Owner Quick Profile */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <span>Propriétaire vérifié</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </h3>
          <p className="text-xs text-slate-500">Membre actif Olmart certifié</p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2.5">
        {property.listingType === 'rent_short' && (
          <button
            type="button"
            onClick={onOpenBooking}
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Réserver ce séjour</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenVisit}
          className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Demander une visite</span>
        </button>

        <button
          type="button"
          onClick={onOpenContact}
          className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Envoyer un message</span>
        </button>

        {property.contactPhone && (
          <a
            href={`tel:${property.contactPhone}`}
            className="w-full py-2.5 px-4 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Appeler ({property.contactPhone})</span>
          </a>
        )}
      </div>

      {/* Trust guarantees */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Annonce modérée & géolocalisée</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Transactions sécurisées Olmart</span>
        </div>
      </div>
    </div>
  );
};
