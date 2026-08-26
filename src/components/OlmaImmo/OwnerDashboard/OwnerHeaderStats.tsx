import React from 'react';
import { Building2, Eye, Calendar, DollarSign, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OwnerHeaderStatsProps {
  propertiesCount: number;
  totalViews?: number;
  visitsCount: number;
  bookingsCount: number;
  totalRevenueDZD: number;
}

export const OwnerHeaderStats: React.FC<OwnerHeaderStatsProps> = ({
  propertiesCount,
  totalViews: _totalViews,
  visitsCount,
  bookingsCount,
  totalRevenueDZD,
}) => {
  return (
    <div className="space-y-6">
      {/* Top title and publish button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a3831] font-['Playfair_Display',serif]">
            Tableau de bord Annonceur & Pro
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Gérez votre parc immobilier, vos demandes de visite et vos réservations de séjours.
          </p>
        </div>

        <Link
          to="/immo/publish"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1a3831] hover:bg-[#122b24] text-[#ebdcb8] font-bold text-xs rounded-2xl uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-[#ebdcb8]" />
          <span>Déposer une annonce</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-[#e8e2d4] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Biens en ligne</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4ecd8] text-[#1a3831] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1a3831]">{propertiesCount}</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#e8e2d4] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Visites demandées</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{visitsCount}</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#e8e2d4] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Réservations séjours</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{bookingsCount}</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#e8e2d4] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Volume généré</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#1a3831]">
            {new Intl.NumberFormat('fr-DZ').format(totalRevenueDZD)} <span className="text-xs font-bold">DA</span>
          </div>
        </div>
      </div>
    </div>
  );
};
