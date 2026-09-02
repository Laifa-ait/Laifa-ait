import React from 'react';
import {
  ShieldCheck,
  Clock,
  Ban,
  ExternalLink,
  Power,
} from 'lucide-react';
import { ArtisanProfile } from '../../../types/artisan';
import { Link } from 'react-router-dom';

interface ArtisanDashboardHeaderProps {
  profile: ArtisanProfile;
  onToggleAvailability: () => void;
  updatingAvailability: boolean;
}

export const ArtisanDashboardHeader: React.FC<ArtisanDashboardHeaderProps> = ({
  profile,
  onToggleAvailability,
  updatingAvailability,
}) => {
  return (
    <div className="space-y-4">
      {/* Moderation Status Banner */}
      {profile.status === 'pending' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 animate-spin" />
          <div>
            <p className="font-extrabold text-sm">Candidature en attente de validation</p>
            <p className="text-slate-600 mt-0.5">
              Votre profil est en cours d'examen par notre équipe. Il sera visible dès approbation.
            </p>
          </div>
        </div>
      )}

      {profile.status === 'rejected' && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-3">
          <Ban className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <p className="font-extrabold text-sm">Candidature non retenue</p>
            <p className="text-slate-600 mt-0.5">
              {profile.rejectionReason || 'Veuillez contacter le support pour plus d’informations.'}
            </p>
          </div>
        </div>
      )}

      {/* Main Profile Header Box */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img loading="lazy" decoding="async" src={
              profile.avatarUrl ||
              'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=160&auto=format&fit=crop&q=80'
            }
            alt={profile.fullName}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {profile.professionalName || profile.fullName}
              </h1>
              {!!profile.verifiedAt && (
                <span title="Artisan Vérifié"><ShieldCheck className="w-4 h-4 text-emerald-600" /></span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {profile.tradeName} • {profile.commune}, {profile.wilaya}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="font-bold text-slate-700">
                ⭐ {profile.rating > 0 ? profile.rating.toFixed(1) : '5.0'} ({profile.reviewCount} avis)
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">{profile.completedJobsCount} chantiers</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto">
          <button
            onClick={onToggleAvailability}
            disabled={updatingAvailability}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
              profile.isAvailable
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{profile.isAvailable ? 'Disponible pour missions' : 'Indisponible (En pause)'}</span>
          </button>

          {profile.status === 'approved' && (
            <Link
              to={`/artisans/profile/${profile.id}`}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Voir mon profil public</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
