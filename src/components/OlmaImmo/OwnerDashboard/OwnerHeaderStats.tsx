import React from 'react';
import { Building2, Eye, Calendar, DollarSign, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OlmaButton, OlmaSurface } from '../primitives';

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
            Tableau de bord Annonceur & Propriétaire
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Gérez votre parc immobilier, vos demandes de visite et vos réservations de séjours.
          </p>
        </div>

        <OlmaButton
          as={Link}
          to="/immo/publish"
          variant="primary"
          size="lg"
          radius="2xl"
          className="shrink-0 shadow-md hover:shadow-lg"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          <span>Déposer une annonce</span>
        </OlmaButton>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OlmaSurface
          variant="default"
          elevation="card"
          padding="md"
          className="rounded-3xl border border-[#e8e2d4] shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Biens en ligne</span>
            <div className="w-8 h-8 rounded-xl bg-[#f4ecd8] text-[#1a3831] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1a3831] font-['Playfair_Display',serif]">
            {propertiesCount}
          </div>
        </OlmaSurface>

        <OlmaSurface
          variant="default"
          elevation="card"
          padding="md"
          className="rounded-3xl border border-[#e8e2d4] shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Visites demandées</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-['Playfair_Display',serif]">
            {visitsCount}
          </div>
        </OlmaSurface>

        <OlmaSurface
          variant="default"
          elevation="card"
          padding="md"
          className="rounded-3xl border border-[#e8e2d4] shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Réservations séjours</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-['Playfair_Display',serif]">
            {bookingsCount}
          </div>
        </OlmaSurface>

        <OlmaSurface
          variant="default"
          elevation="card"
          padding="md"
          className="rounded-3xl border border-[#e8e2d4] shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Volume généré</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#1a3831] font-['Playfair_Display',serif]">
            {new Intl.NumberFormat('fr-DZ').format(totalRevenueDZD)}{' '}
            <span className="text-xs font-bold font-sans">DA</span>
          </div>
        </OlmaSurface>
      </div>
    </div>
  );
};

