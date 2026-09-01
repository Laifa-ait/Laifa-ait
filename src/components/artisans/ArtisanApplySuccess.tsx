import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { ArtisanProfile } from '../../types/artisan';

interface ArtisanApplySuccessProps {
  artisan: ArtisanProfile;
}

export const ArtisanApplySuccess: React.FC<ArtisanApplySuccessProps> = ({ artisan }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center space-y-6 max-w-xl mx-auto">
      <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Candidature soumise avec succès !
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Merci <strong>{artisan.fullName}</strong>. Votre dossier pour le métier{' '}
          <strong>{artisan.tradeName}</strong> à <strong>{artisan.wilaya}</strong> a bien été
          enregistré sous la référence{' '}
          <span className="font-mono font-bold text-amber-700">{artisan.id}</span>.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-left text-xs text-amber-950 space-y-2">
        <p className="font-bold">Prochaines étapes :</p>
        <ul className="list-disc list-inside space-y-1 text-slate-700">
          <li>Un modérateur Olmart va vérifier vos informations sous 24 à 48 heures.</li>
          <li>Vous recevrez une notification et un e-mail dès validation de votre profil.</li>
          <li>Votre profil public deviendra visible par les clients de votre wilaya.</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <button
          onClick={() => navigate('/artisans/dashboard')}
          className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <span>Accéder à mon espace artisan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate('/bricolage')}
          className="px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors cursor-pointer"
        >
          <span>Explorer les artisans</span>
        </button>
      </div>
    </div>
  );
};
