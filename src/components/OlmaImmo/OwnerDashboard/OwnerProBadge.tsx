import React from 'react';
import { ShieldCheck, Award, Building, CheckCircle2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OwnerProBadgeProps {
  isVerifiedHost?: boolean;
  agencyName?: string;
  professionalLicenseNumber?: string;
}

export const OwnerProBadge: React.FC<OwnerProBadgeProps> = ({
  isVerifiedHost: _isVerifiedHost = true,
  agencyName,
  professionalLicenseNumber,
}) => {
  return (
    <div className="bg-gradient-to-br from-[#1E3A8A] to-[#172554] rounded-3xl p-6 sm:p-8 text-white shadow-md border border-blue-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-3 flex-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full text-[#F59E0B] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Statut Professionnel Immobilier</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold font-['Playfair_Display',serif] text-white">
          {agencyName ? `Agence Partenaire : ${agencyName}` : 'Annonceur Certifié Olma Immo'}
        </h3>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
          Vos annonces bénéficient du badge de vérification officiel et d'une visibilité prioritaire auprès des acquéreurs et locataires des 58 wilayas.
        </p>

        <div className="flex items-center gap-4 flex-wrap text-xs text-blue-100 font-medium pt-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Identité & Titre vérifiés</span>
          </div>
          {professionalLicenseNumber && (
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#F59E0B]" />
              <span>Agrément N° {professionalLicenseNumber}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Support Prioritaire Olma Pro</span>
          </div>
        </div>
      </div>

      <div className="shrink-0">
        <Link
          to="/immo/profile"
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#F59E0B] hover:bg-amber-500 text-slate-900 font-bold text-xs rounded-xl uppercase tracking-wider transition shadow-sm"
        >
          <Building className="w-4 h-4 text-slate-900" />
          <span>Gérer mon profil Pro</span>
        </Link>
      </div>
    </div>
  );
};
