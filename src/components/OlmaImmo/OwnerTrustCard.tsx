import React from 'react';
import { PublicOwnerProfile } from '../../types/realEstate';
import { User, ShieldCheck, ShieldAlert, Shield, Clock } from 'lucide-react';

interface OwnerTrustCardProps {
  owner: PublicOwnerProfile | null;
  isLoading: boolean;
  error: boolean;
}

export const OwnerTrustCard: React.FC<OwnerTrustCardProps> = ({ owner, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-4 py-3 animate-pulse">
        <div className="w-14 h-14 bg-slate-200 rounded-full"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-3 bg-slate-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (error || !owner) {
    return (
      <div className="flex items-center gap-4 py-3">
        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-slate-400" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Propriétaire Anonyme</h3>
          <p className="text-xs text-slate-500 font-medium">Informations indisponibles</p>
        </div>
      </div>
    );
  }

  const isVerified = owner.verificationStatus === 'approved';
  const isPending = owner.verificationStatus === 'pending';
  const isActionRequired = owner.verificationStatus === 'action_required';
  const isRejected = owner.verificationStatus === 'rejected';
  
  const isProfessional = owner.sellerType === 'professional' || owner.role === 'seller';
  const displayName = isProfessional && owner.shopName ? owner.shopName : owner.displayName;

  return (
    <div className="flex items-center gap-4 py-2">
      <div className="relative">
        {owner.photoURL ? (
          <img loading="lazy" decoding="async" src={owner.photoURL} alt={displayName} className="w-14 h-14 rounded-full object-cover border border-slate-200" />
        ) : (
          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
            <User className="w-6 h-6 text-emerald-600" />
          </div>
        )}
        
        {/* Verification Badge */}
        {isVerified && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-3 h-3 text-white" />
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900 text-sm">{displayName}</h3>
          
          {isVerified && isProfessional && (
            <span className="inline-block text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-100">
              Partenaire Immo Olma
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-0.5">
          {isVerified ? (
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Identité vérifiée
            </p>
          ) : isPending ? (
            <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Vérification en cours
            </p>
          ) : isActionRequired || isRejected ? (
            <p className="text-xs text-red-600 font-medium flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Vérification échouée
            </p>
          ) : (
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 opacity-60" />
              Non vérifié
            </p>
          )}
          
          {owner.joinedAt && (
             <>
               <span className="text-slate-300 mx-1">•</span>
               <p className="text-[11px] text-slate-400">
                 Inscrit en {new Date(owner.joinedAt).getFullYear()}
               </p>
             </>
          )}
        </div>
      </div>
    </div>
  );
};
