import React from 'react';
import { PublicOwnerProfile } from '../../types/realEstate';
import { User, ShieldCheck, ShieldAlert, Shield, Clock } from 'lucide-react';
import { OlmaPill } from './primitives/OlmaPill';

interface OwnerTrustCardProps {
  owner: PublicOwnerProfile | null;
  isLoading: boolean;
  error: boolean;
}

export const OwnerTrustCard: React.FC<OwnerTrustCardProps> = ({ owner, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-4 py-3 animate-pulse">
        <div className="w-14 h-14 bg-stone-200 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-stone-200 rounded w-1/3" />
          <div className="h-3 bg-stone-200 rounded w-1/4" />
        </div>
      </div>
    );
  }

  if (error || !owner) {
    return (
      <div className="flex items-center gap-4 py-3">
        <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center border border-[#E8E2D4]">
          <User className="w-6 h-6 text-stone-400" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-bold text-[#1A3831] text-sm">Annonceur Olmart</h3>
          <p className="text-xs text-stone-500 font-medium">Profil public non renseigné</p>
        </div>
      </div>
    );
  }

  const isVerified = owner.verificationStatus === 'approved';
  const isPending = owner.verificationStatus === 'pending';
  const isActionRequired = owner.verificationStatus === 'action_required';
  const isRejected = owner.verificationStatus === 'rejected';

  const isProfessional = owner.sellerType === 'professional' || owner.role === 'seller';
  const displayName = isProfessional && owner.shopName ? owner.shopName : owner.displayName || 'Propriétaire';

  return (
    <div className="flex items-center gap-4 py-2">
      <div className="relative">
        {owner.photoURL ? (
          <img
            loading="lazy"
            decoding="async"
            src={owner.photoURL}
            alt={displayName}
            className="w-14 h-14 rounded-full object-cover border-2 border-[#E8E2D4]"
          />
        ) : (
          <div className="w-14 h-14 bg-[#F4ECD8] rounded-full flex items-center justify-center border-2 border-[#EBDCB8]">
            <User className="w-6 h-6 text-[#1A3831]" aria-hidden="true" />
          </div>
        )}

        {/* Verification Badge Over Avatar */}
        {isVerified && (
          <div
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-xs"
            title="Identité vérifiée par Olmart"
          >
            <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-3 h-3 text-white" aria-hidden="true" />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-[#1A3831] text-sm truncate">{displayName}</h3>

          {isVerified && isProfessional && (
            <OlmaPill variant="brand" size="sm">
              Pro Immo
            </OlmaPill>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {isVerified ? (
            <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Identité vérifiée</span>
            </p>
          ) : isPending ? (
            <p className="text-xs text-amber-700 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Vérification en cours</span>
            </p>
          ) : isActionRequired || isRejected ? (
            <p className="text-xs text-rose-700 font-medium flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Dossier à compléter</span>
            </p>
          ) : (
            <p className="text-xs text-stone-500 font-medium flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 opacity-60 shrink-0" aria-hidden="true" />
              <span>Compte membre</span>
            </p>
          )}

          {owner.joinedAt && (
            <>
              <span className="text-stone-300 mx-0.5">•</span>
              <p className="text-[11px] text-stone-400">
                Membre depuis {new Date(owner.joinedAt).getFullYear()}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
