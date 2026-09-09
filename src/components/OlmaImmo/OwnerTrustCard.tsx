import React, { useState } from 'react';
import { PublicOwnerProfile } from '../../types/realEstate';
import { User, ShieldCheck, Shield } from 'lucide-react';
import { OlmaSurface } from './primitives/OlmaSurface';
import { OlmaPill } from './primitives/OlmaPill';

interface OwnerTrustCardProps {
  owner: PublicOwnerProfile | null;
  isLoading: boolean;
  error: boolean;
}

export const OwnerTrustCard: React.FC<OwnerTrustCardProps> = ({ owner, isLoading, error }) => {
  const [imageError, setImageError] = useState(false);

  if (isLoading) {
    return (
      <OlmaSurface
        variant="subtle"
        bordered
        radius="2xl"
        padding="md"
        elevation="subtle"
        aria-busy="true"
        aria-label="Chargement du profil de l'annonceur"
        className="w-full"
      >
        <div className="flex items-center gap-3.5 animate-pulse">
          <div className="w-12 h-12 bg-stone-200 rounded-full shrink-0" />
          <div className="space-y-2 flex-1 min-w-0">
            <div className="h-4 bg-stone-200 rounded w-1/3" />
            <div className="h-3 bg-stone-200 rounded w-1/4" />
          </div>
        </div>
      </OlmaSurface>
    );
  }

  if (error || !owner) {
    return (
      <OlmaSurface
        variant="subtle"
        bordered
        radius="2xl"
        padding="md"
        elevation="subtle"
        aria-label="Profil de l'annonceur indisponible"
        className="w-full"
      >
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 bg-[#FAF8F5] rounded-full flex items-center justify-center border border-[#E8E2D4] shrink-0"
            aria-hidden="true"
          >
            <User className="w-5 h-5 text-stone-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-[#1A3831] text-sm truncate">Annonceur</h3>
            <p className="text-xs text-stone-500 font-medium">Informations publiques non renseignées</p>
          </div>
        </div>
      </OlmaSurface>
    );
  }

  // Strictly check backend-authorized flags
  const isVerified = owner.verificationStatus === 'approved';
  const isProfessional = owner.sellerType === 'professional';
  const isPropertyOwner = owner.role === 'property_owner';

  const roleLabel = isProfessional ? 'Professionnel' : isPropertyOwner ? 'Propriétaire' : 'Annonceur';
  const displayName = isProfessional && owner.shopName ? owner.shopName : owner.displayName || roleLabel;

  // Safe year parsing strictly as boolean
  let memberSinceYear: number | null = null;
  if (owner.joinedAt) {
    const parsed = new Date(owner.joinedAt).getFullYear();
    if (!Number.isNaN(parsed) && parsed >= 2000 && parsed <= 2100) {
      memberSinceYear = parsed;
    }
  }
  const hasValidYear = memberSinceYear !== null;

  return (
    <OlmaSurface
      variant="subtle"
      bordered
      radius="2xl"
      padding="md"
      elevation="subtle"
      aria-label={`Profil de l'annonceur ${displayName}`}
      className="w-full space-y-3"
    >
      <div className="flex items-center gap-3.5">
        <div className="relative shrink-0">
          {owner.photoURL && !imageError ? (
            <img
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              src={owner.photoURL}
              alt={`Photo de profil de ${displayName}`}
              onError={() => setImageError(true)}
              className="w-12 h-12 rounded-full object-cover border-2 border-[#E8E2D4]"
            />
          ) : (
            <div
              className="w-12 h-12 bg-[#FAF8F5] rounded-full flex items-center justify-center border-2 border-[#EBDCB8]"
              aria-hidden="true"
            >
              <User className="w-5 h-5 text-[#1A3831]" />
            </div>
          )}

          {isVerified && (
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-xs"
              title="Identité vérifiée par Olmart"
              aria-hidden="true"
            >
              <div className="w-4 h-4 bg-emerald-700 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-[#1A3831] text-sm truncate">{displayName}</h3>
            {isProfessional ? (
              <OlmaPill variant="brand" size="sm">
                Professionnel
              </OlmaPill>
            ) : (
              <OlmaPill variant="neutral" size="sm">
                {roleLabel}
              </OlmaPill>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1 flex-wrap text-xs">
            {isVerified ? (
              <span className="text-emerald-800 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-700" aria-hidden="true" />
                <span>Identité vérifiée</span>
              </span>
            ) : (
              <span className="text-stone-500 font-medium flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 shrink-0 opacity-60 text-stone-500" aria-hidden="true" />
                <span>Annonceur</span>
              </span>
            )}

            {hasValidYear && (
              <>
                <span className="text-stone-300 mx-0.5" aria-hidden="true">•</span>
                <span className="text-stone-500 font-medium">
                  Membre depuis {memberSinceYear}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-[#E8E2D4]/60 text-[11px] text-stone-500 leading-relaxed font-medium">
        {isProfessional ? (
          <span>Annonce professionnelle vérifiable sur Olmart. Les visites et démarches s'effectuent directement avec l'agence.</span>
        ) : (
          <span>Annonce publiée sur Olmart. Les prises de contact et visites s'organisent directement avec l'annonceur.</span>
        )}
      </div>
    </OlmaSurface>
  );
};
