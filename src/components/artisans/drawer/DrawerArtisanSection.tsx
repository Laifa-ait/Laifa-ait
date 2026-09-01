import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  Clock,
  CheckCircle,
  ChevronRight,
} from 'lucide-react';
import { ArtisanProfile } from '../../../types/artisan';

interface DrawerArtisanSectionProps {
  profile: ArtisanProfile | null;
  loading: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
}

export const DrawerArtisanSection: React.FC<DrawerArtisanSectionProps> = ({
  profile,
  loading,
  onClose,
  isLoggedIn,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="p-4 bg-slate-50 rounded-2xl animate-pulse space-y-2">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-8 bg-slate-200 rounded w-full" />
      </div>
    );
  }

  // User has an approved artisan profile
  if (profile && profile.status === 'approved') {
    return (
      <div className="p-3.5 bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-2xl border border-amber-300/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500 text-slate-950 rounded-lg">
              <Briefcase className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Espace Artisan Pro
              </h4>
              <p className="text-[10px] text-amber-800 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                Compte Partenaire Vérifié
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            onClose();
            navigate('/artisans/dashboard');
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black flex items-center justify-between shadow-xs transition-all cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <LayoutDashboard className="w-3.5 h-3.5" />
            Accéder à mon Dashboard Artisan
          </span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // User has submitted an application which is pending or under review
  if (profile && (profile.status === 'under_review' || profile.status === 'pending')) {
    return (
      <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200/80 space-y-2">
        <div className="flex items-center gap-2 text-blue-900">
          <Clock className="w-4 h-4 text-blue-600 animate-spin" />
          <h4 className="text-xs font-bold uppercase tracking-wider">
            Candidature en cours d&apos;examen
          </h4>
        </div>
        <p className="text-[11px] text-blue-700">
          Votre dossier d&apos;artisan est actuellement vérifié par l&apos;équipe Olmart.
        </p>
        <button
          onClick={() => {
            onClose();
            navigate('/artisans/devenir-artisan');
          }}
          className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
        >
          Voir les détails de mon dossier
        </button>
      </div>
    );
  }

  // User is not yet an artisan -> Prompt to apply
  return (
    <div className="p-3.5 bg-slate-900 rounded-2xl text-white space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="p-1.5 bg-amber-500 text-slate-950 rounded-lg">
          <PlusCircle className="w-4 h-4" />
        </span>
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
            Vous êtes Artisan ?
          </h4>
          <p className="text-[10px] text-slate-300">
            Rejoignez le réseau leader en Algérie
          </p>
        </div>
      </div>

      <p className="text-[11px] text-slate-300 leading-relaxed">
        Développez votre clientèle dans votre wilaya et recevez des demandes de devis qualifiées.
      </p>

      <button
        onClick={() => {
          onClose();
          navigate(isLoggedIn ? '/artisans/devenir-artisan' : '/auth?redirect=/artisans/devenir-artisan');
        }}
        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black flex items-center justify-between transition-all cursor-pointer"
      >
        <span>Postuler comme Artisan Partenaire</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
