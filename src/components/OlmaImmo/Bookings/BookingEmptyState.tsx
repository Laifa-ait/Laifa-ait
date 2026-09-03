import React from 'react';
import { Link } from 'react-router-dom';
import { Palmtree, ArrowRight } from 'lucide-react';

interface BookingEmptyStateProps {
  activeTab: string;
}

export const BookingEmptyState: React.FC<BookingEmptyStateProps> = ({ activeTab }) => {
  return (
    <div className="bg-white rounded-2xl p-12 text-center border border-[#e8e2d4] shadow-xs space-y-4 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-[#f4ecd8] text-[#1a3831] flex items-center justify-center mx-auto border border-[#ebdcb8]">
        <Palmtree className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-bold text-[#1a3831] font-['Playfair_Display',serif]">
          {activeTab === 'all'
            ? 'Aucune réservation de séjour'
            : 'Aucun séjour dans cette catégorie'}
        </h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
          Découvrez des villas balnéaires, chalets de montagne et appartements meublés pour vos vacances à travers l'Algérie.
        </p>
      </div>

      <Link
        to="/immo?type=rent_short"
        className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#1a3831] hover:bg-[#122b24] text-[#ebdcb8] font-bold text-xs rounded-2xl uppercase tracking-wider transition shadow-md hover:shadow-lg mt-2 cursor-pointer"
      >
        <span>Explorer les locations vacances</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};
